export interface WalletConnection {
  address: string;
  chain: "evm" | "tron" | "btc";
  connector: "walletconnect" | "tronlink" | "metamask";
}

export interface AuthPayload {
  address: string;
  chain: string;
  signature: string;
}

export interface TransactionRequest {
  to: string;
  amount: string;
  asset: "BTC" | "ETH" | "USDT";
  chain: "bitcoin" | "ethereum" | "tron";
}
