"use client";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode } from "react";

// Import styles dynamically to avoid SSR issues
if (typeof window !== "undefined") {
  require("@solana/wallet-adapter-react-ui/styles.css");
}

export function WalletModal({ children }: { children: ReactNode }) {
  return <WalletModalProvider>{children}</WalletModalProvider>;
}
