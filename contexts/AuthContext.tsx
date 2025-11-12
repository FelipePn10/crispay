"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { signToken, verifyToken } from "@/lib/jwt";
import { WalletConnection } from "@/types/wallet";

interface AuthContextType {
  user: any | null;
  wallet: WalletConnection | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletData: WalletConnection, signature: string) => Promise<void>;
  logout: () => void;
  requestPayment: (transaction: any) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const walletData = localStorage.getItem("wallet_data");

      if (token && walletData) {
        const decoded = verifyToken(token);
        if (decoded) {
          setUser(decoded);
          setWallet(JSON.parse(walletData));
        } else {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("wallet_data");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("wallet_data");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (walletData: WalletConnection, signature: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: walletData.address,
          chain: walletData.chain,
          signature,
        }),
      });

      if (!response.ok) throw new Error("Authentication failed");

      const { token, user: userData } = await response.json();

      localStorage.setItem("auth_token", token);
      localStorage.setItem("wallet_data", JSON.stringify(walletData));

      setUser(userData);
      setWallet(walletData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("wallet_data");
    setUser(null);
    setWallet(null);
  };

  const requestPayment = async (transaction: any): Promise<string> => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch("/api/transactions/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error("Payment failed");

    const { txHash } = await response.json();
    return txHash;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        requestPayment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
