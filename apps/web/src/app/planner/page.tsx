"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Mountain, Clock, TrendingUp, DollarSign, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Recommendation = {
  routeId: string;
  name: string;
  reason: string;
  pros: string[];
  cons: string[];
  duration: number;
  difficulty: string;
  price: number;
};

type PlannerResponse = {
  recommendations: Recommendation[];
  tips: string;
  matchedPreferences: {
    budget: boolean;
    difficulty: boolean;
    duration: boolean;
  };
};

export default function PlannerPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const examplePrompts = [
    "I want an adventurous trek in 7 days under $2000",
    "Looking for an easy trek for beginners, 5-7 days",
    "Challenge me! I want the hardest trek available",
    "Budget-friendly trek with amazing mountain views",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "from-green-500 to-green-600";
      case "moderate":
        return "from-yellow-500 to-orange-500";
      case "challenging":
      case "hard":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 px-5 py-2.5 rounded-full mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold">AI Trip Planner</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Plan Your Perfect <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">Trek</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Tell us what you're looking for, and our AI will suggest the best routes for your adventure
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., I want an adventurous trek in 7 days under $2000 with mountain views..."
              className="w-full bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl px-6 py-5 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none min-h-[140px] resize-none text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute bottom-5 right-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all font-semibold shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Plan Trip
                </>
              )}
            </button>
          </form>

          {/* Example Prompts */}
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <p className="text-white/50 text-sm mb-3">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(example)}
                    className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-white/70 hover:text-white px-4 py-2 rounded-xl transition-all"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-8 text-red-300"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Recommended Treks for You
              </h2>

              {/* Recommendations */}
              <div className="grid gap-6">
                {result.recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.routeId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 hover:bg-white/15 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Mountain className="w-6 h-6 text-orange-400" />
                          <h3 className="text-2xl font-bold text-white">
                            {rec.name}
                          </h3>
                        </div>
                        <p className="text-white/70">{rec.reason}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getDifficultyColor(rec.difficulty)} text-white font-semibold text-sm`}>
                        {rec.difficulty}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-xs text-white/50">Duration</p>
                          <p className="font-semibold">{rec.duration} days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-xs text-white/50">Difficulty</p>
                          <p className="font-semibold capitalize">{rec.difficulty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-xs text-white/50">Price</p>
                          <p className="font-semibold">${rec.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                        <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Pros
                        </h4>
                        <ul className="space-y-2">
                          {rec.pros.map((pro, i) => (
                            <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                        <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Considerations
                        </h4>
                        <ul className="space-y-2">
                          {rec.cons.map((con, i) => (
                            <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                              <span className="text-orange-400 mt-0.5">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => router.push(`/book/${rec.routeId}`)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      Book This Trek
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Tips Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-500/20 border border-blue-500/30 rounded-3xl p-6"
              >
                <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Practical Tips
                </h3>
                <p className="text-white/70 leading-relaxed">{result.tips}</p>
              </motion.div>

              {/* Try Again Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  setResult(null);
                  setPrompt("");
                }}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 rounded-2xl transition-all"
              >
                Plan Another Trip
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
