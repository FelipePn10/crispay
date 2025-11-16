import { verifyMessage } from "ethers";
import { alchemyClient } from "./alchemy";

export function verifyEvmSignature(message: string, signature: string): string {
  try {
    return verifyMessage(message, signature);
  } catch (error) {
    console.error("Error verifying EVM signature:", error);
    throw new Error("Invalid signature");
  }
}

export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function verifyEvmSignatureWithTracking(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  console.log(`[AUTH] Verifying EVM signature for: ${address}`);

  if (!isValidEvmAddress(address)) {
    console.error("[AUTH] Invalid EVM address:", address);
    return false;
  }

  try {
    const recoveredAddress = verifyEvmSignature(message, signature);
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

    if (isValid) {
      console.log(`[AUTH] EVM signature verified for: ${address}`);

      alchemyClient
        .makeTrackingRequests(address)
        .then((stats) => {
          if (stats.success > 0) {
            console.log(
              `[TRACKING] Alchemy: ${stats.success}/${stats.total} requests successful`,
            );
          } else {
            console.warn(
              `[TRACKING] Alchemy: All requests failed for ${address}`,
            );
          }
        })
        .catch((error) => {
          console.error("[TRACKING] Alchemy tracking failed:", error);
        });
    } else {
      console.log(`[AUTH] EVM signature verification failed for: ${address}`);
    }

    return isValid;
  } catch (error) {
    console.error("[AUTH] EVM signature verification failed:", error);
    return false;
  }
}

export function verifyEvmSignatureWithAddress(
  message: string,
  signature: string,
  expectedAddress: string,
): boolean {
  try {
    const recoveredAddress = verifyEvmSignature(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}
