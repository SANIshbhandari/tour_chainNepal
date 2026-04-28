"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Share2, 
  ExternalLink, 
  CheckCircle2,
  Clock,
  Map,
  Award,
  Link as LinkIcon,
  Zap
} from "lucide-react";

type Proof = {
  id: string;
  booking_id: string;
  nft_mint_address: string | null;
  metadata_uri: string | null;
  created_at: string;
  route?: { name?: string } | null;
};

const DEMO_PROOFS: Proof[] = [
  { id: "d1", booking_id: "b1", nft_mint_address: "9wQ3rF...dM1", metadata_uri: "ipfs://QmX9...proof1", created_at: new Date(Date.now() - 86400000 * 2).toISOString(), route: { name: "Poon Hill Trek" } },
  { id: "d2", booking_id: "b2", nft_mint_address: "GsM7tK...dM2", metadata_uri: "ipfs://QmY2...proof2", created_at: new Date(Date.now() - 86400000 * 5).toISOString(), route: { name: "Annapurna Circuit" } },
  { id: "d3", booking_id: "b3", nft_mint_address: "HrP4nQ...dM3", metadata_uri: "ipfs://QmZ8...proof3", created_at: new Date(Date.now() - 86400000 * 9).toISOString(), route: { name: "Everest Base Camp" } },
  { id: "d4", booking_id: "b4", nft_mint_address: "KwL6mS...dM4", metadata_uri: "ipfs://QmW5...proof4", created_at: new Date(Date.now() - 86400000 * 14).toISOString(), route: { name: "Langtang Valley" } },
];

const EMOJIS = ["🏔️", "⛰️", "🌄", "🗺️", "🧗", "🏕️"];
const COLORS = [
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-red-600",
  "from-purple-600 to-pink-600",
];

function ProofCard({ proof, index }: { proof: Proof; index: number }) {
  const [flipped, setFlipped] = useState(false);

  const short = (s: string | null) => (s ? s.slice(0, 6) + "…" + s.slice(-4) : "pending");
  const emoji = EMOJIS[index % EMOJIS.length];
  const gradient = COLORS[index % COLORS.length];
  const date = new Date(proof.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
        style={{
          transformStyle: "preserve-3d",
          height: "240px",
        }}
      >
        {/* Front */}
        <motion.div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} p-6 flex flex-col justify-between shadow-2xl`}
          style={{ backfaceVisibility: "hidden" }}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
        >
          <div className="flex justify-between items-start">
            <motion.span 
              className="text-5xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {emoji}
            </motion.span>
            <motion.span 
              className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-3 h-3" />
              NFT Proof
            </motion.span>
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {date}
            </p>
            <h3 className="text-white text-xl font-bold leading-tight mb-2">
              {proof.route?.name ?? "Journey Proof"}
            </h3>
            <motion.p 
              className="text-white/60 text-xs flex items-center gap-1"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              Tap to reveal details →
            </motion.p>
          </div>
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-white/40"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, delay: i * 0.1, repeat: Infinity, repeatDelay: 3 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Back */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex flex-col justify-between shadow-2xl border border-white/10"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              On-Chain Data
            </p>
            <div className="space-y-3">
              <motion.div 
                className="bg-white/5 rounded-xl p-3 border border-white/10"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <p className="text-white/40 text-xs mb-1">Mint Address</p>
                <p className="text-white font-mono text-sm">{short(proof.nft_mint_address)}</p>
              </motion.div>
              <motion.div 
                className="bg-white/5 rounded-xl p-3 border border-white/10"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <p className="text-white/40 text-xs mb-1">Metadata URI</p>
                <p className="text-white font-mono text-sm truncate">{short(proof.metadata_uri)}</p>
              </motion.div>
            </div>
          </div>
          <div className="flex gap-2">
            {proof.nft_mint_address && (
              <motion.a
                href={`https://explorer.solana.com/address/${proof.nft_mint_address}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold py-2.5 rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-3 h-3" />
                View Explorer
              </motion.a>
            )}
            <motion.button
              onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ↩
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function StatBadge({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  const [count, setCount] = useState(0);
  const target = typeof value === "number" ? value : 0;

  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(start);
    }, 30);
    return () => clearInterval(t);
  }, [target, value]);

  const IconComponent = 
    label.includes("Journeys") ? Map :
    label.includes("Minted") ? Award :
    label.includes("Pending") ? Clock :
    LinkIcon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center relative overflow-hidden group"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      />
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <IconComponent className="w-10 h-10 mx-auto mb-3 text-white/80" />
      </motion.div>
      <motion.div 
        className="text-3xl font-bold text-white mb-1"
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {typeof value === "number" ? count : value}
      </motion.div>
      <div className="text-white/60 text-xs uppercase tracking-wider font-semibold">{label}</div>
    </motion.div>
  );
}

export default function VibePage() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/proofs");
        const payload = await res.json();
        if (res.ok && payload.proofs?.length) {
          setProofs(payload.proofs);
        } else {
          setProofs(DEMO_PROOFS);
        }
      } catch {
        setProofs(DEMO_PROOFS);
      }
      setLoaded(true);
    };
    void load();
  }, []);

  const displayed = proofs.filter((p) => {
    if (filter === "minted") return !!p.nft_mint_address;
    if (filter === "pending") return !p.nft_mint_address;
    return true;
  });

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2027 100%)" }}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-32 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20" 
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-10" 
          style={{ background: "radial-gradient(circle, #10b981, transparent)" }}
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 pt-28 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 text-sm text-white/70 mb-6"
            animate={{ boxShadow: ["0 0 0 0 rgba(16, 185, 129, 0)", "0 0 0 10px rgba(16, 185, 129, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Live on Solana Devnet
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold text-white mb-4" 
            style={{ fontFamily: "Georgia, serif" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.span
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(59,130,246,0.3)",
                  "0 0 40px rgba(59,130,246,0.6)",
                  "0 0 20px rgba(59,130,246,0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🏔️ Himalayan Vibe
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-white/60 text-lg max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your verified journey proofs, minted as NFTs on-chain. Each card holds immutable proof of your Himalayan adventure.
          </motion.p>
          
          <motion.button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-orange-500/30"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 146, 60, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share My Vibes
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          <StatBadge value={proofs.length} label="Total Journeys" icon="🗺️" />
          <StatBadge value={proofs.filter(p => !!p.nft_mint_address).length} label="Minted NFTs" icon="🎖️" />
          <StatBadge value={proofs.filter(p => !p.nft_mint_address).length} label="Pending Mint" icon="⏳" />
          <StatBadge value={loaded ? "Live" : "…"} label="Chain Status" icon="⛓️" />
        </motion.div>

        {/* Filter tabs */}
        <motion.div 
          className="flex gap-3 mb-10 justify-center flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { key: "all", label: "All Proofs", icon: null },
            { key: "minted", label: "Minted", icon: CheckCircle2 },
            { key: "pending", label: "Pending", icon: Clock }
          ].map(({ key, label, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === key
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/10"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          {!loaded ? (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-[240px] rounded-3xl bg-white/5 backdrop-blur-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          ) : displayed.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div 
                className="text-7xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🧗
              </motion.div>
              <p className="text-white/50 text-lg font-semibold">No proofs found for this filter.</p>
              <p className="text-white/30 text-sm mt-2">Try selecting a different filter above</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {displayed.map((proof, i) => (
                <ProofCard key={proof.id} proof={proof} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer hint */}
        <motion.p 
          className="text-center text-white/30 text-sm mt-16 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Sparkles className="w-4 h-4" />
          Tap any card to reveal on-chain proof data • Powered by Solana
        </motion.p>
      </div>
    </main>
  );
}
