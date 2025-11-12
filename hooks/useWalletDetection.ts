import { useState, useEffect } from "react";

export interface WalletDetection {
  hasMetaMask: boolean;
  hasTronLink: boolean;
  isTronLinkConnected: boolean;
}

export const useWalletDetection = () => {
  const [wallets, setWallets] = useState<WalletDetection>({
    hasMetaMask: false,
    hasTronLink: false,
    isTronLinkConnected: false,
  });

  useEffect(() => {
    const checkWallets = () => {
      setWallets({
        hasMetaMask: !!window.ethereum,
        hasTronLink: !!window.tronWeb,
        isTronLinkConnected: !!window.tronWeb?.ready,
      });
    };

    // Check initially
    checkWallets();

    // Listen for wallet changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", checkWallets);
      window.ethereum.on("chainChanged", checkWallets);
    }

    // Check for TronLink periodically
    const tronInterval = setInterval(checkWallets, 1000);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", checkWallets);
        window.ethereum.removeListener("chainChanged", checkWallets);
      }
      clearInterval(tronInterval);
    };
  }, []);

  return wallets;
};
