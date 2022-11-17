const constants = {
  api: process.env.REACT_APP_API ?? "",
  contract: process.env.REACT_APP_CONTRACT ?? "",
  walletConnect: process.env.REACT_APP_REDIRECT ?? "",
  schema: process.env.REACT_APP_SCHEMA ?? "",
  network: process.env.REACT_APP_NETWORK ?? "",
  rpc: process.env.REACT_APP_RPC ?? "",
};

export default constants;
