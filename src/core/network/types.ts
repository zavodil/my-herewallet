import { Chain } from "../token/types";

export class HereError extends Error {
  constructor(readonly title: string, readonly body: string) {
    super(body);
  }
}

export class TransactionError extends HereError {}

export interface NFTModel {
  collection_description: string | null;
  collection_name: string | null;
  collection_site: string | null;
  collection_symbol: string | null;
  contract_id: string;
  media_url: string;
  nft_description: string | null;
  nft_id: string;
  nft_title: string;

  total_volume: number;
  collection_price: number;

  benefits: {
    title: string;
    body: string;
    link: string;
  }[];
}

export interface UserContact {
  address: string;
  chain_id: Chain;
  currency: string;
  account_id: string;
  avatar_url: string;
  verified: boolean;
  profile: {
    twitter_username: string;
    twitter_name: string;
    telegram_username: string;
    telegram_name: string;
    instagram_username: string;
    ns_name: string;
  };
}

export interface UserData {
  id: string;
  score?: number;
  verified?: boolean;
  referal_id?: number;
  phone_linked: boolean;
  avatar_url?: string;
  can_bind_referral?: boolean;
  abtests: {
    name: string;
    value: boolean;
  }[];
}

interface RequestSerialized {
  headers: object;
  body: any;
  method: string;
  url: string;
}

export interface RecentlyApps {
  contract_id: string;
  name: string;
  image: string;
  timestamp: number;
}

export interface RequestAccessToken {
  msg: string;
  device_id: string;
  account_sign: string;
  device_name: string;
  near_account_id: string;
  public_key: string;
  wallet_type: string;
  nonce: number[];
  web_auth: boolean;
}

type JSONValue = string | number | boolean | { [x: string]: JSONValue };

interface ResponseSerialized {
  headers: object;
  body: JSONValue;
  url: string;
  status: number;
}

export class RequestError extends HereError {
  constructor(readonly request: RequestSerialized) {
    super("SomethingWentWrong", "checkInternet");
  }

  static async create(req: Request) {
    const reqBody = await req.text().catch(() => "serialize error");
    return new RequestError({
      body: reqBody,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries((req.headers as any).entries()),
    });
  }
}

export class ResponseError extends HereError {
  constructor(readonly request: RequestSerialized, readonly response: ResponseSerialized) {
    let title = "somethingWentWrong";
    let text = String(response.body ?? `UnknownError (${response.status})`);

    if (typeof response.body === "object" && !Array.isArray(response.body)) {
      const { readable_title, readable_body, detail } = response.body;
      title = String(readable_title || "Something wrong");
      text = String(readable_body ?? detail ?? "");
    }

    super("somethingWentWrong", String(response.body ?? `UnknownError (${response.status})`));
  }

  static async create(req: Request, res: Response) {
    const { request } = await RequestError.create(req);
    const resBody = await res.json().catch(() => ({}));

    return new ResponseError(request, {
      body: resBody,
      url: res.url,
      status: res.status,
      headers: Object.fromEntries((res.headers as any).entries()),
    });
  }
}

export interface AllocateUsername {
  near_account_id: string;
  public_key: string;
  sign: string;
  device_id: string;
}
