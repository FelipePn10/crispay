import { createHash } from "crypto";
import * as elliptic from "elliptic";

const ec = new elliptic.ec("secp256k1");

/**
 * Valida endereço TRON sem depender do TronWeb
 */
export function isValidTronAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  if (!/^T[A-Za-z0-9]{33}$/.test(address)) {
    return false;
  }
  return true;
}

/**
 * Converte texto para hex
 */
export function textToHex(text: string): string {
  return Buffer.from(text, "utf8").toString("hex");
}

/**
 * Converte hex para base58 (endereço TRON)
 */
function hexToBase58(hex: string): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  // Adiciona checksum
  const hash1 = createHash("sha256").update(Buffer.from(hex, "hex")).digest();
  const hash2 = createHash("sha256").update(hash1).digest();
  const checksum = hash2.slice(0, 4).toString("hex");
  const hexWithChecksum = hex + checksum;

  let num = BigInt("0x" + hexWithChecksum);
  let encoded = "";

  while (num > 0) {
    const remainder = num % BigInt(58);
    num = num / BigInt(58);
    encoded = ALPHABET[Number(remainder)] + encoded;
  }

  for (
    let i = 0;
    i < hexWithChecksum.length && hexWithChecksum.substr(i, 2) === "00";
    i += 2
  ) {
    encoded = "1" + encoded;
  }

  return encoded;
}

/**
 * Cria o hash Keccak256
 */
function keccak256(data: Buffer): Buffer {
  const { createHash } = require("crypto");
  try {
    const { keccak256 } = require("@ethersproject/keccak256");
    const { arrayify } = require("@ethersproject/bytes");
    return Buffer.from(arrayify(keccak256(data)));
  } catch {
    // Fallback para sha3-256 se ethers não estiver disponível
    return createHash("sha3-256").update(data).digest();
  }
}

/**
 * Recupera o endereço da assinatura TRON
 */
function recoverAddressFromSignature(
  message: string,
  signature: string,
): string | null {
  try {
    // Remove o prefixo '0x' se existir
    signature = signature.replace(/^0x/, "");

    if (signature.length !== 130) {
      console.error("Invalid signature length:", signature.length);
      return null;
    }

    const r = signature.slice(0, 64);
    const s = signature.slice(64, 128);
    const v = parseInt(signature.slice(128, 130), 16);

    const messagePrefix = "\x19TRON Signed Message:\n";
    const messageBytes = Buffer.from(message, "utf8");
    const messageLengthBuffer = Buffer.from(
      messageBytes.length.toString(),
      "utf8",
    );

    const prefixedMessage = Buffer.concat([
      Buffer.from(messagePrefix, "utf8"),
      messageLengthBuffer,
      messageBytes,
    ]);

    console.log("🔍 Debug verification:");
    console.log("  - Message:", message);
    console.log("  - Message length:", messageBytes.length);
    console.log("  - Prefixed message hex:", prefixedMessage.toString("hex"));
    console.log("  - Signature:", signature);
    console.log("  - V value:", v);

    // Hash da mensagem prefixada usando Keccak256
    const messageHash = keccak256(prefixedMessage);

    console.log("  - Message hash:", messageHash.toString("hex"));

    // Recupera a chave pública
    const recovery = v >= 27 ? v - 27 : v;
    const signature_obj = { r, s };

    const publicKey = ec.recoverPubKey(messageHash, signature_obj, recovery);

    // Converte chave pública para endereço
    const publicKeyBytes = Buffer.from(
      publicKey.encode("array", false).slice(1),
    );
    const publicKeyHash = keccak256(publicKeyBytes);

    // Pega os últimos 20 bytes e adiciona o prefixo 0x41 (TRON mainnet)
    const addressHex = "41" + publicKeyHash.slice(-20).toString("hex");
    const recoveredAddress = hexToBase58(addressHex);

    console.log("  - Recovered address:", recoveredAddress);

    return recoveredAddress;
  } catch (error) {
    console.error("Error recovering address:", error);
    return null;
  }
}

/**
 * Verifica assinatura TRON
 */
export async function verifyTronSignature(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  if (!isValidTronAddress(address)) {
    console.error("❌ Endereço TRON inválido:", address);
    return false;
  }

  try {
    console.log("🔐 Verificando assinatura TRON...");
    console.log("  - Address esperado:", address);
    console.log("  - Message:", message);

    const recoveredAddress = recoverAddressFromSignature(message, signature);

    if (!recoveredAddress) {
      console.error("❌ Não foi possível recuperar o endereço da assinatura");
      return false;
    }

    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

    if (isValid) {
      console.log("✅ Assinatura TRON verificada com sucesso para:", address);
    } else {
      console.log(
        "❌ Assinatura TRON inválida. Esperado:",
        address,
        "Recuperado:",
        recoveredAddress,
      );
    }

    return isValid;
  } catch (error) {
    console.error("❌ Erro ao verificar assinatura TRON:", error);
    return false;
  }
}

export async function verifyTronSignatureWithTronWeb(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && (window as any).tronWeb) {
      const tronWeb = (window as any).tronWeb;
      const hexMessage = textToHex(message);

      let recoveredAddress: string;

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
    }

    return await verifyTronSignature(message, signature, address);
  } catch (error) {
    console.error("Error in TronWeb verification:", error);
    return await verifyTronSignature(message, signature, address);
  }
}
