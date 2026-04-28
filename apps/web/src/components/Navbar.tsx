"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, LayoutDashboard, Award, Landmark, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { WalletButton } from "./WalletButton";

const navigation = [
  { name: "Explore", href: "/explore", icon: Map },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vibe", href: "/vibe", icon: Award },
  { name: "DAO", href: "/dao", icon: Landmark },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-himalayan-blue/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-trekker-orange to-trekker-orange/80 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-trekker-orange/20">
            <Compass className="text-white w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <span className="font-playfair text-2xl text-summit-white tracking-tight block leading-none">
              Tour Chain
            </span>
            <span className="text-xs text-trekker-orange font-semibold tracking-wider uppercase">Nepal</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg",
                  isActive 
                    ? "text-trekker-orange bg-trekker-orange/10" 
                    : "text-summit-white/70 hover:text-summit-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <WalletButton />
        </div>
      </div>
    </nav>
  );
};
