export enum ConnectorEnum {
  WAIT_REQUEST,
  INVALID_BODY,
  INVALID_NETWORK,
  REQUESTING,
  SUCCESS_REQUEST,
  ERROR_REQUEST,
  APPROVING,
  SUCCESS,
  ERROR,
}

export class SignPayload {
  readonly message: string;
  readonly nonce: number[];
  readonly recipient: string;
  readonly callbackUrl?: string;
  readonly tag: number;

  constructor({
    message,
    nonce,
    recipient,
    callbackUrl,
  }: {
    message: string;
    nonce: number[];
    recipient: string;
    callbackUrl?: string;
  }) {
    this.tag = 2147484061;
    this.message = message;
    this.nonce = nonce;
    this.recipient = recipient;
    if (callbackUrl) {
      this.callbackUrl = callbackUrl;
    }
  }
}

export const signPayloadSchema = new Map([
  [
    SignPayload,
    {
      kind: "struct",
      fields: [
        ["tag", "u32"],
        ["message", "string"],
        ["nonce", [32]],
        ["recipient", "string"],
        ["callbackUrl", { kind: "option", type: "string" }],
      ],
    },
  ],
]);
