"use client";

export function TronLinkInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        Para usar o TronLink:
      </h3>
      <ol className="list-decimal list-inside space-y-1 text-blue-700">
        <li>Instale a extensão TronLink no seu navegador</li>
        <li>Crie ou importe uma carteira TRON</li>
        <li>Desbloqueie a carteira no TronLink</li>
        <li>Recarregue esta página</li>
        <li>Clique em "Conectar TRON"</li>
      </ol>
      <div className="mt-3">
        <a
          href="https://www.tronlink.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Baixar TronLink
        </a>
      </div>
    </div>
  );
}
