"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/email";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setMessage("Account created! Check your inbox to verify your email.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign up");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-trekker-orange via-orange-600 to-orange-700 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-trekker-orange" />
            </div>
          </div>
          <h1 className="text-4xl font-playfair font-bold text-white mb-2">
            Join Tour Chain
          </h1>
          <p className="text-white/90">Start your Himalayan adventure today</p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-himalayan-blue/70 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-himalayan-blue/40" />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-himalayan-blue/5 border border-himalayan-blue/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-trekker-orange/50 focus:border-trekker-orange/50 transition-all text-himalayan-blue placeholder:text-himalayan-blue/30"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-himalayan-blue/70 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-himalayan-blue/40" />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-himalayan-blue/5 border border-himalayan-blue/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-trekker-orange/50 focus:border-trekker-orange/50 transition-all text-himalayan-blue placeholder:text-himalayan-blue/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-himalayan-blue/50 ml-1">Minimum 6 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2"
              >
                <span className="text-red-600 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-800 font-semibold text-sm">Success!</p>
                  <p className="text-emerald-700 text-sm">{message}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-trekker-orange to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-trekker-orange/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-himalayan-blue/10 space-y-3">
            <p className="text-xs font-semibold text-himalayan-blue/70 uppercase tracking-wider">
              What you'll get:
            </p>
            <div className="space-y-2">
              {[
                "Access to verified Nepal trekking routes",
                "Earn $TREK tokens for every adventure",
                "Collect NFT proof of your journeys",
                "Participate in DAO governance"
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-trekker-orange shrink-0" />
                  <span className="text-sm text-himalayan-blue/70">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-himalayan-blue/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-himalayan-blue/50 uppercase tracking-wider font-semibold">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="block w-full text-center py-4 bg-himalayan-blue/5 hover:bg-himalayan-blue/10 border border-himalayan-blue/10 rounded-xl font-semibold text-himalayan-blue transition-all"
          >
            Sign In Instead
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-white/80 text-sm mt-6"
        >
          By signing up, you agree to our Terms & Privacy Policy
        </motion.p>
      </motion.div>
    </main>
  );
}
