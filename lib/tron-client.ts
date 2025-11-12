// lib/tron-client.ts
/**
 * Cliente TRON leve para uso no servidor
 */

interface TronTransaction {
  txID: string;
  raw_data: {
    contract: any[];
    ref_block_bytes: string;
    ref_block_hash: string;
    expiration: number;
    timestamp: number;
  };
}

export class TronClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.TRON_FULLNODE || "https://api.trongrid.io";
  }

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          "TRON-PRO-API-KEY": process.env.TRON_API_KEY || "",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("TRON API request failed:", error);
      throw error;
    }
  }

  /**
   * Obtém informações da conta
   */
  async getAccount(address: string) {
    return this.makeRequest(`/v1/accounts/${address}`);
  }

  /**
   * Obtém transação por hash
   */
  async getTransaction(txHash: string) {
    return this.makeRequest(`/v1/transactions/${txHash}`);
  }

  /**
   * Envia transação
   */
  async broadcastTransaction(rawTransaction: any) {
    return this.makeRequest("/v1/transactions", {
      method: "POST",
      body: JSON.stringify(rawTransaction),
    });
  }
}

export const tronClient = new TronClient();
