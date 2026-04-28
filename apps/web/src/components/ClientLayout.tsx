"use client";

import { useEffect, useState } from "react";
import { SolanaProvider } from "@/components/SolanaProvider";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SolanaProvider>
      <AuthProvider>
        {mounted && <Navbar />}
        <div className="flex-1">
          {children}
        </div>
      </AuthProvider>
    </SolanaProvider>
  );
};
