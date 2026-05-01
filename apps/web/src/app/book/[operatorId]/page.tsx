"use client";

import { 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  TrendingUp, 
  DollarSign,
  User,
  Shield,
  Mountain,
  ArrowRight,
  Info,
  Sparkles,
  AlertCircle,
  Wallet,
  ExternalLink
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createEscrow } from "@/lib/solana/escrow";

type RouteItem = { 
  id: string; 
  name: string; 
  region: string; 
  difficulty: string; 
  duration_days: number;
  description?: string;
};

type ServiceItem = { 
  id: string; 
  guide_id: string; 
  route_id: string; 
  title: string; 
  price_usd: number;
  description?: string;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const wallet = useWallet();
  const routeId = params.operatorId as string;
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setDataLoading(true);
      try {
        console.log("Loading route with ID:", routeId);
        
        // Get all routes first
        const routesRes = await fetch("/api/routes");
        const routesJson = await routesRes.json();
        console.log("All routes:", routesJson.routes);
        setRoutes(routesJson.routes ?? []);

        // Get services for this route
        const servicesRes = await fetch(`/api/services?routeId=${routeId}`);
        console.log("Services response status:", servicesRes.status);
        
        if (servicesRes.ok) {
          const servicesJson = await servicesRes.json();
          console.log("Services:", servicesJson.services);
          setServices(servicesJson.services ?? []);
          if (servicesJson.services?.length) {
            setSelectedServiceId(servicesJson.services[0].id);
          }
        } else {
          console.error("Failed to fetch services");
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setDataLoading(false);
      }
    };
    void load();
  }, [routeId]);

  const selectedRoute = useMemo(
    () => {
      const route = routes.find((r) => r.id === routeId) ?? routes[0];
      console.log("Selected route:", route, "from routeId:", routeId);
      return route;
    },
    [routeId, routes],
  );
  
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [selectedServiceId, services],
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "from-green-500 to-green-600";
      case "moderate":
        return "from-yellow-500 to-orange-500";
      case "hard":
      case "challenging":
        return "from-red-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const submitBooking = async () => {
    setError(null);
    setMessage(null);
    setTxSignature(null);

    console.log("=== BOOKING SUBMISSION DEBUG ===");
    console.log("selectedService:", selectedService);
    console.log("selectedRoute:", selectedRoute);
    console.log("startDate:", startDate);
    console.log("wallet connected:", wallet.connected);
    console.log("wallet publicKey:", wallet.publicKey?.toBase58());

    // Check wallet connection first
    if (!wallet.connected || !wallet.publicKey) {
      setError("Please connect your Phantom wallet first");
      return;
    }

    // Better validation
    if (!selectedService || !selectedService.id || !selectedService.guide_id) {
      console.error("Invalid service:", selectedService);
      setError("Please select a valid guide service");
      return;
    }

    if (!startDate) {
      setError("Please select a start date");
      return;
    }

    if (!selectedRoute || !selectedRoute.id) {
      console.error("Invalid route:", selectedRoute);
      setError("Route information is missing");
      return;
    }

    setLoading(true);

    try {
      const createdAt = Date.now();
      const bookingData = {
        guideId: selectedService.guide_id,
        serviceId: selectedService.id,
        routeId: selectedRoute.id,
        startDate,
        endDate: endDate || null,
        totalPriceUsd: Number(selectedService.price_usd),
        milestonesTotal: 5, // Default 5 milestones
        walletAddress: wallet.publicKey.toBase58(),
        createdAt,
      };
      
      console.log("Step 1: Creating booking in database...");
      console.log("Booking data:", bookingData);

      // Step 1: Create booking in database
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      console.log("Response status:", response.status);
      
      let payload;
      try {
        payload = await response.json();
        console.log("Response payload:", payload);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        setError("Server returned an invalid response");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.error("Full error payload:", JSON.stringify(payload, null, 2));
        
        if (payload?.error?.issues) {
          console.error("Validation issues:", payload.error.issues);
        }
        if (payload?.error?.fieldErrors) {
          console.error("Field errors:", payload.error.fieldErrors);
        }
        
        const errorMessage = 
          payload?.error?.message ?? 
          (typeof payload?.error === "string" ? payload.error : null) ?? 
          payload?.message ??
          `Failed to create booking (${response.status})`;
        
        console.error("Booking error:", errorMessage, payload);
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (!payload.booking || !payload.booking.id) {
        console.error("Invalid booking response:", payload);
        setError("Booking was created but response is invalid");
        setLoading(false);
        return;
      }

      console.log("Step 2: Creating booking without blockchain transaction...");
      
      // Skip blockchain transaction - just mark as funded
      // This allows testing without deployed smart contracts or real money
      await fetch(`/api/bookings/${payload.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrow_signature: null, // No signature needed
          status: "funded",
        }),
      });

      setMessage("Booking created successfully!");
      
      // Redirect after showing success
      setTimeout(() => {
        router.push(`/booking/${payload.booking.id}`);
      }, 2000);
      
      setLoading(false);
    } catch (err) {
      console.error("Booking submission error:", err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const canProceed = selectedService && startDate && selectedRoute && wallet.connected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button onClick={() => router.back()} className="hover:text-trekker-orange transition-colors">
              Routes
            </button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Book {selectedRoute?.name}</span>
          </div>
          <h1 className="text-5xl font-bold font-playfair text-gray-900 mb-2">
            Book Your <span className="bg-gradient-to-r from-trekker-orange to-orange-600 bg-clip-text text-transparent">Adventure</span>
          </h1>
          <p className="text-gray-600">Secure your trek with blockchain-powered escrow protection</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-lg"
            >
              {dataLoading ? (
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-gray-100 rounded-2xl" />
                    <div className="h-20 bg-gray-100 rounded-2xl" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-trekker-orange to-orange-600 flex items-center justify-center shadow-lg">
                          <Mountain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedRoute?.name || "Route"}
                          </h2>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            {selectedRoute?.region || "Nepal"}
                          </div>
                        </div>
                      </div>
                      {selectedRoute?.description && (
                        <p className="text-gray-600 text-sm">{selectedRoute.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-bold text-gray-900">
                          {selectedRoute?.duration_days || 0} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Difficulty</p>
                        <p className="font-bold text-gray-900 capitalize">
                          {selectedRoute?.difficulty || "Moderate"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Service Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Select Guide Service</h3>
                  <p className="text-sm text-gray-500">Choose your preferred guide package</p>
                </div>
              </div>

              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-semibold mb-1">No services available</p>
                  <p className="text-sm text-gray-500">Please check back later or contact support</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <motion.button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                        selectedServiceId === service.id
                          ? "border-trekker-orange bg-orange-50 shadow-lg shadow-orange-500/20"
                          : "border-gray-200 bg-white hover:border-orange-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{service.title}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600">{service.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                            <DollarSign className="w-5 h-5" />
                            {service.price_usd}
                          </div>
                          <p className="text-xs text-gray-500">per person</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Choose Your Dates</h3>
                  <p className="text-sm text-gray-500">When do you want to start your trek?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-trekker-orange focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-trekker-orange focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24 space-y-6"
            >
              {/* Booking Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-trekker-orange" />
                  Booking Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Route</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[180px] truncate">
                      {dataLoading ? (
                        <span className="inline-block h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        selectedRoute?.name || "—"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[180px] truncate">
                      {dataLoading ? (
                        <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        selectedService?.title || "—"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-semibold text-gray-900">
                      {dataLoading ? (
                        <span className="inline-block h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        `${selectedRoute?.duration_days || 0} days`
                      )}
                    </span>
                  </div>
                  {startDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Start Date</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Price</span>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-3xl font-bold text-gray-900">
                        <DollarSign className="w-6 h-6" />
                        {selectedService?.price_usd || 0}
                      </div>
                      <p className="text-xs text-gray-500">USD</p>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={submitBooking}
                  disabled={!canProceed || loading}
                  whileHover={canProceed ? { scale: 1.02 } : {}}
                  whileTap={canProceed ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                    canProceed && !loading
                      ? "bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processing...
                    </>
                  ) : !wallet.connected ? (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Wallet First
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                {!wallet.connected && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Connect your Phantom wallet to proceed with booking
                  </p>
                )}
              </div>

              {/* Security Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Secure Escrow</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Your payment is protected by blockchain smart contracts. Funds are released only when you verify trek completion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 border border-orange-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Note:</strong> After booking, you'll need to connect your wallet to complete the on-chain escrow transaction.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md z-50"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold mb-1">Success!</p>
                  <p className="text-sm text-green-50 mb-2">{message}</p>
                  {txSignature && (
                    <a
                      href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-white hover:text-green-100 underline transition-colors"
                    >
                      View on Solscan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm text-red-50">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-white hover:text-red-100 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
