"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/email";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-himalayan-blue via-himalayan-blue/95 to-blue-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-trekker-orange/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
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
            <div className="w-12 h-12 bg-gradient-to-br from-trekker-orange to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-trekker-orange/20">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-playfair font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-white/70">Sign in to continue your journey</p>
        </motion.div>

        {/* Login Card */}
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
                />
              </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-trekker-orange to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-trekker-orange/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-himalayan-blue/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-himalayan-blue/50 uppercase tracking-wider font-semibold">
                New to Tour Chain?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/signup"
            className="block w-full text-center py-4 bg-himalayan-blue/5 hover:bg-himalayan-blue/10 border border-himalayan-blue/10 rounded-xl font-semibold text-himalayan-blue transition-all group"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-trekker-orange" />
              Create an Account
            </span>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center text-white/50 text-sm mt-6"
        >
          Secured by Solana blockchain
        </motion.p>
      </motion.div>
    </main>
  );
}
