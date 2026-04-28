"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Zap,
  Mountain,
  Star,
  Crown,
  Target,
  Flame
} from "lucide-react";

type LeaderboardUser = {
  id: string;
  display_name: string;
  xp: number;
  rank: string;
  total_completions: number;
  avatar_url?: string;
};

const RANK_CONFIG = {
  novice: { color: "from-gray-400 to-gray-500", icon: Mountain, minXP: 0 },
  explorer: { color: "from-blue-400 to-blue-600", icon: Target, minXP: 100 },
  veteran: { color: "from-purple-400 to-purple-600", icon: Award, minXP: 500 },
  legend: { color: "from-yellow-400 to-orange-500", icon: Crown, minXP: 1000 },
};

const ACHIEVEMENTS = [
  { id: "first_trek", name: "First Steps", desc: "Complete your first trek", icon: Mountain, xp: 50 },
  { id: "five_treks", name: "Explorer", desc: "Complete 5 treks", icon: Target, xp: 100 },
  { id: "ten_treks", name: "Veteran", desc: "Complete 10 treks", icon: Award, xp: 200 },
  { id: "speed_demon", name: "Speed Demon", desc: "Complete a trek in record time", icon: Zap, xp: 150 },
  { id: "completionist", name: "Completionist", desc: "Check in at all checkpoints", icon: Star, xp: 100 },
];

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (res.ok && data.leaderboard) {
          setUsers(data.leaderboard);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
      setLoading(false);
    };
    void load();
  }, [timeframe]);

  const getRankInfo = (rank: string) => {
    return RANK_CONFIG[rank as keyof typeof RANK_CONFIG] || RANK_CONFIG.novice;
  };

  const getMedalColor = (position: number) => {
    if (position === 0) return "from-yellow-400 to-yellow-600";
    if (position === 1) return "from-gray-300 to-gray-400";
    if (position === 2) return "from-orange-400 to-orange-600";
    return "from-blue-400 to-blue-600";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold text-sm">Global Rankings</span>
          </motion.div>
          
          <h1 className="text-6xl font-bold font-playfair text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-trekker-orange to-orange-600 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-gray-600 text-lg">Compete with trekkers worldwide and climb the ranks!</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Total Trekkers</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Total XP Earned</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.xp, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Mountain className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">Treks Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.reduce((sum, u) => sum + u.total_completions, 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Timeframe Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mb-8 justify-center"
        >
          {[
            { key: "all", label: "All Time" },
            { key: "month", label: "This Month" },
            { key: "week", label: "This Week" }
          ].map(({ key, label }) => (
            <motion.button
              key={key}
              onClick={() => setTimeframe(key as any)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                timeframe === key
                  ? "bg-gradient-to-r from-trekker-orange to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "bg-white/80 text-gray-600 hover:bg-white border border-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-lg mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-trekker-orange" />
            Top Trekkers
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No trekkers yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 10).map((user, index) => {
                const rankInfo = getRankInfo(user.rank);
                const RankIcon = rankInfo.icon;
                const medalColor = getMedalColor(index);

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                      index < 3
                        ? "bg-gradient-to-r from-white to-orange-50 border-orange-200 shadow-md"
                        : "bg-white border-gray-100 hover:border-orange-200"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 shrink-0">
                      {index < 3 ? (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${medalColor} flex items-center justify-center shadow-lg`}>
                          <Medal className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{user.display_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${rankInfo.color} text-white text-xs font-bold`}>
                          <RankIcon className="w-3 h-3" />
                          {user.rank}
                        </div>
                        <span className="text-xs text-gray-500">
                          {user.total_completions} {user.total_completions === 1 ? "trek" : "treks"}
                        </span>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        {user.xp.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-trekker-orange" />
            Achievements
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-trekker-orange to-orange-600 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{achievement.desc}</p>
                      <div className="flex items-center gap-1 text-yellow-600 text-sm font-bold">
                        <Zap className="w-4 h-4" />
                        +{achievement.xp} XP
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
