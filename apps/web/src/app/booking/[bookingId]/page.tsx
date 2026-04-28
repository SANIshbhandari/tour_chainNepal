"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  MapPin, 
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";

type Booking = {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_price_usd: number;
};
type Checkin = { id: string; place_id: string; verified: boolean; created_at: string };

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error?.message ?? (typeof payload?.error === "string" ? payload.error : null) ?? "Failed to load booking");
        return;
      }
      setBooking(payload.booking);
      setCheckins(payload.checkins ?? []);
    };
    void load();
  }, [bookingId]);

  const timeline = useMemo(() => {
    if (!booking) return [];
    const items = [
      { at: booking.start_date, label: "Booking start date", type: "booking" as const },
      ...checkins.map((checkin) => ({
        at: checkin.created_at,
        label: `Checkpoint verified (${checkin.place_id.slice(0, 8)}...)`,
        type: "checkin" as const,
      })),
    ];
    return items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [booking, checkins]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "from-green-500 to-green-600";
      case "active":
        return "from-blue-500 to-blue-600";
      case "completed":
        return "from-purple-500 to-purple-600";
      case "cancelled":
      case "refunded":
        return "from-gray-500 to-gray-600";
      case "disputed":
        return "from-red-500 to-red-600";
      default:
        return "from-orange-500 to-orange-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <CheckCircle2 className="w-5 h-5" />;
      case "active":
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold font-playfair text-gray-900 mb-2">
            Booking <span className="bg-gradient-to-r from-trekker-orange to-orange-600 bg-clip-text text-transparent">Details</span>
          </h1>
          <p className="text-gray-600">Track your trek booking and timeline</p>
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-start gap-4"
          >
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Error Loading Booking</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        ) : !booking ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="w-8 h-8 text-trekker-orange animate-spin" />
          </motion.div>
        ) : (
          <>
            {/* Booking Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-lg mb-8"
            >
              {/* Status Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${getStatusColor(booking.status)} text-white font-bold shadow-lg`}>
                  {getStatusIcon(booking.status)}
                  <span className="capitalize">{booking.status}</span>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Start Date</p>
                    <p className="font-bold text-gray-900">{new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    {booking.end_date && (
                      <p className="text-sm text-gray-600 mt-1">
                        to {new Date(booking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">Total Price</p>
                    <p className="font-bold text-gray-900 text-2xl">${booking.total_price_usd}</p>
                    <p className="text-xs text-gray-500">USD</p>
                  </div>
                </motion.div>
              </div>

              {/* Booking ID */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                <p className="font-mono text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg inline-block">
                  {booking.id}
                </p>
              </motion.div>
            </motion.div>

            {/* Timeline Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-playfair text-gray-900">Timeline</h2>
              </div>

              {timeline.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-100 text-center"
                >
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No timeline events yet</p>
                  <p className="text-sm text-gray-500 mt-1">Check-ins and milestones will appear here</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="relative"
                    >
                      {/* Timeline connector */}
                      {index < timeline.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-trekker-orange to-orange-300" />
                      )}
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            item.type === "booking" 
                              ? "bg-gradient-to-br from-trekker-orange to-orange-600" 
                              : "bg-gradient-to-br from-green-500 to-green-600"
                          }`}>
                            {item.type === "booking" ? (
                              <Calendar className="w-6 h-6 text-white" />
                            ) : (
                              <MapPin className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 mb-1">{item.label}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(item.at).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                href={`/trek/${booking.id}`}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
              >
                <span>Open Active Trek View</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
