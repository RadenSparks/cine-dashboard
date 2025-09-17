import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";
import { Card, CardBody, CardHeader, toast } from "@heroui/react";
import {
  ChartLineIcon,
  PlayCircleIcon,
  StarIcon,
  User2Icon,
} from "lucide-react";
import Loading from "../../components/UI/Loading";
import Title from "../../components/UI/Title";
import BlurCircle from "../../components/UI/BlurCircle";
import formatDateTime from "../../lib/dateCalculate";
import ProtectedRoute from "../../components/ProtectedRoute";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import React from "react";
import { EvervaultCard } from "../../components/UI/EvervaultCard";
import { InfiniteMovingCards } from "../../components/UI/InfiniteMovingCards";
import type { Movie } from "../../store/moviesSlice";

// --- Aceternity Card Flip Component ---
function FlipCard({ front, back }: { front: React.ReactNode; back: React.ReactNode }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className="relative w-40 h-64 perspective cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped((f) => !f)}
      aria-label="Flip card"
    >
      <div
        className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center [backface-visibility:hidden]">
          {front}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900 dark:via-blue-800 dark:to-blue-950 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {back}
        </div>
      </div>
    </div>
  );
}

// --- Top Booked Movies Section ---
function TopBookedMoviesFlip({ movies }: { movies: Movie[] }) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {movies.map((movie) => (
        <FlipCard
          key={movie.title}
          front={
            <div className="flex flex-col items-center justify-center h-full px-2 py-4">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-24 h-36 object-cover rounded-lg border mb-2 shadow"
              />
              <p className="font-semibold text-lg text-blue-700 text-center">{movie.title}</p>
              <div className="flex items-center gap-1 text-yellow-500 mt-1">
                <StarIcon className="w-4 h-4" />
                {movie.averageRating ?? "N/A"}
              </div>
            </div>
          }
          back={
            <div className="flex flex-col items-center justify-center h-full px-2 py-4">
              <span className="text-gray-700 text-sm mb-2 text-center">
                Booked <span className="font-bold">{movie.sales ?? "?"}</span> times
              </span>
              <span className="text-blue-600 font-semibold text-base mt-2">Top Booked</span>
              <span className="text-xs text-gray-400 mt-4">Click to flip back</span>
            </div>
          }
        />
      ))}
    </div>
  );
}

// --- Mock Data for Stat Cards ---
const dashboardCards = [
  {
    title: "Total Movies",
    value: 128,
    icon: PlayCircleIcon,
    color: "text-success",
  },
  {
    title: "Total Genres",
    value: 8,
    icon: StarIcon,
    color: "text-primary",
  },
  {
    title: "Total Bookings",
    value: 542,
    icon: ChartLineIcon,
    color: "text-warning",
  },
  {
    title: "Total Users",
    value: 312,
    icon: User2Icon,
    color: "text-danger",
  },
];

// --- Pie Chart Colors ---
const pieColors = ["#2563eb", "#f59e42", "#a855f7", "#10b981"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState(0);
  const [fade, setFade] = useState(true);

  // --- Redux selectors ---
  const movies = useSelector((state: RootState) => state.movies);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      toast({
        color: "success",
        message: "Dashboard data loaded!",
      });
    }, 800);
  }, []);

  // --- Example: Generate sales chart data from movies ---
  const salesChartData = useMemo(() => {
    return movies.map((m) => ({
      name: m.premiere_date.slice(5, 10),
      sales: Math.floor(Math.random() * 30) + 10,
    }));
  }, [movies]);

  // --- Pie Chart Data: Top 4 Booked Movies ---
  const topBookedMovies = movies.slice(0, 4);
  const pieChartData = topBookedMovies.map((movie) => ({
    name: movie.title,
    value: Math.floor(Math.random() * 100) + 50, // Mock bookings
  }));

  // --- Booking Table (demo: show all movies as bookings) ---
  const bookingRows = movies.map((movie, idx) => ({
    id: movie.movie_id,
    user: "Demo User",
    movie: movie.title,
    bookingStatus: "completed",
    total_price: 120000 + idx * 10000,
    booking_date: movie.premiere_date,
  }));

  // --- Comments (demo: show movie titles as comments) ---
  const comments = movies.map((movie) => ({
    user: "Demo User",
    comment: movie.description || "No comment",
    movie: movie.title,
    date: movie.premiere_date,
  }));

  // Comment carousel logic
  useEffect(() => {
    setCurrentComment(0);
    if (comments.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentComment((prev) => (prev + 1) % comments.length);
        setFade(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, [comments.length]);

  if (loading) {
    return <Loading />;
  }

  return (
    <ProtectedRoute>
      <div className="mt-10">
        <Title text1="Admin" text2="Dashboard" />
        <BlurCircle top="0" left="0" />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className="w-full h-40 flex items-center justify-center"
            >
              <EvervaultCard
                text={
                  <span className="flex flex-col items-center justify-center">
                    <card.icon className={`w-7 h-7 mb-2 ${card.color}`} />
                    <span className="text-base font-semibold">{card.title}</span>
                    <span className="text-xl font-bold mt-1">{card.value}</span>
                  </span>
                }
                className={`transition-all duration-300 ${
                  hovered !== null && hovered !== index ? "blur-sm scale-[0.98]" : ""
                }`}
              />
            </div>
          ))}
        </div>

        {/* Active Shows Reel */}
        <div>
          <h3 className="font-bold text-xl text-blue-700 mb-4">
            Active Shows Reel
          </h3>
          <InfiniteMovingCards
            items={movies.map((movie) => ({
              quote: movie.title,
              name: movie.premiere_date,
              title: "Now Showing",
              image: movie.poster,
            }))}
            direction="left"
            speed="slow"
            pauseOnHover={true}
            className="mb-8"
          />
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Movie Sales Chart & Pie Chart */}
          <Card className="col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-blue-100 dark:bg-zinc-900 dark:border-blue-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ChartLineIcon className="w-6 h-6 text-blue-700" />
                <h3 className="font-bold text-xl text-blue-700">
                  Films Sales Overview
                </h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="w-full h-56 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Chart for Top Booked Movies */}
              <div className="w-full flex flex-col items-center">
                <h4 className="font-bold text-lg text-blue-700 mb-2">Top Booked Movies (Pie)</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                    >
                      {pieChartData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          {/* Top Booked Movies - Flipping Cards */}
          <Card className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 dark:bg-zinc-900 dark:border-blue-900 flex flex-col items-center min-h-[600px]">
            <CardHeader>
              <h3 className="font-bold text-xl text-blue-700 mb-6 text-center">
                Top Booked Movies
              </h3>
            </CardHeader>
            <CardBody>
              <TopBookedMoviesFlip movies={topBookedMovies} />
            </CardBody>
          </Card>
        </div>

        {/* Booking Table */}
        <Card className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 dark:bg-zinc-900 dark:border-blue-900">
          <CardHeader>
            <h3 className="font-bold text-xl text-blue-700">
              Recent Bookings
            </h3>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Booking ID</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Movie</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingRows.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2">{order.id}</td>
                      <td className="py-2">{order.user}</td>
                      <td className="py-2">{order.movie}</td>
                      <td className="py-2">{order.bookingStatus}</td>
                      <td className="py-2">
                        {order.total_price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                      <td className="py-2">
                        {formatDateTime(order.booking_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Recent Comment Panel */}
        <Card className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 dark:bg-zinc-900 dark:border-blue-900">
          <CardHeader>
            <h3 className="font-bold text-xl text-blue-700">
              Recent User Comments
            </h3>
          </CardHeader>
          <CardBody>
            <div
              className={`flex flex-col items-center transition-opacity duration-300 ease-in-out max-w-sm text-center mx-auto ${
                fade ? "opacity-100" : "opacity-0"
              }`}
              key={currentComment}
            >
              <span className="font-semibold text-gray-800 truncate">
                {comments[currentComment].user}
              </span>
              <span className="text-gray-600 text-sm mb-1">
                about{" "}
                <span className="font-medium">
                  {comments[currentComment].movie}
                </span>
              </span>
              <p className="text-gray-700 text-sm mb-2 max-w-xs">
                {comments[currentComment].comment}
              </p>
              <span className="text-xs text-gray-400">
                {comments[currentComment].date}
              </span>
              <div className="flex gap-1 mt-3 justify-center">
                {comments.map((_, idx) => (
                  <span
                    key={idx}
                    className={`inline-block w-2 h-2 rounded-full ${
                      idx === currentComment ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;