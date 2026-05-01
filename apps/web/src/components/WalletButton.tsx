"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export const WalletButton = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="h-11 px-6 bg-gradient-to-r from-trekker-orange to-orange-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-trekker-orange/20">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <WalletButtonInner />;
};

// Separate component that uses wallet hooks - only rendered after mount
const WalletButtonInner = () => {
  const { publicKey, disconnect, connect, select, wallets, connecting, wallet } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      if (wallet) {
        // If wallet is already selected, just connect
        await connect();
      } else {
        // Show dropdown to select wallet
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  const handleSelectWallet = async (walletName: string) => {
    try {
      select(walletName);
      setShowDropdown(false);
      // Auto-connect will handle the connection
    } catch (err) {
      console.error("Wallet selection error:", err);
    }
  };

  if (publicKey) {
    return (
      <button
        onClick={disconnect}
        className="h-11 px-6 bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-trekker-orange/90 hover:to-orange-600/90 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all shadow-lg shadow-trekker-orange/20 hover:shadow-xl hover:shadow-trekker-orange/30"
      >
        {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="h-11 px-6 bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-trekker-orange/90 hover:to-orange-600/90 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all shadow-lg shadow-trekker-orange/20 hover:shadow-xl hover:shadow-trekker-orange/30 disabled:opacity-50"
      >
        {connecting ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Connect Wallet"
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Connect Wallet</h3>
              <p className="text-xs text-gray-500 mt-1">Choose your wallet</p>
            </div>
            <div className="p-2">
              {wallets.filter(w => w.readyState === "Installed" || w.readyState === "Loadable").map((w) => (
                <button
                  key={w.adapter.name}
                  onClick={() => handleSelectWallet(w.adapter.name)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  {w.adapter.icon && (
                    <img 
                      src={w.adapter.icon} 
                      alt={w.adapter.name}
                      className="w-8 h-8 rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{w.adapter.name}</div>
                    <div className="text-xs text-gray-500">
                      {w.readyState === "Installed" ? "Detected" : "Available"}
                    </div>
                  </div>
                </button>
              ))}
              {wallets.filter(w => w.readyState === "Installed" || w.readyState === "Loadable").length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No wallets detected. Please install Phantom or Solflare.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
