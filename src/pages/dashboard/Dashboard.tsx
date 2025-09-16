import { useEffect, useState, useMemo } from "react";
import { Card, CardBody, CardHeader, toast } from "@heroui/react";
import {
  ChartLineIcon,
  IndianRupeeIcon,
  PlayCircleIcon,
  StarIcon,
  UsersIcon,
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
} from "recharts";
import React from "react";
import { EvervaultCard } from "../../components/UI/EvervaultCard";
import { InfiniteMovingCards } from "../../components/UI/InfiniteMovingCards";


// Dummy data for demonstration
const MOCK_BOOKINGS = [
  {
    id: 1,
    user: { full_name: "Leon Arsene" },
    movie: "The Great Adventure",
    bookingStatus: "completed",
    total_price: 120000,
    booking_date: "2025-09-10T19:00:00",
  },
  {
    id: 2,
    user: { full_name: "Ezperanza Valdez" },
    movie: "Comedy Night",
    bookingStatus: "pending",
    total_price: 90000,
    booking_date: "2025-09-11T20:30:00",
  },
];

const MOCK_MOVIES = [
  {
    name: "The Great Adventure",
    sales: 120,
    primaryImage: "https://via.placeholder.com/300x400",
    averageRating: 4.5,
  },
  {
    name: "Comedy Night",
    sales: 90,
    primaryImage: "https://via.placeholder.com/300x400",
    averageRating: 4.2,
  },
];

const MOCK_COMMENTS = [
  {
    user: "Leon Arsene",
    comment: "This movie rocks! A must-watch for everyone.",
    movie: "The Great Adventure",
    date: "10/09/2025",
  },
  {
    user: "Ezperanza Valdez",
    comment: "Hilarious and entertaining from start to finish.",
    movie: "Comedy Night",
    date: "11/09/2025",
  },
];

const MOCK_SALES_CHART = [
  { name: "01/09", sales: 10 },
  { name: "02/09", sales: 20 },
  { name: "03/09", sales: 15 },
  { name: "04/09", sales: 30 },
  { name: "05/09", sales: 25 },
];

// Dummy active shows data
const MOCK_SHOWS = [
  {
    id: 1,
    title: "The Great Adventure",
    time: "19:00",
    date: "2025-09-10",
    image: "https://via.placeholder.com/120x180",
    status: "Now Showing",
  },
  {
    id: 2,
    title: "Comedy Night",
    time: "20:30",
    date: "2025-09-11",
    image: "https://via.placeholder.com/120x180",
    status: "Upcoming",
  },
];

const StatCard = ({
  card,
  index,
  hovered,
  setHovered,
}: {
  card: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
  };
  index: number;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
}) => (
  <div
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
);

const SalesChart = React.memo(function SalesChart({
  data,
}: {
  data: { name: string; sales: number }[];
}) {
  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
  );
});

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
function TopBookedMoviesFlip({ movies }: { movies: typeof MOCK_MOVIES }) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {movies.map((movie) => (
        <FlipCard
          key={movie.name}
          front={
            <div className="flex flex-col items-center justify-center h-full px-2 py-4">
              <img
                src={movie.primaryImage}
                alt={movie.name}
                className="w-24 h-36 object-cover rounded-lg border mb-2 shadow"
              />
              <p className="font-semibold text-lg text-blue-700 text-center">{movie.name}</p>
              <div className="flex items-center gap-1 text-yellow-500 mt-1">
                <StarIcon className="w-4 h-4" />
                {movie.averageRating}
              </div>
            </div>
          }
          back={
            <div className="flex flex-col items-center justify-center h-full px-2 py-4">
              <span className="text-gray-700 text-sm mb-2 text-center">
                Booked <span className="font-bold">{movie.sales}</span> times
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

const Dashboard = () => {
  const currency = "₫";
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [currentComment, setCurrentComment] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      toast({
        color: "success",
        message: "Dashboard data loaded!",
      });
    }, 800);
  }, []);

  // Comment carousel logic
  useEffect(() => {
    setCurrentComment(0);
    if (MOCK_COMMENTS.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentComment((prev) => (prev + 1) % MOCK_COMMENTS.length);
        setFade(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Memoize chart data so it doesn't change on hover
  const salesChartData = useMemo(() => MOCK_SALES_CHART, []);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: MOCK_BOOKINGS.length,
      icon: ChartLineIcon,
      color: "text-primary",
    },
    {
      title: "Total Revenue",
      value: `${currency} ${MOCK_BOOKINGS.reduce(
        (sum, b) => sum + b.total_price,
        0
      )}`,
      icon: IndianRupeeIcon,
      color: "text-warning",
    },
    {
      title: "Top Booked Movies",
      value: MOCK_MOVIES.length,
      icon: PlayCircleIcon,
      color: "text-success",
    },
    {
      title: "Total Users",
      value: 350,
      icon: UsersIcon,
      color: "text-secondary",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="mt-10">
        {/* Consistent spacing for both loading and loaded states */}
        {loading ? (
          <Loading />
        ) : (
          <>
            <Title text1="Admin" text2="Dashboard" />
            <BlurCircle top="0" left="0" />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              {dashboardCards.map((card, index) => (
                <StatCard
                  key={index}
                  card={card}
                  index={index}
                  hovered={hovered}
                  setHovered={setHovered}
                />
              ))}
            </div>

            {/* Active Shows Reel */}
            <div>
              <h3 className="font-bold text-xl text-blue-700 mb-4">
                Active Shows Reel
              </h3>
              <InfiniteMovingCards
                items={MOCK_SHOWS.map((show) => ({
                  quote: show.title,
                  name: `${show.date} • ${show.time}`,
                  title: show.status,
                  image: show.image,
                }))}
                direction="left"
                speed="slow"
                pauseOnHover={true}
                className="mb-8"
              />
            </div>

            {/* Main Dashboard Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Movie Sales Chart */}
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
                  <SalesChart data={salesChartData} />
                </CardBody>
              </Card>

              {/* Top Booked Movies - Flipping Cards */}
              <Card className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 dark:bg-zinc-900 dark:border-blue-900 flex flex-col items-center">
                <CardHeader>
                  <h3 className="font-bold text-xl text-blue-700 mb-6 text-center">
                    Top Booked Movies
                  </h3>
                </CardHeader>
                <CardBody>
                  <TopBookedMoviesFlip movies={MOCK_MOVIES} />
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
                      {MOCK_BOOKINGS.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-2">{order.id}</td>
                          <td className="py-2">{order.user.full_name}</td>
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
                    {MOCK_COMMENTS[currentComment].user}
                  </span>
                  <span className="text-gray-600 text-sm mb-1">
                    about{" "}
                    <span className="font-medium">
                      {MOCK_COMMENTS[currentComment].movie}
                    </span>
                  </span>
                  <p className="text-gray-700 text-sm mb-2 max-w-xs">
                    {MOCK_COMMENTS[currentComment].comment}
                  </p>
                  <span className="text-xs text-gray-400">
                    {MOCK_COMMENTS[currentComment].date}
                  </span>
                  <div className="flex gap-1 mt-3 justify-center">
                    {MOCK_COMMENTS.map((_, idx) => (
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
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;