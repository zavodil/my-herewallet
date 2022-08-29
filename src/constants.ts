const constants = {
  api: process.env.REACT_APP_API ?? "",
  contract: process.env.REACT_APP_CONTRACT ?? "",
  walletSchema: process.env.REACT_APP_WALLET_SCHEMA ?? "",
  network: process.env.REACT_APP_NETWORK ?? "",
  rpc: process.env.REACT_APP_RPC ?? "",
};

export default constants;
