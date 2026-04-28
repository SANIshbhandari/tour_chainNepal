"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  CheckCircle2,
  Clock,
  Trophy,
  Navigation,
  Sparkles,
  AlertCircle,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";

const InteractiveMap = dynamic(() => import("@/components/Map"), { ssr: false });

type Checkpoint = {
  id: string;
  sequence_order: number;
  place: { id: string; name: string; latitude: number; longitude: number };
};

type Checkin = { id: string; place_id: string; verified: boolean; created_at: string };

export default function TrekPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error?.message ?? (typeof payload?.error === "string" ? payload.error : null) ?? "Failed to load trek");
        setLoading(false);
        return;
      }
      setCheckpoints(payload.checkpoints ?? []);
      setCheckins(payload.checkins ?? []);
      setLoading(false);
    };
    void load();
  }, [bookingId]);

  const doneSet = useMemo(() => new Set(checkins.filter((c) => c.verified).map((c) => c.place_id)), [checkins]);
  const progressPercent = useMemo(
    () => (checkpoints.length > 0 ? Math.round((doneSet.size / checkpoints.length) * 100) : 0),
    [checkpoints.length, doneSet.size],
  );
  const nextCheckpoint = useMemo(
    () => checkpoints.find((checkpoint) => !doneSet.has(checkpoint.place.id)),
    [checkpoints, doneSet],
  );

  const handleCheckin = async () => {
    if (!nextCheckpoint) return;
    if (!navigator.geolocation) {
      setError("Geolocation is not available");
      return;
    }
    
    setCheckingIn(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            place_id: nextCheckpoint.place.id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        });
        const payload = await res.json();
        if (!res.ok) {
          setError(payload?.error?.message ?? (typeof payload?.error === "string" ? payload.error : null) ?? "Check-in failed");
          setCheckingIn(false);
          return;
        }
        setCheckins((prev) => [payload.checkin, ...prev]);
        setError(null);
        setInfo(`✓ Checked in at ${nextCheckpoint.place.name}!`);
        setCheckingIn(false);
        setTimeout(() => setInfo(null), 5000);
      },
      (err) => {
        setError("Unable to get your location. Please enable location services.");
        setCheckingIn(false);
      }
    );
  };

  const mintProof = async () => {
    setMinting(true);
    setError(null);
    
    try {
      const response = await fetch("/api/proof/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          name: "Trek Completion",
          symbol: "TREK",
          uri: "https://example.com/metadata.json",
        }),
      });
      
      const payload = await response.json();
      
      if (!response.ok) {
        const errorMessage = 
          payload?.error?.message ?? 
          (typeof payload?.error === "string" ? payload.error : null) ?? 
          "Proof mint failed";
        
        setError(errorMessage);
        setMinting(false);
        return;
      }
      
      setInfo(`🎉 Completion proof minted successfully! NFT: ${payload.proof?.nft_mint_address}`);
      setMinting(false);
      setTimeout(() => {
        // Redirect to vibe page to see the NFT
        window.location.href = "/vibe";
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint proof");
      setMinting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold font-playfair text-gray-900 mb-2">
            Active <span className="bg-gradient-to-r from-trekker-orange to-orange-600 bg-clip-text text-transparent">Trek</span>
          </h1>
          <p className="text-gray-600">Track your progress and check in at waypoints</p>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 text-trekker-orange animate-spin" />
          </motion.div>
        ) : (
          <>
            {/* Progress Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Checkpoints</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {doneSet.size}<span className="text-lg text-gray-400">/{checkpoints.length}</span>
                    </p>
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{progressPercent}%</p>
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    {nextCheckpoint ? <Navigation className="w-7 h-7 text-white" /> : <Trophy className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-semibold">Status</p>
                    <p className="text-lg font-bold text-gray-900">
                      {nextCheckpoint ? "In Progress" : "Complete!"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg mb-8"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Trek Progress</h3>
                <span className="text-sm font-bold text-trekker-orange">{progressPercent}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-trekker-orange to-orange-600 rounded-full"
                />
              </div>
              {nextCheckpoint && (
                <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Next: <span className="font-semibold">{nextCheckpoint.place.name}</span>
                </p>
              )}
            </motion.div>

            {/* Notifications */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-red-800 font-semibold">{error}</p>
                </motion.div>
              )}
              {info && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-green-800 font-semibold">{info}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg mb-8 overflow-hidden"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-trekker-orange" />
                Trek Route Map
              </h3>
              <div className="rounded-2xl overflow-hidden">
                <InteractiveMap
                  points={checkpoints.map((checkpoint) => ({
                    id: checkpoint.place.id,
                    name: checkpoint.place.name,
                    lat: Number(checkpoint.place.latitude),
                    lng: Number(checkpoint.place.longitude),
                    description: doneSet.has(checkpoint.place.id) ? "✓ Checked in" : "Pending checkpoint",
                  }))}
                  zoom={8}
                />
              </div>
            </motion.div>

            {/* Checkpoints List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="font-bold text-gray-900 mb-4 text-xl">Checkpoints</h3>
              <div className="space-y-3">
                {checkpoints.map((checkpoint, index) => {
                  const done = doneSet.has(checkpoint.place.id);
                  const isNext = nextCheckpoint?.id === checkpoint.id;
                  
                  return (
                    <motion.div
                      key={checkpoint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 transition-all ${
                        isNext
                          ? "border-trekker-orange shadow-lg shadow-orange-500/20"
                          : done
                          ? "border-green-200"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                              done
                                ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                                : isNext
                                ? "bg-gradient-to-br from-trekker-orange to-orange-600 text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-6 h-6" /> : checkpoint.sequence_order}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              {checkpoint.place.name}
                              {isNext && (
                                <span className="text-xs bg-trekker-orange text-white px-2 py-1 rounded-full">
                                  Next
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {Number(checkpoint.place.latitude).toFixed(4)}, {Number(checkpoint.place.longitude).toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-xl font-bold text-sm ${
                            done
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {done ? "✓ Completed" : "Pending"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={handleCheckin}
                disabled={!nextCheckpoint || checkingIn}
                whileHover={nextCheckpoint && !checkingIn ? { scale: 1.02 } : {}}
                whileTap={nextCheckpoint && !checkingIn ? { scale: 0.98 } : {}}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-lg transition-all ${
                  nextCheckpoint && !checkingIn
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking in...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Check in at Next Checkpoint
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={mintProof}
                disabled={Boolean(nextCheckpoint) || minting}
                whileHover={!nextCheckpoint && !minting ? { scale: 1.02 } : {}}
                whileTap={!nextCheckpoint && !minting ? { scale: 0.98 } : {}}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold shadow-lg transition-all ${
                  !nextCheckpoint && !minting
                    ? "bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-500/30"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {minting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Mint Completion Proof
                  </>
                )}
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
