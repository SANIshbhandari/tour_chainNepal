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
  const { publicKey, disconnect, wallets, select, connecting } = useWallet();

  const handleConnect = async () => {
    // Try Phantom first, then Solflare
    const phantom = wallets.find(w => w.adapter.name === 'Phantom');
    const solflare = wallets.find(w => w.adapter.name === 'Solflare');
    
    const wallet = phantom || solflare || wallets[0];
    if (wallet) {
      select(wallet.adapter.name);
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
  );
};
