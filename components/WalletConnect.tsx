import React from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";

export const WalletConnect: React.FC = () => {
  const { connectWallet, isConnecting, error } = useWallet();
  const { login, logout, isAuthenticated, wallet } = useAuth();

  const handleConnect = async (chain: "evm" | "tron") => {
    try {
      const { walletData, signature } = await connectWallet(chain);
      await login(walletData, signature);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  if (isAuthenticated && wallet) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Connected</p>
            <p className="text-xs text-green-600 mt-1">
              {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)} •{" "}
              {wallet.chain.toUpperCase()}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Connect Your Wallet
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => handleConnect("evm")}
          disabled={isConnecting}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
              Connecting...
            </div>
          ) : (
            "Connect EVM Wallet (MetaMask)"
          )}
        </button>

        <button
          onClick={() => handleConnect("tron")}
          disabled={isConnecting}
          className="w-full flex items-center justify-center px-4 py-3 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
              Connecting...
            </div>
          ) : (
            "Connect Tron Wallet (TronLink)"
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        We support MetaMask for EVM chains and TronLink for TRON network
      </p>
    </div>
  );
};
