let tronWebInstance: any = null;

const createServerTronWeb = () => {
  try {
    if (typeof window === "undefined") {
      const TronWeb = require("tronweb");
      const TronWebConstructor = TronWeb.default || TronWeb;

      return new TronWebConstructor({
        fullHost: process.env.TRON_FULLNODE || "https://api.trongrid.io",
        headers: {
          "TRON-PRO-API-KEY": process.env.TRON_API_KEY,
        },
      });
    }
    return null;
  } catch (error) {
    console.warn("TronWeb not available on server:", error);
    return null;
  }
};

export const getTronWeb = (): any => {
  if (tronWebInstance) {
    return tronWebInstance;
  }

  if (typeof window !== "undefined") {
    if ((window as any).tronWeb) {
      tronWebInstance = (window as any).tronWeb;
      return tronWebInstance;
    }
    // Fallback para TronLink object se disponível
    if ((window as any).tronLink && (window as any).tronLink.tronWeb) {
      tronWebInstance = (window as any).tronLink.tronWeb;
      return tronWebInstance;
    }
  }

  // Servidor - cria instância apenas quando necessário
  tronWebInstance = createServerTronWeb();
  return tronWebInstance;
};

export function textToHex(text: string): string {
  return Buffer.from(text, "utf8").toString("hex");
}

export async function verifyTronSignature(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  if (!message || !signature || !address) {
    return false;
  }

  try {
    const tronWeb = getTronWeb();
    if (!tronWeb) {
      console.error("TronWeb not available for signature verification");
      return false;
    }

    const hexMessage = textToHex(message);
    let recoveredAddress: string;

    // Tenta diferentes métodos de verificação
    if (typeof tronWeb.trx.verifyMessage === "function") {
      recoveredAddress = tronWeb.trx.verifyMessage(hexMessage, signature);
    } else if (typeof tronWeb.trx.verifyMessageV2 === "function") {
      recoveredAddress = await tronWeb.trx.verifyMessageV2(
        hexMessage,
        signature,
      );
    } else {
      console.error("No compatible verify method found in TronWeb");
      return false;
    }

    return recoveredAddress?.toLowerCase() === address.toLowerCase();
  } catch (err) {
    console.error("Error verifying TRON signature:", err);
    return false;
  }
}

export function isValidTronAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;

  // Validação básica de formato TRON (começa com T e tem 34 caracteres)
  if (!/^T[A-Za-z0-9]{33}$/.test(address)) {
    return false;
  }

  try {
    const tronWeb = getTronWeb();
    return tronWeb ? tronWeb.isAddress(address) : false;
  } catch {
    return false;
  }
}
