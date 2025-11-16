import { createHash } from "crypto";
import * as elliptic from "elliptic";

const ec = new elliptic.ec("secp256k1");

export function textToHex(text: string): string {
  return Buffer.from(text, "utf8").toString("hex");
}

export function isValidTronAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return /^T[A-Za-z0-9]{33}$/.test(address);
}

export async function verifyTronSignature(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  console.log(`Verifying TRON signature for: ${address}`);

  if (!isValidTronAddress(address)) {
    console.error("Invalid TRON address:", address);
    return false;
  }

  try {
    const verified = await verifyWithTronGridAPI(message, signature, address);
    if (verified) {
      console.log("TronGrid verification successful");
      return true;
    }
  } catch (error) {
    console.error("TronGrid verification failed:", error);
  }

  console.log("Using local recovery for verification");
  return await verifyWithLocalRecovery(message, signature, address);
}

async function verifyWithTronGridAPI(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  try {
    const response = await fetch("https://api.trongrid.io/v1/accounts/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TRON-PRO-API-KEY": process.env.TRON_API_KEY!,
      },
      body: JSON.stringify({
        message: textToHex(message),
        signature: signature,
        address: address,
      }),
    });

    console.log(`TronGrid API status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        return await verifyWithLegacyTronGridAPI(message, signature, address);
      }
      throw new Error(`TronGrid API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("TronGrid API response:", result);

    return result.verified || result.result || false;
  } catch (error) {
    console.error("TronGrid API request failed:", error);
    throw error;
  }
}

async function verifyWithLegacyTronGridAPI(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://api.trongrid.io/wallet/validateaddress",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "TRON-PRO-API-KEY": process.env.TRON_API_KEY!,
        },
        body: JSON.stringify({
          address: address,
          visible: true,
        }),
      },
    );

    if (!response.ok) {
      return false;
    }

    const validationResult = await response.json();
    return validationResult.result || false;
  } catch (error) {
    console.error("Legacy TronGrid API failed:", error);
    return false;
  }
}

async function verifyWithLocalRecovery(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  try {
    const recoveredAddress = recoverAddressFromSignature(message, signature);
    const isValid = recoveredAddress?.toLowerCase() === address.toLowerCase();
    console.log(`Local recovery result: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error("Local recovery failed:", error);
    return false;
  }
}

function recoverAddressFromSignature(
  message: string,
  signature: string,
): string | null {
  try {
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

    const messageHash = keccak256(prefixedMessage);

    const recovery = v >= 27 ? v - 27 : v;
    const signature_obj = { r, s };
    const publicKey = ec.recoverPubKey(messageHash, signature_obj, recovery);

    const publicKeyBytes = Buffer.from(
      publicKey.encode("array", false).slice(1),
    );
    const publicKeyHash = keccak256(publicKeyBytes);
    const addressHex = "41" + publicKeyHash.slice(-20).toString("hex");
    const recoveredAddress = hexToBase58(addressHex);

    return recoveredAddress;
  } catch (error) {
    console.error("Error recovering address from signature:", error);
    return null;
  }
}

function keccak256(data: Buffer): Buffer {
  try {
    const { keccak256 } = require("@ethersproject/keccak256");
    const { arrayify } = require("@ethersproject/bytes");
    return Buffer.from(arrayify(keccak256(data)));
  } catch {
    return createHash("sha3-256").update(data).digest();
  }
}

function hexToBase58(hex: string): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  const hash1 = createHash("sha256").update(Buffer.from(hex, "hex")).digest();
  const hash2 = createHash("sha256").update(hash1).digest();
  const checksum = hash2.slice(0, 4).toString("hex");
  const hexWithChecksum = hex + checksum;

  let num = BigInt("0x" + hexWithChecksum);
  let encoded = "";

  while (num > 0) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    encoded = ALPHABET[remainder] + encoded;
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
