"use client";

import type React from "react";
import { useState, useEffect } from "react";

interface ConnectWalletProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: string) => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<
    "select" | "connecting" | "success"
  >("select");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedWallet(null);
      setIsConnecting(false);
      setConnectionStep("select");
    }
  }, [isOpen]);

  const handleWalletSelect = (wallet: string) => {
    setSelectedWallet(wallet);
  };

  const handleConnect = async () => {
    if (!selectedWallet) return;

    setIsConnecting(true);
    setConnectionStep("connecting");

    // Simulate wallet connection process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setConnectionStep("success");

    // Simulate successful connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onConnect(selectedWallet);
    onClose();
  };

  const popularWallets = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Connect using browser extension",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21.5 2L12 8.5L13.5 5L21.5 2Z"
            fill="#E17726"
            stroke="#E17726"
            strokeWidth="0.5"
          />
          <path
            d="M2.5 2L12 8.5L10.5 5L2.5 2Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
          <path
            d="M18.5 16.5L16.5 19L21 20L22 16.5H18.5Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
          <path
            d="M2 16.5L3 20L7.5 19L5.5 16.5H2Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
          <path
            d="M7.5 11L6 13.5L12 13.5L11.5 9L7.5 11Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
          <path
            d="M16.5 11L12.5 9L12 13.5L18 13.5L16.5 11Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
          <path
            d="M7.5 19L10.5 17.5L8 16.5L7.5 19Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
          <path
            d="M13.5 17.5L16.5 19L16 16.5L13.5 17.5Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
          />
        </svg>
      ),
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Scan QR code with mobile wallet",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#3B99FC" />
          <path
            d="M7 9.5C9.5 7 14.5 7 17 9.5M9.5 17C7 14.5 7 9.5 9.5 7M14.5 17C17 14.5 17 9.5 14.5 7"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      description: "Connect with Coinbase app",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#0052FF" />
          <path
            d="M12 6C8.7 6 6 8.7 6 12S8.7 18 12 18 18 15.3 18 12 15.3 6 12 6ZM11 13H9V11H11V13ZM15 13H13V11H15V13Z"
            fill="white"
          />
        </svg>
      ),
    },
    {
      id: "phantom",
      name: "Phantom",
      description: "Solana ecosystem wallet",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#AB9FF2" />
          <path d="M15 7H9V17H15V7Z" fill="white" />
          <path d="M13 9H11V15H13V9Z" fill="#AB9FF2" />
        </svg>
      ),
    },
  ];

  const otherWallets = [
    {
      id: "trustwallet",
      name: "Trust Wallet",
      description: "Mobile wallet app",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#3375BB" />
          <path
            d="M16 8H8V16H16V8Z"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
      ),
    },
    {
      id: "ledger",
      name: "Ledger",
      description: "Hardware wallet",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#000" />
          <path d="M8 7H16V17H8V7Z" fill="white" />
          <path d="M10 9H14V15H10V9Z" fill="#000" />
        </svg>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[rgba(55,50,47,0.12)]">
          <div className="flex justify-between items-center">
            <h2 className="text-[#37322F] text-xl font-semibold font-sans">
              {connectionStep === "select" && "Connect Wallet"}
              {connectionStep === "connecting" && "Connecting..."}
              {connectionStep === "success" && "Connected!"}
            </h2>
            <button
              onClick={onClose}
              className="text-[#605A57] hover:text-[#37322F] transition-colors p-2 rounded-lg hover:bg-[#F7F5F3]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="text-[#605A57] text-sm mt-2 font-sans">
            {connectionStep === "select" &&
              "Choose your preferred wallet to connect"}
            {connectionStep === "connecting" &&
              "Please confirm the connection in your wallet"}
            {connectionStep === "success" && "Wallet connected successfully"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {connectionStep === "select" && (
            <>
              {/* Popular Wallets */}
              <div className="mb-6">
                <h3 className="text-[#37322F] font-medium text-sm mb-3 font-sans">
                  Popular
                </h3>
                <div className="space-y-2">
                  {popularWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletSelect(wallet.id)}
                      className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 text-left ${
                        selectedWallet === wallet.id
                          ? "border-[#3B82F6] bg-blue-50 shadow-sm"
                          : "border-[rgba(55,50,47,0.12)] hover:border-[#3B82F6] hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex-shrink-0">{wallet.icon}</div>
                      <div className="flex-1">
                        <div className="text-[#37322F] font-medium font-sans">
                          {wallet.name}
                        </div>
                        <div className="text-[#605A57] text-sm font-sans">
                          {wallet.description}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedWallet === wallet.id
                            ? "border-[#3B82F6] bg-[#3B82F6]"
                            : "border-[rgba(55,50,47,0.2)]"
                        }`}
                      >
                        {selectedWallet === wallet.id && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Wallets */}
              <div>
                <h3 className="text-[#37322F] font-medium text-sm mb-3 font-sans">
                  Other Wallets
                </h3>
                <div className="space-y-2">
                  {otherWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleWalletSelect(wallet.id)}
                      className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 text-left ${
                        selectedWallet === wallet.id
                          ? "border-[#3B82F6] bg-blue-50 shadow-sm"
                          : "border-[rgba(55,50,47,0.12)] hover:border-[#3B82F6] hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex-shrink-0">{wallet.icon}</div>
                      <div className="flex-1">
                        <div className="text-[#37322F] font-medium font-sans">
                          {wallet.name}
                        </div>
                        <div className="text-[#605A57] text-sm font-sans">
                          {wallet.description}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedWallet === wallet.id
                            ? "border-[#3B82F6] bg-[#3B82F6]"
                            : "border-[rgba(55,50,47,0.2)]"
                        }`}
                      >
                        {selectedWallet === wallet.id && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 6L9 17L4 12"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {connectionStep === "connecting" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#605A57] text-center font-sans">
                Waiting for confirmation in your wallet...
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#605A57]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8V12L14 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                This may take a few seconds
              </div>
            </div>
          )}

          {connectionStep === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#10B981" />
                  <path
                    d="M8 12L11 15L16 9"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-[#37322F] text-lg font-semibold mb-2 font-sans">
                Wallet Connected!
              </p>
              <p className="text-[#605A57] text-center font-sans">
                Your wallet has been successfully connected to CrisPay.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {connectionStep === "select" && (
          <div className="p-6 border-t border-[rgba(55,50,47,0.12)] bg-[#F7F5F3]">
            <button
              onClick={handleConnect}
              disabled={!selectedWallet || isConnecting}
              className={`w-full py-3 px-4 rounded-xl font-medium font-sans transition-all duration-200 ${
                selectedWallet && !isConnecting
                  ? "bg-[#37322F] text-white hover:bg-[#49423D] shadow-sm"
                  : "bg-[#E0DEDB] text-[#605A57] cursor-not-allowed"
              }`}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>

            <div className="mt-4 text-center">
              <p className="text-[#605A57] text-xs font-sans">
                By connecting, I accept CrisPay's{" "}
                <a href="#" className="text-[#3B82F6] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#3B82F6] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        )}

        {connectionStep === "connecting" && (
          <div className="p-6 border-t border-[rgba(55,50,47,0.12)] bg-[#F7F5F3]">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl font-medium font-sans bg-white text-[#37322F] border border-[rgba(55,50,47,0.12)] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectWallet;
