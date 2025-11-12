import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentFormProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onError,
}) => {
  const { wallet, requestPayment, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    amount: "",
    asset: "USDT" as "BTC" | "ETH" | "USDT",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !wallet) {
      onError?.("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);

    try {
      const chain =
        wallet.chain === "tron"
          ? "tron"
          : wallet.chain === "evm"
            ? "ethereum"
            : "bitcoin";

      const txHash = await requestPayment({
        ...formData,
        chain,
      });

      onSuccess?.(txHash);
      setFormData({ to: "", amount: "", asset: "USDT" });
    } catch (error: any) {
      onError?.(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Please connect your wallet to make payments
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Make a Payment
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={formData.to}
            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset
          </label>
          <select
            value={formData.asset}
            onChange={(e) =>
              setFormData({ ...formData, asset: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
            <option value="BTC">BTC</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Processing..." : "Send Payment"}
        </button>
      </div>
    </form>
  );
};
