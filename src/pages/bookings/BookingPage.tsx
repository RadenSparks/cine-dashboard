import { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { CalendarIcon, TicketIcon, CheckCircleIcon, TrendingUpIcon } from "lucide-react";
import Loading from "../../components/UI/Loading";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import BlurCircle from "../../components/UI/BlurCircle";

// Types for bookings
type Booking = {
  id: number;
  bookingId: string;
  userId: number;
  userName: string;
  movieTitle: string;
  roomName: string;
  seats: string[];
  sessionDate: string;
  bookingDate: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  totalPrice: number;
  ticketCount: number;
};

type BookingFilters = {
  search: string;
  status: "all" | Booking["status"];
  dateRange: "all" | "today" | "upcoming" | "past";
};

// Mock booking data
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    bookingId: "BK-001-2025",
    userId: 1,
    userName: "John Doe",
    movieTitle: "Inception",
    roomName: "Room 1",
    seats: ["A1", "A2"],
    sessionDate: "2025-12-10",
    bookingDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    totalPrice: 500,
    ticketCount: 2,
  },
  {
    id: 2,
    bookingId: "BK-002-2025",
    userId: 2,
    userName: "Jane Smith",
    movieTitle: "Oppenheimer",
    roomName: "Room 2",
    seats: ["B5", "B6", "B7"],
    sessionDate: "2025-12-12",
    bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    totalPrice: 750,
    ticketCount: 3,
  },
  {
    id: 3,
    bookingId: "BK-003-2025",
    userId: 3,
    userName: "Mike Johnson",
    movieTitle: "Dune Part Two",
    roomName: "Room 1",
    seats: ["C3"],
    sessionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    bookingDate: new Date().toISOString(),
    status: "PENDING",
    totalPrice: 250,
    ticketCount: 1,
  },
  {
    id: 4,
    bookingId: "BK-004-2025",
    userId: 4,
    userName: "Sarah Wilson",
    movieTitle: "Barbie",
    roomName: "Room 3",
    seats: ["D1", "D2"],
    sessionDate: "2025-12-08",
    bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CANCELLED",
    totalPrice: 400,
    ticketCount: 2,
  },
  {
    id: 5,
    bookingId: "BK-005-2025",
    userId: 5,
    userName: "Tom Brown",
    movieTitle: "Interstellar",
    roomName: "Room 2",
    seats: ["E4", "E5"],
    sessionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "CONFIRMED",
    totalPrice: 500,
    ticketCount: 2,
  },
];

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: typeof CalendarIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-blue-100 dark:border-zinc-700 p-6 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subtext}</p>}
      </div>
    </div>
  );
}

// Booking status badge
function StatusBadge({ status }: { status: Booking["status"] }) {
  const statusStyles: Record<Booking["status"], string> = {
    CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

// Booking table row
function BookingRow({ booking }: { booking: Booking }) {
  return (
    <tr className="hover:bg-blue-50 dark:hover:bg-zinc-800/50 transition border-b border-blue-100 dark:border-zinc-700 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
        {booking.bookingId}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{booking.userName}</td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{booking.movieTitle}</td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
        {booking.roomName} • {booking.seats.join(", ")}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
        {new Date(booking.sessionDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="px-6 py-4 text-sm">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
        ৳{booking.totalPrice}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
        <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
          <TicketIcon className="w-4 h-4" />
          {booking.ticketCount}
        </span>
      </td>
    </tr>
  );
}

export default function BookingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  // Mock loading and bookings state
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Filters
  const [filters, setFilters] = useState<BookingFilters>({
    search: "",
    status: "all",
    dateRange: "all",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Simulate loading bookings
  useEffect(() => {
    const timer = setTimeout(() => {
      setBookings(MOCK_BOOKINGS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
    const revenue = bookings
      .filter(b => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const upcoming = bookings.filter(
      b => new Date(b.sessionDate) > new Date() && b.status === "CONFIRMED"
    ).length;
    return { total, confirmed, revenue, upcoming };
  }, [bookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Search filter
    if (filters.search) {
      result = result.filter(
        b =>
          b.bookingId.toLowerCase().includes(filters.search.toLowerCase()) ||
          b.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          b.movieTitle.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(b => b.status === filters.status);
    }

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== "all") {
      result = result.filter(b => {
        const sessionDate = new Date(b.sessionDate);
        if (filters.dateRange === "today") {
          return sessionDate.toDateString() === now.toDateString();
        } else if (filters.dateRange === "upcoming") {
          return sessionDate > now;
        } else if (filters.dateRange === "past") {
          return sessionDate < now;
        }
        return true;
      });
    }

    return result;
  }, [bookings, filters]);

  // Paginate
  const paginatedBookings = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16 min-h-[400px] hide-scrollbar">
        <BlurCircle top="0" left="0" />

        {/* Header */}
        <div className="mb-8 mt-8">
          <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
            🎟️ Bookings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Manage movie ticket bookings and sessions</p>
        </div>

        {/* Key Metrics - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-md border border-blue-200 dark:border-blue-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <TicketIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>TOTAL BOOKINGS</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>All time</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-md border border-purple-200 dark:border-purple-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>UPCOMING</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.upcoming}</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>Future sessions</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-md border border-green-200 dark:border-green-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-600 dark:text-green-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>CONFIRMED</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.confirmed}</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>{stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(0) : 0}% confirmed</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-md border border-orange-200 dark:border-orange-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-lg">
              <TrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-orange-600 dark:text-orange-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>REVENUE</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">৳{stats.revenue.toLocaleString()}</h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>From confirmed bookings</p>
            </div>
          </div>
        </div>

        {/* Main Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-md border border-purple-100 dark:border-zinc-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Filters & Views
                </h3>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={filters.search}
                    onChange={e => {
                      setFilters({ ...filters, search: e.target.value });
                      setCurrentPage(0);
                    }}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Status Tabs */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Status</label>
                  <div className="space-y-2 mt-3">
                    {["all", "CONFIRMED", "PENDING", "CANCELLED"].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilters({ ...filters, status: status as any });
                          setCurrentPage(0);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                          filters.status === status
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600"
                        }`}
                      >
                        {status === "all" ? "All Status" : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={e => {
                      setFilters({ ...filters, dateRange: e.target.value as any });
                      setCurrentPage(0);
                    }}
                    className="w-full px-3 py-2 mt-3 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none dark:text-white"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{filteredBookings.length}</span> bookings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-md border border-purple-100 dark:border-zinc-800 overflow-hidden">
              {paginatedBookings.length === 0 ? (
                <div className="p-12 text-center">
                  <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No bookings found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {/* Booking Cards */}
                  <div className="divide-y divide-purple-100 dark:divide-zinc-700">
                    {paginatedBookings.map(booking => (
                      <div
                        key={booking.id}
                        className="p-6 hover:bg-purple-50 dark:hover:bg-zinc-800/50 transition border-l-4 border-purple-500"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left: Booking Info */}
                          <div>
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <TicketIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{booking.bookingId}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {booking.userName} • {booking.ticketCount} ticket{booking.ticketCount > 1 ? "s" : ""}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {booking.movieTitle}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  Seats: <span className="font-semibold text-gray-700 dark:text-gray-300">{booking.seats.join(", ")}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right: Session & Status */}
                          <div className="flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Session</p>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                    {new Date(booking.sessionDate).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                <StatusBadge status={booking.status} />
                              </div>
                            </div>
                            <div className="pt-4 border-t border-purple-100 dark:border-zinc-700 flex items-center justify-between">
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {booking.roomName} • {new Date(booking.bookingDate).toLocaleDateString()}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">৳{booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {filteredBookings.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border-t border-purple-100 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage + 1}</span> of{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">{totalPages || 1}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                          disabled={currentPage === 0}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                          disabled={currentPage >= totalPages - 1}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}