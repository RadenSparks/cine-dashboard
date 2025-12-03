import { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { DollarSignIcon, TrendingUpIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import Loading from "../../components/UI/Loading";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import BlurCircle from "../../components/UI/BlurCircle";

// Types for transactions
type Transaction = {
  id: number;
  transactionId: string;
  userId: number;
  userName: string;
  amount: number;
  type: "BOOKING" | "REFUND" | "PAYMENT" | "CHARGE";
  status: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";
  description: string;
  createdAt: string;
  updatedAt?: string;
};

type TransactionFilters = {
  search: string;
  type: "all" | Transaction["type"];
  status: "all" | Transaction["status"];
  dateRange: "all" | "today" | "week" | "month";
};

// Mock transaction data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    transactionId: "TXN-001-2025",
    userId: 1,
    userName: "John Doe",
    amount: 450,
    type: "BOOKING",
    status: "COMPLETED",
    description: "Movie ticket booking - Inception",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    transactionId: "TXN-002-2025",
    userId: 2,
    userName: "Jane Smith",
    amount: -150,
    type: "REFUND",
    status: "COMPLETED",
    description: "Refund - Cancelled booking",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    transactionId: "TXN-003-2025",
    userId: 3,
    userName: "Mike Johnson",
    amount: 600,
    type: "BOOKING",
    status: "PENDING",
    description: "Movie ticket booking - Oppenheimer",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    transactionId: "TXN-004-2025",
    userId: 4,
    userName: "Sarah Wilson",
    amount: 300,
    type: "BOOKING",
    status: "COMPLETED",
    description: "Movie ticket booking - Dune Part Two",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    transactionId: "TXN-005-2025",
    userId: 5,
    userName: "Tom Brown",
    amount: 0,
    type: "CHARGE",
    status: "FAILED",
    description: "Payment processing failed",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
  icon: typeof DollarSignIcon;
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

// Transaction status badge
function StatusBadge({ status }: { status: Transaction["status"] }) {
  const statusStyles: Record<Transaction["status"], string> = {
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

// Transaction type badge
function TypeBadge({ type }: { type: Transaction["type"] }) {
  const typeStyles: Record<Transaction["type"], string> = {
    BOOKING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    REFUND: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
    PAYMENT: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    CHARGE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeStyles[type]}`}>
      {type}
    </span>
  );
}

// Transaction table row
function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <tr className="hover:bg-blue-50 dark:hover:bg-zinc-800/50 transition border-b border-blue-100 dark:border-zinc-700 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
        {transaction.transactionId}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{transaction.userName}</td>
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
        ৳{Math.abs(transaction.amount).toLocaleString()}
      </td>
      <td className="px-6 py-4 text-sm">
        <TypeBadge type={transaction.type} />
      </td>
      <td className="px-6 py-4 text-sm">
        <StatusBadge status={transaction.status} />
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{transaction.description}</td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {new Date(transaction.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        })}
      </td>
    </tr>
  );
}

export default function TransactionPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  // Mock loading and transactions state
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Filters
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    type: "all",
    status: "all",
    dateRange: "all",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Simulate loading transactions
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const completed = transactions.filter(t => t.status === "COMPLETED").length;
    const pending = transactions.filter(t => t.status === "PENDING").length;
    return { total, completed, pending };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (filters.search) {
      result = result.filter(
        t =>
          t.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter(t => t.type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(t => t.status === filters.status);
    }

    // Date range filter
    const now = new Date();
    if (filters.dateRange !== "all") {
      result = result.filter(t => {
        const txnDate = new Date(t.createdAt);
        if (filters.dateRange === "today") {
          return txnDate.toDateString() === now.toDateString();
        } else if (filters.dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return txnDate >= weekAgo;
        } else if (filters.dateRange === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return txnDate >= monthAgo;
        }
        return true;
      });
    }

    return result;
  }, [transactions, filters]);

  // Paginate
  const paginatedTransactions = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

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
            💳 Transactions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Real-time payment and transaction monitoring</p>
        </div>

        {/* Key Metrics - Horizontal with emphasis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
              <DollarSignIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-600 dark:text-green-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>TOTAL REVENUE</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">৳{stats.total.toLocaleString()}</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>{transactions.length} transactions</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-md border border-blue-200 dark:border-blue-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>COMPLETED</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completed}</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>{transactions.length > 0 ? ((stats.completed / transactions.length) * 100).toFixed(1) : 0}% success rate</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-md border border-orange-200 dark:border-orange-800 p-6 flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-lg">
              <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-orange-600 dark:text-orange-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>PENDING</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</h3>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>Awaiting completion</p>
            </div>
          </div>
        </div>

        {/* Main Content - Side Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-md border border-blue-100 dark:border-zinc-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Filters
                </h3>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={e => {
                      setFilters({ ...filters, search: e.target.value });
                      setCurrentPage(0);
                    }}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Type Filter */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Type</label>
                  <select
                    value={filters.type}
                    onChange={e => {
                      setFilters({ ...filters, type: e.target.value as typeof filters.type });
                      setCurrentPage(0);
                    }}
                    className="w-full px-3 py-2 mt-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="BOOKING">Booking</option>
                    <option value="REFUND">Refund</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="CHARGE">Charge</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Status</label>
                  <select
                    value={filters.status}
                    onChange={e => {
                      setFilters({ ...filters, status: e.target.value as typeof filters.status });
                      setCurrentPage(0);
                    }}
                    className="w-full px-3 py-2 mt-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={e => {
                      setFilters({ ...filters, dateRange: e.target.value as typeof filters.dateRange });
                      setCurrentPage(0);
                    }}
                    className="w-full px-3 py-2 mt-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none dark:text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">{filteredTransactions.length}</span> found
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Transaction List */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-md border border-blue-100 dark:border-zinc-800 overflow-hidden">
              {/* Table */}
              <div className="overflow-y-auto hide-scrollbar max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-zinc-800 dark:to-zinc-800 border-b border-blue-100 dark:border-zinc-700 font-asul z-10" style={{ fontFamily: 'Asul, sans-serif' }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map(transaction => (
                        <TransactionRow key={transaction.id} transaction={transaction} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTransactions.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-zinc-800 dark:to-zinc-800 border-t border-blue-100 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage + 1}</span> of{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">{totalPages || 1}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}