"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Compass, 
  Globe, 
  Calendar, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";
import { COUNTRIES } from "@/lib/countries";

const steps = [
  { id: "wallet", title: "Identity", description: "Connect your digital wallet" },
  { id: "profile", title: "Passport", description: "Origin and travel window" },
  { id: "bridge", title: "Treasury", description: "On-ramp liquidity" },
  { id: "ready", title: "Embark", description: "Begin your odyssey" }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { connected } = useWallet();
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");

  const nextStep = () => {
    if (currentStep === 0 && !connected) return;
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="pt-24 min-h-screen bg-gradient-to-br from-summit-white via-blue-50/20 to-orange-50/20 flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div 
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-trekker-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-himalayan-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div 
        className="max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.id} 
                className="flex flex-col items-center relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
              >
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    idx <= currentStep ? "bg-himalayan-blue text-summit-white" : "bg-zinc-200 text-himalayan-blue/20"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={idx === currentStep ? { 
                    boxShadow: ["0 0 0 0 rgba(30, 58, 138, 0.4)", "0 0 0 10px rgba(30, 58, 138, 0)", "0 0 0 0 rgba(30, 58, 138, 0)"]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {idx < currentStep ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    idx + 1
                  )}
                </motion.div>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
                  idx <= currentStep ? "text-himalayan-blue" : "text-himalayan-blue/20"
                }`}>
                  {step.title}
                </span>
                {idx === 0 && !connected && idx === currentStep && (
                  <motion.span 
                    className="absolute -top-6 text-[8px] font-bold text-trekker-orange uppercase tracking-tighter"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Connection Required
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
          <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-himalayan-blue to-trekker-orange" 
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-[40px] p-12 shadow-2xl shadow-himalayan-blue/5 border border-himalayan-blue/5 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <header className="text-center">
                  <motion.div 
                    className="w-16 h-16 bg-trekker-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Wallet className="w-8 h-8 text-trekker-orange" />
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-playfair mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Initialize Your <span className="italic">Identity</span>
                  </motion.h2>
                  <motion.p 
                    className="text-himalayan-blue/60 font-dm-sans"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Connect your Solana wallet to begin your trek on the blockchain.
                  </motion.p>
                </header>
                <motion.div 
                  className="flex justify-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <WalletButton />
                </motion.div>
                {connected && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center gap-2 text-forest-green font-bold text-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                    Wallet Linked Successfully
                  </motion.div>
                )}
                <motion.p 
                  className="text-center text-xs text-himalayan-blue/40 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  New to Solana? We&apos;ll help you bootstrap your traveler&apos;s profile.
                </motion.p>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <header className="text-center">
                  <motion.div 
                    className="w-16 h-16 bg-forest-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Globe className="w-8 h-8 text-forest-green" />
                  </motion.div>
                  <h2 className="text-4xl font-playfair mb-2">Travel <span className="italic">Manifest</span></h2>
                  <p className="text-himalayan-blue/60 font-dm-sans">Help us customize your Himalayan odyssey recommendations.</p>
                </header>
                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.15,
                        delayChildren: 0.2
                      }
                    }
                  }}
                >
                  <motion.div 
                    className="space-y-1"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                  >
                    <motion.label 
                      className="text-[10px] font-bold uppercase tracking-widest text-himalayan-blue/40 ml-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Home Country
                    </motion.label>
                    <motion.select
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      className="w-full p-4 bg-zinc-50 rounded-xl border border-himalayan-blue/10 font-dm-sans focus:outline-none focus:ring-2 focus:ring-himalayan-blue/5 transition-all hover:bg-zinc-100 cursor-pointer"
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileFocus={{ scale: 1.01, borderColor: "rgba(30, 58, 138, 0.3)" }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <option value="">Select your country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </motion.select>
                  </motion.div>
                  <motion.div 
                    className="space-y-1"
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                  >
                    <motion.label 
                      className="text-[10px] font-bold uppercase tracking-widest text-himalayan-blue/40 ml-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Arrival Window
                    </motion.label>
                    <div className="flex gap-4">
                      <motion.div 
                        className="flex-1 relative"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-himalayan-blue/40" />
                        </motion.div>
                        <input
                          type="date"
                          value={arrival}
                          onChange={(event) => setArrival(event.target.value)}
                          className="w-full pl-10 pr-4 py-4 bg-zinc-50 rounded-xl border border-himalayan-blue/10 text-sm hover:bg-zinc-100 transition-all font-dm-sans focus:ring-2 focus:ring-himalayan-blue/5 focus:outline-none"
                        />
                      </motion.div>
                      <motion.div 
                        className="flex-1 relative"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        >
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-himalayan-blue/40" />
                        </motion.div>
                        <input
                          type="date"
                          value={departure}
                          onChange={(event) => setDeparture(event.target.value)}
                          className="w-full pl-10 pr-4 py-4 bg-zinc-50 rounded-xl border border-himalayan-blue/10 text-sm hover:bg-zinc-100 transition-all font-dm-sans focus:ring-2 focus:ring-himalayan-blue/5 focus:outline-none"
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <header className="text-center">
                  <motion.div 
                    className="w-16 h-16 bg-trekker-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Zap className="w-8 h-8 text-trekker-orange" />
                  </motion.div>
                  <motion.h2 
                    className="text-4xl font-playfair mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Cross-Chain <span className="italic">Liquidity</span>
                  </motion.h2>
                  <motion.p 
                    className="text-himalayan-blue/60 font-dm-sans"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Pay with USDC from Ethereum, Polygon, or BNB smoothly.
                  </motion.p>
                </header>
                <motion.div 
                  className="bg-zinc-50 rounded-3xl p-8 border border-himalayan-blue/10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <motion.div 
                    className="flex items-center justify-between mb-8 pb-8 border-b border-himalayan-blue/5"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg"
                        animate={{ 
                          boxShadow: [
                            "0 4px 6px rgba(59, 130, 246, 0.3)",
                            "0 8px 12px rgba(59, 130, 246, 0.5)",
                            "0 4px 6px rgba(59, 130, 246, 0.3)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        W
                      </motion.div>
                      <span className="font-bold text-himalayan-blue italic">Wormhole Connect</span>
                    </div>
                    <motion.span 
                      className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase tracking-widest"
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Active
                    </motion.span>
                  </motion.div>
                  <motion.div 
                    className="space-y-4 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.2,
                          delayChildren: 0.6
                        }
                      }
                    }}
                  >
                    <motion.p 
                      className="text-xs text-himalayan-blue/40 leading-relaxed max-w-xs mx-auto"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      Bridge USDC directly into the tourism protocol. 
                      Gasless bridging is supported for the Nepal ecosystem.
                    </motion.p>
                    <motion.button 
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1 }
                      }}
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 12px 24px rgba(37, 99, 235, 0.2)"
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Select Source Chain
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="w-24 h-24 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto scale-110 mb-8 overflow-hidden shadow-inner font-playfair italic">
                  <CheckCircle2 className="w-12 h-12 text-forest-green" />
                </div>
                <h2 className="text-5xl font-playfair italic">Adventure <br /> <span className="text-trekker-orange not-italic font-bold">Awaits</span></h2>
                <p className="text-himalayan-blue/60 font-dm-sans max-w-sm mx-auto">
                  Your profile is initialized on the Solana devnet. You are now ready to book 
                  verifiable experiences and earn $TREK rewards.
                </p>
                <div className="py-8">
                  <button
                    onClick={() => router.push("/explore")}
                    className="w-full py-5 bg-himalayan-blue text-summit-white rounded-2xl font-bold text-xl shadow-xl shadow-himalayan-blue/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                  >
                    Find My First Trek
                    <Compass className="w-6 h-6 animate-pulse" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-12 pt-8 border-t border-himalayan-blue/5 flex justify-between items-center">
            {currentStep > 0 ? (
              <button 
                onClick={prevStep}
                className="flex items-center gap-2 text-himalayan-blue/40 font-bold text-sm hover:text-himalayan-blue transition-colors"
                disabled={currentStep === 3}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            
            {currentStep < 3 && (
              <button 
                onClick={nextStep}
                disabled={currentStep === 0 && !connected}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all group ${
                  currentStep === 0 && !connected 
                    ? "bg-zinc-100 text-himalayan-blue/20 cursor-not-allowed" 
                    : "bg-zinc-50 text-himalayan-blue hover:bg-zinc-100"
                }`}
              >
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </footer>
        </motion.div>
      </motion.div>
    </div>
  );
}
