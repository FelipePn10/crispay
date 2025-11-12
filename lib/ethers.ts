import { verifyMessage } from "ethers";

/**
 * Verifica assinatura EVM e retorna o endereço recuperado
 */
export function verifyEvmSignature(message: string, signature: string): string {
  try {
    return verifyMessage(message, signature);
  } catch (error) {
    console.error("Error verifying EVM signature:", error);
    throw new Error("Invalid signature");
  }
}

/**
 * Verifica assinatura EVM e compara com endereço esperado
 */
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

/**
 * Valida endereço EVM
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
