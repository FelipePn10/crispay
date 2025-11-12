import { useState, useCallback } from "react";
import { useTronLinkDetection } from "./useTronLinkDetection";

interface WalletConnection {
  address: string;
  chain: "evm" | "tron";
  connector: "metamask" | "tronlink";
}

interface ConnectResult {
  walletData: WalletConnection;
  signature: string;
}

declare global {
  interface Window {
    ethereum?: any;
    tronWeb?: any;
    tronLink?: any;
  }
}

export const useWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tronLinkState = useTronLinkDetection();

  const connectEVM = useCallback(async (): Promise<{
    address: string;
    signature: string;
  }> => {
    if (!window.ethereum) {
      throw new Error(
        "No Ethereum wallet found. Please install MetaMask or another Web3 wallet.",
      );
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];

      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chain: "evm" }),
      });

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(errorData.error || "Failed to get nonce");
      }

      const { message } = await nonceResponse.json();

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      return { address, signature };
    } catch (err: any) {
      throw new Error(err.message || "Failed to connect EVM wallet");
    }
  }, []);

  const connectTron = useCallback(async (): Promise<{
    address: string;
    signature: string;
  }> => {
    if (!tronLinkState.installed) {
      throw new Error(
        "TronLink is not installed. Please install TronLink and refresh the page.",
      );
    }

    if (!tronLinkState.loggedIn) {
      throw new Error(
        "TronLink is not connected. Please unlock TronLink and connect your account.",
      );
    }

    try {
      const tronWeb = window.tronWeb;

      if (
        !tronWeb ||
        !tronWeb.defaultAddress ||
        !tronWeb.defaultAddress.base58
      ) {
        throw new Error(
          "TronLink is not properly initialized. Please refresh the page.",
        );
      }

      const address = tronWeb.defaultAddress.base58;

      // Busca o nonce do servidor
      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chain: "tron" }),
      });

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(errorData.error || "Failed to get nonce");
      }

      const { message } = await nonceResponse.json();

      console.log("📝 Mensagem para assinar:", message);

      // Converte a mensagem para hex (TronLink espera mensagem em texto)
      let signature: string;

      try {
        // Método 1: signMessageV2 - mais recente e recomendado
        if (typeof tronWeb.trx.signMessageV2 === "function") {
          console.log("🔐 Usando signMessageV2");
          signature = await tronWeb.trx.signMessageV2(message);
        }
        // Método 2: signMessage - antigo mas ainda suportado
        else if (typeof tronWeb.trx.signMessage === "function") {
          console.log("🔐 Usando signMessage");
          signature = await tronWeb.trx.signMessage(message);
        }
        // Método 3: Tenta via tronLink diretamente
        else if (
          window.tronLink &&
          typeof window.tronLink.signMessage === "function"
        ) {
          console.log("🔐 Usando tronLink.signMessage");
          signature = await window.tronLink.signMessage(message);
        }
        // Método 4: sign - método genérico
        else if (typeof tronWeb.trx.sign === "function") {
          console.log("🔐 Usando trx.sign");
          const messageHex = tronWeb.toHex(message);
          signature = await tronWeb.trx.sign(messageHex);
        } else {
          throw new Error(
            "No compatible signing method found in TronLink. Please update TronLink to the latest version.",
          );
        }

        console.log(
          "✅ Assinatura obtida:",
          signature.substring(0, 20) + "...",
        );

        // Valida que a assinatura foi obtida
        if (!signature || typeof signature !== "string") {
          throw new Error("Invalid signature format received from TronLink");
        }

        // Remove prefixo 0x se existir (algumas versões do TronLink adicionam)
        signature = signature.replace(/^0x/, "");

        // Verifica se a assinatura tem o tamanho correto (130 caracteres hex = 65 bytes)
        if (signature.length !== 130) {
          console.warn(
            `⚠️ Assinatura com tamanho inesperado: ${signature.length} (esperado: 130)`,
          );
        }

        return { address, signature };
      } catch (signError: any) {
        console.error("❌ Erro ao assinar mensagem:", signError);

        // Mensagens de erro mais específicas
        if (signError.message?.includes("User rejected")) {
          throw new Error("Signature request was rejected by user");
        } else if (signError.message?.includes("timeout")) {
          throw new Error("Signature request timed out. Please try again.");
        } else {
          throw new Error(
            `Failed to sign message: ${signError.message || "Unknown error"}`,
          );
        }
      }
    } catch (err: any) {
      console.error("❌ Erro na conexão Tron:", err);
      throw new Error(err.message || "Failed to connect Tron wallet");
    }
  }, [tronLinkState]);

  const connectWallet = useCallback(
    async (chain: "evm" | "tron"): Promise<ConnectResult> => {
      setIsConnecting(true);
      setError(null);

      try {
        let result: { address: string; signature: string };
        let connector: "metamask" | "tronlink";

        switch (chain) {
          case "evm":
            result = await connectEVM();
            connector = "metamask";
            break;
          case "tron":
            result = await connectTron();
            connector = "tronlink";
            break;
          default:
            throw new Error(`Unsupported chain: ${chain}`);
        }

        const walletData: WalletConnection = {
          address: result.address,
          chain,
          connector,
        };

        console.log("✅ Carteira conectada:", {
          chain,
          address: result.address,
          signatureLength: result.signature.length,
        });

        return { walletData, signature: result.signature };
      } catch (err: any) {
        const errorMessage = err.message || "Unknown error occurred";
        setError(errorMessage);
        console.error("❌ Erro ao conectar carteira:", errorMessage);
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [connectEVM, connectTron],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connectWallet,
    isConnecting,
    error,
    clearError,
    tronLinkState,
  };
};
