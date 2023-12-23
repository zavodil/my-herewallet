import {fetchJson} from 'near-api-js/lib/utils/web';
import {SignedTransaction} from 'near-api-js/lib/transaction';
import {exponentialBackoff} from '@near-js/providers/lib/exponential-backoff';
import {ErrorContext, FinalExecutionOutcome, JsonRpcProvider, TypedError} from 'near-api-js/lib/providers';
import {parseRpcError} from 'near-api-js/lib/utils/rpc_errors';
import {base_encode} from 'near-api-js/lib/utils/serialize';
import {transactions, utils} from 'near-api-js';
import {createHash} from 'crypto';

import AccountModule from '../AccountModule';
import {HereError, headers} from '../network/helpers';
import {getNodeUrl} from './constants';

// Default number of retries before giving up on a request.
const REQUEST_RETRY_NUMBER = 12;
// Default wait until next retry in millis.
const REQUEST_RETRY_WAIT = 500;
// Exponential back off for waiting to retry.
const REQUEST_RETRY_WAIT_BACKOFF = 1.5;
/// Keep ids unique across all connections.
let _nextId = 123;

export function getErrorTypeFromErrorMessage(errorMessage: string, errorType: string) {
  // This function should be removed when JSON RPC starts returning typed errors.
  switch (true) {
    case /^account .*? does not exist while viewing$/.test(errorMessage):
      return 'AccountDoesNotExist';
    case /^Account .*? doesn't exist$/.test(errorMessage):
      return 'AccountDoesNotExist';
    case /^access key .*? does not exist while viewing$/.test(errorMessage):
      return 'AccessKeyDoesNotExist';
    case /wasm execution failed with error: FunctionCallError\(CompilationError\(CodeDoesNotExist/.test(errorMessage):
      return 'CodeDoesNotExist';
    case /Transaction nonce \d+ must be larger than nonce of the used access key \d+/.test(errorMessage):
      return 'InvalidNonce';
    default:
      return errorType;
  }
}

export class HereRpcError extends TypedError {
  readableError?: HereError;
  constructor(message?: string, type?: string, context?: ErrorContext) {
    super(message, type, context);
  }
}

export class HereRpcNear extends JsonRpcProvider {
  public timezone: string | null = null;
  constructor(readonly network: string) {
    super({url: getNodeUrl(network), headers: headers()});
  }

  async sendTransaction(signedTransaction: SignedTransaction): Promise<FinalExecutionOutcome> {
    const sha256 = createHash('sha256');
    const serializedTx = utils.serialize.serialize(transactions.SCHEMA, signedTransaction.transaction);
    const trx = base_encode(sha256.update(serializedTx).digest());
    const {sign: Sign, deviceId: DeviceId} = await AccountModule.trackTransaction(trx);

    const bytes = signedTransaction.encode();
    return this.sendJsonRpc('broadcast_tx_commit', [Buffer.from(bytes).toString('base64')], {
      DeviceId,
      Sign,
    });
  }

  // @ts-ignore
  async sendTransactionAsync(signedTransaction: SignedTransaction): Promise<string> {
    const sha256 = createHash('sha256');
    const serializedTx = utils.serialize.serialize(transactions.SCHEMA, signedTransaction.transaction);
    const trx = base_encode(sha256.update(serializedTx).digest());
    const {sign: Sign, deviceId: DeviceId} = await AccountModule.trackTransaction(trx);

    const bytes = signedTransaction.encode();
    return this.sendJsonRpc('broadcast_tx_async', [Buffer.from(bytes).toString('base64')], {
      DeviceId,
      Sign,
    });
  }

  async sendJsonRpc<T>(method: string, params: object, addHeaders = {}): Promise<T> {
    let response: any;

    const finalResult = await exponentialBackoff(
      REQUEST_RETRY_WAIT,
      REQUEST_RETRY_NUMBER,
      REQUEST_RETRY_WAIT_BACKOFF,
      async () => {
        try {
          const request = {method, params, id: _nextId++, jsonrpc: '2.0'};
          const connection = {...this.connection, headers: {...this.connection.headers, ...addHeaders}};

          // const data = Date.now();
          response = await fetchJson(connection, JSON.stringify(request));
          // console.log('RPC', method, (Date.now() - data) / 1000);

          if (response.error) {
            if (typeof response.error.data === 'object') {
              const isReadable =
                typeof response.error.data.error_message === 'string' &&
                typeof response.error.data.error_type === 'string';

              if (isReadable) {
                // if error data has error_message and error_type properties,
                // we consider that node returned an error in the old format
                throw new TypedError(response.error.data.error_message, response.error.data.error_type);
              }

              throw parseRpcError(response.error.data);
            } else {
              // NOTE: All this hackery is happening because structured errors not implemented
              // TODO: Fix when https://github.com/nearprotocol/nearcore/issues/1839 gets resolved
              const errorMessage = `[${response.error.code}] ${response.error.message}: ${response.error.data}`;
              const isTimeout =
                response.error.data === 'Timeout' ||
                errorMessage.includes('Timeout error') ||
                errorMessage.includes('query has timed out');

              if (isTimeout) throw new TypedError(errorMessage, 'TimeoutError');
              const type = getErrorTypeFromErrorMessage(response.error.data, response.error.name);
              throw new TypedError(errorMessage, type);
            }
          }

          return response;
        } catch (error: any) {
          console.warn('RPC Error', error);
          if (response.error == null) throw error;
          if (!(error instanceof TypedError)) throw error;

          if (error.type === 'TimeoutError') {
            console.warn(`Retrying request to ${method} as it has timed out`, params);
            return null;
          }

          if (typeof response.error.readable_title === 'string' && typeof response.error.readable_body === 'string') {
            const readable = new HereError(response.error.readable_title, response.error.readable_body);
            const rpcError = new HereRpcError(error.message, error.type, error.context);
            rpcError.readableError = readable;
            throw rpcError;
          }

          throw error;
        }
      },
    );

    // From jsonrpc spec:
    // result
    //   This member is REQUIRED on success.
    //   This member MUST NOT exist if there was an error invoking the method.
    const {result} = finalResult;
    if (typeof result === 'undefined') {
      throw new TypedError(`Exceeded ${REQUEST_RETRY_NUMBER} attempts for request to ${method}.`, 'RetriesExceeded');
    }

    return result;
  }
}
