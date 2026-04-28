"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Map, Award, Sparkles, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({ tourists: 0, totalEscrowUsd: 0, proofs: 0 });

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/stats");
      const payload = await res.json();
      if (res.ok) {
        setStats({
          tourists: payload.tourists ?? 0,
          totalEscrowUsd: payload.totalEscrowUsd ?? 0,
          proofs: payload.proofs ?? 0,
        });
      }
    };
    void load();
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-himalayan-blue via-himalayan-blue/95 to-summit-white text-himalayan-blue overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-trekker-orange/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-trekker-orange" />
              <span className="text-white font-semibold text-sm">Powered by Solana Blockchain</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-playfair text-white leading-tight"
            >
              Explore Nepal,
              <br />
              <span className="bg-gradient-to-r from-trekker-orange via-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Earn On-Chain
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-white/80 leading-relaxed max-w-xl"
            >
              Book verified tours with trustless escrow, collect NFT proof of your adventures, 
              and earn $TREK tokens for every mountain you conquer.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/onboard"
                className="group px-8 py-4 bg-gradient-to-r from-trekker-orange to-orange-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-trekker-orange/40 transition-all flex items-center justify-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/explore"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center"
              >
                Explore Routes
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-trekker-orange">{stats.tourists.toLocaleString()}</div>
                <div className="text-sm text-white/60 uppercase tracking-wider">Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-trekker-orange">${Math.round(stats.totalEscrowUsd).toLocaleString()}</div>
                <div className="text-sm text-white/60 uppercase tracking-wider">In Escrow</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-trekker-orange">{stats.proofs.toLocaleString()}</div>
                <div className="text-sm text-white/60 uppercase tracking-wider">NFTs Minted</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/hero.png"
                alt="Himalayan Mountains"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-himalayan-blue/60 via-transparent to-transparent" />
            </div>
            {/* Floating Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-trekker-orange to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-himalayan-blue/60 font-medium">Active Tours</div>
                  <div className="text-2xl font-bold text-himalayan-blue">127 Routes Available</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 bg-summit-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-playfair text-himalayan-blue mb-4">
              Why Choose Tour Chain?
            </h2>
            <p className="text-xl text-himalayan-blue/70 max-w-2xl mx-auto">
              The future of tourism is transparent, secure, and rewarding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-himalayan-blue/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-trekker-orange/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-trekker-orange to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-trekker-orange/20">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair mb-4 text-himalayan-blue">Trustless Escrow</h3>
                <p className="text-himalayan-blue/70 leading-relaxed">
                  Your funds are secured on-chain with smart contracts. Payment releases only when you verify tour completion.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-himalayan-blue/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair mb-4 text-himalayan-blue">NFT Proof System</h3>
                <p className="text-himalayan-blue/70 leading-relaxed">
                  Collect soul-bound NFTs for every destination. Build your on-chain travel reputation and unlock exclusive perks.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-himalayan-blue/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-yellow-500/20">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-playfair mb-4 text-himalayan-blue">Earn $TREK Tokens</h3>
                <p className="text-himalayan-blue/70 leading-relaxed">
                  Get rewarded for every kilometer trekked. Stake tokens for discounts or participate in DAO governance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-himalayan-blue to-himalayan-blue/90">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4">
              <Users className="w-4 h-4 text-trekker-orange" />
              <span className="text-white font-semibold text-sm">Join 1000+ Travelers</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-playfair text-white leading-tight">
              Ready to Start Your
              <br />
              <span className="text-trekker-orange">Himalayan Adventure?</span>
            </h2>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Connect your wallet and explore verified tours across Nepal&apos;s most breathtaking destinations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/onboard"
                className="group px-10 py-5 bg-gradient-to-r from-trekker-orange to-orange-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-trekker-orange/40 transition-all flex items-center justify-center gap-2"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/explore"
                className="px-10 py-5 bg-white text-himalayan-blue rounded-full font-bold text-lg hover:bg-white/90 transition-all flex items-center justify-center"
              >
                Browse Tours
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
