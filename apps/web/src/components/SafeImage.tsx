"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

// Highly stable, curated nature/mountain IDs that almost never fail
const STABLE_FALLBACKS = [
  "1544735716-392fe2489ffa", // Everest
  "1585016495481-91613a3ab1bc", // Annapurna
  "1627894483216-2138af692e32", // Langtang
  "1506012733851-f7975ab44749", // Summit
  "1502657877623-f66bf489d236"  // Machapuchare
];

interface SafeImageProps extends ImageProps {
  fallbackType?: "mountain" | "avatar";
}

export const SafeImage = ({ className, src, alt, fallbackType = "mountain", ...props }: SafeImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src as string);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    if (retryCount < STABLE_FALLBACKS.length) {
      // Try next stable fallback from the curated list
      const fallbackId = STABLE_FALLBACKS[retryCount];
      setCurrentSrc(`https://images.unsplash.com/photo-${fallbackId}?q=80&w=1000&auto=format&fit=crop`);
      setRetryCount(prev => prev + 1);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentSrc(src as string);
    setError(false);
    setLoading(true);
    setRetryCount(0);
  }, [src]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-zinc-100 flex items-center justify-center", className)}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 animate-pulse z-10">
          <Compass className="w-8 h-8 text-himalayan-blue/10 animate-spin" />
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Compass className="w-12 h-12 text-himalayan-blue/20 mb-2" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-himalayan-blue/40">Visualizing Highlands...</p>
        </div>
      ) : (
        <Image
          {...props}
          src={currentSrc}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={handleImageError}
          className={cn(
            "transition-all duration-700",
            loading ? "opacity-0 scale-110" : "opacity-100 scale-100",
            className
          )}
        />
      )}
    </div>
  );
};
