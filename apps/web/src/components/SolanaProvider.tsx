"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  
  const cluster = (process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet").toLowerCase();
  const network =
    cluster === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : cluster === "testnet"
        ? WalletAdapterNetwork.Testnet
        : WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl(network),
    [network],
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render wallet providers until mounted on client
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
