"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Mail,
  CheckCircle2,
  Sparkles,
  Users,
  Globe,
  Award,
  Zap,
  ArrowRight,
  MapPin,
  Shield,
  Coins
} from "lucide-react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  // Load waitlist count on mount
  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await fetch("/api/waitlist");
        const data = await res.json();
        if (res.ok) {
          setCount(data.count || 0);
        }
      } catch (err) {
        console.error("Failed to load count:", err);
      }
    };
    void loadCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate email
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to join waitlist");
        setLoading(false);
        return;
      }
      
      setSubmitted(true);
      setCount(data.count || count + 1);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: MapPin,
      title: "Explore Nepal",
      desc: "Discover hidden gems and popular destinations",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Blockchain Trust",
      desc: "Verified reviews and transparent bookings",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Award,
      title: "Earn NFT Badges",
      desc: "Collect proof of your adventures on-chain",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Coins,
      title: "Crypto Payments",
      desc: "Pay with SOL for seamless transactions",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, #f97316, transparent)" }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 text-white/80 mb-8"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold">Coming Soon to Nepal 🇳🇵</span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: "Georgia, serif" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                TourChain
              </motion.span>
              <br />
              <span className="text-5xl md:text-6xl">Nepal</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              The first Web3-powered tourism platform for Nepal.
              <br />
              Explore, book, and earn rewards on the blockchain.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-2 text-white/50 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Globe className="w-4 h-4" />
              <span>Powered by Solana</span>
            </motion.div>
          </motion.div>

          {/* Waitlist Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mb-20"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-3">
                      Join the Waitlist
                    </h2>
                    <p className="text-white/60">
                      Be among the first to experience the future of travel in Nepal
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-12 py-4 text-white placeholder:text-white/40 focus:border-orange-500 focus:outline-none transition-all"
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm"
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Joining...
                        </>
                      ) : (
                        <>
                          Get Early Access
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-8 flex items-center justify-center gap-2 text-white/50 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{count.toLocaleString()} people already joined</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border-2 border-green-500/50 rounded-3xl p-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    You're on the list! 🎉
                  </h3>
                  <p className="text-white/70 mb-6">
                    We'll notify you when TourChain Nepal launches.
                    <br />
                    Get ready for an amazing adventure!
                  </p>
                  <motion.button
                    onClick={() => setSubmitted(false)}
                    className="text-white/60 hover:text-white text-sm underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    Add another email
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-white/40 text-sm"
          >
            <p>Built with ❤️ for Nepal's tourism ecosystem</p>
            <p className="mt-2">Powered by Solana • Secured by Blockchain</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
