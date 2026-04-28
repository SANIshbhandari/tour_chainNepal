"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  MapPin, 
  Trophy, 
  Calendar, 
  DollarSign, 
  Compass,
  Sparkles,
  Mountain,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  Eye,
  Thermometer
} from "lucide-react";

type Booking = {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_price_usd: number;
  route?: { name?: string; latitude?: number; longitude?: number } | null;
  service?: { title?: string } | null;
};

type WeatherData = {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  visibility: number;
  location: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode; gradient: string }> = {
  confirmed: { 
    label: "Confirmed", 
    color: "text-blue-700", 
    bg: "bg-blue-50", 
    border: "border-blue-200", 
    icon: <CheckCircle2 className="w-4 h-4" />,
    gradient: "from-blue-500 to-blue-600"
  },
  active: { 
    label: "Active", 
    color: "text-emerald-700", 
    bg: "bg-emerald-50", 
    border: "border-emerald-200", 
    icon: <TrendingUp className="w-4 h-4" />,
    gradient: "from-emerald-500 to-emerald-600"
  },
  completed: { 
    label: "Completed", 
    color: "text-gray-600", 
    bg: "bg-gray-50", 
    border: "border-gray-200", 
    icon: <Trophy className="w-4 h-4" />,
    gradient: "from-gray-500 to-gray-600"
  },
  pending: { 
    label: "Pending", 
    color: "text-amber-700", 
    bg: "bg-amber-50", 
    border: "border-amber-200", 
    icon: <Clock className="w-4 h-4" />,
    gradient: "from-amber-500 to-amber-600"
  },
  cancelled: { 
    label: "Cancelled", 
    color: "text-red-600", 
    bg: "bg-red-50", 
    border: "border-red-200", 
    icon: <XCircle className="w-4 h-4" />,
    gradient: "from-red-500 to-red-600"
  },
};

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const t = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [value]);
  return <>{prefix}{display}</>;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  sub, 
  gradient,
  delay = 0 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: React.ReactNode; 
  sub?: string; 
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl" 
        style={{ background: `linear-gradient(135deg, ${gradient})` }} 
      />
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
      </div>
    </motion.div>
  );
}

function WeatherWidget({ location = "Kathmandu, Nepal" }: { location?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        
        if (apiKey && apiKey !== "demo") {
          // Use real API if key is available
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setWeather({
              temp: Math.round(data.main.temp),
              feels_like: Math.round(data.main.feels_like),
              humidity: data.main.humidity,
              wind_speed: Math.round(data.wind.speed * 3.6),
              description: data.weather[0].description,
              icon: data.weather[0].main,
              visibility: Math.round(data.visibility / 1000),
              location: data.name,
            });
            setLoading(false);
            return;
          }
        }
        
        // Fallback to mock data for demo purposes
        const mockWeather: Record<string, WeatherData> = {
          "Kathmandu, Nepal": {
            temp: 22,
            feels_like: 21,
            humidity: 65,
            wind_speed: 12,
            description: "partly cloudy",
            icon: "Clouds",
            visibility: 10,
            location: "Kathmandu",
          },
          "Pokhara, Nepal": {
            temp: 18,
            feels_like: 17,
            humidity: 72,
            wind_speed: 8,
            description: "clear sky",
            icon: "Clear",
            visibility: 15,
            location: "Pokhara",
          },
        };
        
        setWeather(mockWeather[location] || mockWeather["Kathmandu, Nepal"]);
      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const getWeatherIcon = (icon: string) => {
    switch (icon.toLowerCase()) {
      case "clear":
        return <Sun className="w-12 h-12 text-yellow-400" />;
      case "clouds":
        return <Cloud className="w-12 h-12 text-gray-400" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="w-12 h-12 text-blue-400" />;
      case "snow":
        return <CloudSnow className="w-12 h-12 text-blue-200" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-lg"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-16 bg-gray-200 rounded w-full" />
        </div>
      </motion.div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl" />
      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-6 border border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Weather Update</p>
            <h3 className="text-lg font-bold text-gray-900">{weather.location}</h3>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {getWeatherIcon(weather.icon)}
          </motion.div>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <div className="text-5xl font-bold text-gray-900">{weather.temp}°</div>
          <div className="text-gray-500 text-sm mb-2">
            Feels like {weather.feels_like}°C
          </div>
        </div>

        <p className="text-gray-600 text-sm capitalize mb-4">{weather.description}</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <Wind className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-gray-500">Wind</p>
              <p className="font-bold text-gray-900">{weather.wind_speed} km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-gray-500">Humidity</p>
              <p className="font-bold text-gray-900">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Eye className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-gray-500">Visibility</p>
              <p className="font-bold text-gray-900">{weather.visibility} km</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            Perfect trekking conditions • Updated just now
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function BookingRow({ booking, index }: { booking: Booking; index: number }) {
  const cfg = STATUS_MAP[booking.status] ?? STATUS_MAP.pending;

  const title = booking.route?.name ?? booking.service?.title ?? "Route Booking";
  const start = new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const end = booking.end_date ? new Date(booking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

  const progressPct = booking.status === "active" && booking.end_date
    ? Math.min(100, Math.round(((Date.now() - new Date(booking.start_date).getTime()) / (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime())) * 100))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className="group"
    >
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-100 p-6 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
              <Mountain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{start}{end ? ` → ${end}` : ""}</span>
              </div>
              {booking.service?.title && booking.route?.name && (
                <p className="text-xs text-gray-400 mt-1">{booking.service.title}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-gray-900 mb-2">
                <DollarSign className="w-5 h-5" />
                {Number(booking.total_price_usd).toFixed(2)}
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.border} ${cfg.color} border`}>
                {cfg.icon}
                {cfg.label}
              </div>
            </div>
            <Link
              href={`/booking/${booking.id}`}
              className="shrink-0 bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center gap-2"
            >
              View
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {progressPct !== null && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Journey in progress
              </span>
              <span className="font-bold text-emerald-600">{progressPct}% complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full shadow-sm"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default function TouristDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "authed" | "unauthed">("checking");
  const [filter, setFilter] = useState("all");
  const [greeting, setGreeting] = useState("Welcome back");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/bookings");
      const payload = await res.json();

      if (res.status === 401) {
        setAuthState("unauthed");
        router.push("/login?next=/dashboard");
        return;
      }

      if (!res.ok) {
        setAuthState("authed");
        setLoaded(true);
        return;
      }

      setAuthState("authed");
      setBookings(payload.bookings ?? []);
      setUserEmail(payload.user?.email ?? null);
      setLoaded(true);
    };
    void load();
  }, [router]);

  const totalSpent = useMemo(() => bookings.reduce((a, b) => a + Number(b.total_price_usd || 0), 0), [bookings]);
  const activeCount = useMemo(() => bookings.filter(b => ["pending", "confirmed", "active"].includes(b.status)).length, [bookings]);
  const completedCount = useMemo(() => bookings.filter(b => b.status === "completed").length, [bookings]);

  const filtered = bookings.filter(b => {
    if (filter === "active") return ["confirmed", "active", "pending"].includes(b.status);
    if (filter === "completed") return b.status === "completed";
    return true;
  });

  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-trekker-orange border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-500 text-sm">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (authState === "unauthed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-700 font-semibold text-lg">Please log in to view your dashboard</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Redirecting you to login…</p>
          <Link href="/login?next=/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-trekker-orange to-orange-600 text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all">
            Log In Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="pt-28 px-4 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-bold text-trekker-orange uppercase tracking-widest mb-2 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {greeting}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl font-bold font-playfair mb-2"
            >
              Trekker <span className="bg-gradient-to-r from-trekker-orange to-orange-600 bg-clip-text text-transparent">Dashboard</span>
            </motion.h1>
            {userEmail && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 text-sm"
              >
                {userEmail}
              </motion.p>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-trekker-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-orange-500/30"
            >
              <Compass className="w-5 h-5" />
              Explore Routes
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={MapPin} 
            label="Active Bookings" 
            value={loaded ? <AnimatedNumber value={activeCount} /> : "—"} 
            sub="In progress or confirmed" 
            gradient="from-trekker-orange to-orange-600"
            delay={0.1}
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Spent" 
            value={loaded ? `$${totalSpent.toFixed(2)}` : "—"} 
            sub="Across all bookings" 
            gradient="from-emerald-500 to-emerald-600"
            delay={0.2}
          />
          <StatCard 
            icon={Trophy} 
            label="Completed Treks" 
            value={loaded ? <AnimatedNumber value={completedCount} /> : "—"} 
            sub="NFT proofs eligible" 
            gradient="from-blue-500 to-blue-600"
            delay={0.3}
          />
        </div>

        {/* Weather Widget for Active Bookings */}
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h3 className="text-xl font-bold font-playfair text-gray-900 mb-4 flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-500" />
              Weather at Your Destination
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <WeatherWidget location="Kathmandu, Nepal" />
              <WeatherWidget location="Pokhara, Nepal" />
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
        >
          {[
            { href: "/explore", icon: "🗺️", label: "Explore", color: "from-blue-500 to-blue-600" },
            { href: "/vibe", icon: "🎖️", label: "My NFTs", color: "from-purple-500 to-purple-600" },
            { href: "/dao", icon: "⚖️", label: "DAO", color: "from-indigo-500 to-indigo-600" },
            { href: "/nft", icon: "✨", label: "Mint NFT", color: "from-pink-500 to-pink-600" },
          ].map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.05 }}
            >
              <Link
                href={item.href}
                className="flex flex-col items-center gap-3 py-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-trekker-orange transition-colors">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 flex items-center justify-between flex-wrap gap-4"
        >
          <h2 className="text-3xl font-bold font-playfair text-gray-900 flex items-center gap-3">
            <Mountain className="w-8 h-8 text-trekker-orange" />
            My Bookings
          </h2>
          <div className="flex gap-2">
            {["all", "active", "completed"].map((f) => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === f
                    ? "bg-gradient-to-r from-trekker-orange to-orange-600 text-white shadow-lg shadow-orange-500/30"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
                }`}
              >
                {f === "all" ? "All" : f === "active" ? "🚶 Active" : "🏆 Done"}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {!loaded ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-32 rounded-3xl bg-white/60 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 rounded-3xl border-2 border-dashed border-gray-200 bg-white/60 backdrop-blur-sm"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-6"
            >
              🧗
            </motion.div>
            <h3 className="text-gray-700 text-2xl font-bold mb-2">No bookings yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start exploring Nepal trekking routes!</p>
            <Link 
              href="/explore" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-trekker-orange to-orange-600 text-white font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-orange-500/30"
            >
              Browse Routes
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((booking, i) => (
                <BookingRow key={booking.id} booking={booking} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3 h-3" />
          Powered by Solana · Tourism Chain Nepal · All bookings recorded on-chain
        </motion.p>
      </div>
    </div>
  );
}
