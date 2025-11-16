const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

export class AlchemyProductionClient {
  private requestTimeout: number;

  constructor(timeout: number = 10000) {
    this.requestTimeout = timeout;
  }

  private async makeRpcCall(method: string, params: any[]): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(ALCHEMY_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: Math.floor(Math.random() * 1000), // ID único para cada request
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Alchemy RPC error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Alchemy RPC error: ${data.error.message}`);
      }

      return data.result;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        console.error(`Alchemy RPC call timed out for method ${method}`);
        throw new Error(`Request timeout after ${this.requestTimeout}ms`);
      }

      console.error(
        `Alchemy RPC call failed for method ${method}:`,
        error.message,
      );
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    return this.makeRpcCall("eth_getBalance", [address, "latest"]);
  }

  async getBlockNumber(): Promise<string> {
    return this.makeRpcCall("eth_blockNumber", []);
  }

  async getCode(address: string): Promise<string> {
    return this.makeRpcCall("eth_getCode", [address, "latest"]);
  }

  async getGasPrice(): Promise<string> {
    return this.makeRpcCall("eth_gasPrice", []);
  }

  async getChainId(): Promise<string> {
    return this.makeRpcCall("eth_chainId", []);
  }

  async makeTrackingRequests(
    address: string,
  ): Promise<{ success: number; total: number }> {
    const methods = [
      () => this.getBalance(address),
      () => this.getBlockNumber(),
      () => this.getCode(address),
      () => this.getGasPrice(),
      () => this.getChainId(),
    ];

    try {
      const results = await Promise.allSettled(
        methods.map((method) => method()),
      );

      const successfulRequests = results.filter(
        (result) => result.status === "fulfilled",
      ).length;

      const stats = {
        success: successfulRequests,
        total: methods.length,
      };

      console.log(
        `Alchemy tracking completed: ${stats.success}/${stats.total} requests successful for ${address}`,
      );

      return stats;
    } catch (error) {
      console.error("Alchemy tracking requests failed:", error);
      return { success: 0, total: methods.length };
    }
  }
}

export const alchemyClient = new AlchemyProductionClient(10000);
