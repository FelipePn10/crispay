// app/connect-wallet/page.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletDetection } from "@/hooks/useWalletDetection";

export default function ConnectWalletPage() {
  const [selectedChain, setSelectedChain] = useState<"evm" | "tron" | null>(
    null,
  );
  const { connectWallet, isConnecting, error, clearError, tronLinkState } =
    useWallet();
  const { user, wallet, isAuthenticated, login, logout } = useAuth();
  const walletDetection = useWalletDetection();
  const router = useRouter();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Limpar erro quando selecionar nova chain
  useEffect(() => {
    if (selectedChain) {
      clearError();
    }
  }, [selectedChain, clearError]);

  const handleChainSelect = (chain: "evm" | "tron") => {
    setSelectedChain(chain);
  };

  const handleConnect = async () => {
    if (!selectedChain) return;

    try {
      const { walletData, signature } = await connectWallet(selectedChain);
      await login(walletData, signature);

      // O redirecionamento acontecerá automaticamente pelo useEffect acima
    } catch (err) {
      // Erro já é tratado pelo hook useWallet
      console.error("Connection failed:", err);
    }
  };

  const getWalletIcon = (chain: "evm" | "tron") => {
    if (chain === "evm") {
      return (
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
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#FF060A" />
          <path
            d="M12 6C8.7 6 6 8.7 6 12S8.7 18 12 18 18 15.3 18 12 15.3 6 12 6Z"
            fill="white"
          />
          <path
            d="M12 8C9.8 8 8 9.8 8 12S9.8 16 12 16 16 14.2 16 12 14.2 8 12 8Z"
            fill="#FF060A"
          />
        </svg>
      );
    }
  };

  const availableChains = [
    {
      id: "evm",
      name: "EVM Chains",
      description: "MetaMask, Trust Wallet, Coinbase Wallet, etc.",
      icon: getWalletIcon("evm"),
      available: walletDetection.hasMetaMask,
      installLink: "https://metamask.io/download/",
      installText: "Install MetaMask",
    },
    {
      id: "tron",
      name: "TRON Chain",
      description: "TronLink Wallet",
      icon: getWalletIcon("tron"),
      available: tronLinkState.installed,
      installLink: "https://www.tronlink.org/",
      installText: "Install TronLink",
      status: tronLinkState.installed
        ? tronLinkState.loggedIn
          ? "Connected"
          : "Please unlock"
        : "Not installed",
    },
  ];

  const getConnectionStep = () => {
    if (isAuthenticated) return "success";
    if (isConnecting) return "connecting";
    return "select";
  };

  const connectionStep = getConnectionStep();

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center">
      {/* Main container with proper margins */}
      <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen">
        {/* Left vertical line */}
        <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

        {/* Right vertical line */}
        <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0"></div>

        <div className="self-stretch pt-[9px] overflow-hidden flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-[66px] relative z-10">
          {/* Navigation */}
          <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
            <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]"></div>

            <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
              <div className="flex justify-center items-center">
                <div className="flex justify-start items-center">
                  <div
                    className="flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans cursor-pointer"
                    onClick={() => router.push("/")}
                  >
                    CrisPay
                  </div>
                </div>
                <div className="pl-3 sm:pl-4 md:pl-5 lg:pl-5 flex justify-start items-start hidden sm:flex flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-4">
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                      Products
                    </div>
                  </div>
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                      Pricing
                    </div>
                  </div>
                  <div className="flex justify-start items-center">
                    <div className="flex flex-col justify-center text-[rgba(49,45,43,0.80)] text-xs md:text-[13px] font-medium leading-[14px] font-sans">
                      Docs
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-6 sm:h-7 md:h-8 flex justify-start items-start gap-2 sm:gap-3">
                <div
                  className="px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(55,50,47,0.12)] overflow-hidden rounded-full flex justify-center items-center cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  <div className="flex flex-col justify-center text-[#37322F] text-xs md:text-[13px] font-medium leading-5 font-sans">
                    Back to Home
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
            {/* Hero Section */}
            <div className="w-full max-w-2xl text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#49423D] leading-tight font-sans mb-4">
                Connect Your Wallet
              </h1>
              <p className="text-[#605A57] text-lg font-normal leading-7 font-sans">
                Choose your preferred blockchain to connect to CrisPay. Start
                making instant crypto payments with ease and security.
              </p>
            </div>

            {/* Wallet Connection Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[rgba(55,50,47,0.12)] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[rgba(55,50,47,0.12)]">
                <h2 className="text-[#37322F] text-xl font-semibold font-sans">
                  {connectionStep === "select" && "Select Blockchain"}
                  {connectionStep === "connecting" && "Connecting..."}
                  {connectionStep === "success" && "Connected!"}
                </h2>
                <p className="text-[#605A57] text-sm mt-2 font-sans">
                  {connectionStep === "select" &&
                    "Choose your preferred blockchain network"}
                  {connectionStep === "connecting" &&
                    "Please confirm the connection in your wallet"}
                  {connectionStep === "success" &&
                    "Wallet connected successfully"}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {connectionStep === "select" && (
                  <>
                    {/* Available Chains */}
                    <div className="space-y-4">
                      {availableChains.map((chain) => (
                        <div key={chain.id}>
                          {chain.available ? (
                            <button
                              onClick={() =>
                                handleChainSelect(chain.id as "evm" | "tron")
                              }
                              className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 text-left ${
                                selectedChain === chain.id
                                  ? "border-[#3B82F6] bg-blue-50 shadow-sm"
                                  : "border-[rgba(55,50,47,0.12)] hover:border-[#3B82F6] hover:bg-blue-50"
                              }`}
                            >
                              <div className="flex-shrink-0">{chain.icon}</div>
                              <div className="flex-1">
                                <div className="text-[#37322F] font-medium font-sans">
                                  {chain.name}
                                </div>
                                <div className="text-[#605A57] text-sm font-sans">
                                  {chain.description}
                                </div>
                                {chain.status && (
                                  <div
                                    className={`text-xs mt-1 ${
                                      chain.status === "Connected"
                                        ? "text-green-600"
                                        : chain.status === "Please unlock"
                                          ? "text-yellow-600"
                                          : "text-gray-500"
                                    }`}
                                  >
                                    {chain.status}
                                  </div>
                                )}
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedChain === chain.id
                                    ? "border-[#3B82F6] bg-[#3B82F6]"
                                    : "border-[rgba(55,50,47,0.2)]"
                                }`}
                              >
                                {selectedChain === chain.id && (
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
                          ) : (
                            <a
                              href={chain.installLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full p-4 rounded-xl border border-[rgba(55,50,47,0.12)] flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-shrink-0">{chain.icon}</div>
                              <div className="flex-1">
                                <div className="text-[#37322F] font-medium font-sans">
                                  {chain.name}
                                </div>
                                <div className="text-[#605A57] text-sm font-sans">
                                  {chain.description}
                                </div>
                                <div className="text-blue-600 text-xs mt-1">
                                  {chain.installText}
                                </div>
                              </div>
                              <div className="w-5 h-5 rounded-full border-2 border-[rgba(55,50,47,0.2)] flex items-center justify-center">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800 text-sm">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M12 8V12M12 16H12.01"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          {error}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {connectionStep === "connecting" && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[#605A57] text-center font-sans">
                      Waiting for confirmation in your wallet...
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-[#605A57]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
                    {wallet && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-[#605A57]">
                          Connected to:{" "}
                          <span className="font-mono text-xs">
                            {wallet.address.slice(0, 8)}...
                            {wallet.address.slice(-6)}
                          </span>
                        </p>
                        <p className="text-sm text-[#605A57]">
                          Chain:{" "}
                          <span className="font-medium">
                            {wallet.chain.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {connectionStep === "select" && (
                <div className="p-6 border-t border-[rgba(55,50,47,0.12)] bg-[#F7F5F3]">
                  <button
                    onClick={handleConnect}
                    disabled={!selectedChain || isConnecting}
                    className={`w-full py-3 px-4 rounded-xl font-medium font-sans transition-all duration-200 ${
                      selectedChain && !isConnecting
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
                    onClick={() => {
                      // Cancel connection logic would go here
                      window.location.reload();
                    }}
                    className="w-full py-3 px-4 rounded-xl font-medium font-sans bg-white text-[#37322F] border border-[rgba(55,50,47,0.12)] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="w-full max-w-2xl mt-12 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#605A57]">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 16V12M12 8H12.01"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p>Secure Web3 authentication</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p>No fees to connect</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                      />
                      <path
                        d="M19.4 15C17.17 19.87 12 21.5 12 21.5C12 21.5 6.83 19.87 4.6 15C2.37 10.13 4.6 5.5 4.6 5.5C4.6 5.5 12 3.5 12 3.5C12 3.5 19.4 5.5 19.4 5.5C19.4 5.5 21.63 10.13 19.4 15Z"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <p>Multi-chain support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
