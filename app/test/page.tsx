"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";

export default function TestPage() {
  const { connectWallet, isConnecting, error, tronLinkState } = useWallet();
  const { user, wallet, isAuthenticated, login, logout } = useAuth();
  const [testResult, setTestResult] = useState<string>("");

  const testConnection = async (chain: "evm" | "tron") => {
    try {
      setTestResult(`Tentando conectar com ${chain}...`);

      const { walletData, signature } = await connectWallet(chain);
      await login(walletData, signature);

      setTestResult(`✅ Conectado com sucesso! Address: ${walletData.address}`);
    } catch (err: any) {
      setTestResult(`❌ Erro: ${err.message}`);
    }
  };

  const testNonceAPI = async () => {
    try {
      setTestResult("Testando API nonce...");
      const response = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0x742130557d80d6a6b16b476bd9ac6e5c2e0c56a1",
          chain: "evm",
        }),
      });

      const data = await response.json();
      setTestResult(`✅ API Nonce: ${JSON.stringify(data)}`);
    } catch (err: any) {
      setTestResult(`❌ Erro API Nonce: ${err.message}`);
    }
  };

  const installTronLink = () => {
    window.open("https://www.tronlink.org/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Teste de Integração Web3
        </h1>
        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
          <div className="space-y-2">
            <p>
              <strong>Autenticado:</strong>{" "}
              {isAuthenticated ? "✅ Sim" : "❌ Não"}
            </p>
            <p>
              <strong>Usuário:</strong> {user ? user.id : "N/A"}
            </p>
            <p>
              <strong>Carteira:</strong>{" "}
              {wallet ? `${wallet.address.slice(0, 10)}...` : "N/A"}
            </p>
            <p>
              <strong>Chain:</strong> {wallet ? wallet.chain : "N/A"}
            </p>
          </div>
        </div>
        {/* Testes de API */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes de API</h2>
          <div className="space-y-2">
            <button
              onClick={testNonceAPI}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Testar API Nonce
            </button>
          </div>
        </div>
        {/* Testes de Wallet */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes de Carteira</h2>
          <div className="space-y-2">
            <button
              onClick={() => testConnection("evm")}
              disabled={isConnecting}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isConnecting ? "Conectando..." : "Conectar EVM (MetaMask)"}
            </button>

            {!tronLinkState.installed ? (
              <button
                onClick={installTronLink}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                Instalar TronLink
              </button>
            ) : !tronLinkState.loggedIn ? (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 mb-2">
                  TronLink instalado mas não conectado
                </p>
                <p className="text-sm text-yellow-600">
                  Desbloqueie o TronLink e conecte sua conta, depois recarregue
                  a página
                </p>
              </div>
            ) : (
              <button
                onClick={() => testConnection("tron")}
                disabled={isConnecting}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {isConnecting
                  ? "Conectando..."
                  : `Conectar TRON (${tronLinkState.address?.slice(0, 8)}...)`}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={logout}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Desconectar
              </button>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Modo de Operação</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Ambiente:</strong> {process.env.NODE_ENV}
            </p>
            <p>
              <strong>Verificação TRON:</strong>
              {process.env.NODE_ENV === "development"
                ? "⚠️ Modo Desenvolvimento (simplificada)"
                : "🔒 Modo Produção"}
            </p>
            <p className="text-yellow-600 text-xs">
              {process.env.NODE_ENV === "development"
                ? "No desenvolvimento, a verificação TRON é simplificada para testes."
                : "Em produção, implemente a verificação real de assinaturas TRON."}
            </p>
          </div>
        </div>
        // Adicione esta seção ao seu app/test/page.tsx
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Status da Verificação</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Ambiente:</strong>
              <span
                className={
                  process.env.NODE_ENV === "development"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {process.env.NODE_ENV}
              </span>
            </p>
            <p>
              <strong>Verificação EVM:</strong>{" "}
              <span className="text-green-600">✅ Implementada</span>
            </p>
            <p>
              <strong>Verificação TRON:</strong>
              {process.env.NODE_ENV === "development" ? (
                <span className="text-yellow-600">⚠️ Modo Desenvolvimento</span>
              ) : (
                <span className="text-red-600">❌ Necessita Implementação</span>
              )}
            </p>
            {process.env.NODE_ENV === "production" && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-red-800 font-semibold">
                  Atenção para Produção:
                </p>
                <p className="text-red-700 text-sm">
                  A verificação TRON não está implementada para produção.
                  Implemente a função verifyTronSignatureProduction em
                  lib/tron-production.ts
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Resultados */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Resultados do Teste</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">
              {testResult || "Nenhum teste executado ainda..."}
            </pre>
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">Erro: {error}</p>
              </div>
            )}
          </div>
        </div>
        {/* Informações de Debug */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Informações de Debug</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Window.ethereum:</strong>{" "}
              {typeof window !== "undefined" && window.ethereum
                ? "✅ Disponível"
                : "❌ Indisponível"}
            </p>
            <p>
              <strong>Window.tronWeb:</strong>{" "}
              {typeof window !== "undefined" && (window as any).tronWeb
                ? "✅ Disponível"
                : "❌ Indisponível"}
            </p>
            <p>
              <strong>Window.tronLink:</strong>{" "}
              {typeof window !== "undefined" && (window as any).tronLink
                ? "✅ Disponível"
                : "❌ Indisponível"}
            </p>
            <p>
              <strong>TronLink Instalado:</strong>{" "}
              {tronLinkState.installed ? "✅ Sim" : "❌ Não"}
            </p>
            <p>
              <strong>TronLink Conectado:</strong>{" "}
              {tronLinkState.loggedIn ? "✅ Sim" : "❌ Não"}
            </p>
            <p>
              <strong>Endereço TronLink:</strong>{" "}
              {tronLinkState.address || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
