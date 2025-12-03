import { useState, useMemo, useEffect, useRef } from "react";
import { Gift, PercentIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import Loading from "../../components/UI/Loading";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import BlurCircle from "../../components/UI/BlurCircle";
import AppButton from "../../components/UI/AppButton";

// Types for promotions
type Promotion = {
  id: number;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
  applicableMovies: number[];
};

type PromotionFilters = {
  search: string;
  status: "all" | Promotion["status"];
  type: "all" | Promotion["discountType"];
};

// Mock promotion data
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 1,
    code: "SUMMER25",
    title: "Summer Special",
    description: "20% off on all movie tickets",
    discountType: "PERCENTAGE",
    discountValue: 20,
    maxUses: 100,
    usedCount: 45,
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    status: "EXPIRED",
    applicableMovies: [1, 2, 3],
  },
  {
    id: 2,
    code: "HOLIDAY25",
    title: "Holiday Bonanza",
    description: "30% off on weekend shows",
    discountType: "PERCENTAGE",
    discountValue: 30,
    maxUses: 150,
    usedCount: 78,
    startDate: "2025-12-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    applicableMovies: [1, 2, 3, 4, 5],
  },
  {
    id: 3,
    code: "FLAT100",
    title: "Flat Discount",
    description: "Save ৳100 on bookings above ৳500",
    discountType: "FIXED",
    discountValue: 100,
    maxUses: 80,
    usedCount: 32,
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    applicableMovies: [2, 4],
  },
  {
    id: 4,
    code: "NEWYEAR25",
    title: "New Year Offer",
    description: "25% off on all bookings",
    discountType: "PERCENTAGE",
    discountValue: 25,
    maxUses: 200,
    usedCount: 0,
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    status: "SCHEDULED",
    applicableMovies: [1, 2, 3, 4, 5],
  },
  {
    id: 5,
    code: "STUDENT25",
    title: "Student Discount",
    description: "15% off with valid student ID",
    discountType: "PERCENTAGE",
    discountValue: 15,
    maxUses: 500,
    usedCount: 156,
    startDate: "2025-09-01",
    endDate: "2025-12-31",
    status: "ACTIVE",
    applicableMovies: [1, 2, 3, 4, 5],
  },
];

// Status badge
function StatusBadge({ status }: { status: Promotion["status"] }) {
  const statusStyles: Record<Promotion["status"], string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    EXPIRED: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

// Type badge
function TypeBadge({ type }: { type: Promotion["discountType"] }) {
  const typeStyles: Record<Promotion["discountType"], string> = {
    PERCENTAGE: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    FIXED: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeStyles[type]}`}>
      {type === "PERCENTAGE" ? `${type}` : `${type}`}
    </span>
  );
}

// Modal Component for Add/Edit Promotion
function PromotionModal({
  show,
  onClose,
  promotion,
  onSave,
}: {
  show: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onSave: (promotion: Promotion) => void;
}) {
  const [formData, setFormData] = useState<Promotion>(
    promotion || {
      id: 0,
      code: "",
      title: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxUses: 100,
      usedCount: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      status: "ACTIVE",
      applicableMovies: [],
    }
  );

  useEffect(() => {
    if (promotion) {
      setFormData(promotion);
    }
  }, [promotion]);

  const handleSubmit = () => {
    if (!formData.code || !formData.title || formData.discountValue <= 0) {
      return;
    }
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {promotion ? "Edit Promotion" : "Create New Promotion"}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Promotion Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., SUMMER25"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Promotion title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this promotion offers"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={e =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as "PERCENTAGE" | "FIXED",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Discount Value
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Maximum Uses
            </label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={e => setFormData({ ...formData, maxUses: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={e =>
                setFormData({
                  ...formData,
                  status: e.target.value as "ACTIVE" | "SCHEDULED" | "EXPIRED",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
          >
            Cancel
          </button>
          <AppButton onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            {promotion ? "Update Promotion" : "Create Promotion"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  show,
  onClose,
  onConfirm,
  title,
}: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Promotion?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete "{title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromotionPage() {
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(
    null
  );

  // Mock loading and promotions state
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Filters
  const [filters, setFilters] = useState<PromotionFilters>({
    search: "",
    status: "all",
    type: "all",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; promotionId: number; title: string }>({
    show: false,
    promotionId: 0,
    title: "",
  });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPromotions(MOCK_PROMOTIONS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const active = promotions.filter(p => p.status === "ACTIVE").length;
    const totalReach = promotions.reduce((sum, p) => sum + p.usedCount, 0);
    const avgDiscount = (
      promotions.reduce((sum, p) => sum + p.discountValue, 0) / promotions.length
    ).toFixed(1);
    return { active, totalReach, avgDiscount, total: promotions.length };
  }, [promotions]);

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    let result = [...promotions];

    if (filters.search) {
      result = result.filter(
        p =>
          p.code.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      result = result.filter(p => p.status === filters.status);
    }

    if (filters.type !== "all") {
      result = result.filter(p => p.discountType === filters.type);
    }

    return result;
  }, [promotions, filters]);

  // Paginate
  const paginatedPromotions = useMemo(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    return filteredPromotions.slice(start, end);
  }, [filteredPromotions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPromotions.length / pageSize);

  // Handlers
  const handleAddPromotion = (newPromotion: Promotion) => {
    if (editingPromotion) {
      // Update existing promotion
      setPromotions(prev =>
        prev.map(p => (p.id === editingPromotion.id ? { ...newPromotion, id: editingPromotion.id } : p))
      );
      toastRef.current?.showNotification({
        title: "Updated",
        content: `Promotion "${newPromotion.title}" updated successfully.`,
        accentColor: "#22c55e",
        position: "bottom-right",
        longevity: 3000,
      });
    } else {
      // Create new promotion
      const newId = promotions.length ? Math.max(...promotions.map(p => p.id)) + 1 : 1;
      setPromotions(prev => [...prev, { ...newPromotion, id: newId }]);
      toastRef.current?.showNotification({
        title: "Created",
        content: `Promotion "${newPromotion.title}" created successfully.`,
        accentColor: "#22c55e",
        position: "bottom-right",
        longevity: 3000,
      });
    }
    setShowAddModal(false);
    setEditingPromotion(null);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setShowAddModal(true);
  };

  const handleDeletePromotion = (id: number) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    toastRef.current?.showNotification({
      title: "Deleted",
      content: "Promotion deleted successfully.",
      accentColor: "#ef4444",
      position: "bottom-right",
      longevity: 3000,
    });
    setDeleteConfirm({ show: false, promotionId: 0, title: "" });
  };

  const handleOpenDeleteConfirm = (id: number, title: string) => {
    setDeleteConfirm({ show: true, promotionId: id, title });
  };

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
            🎁 Promotions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Create and manage promotional campaigns and discount codes</p>
        </div>

        {/* Key Metrics - 4 Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-md border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-600 dark:text-green-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>ACTIVE CAMPAIGNS</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>Out of {stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl shadow-md border border-blue-200 dark:border-blue-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>TOTAL REACH</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalReach}</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>Across all campaigns</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-md border border-purple-200 dark:border-purple-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <PercentIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-600 dark:text-purple-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>AVG DISCOUNT</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.avgDiscount}%</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>Average value</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-md border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-lg">
                <Gift className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-orange-600 dark:text-orange-300 font-semibold font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>TOTAL CAMPAIGNS</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>All time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <AppButton
            onClick={() => {
              setEditingPromotion(null);
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white whitespace-nowrap flex-shrink-0"
          >
            + Create Campaign
          </AppButton>

          {/* Inline Filters */}
          <div className="flex flex-1 gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={e => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(0);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:outline-none dark:text-white"
              />
            </div>

            <select
              value={filters.status}
              onChange={e => {
                setFilters({ ...filters, status: e.target.value as "all" | Promotion["status"] });
                setCurrentPage(0);
              }}
              className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:outline-none dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <select
              value={filters.type}
              onChange={e => {
                setFilters({ ...filters, type: e.target.value as "all" | Promotion["discountType"] });
                setCurrentPage(0);
              }}
              className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:outline-none dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>
        </div>

        {/* Promotion Cards Grid */}
        {paginatedPromotions.length === 0 ? (
          <div className="bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-md border border-red-100 dark:border-zinc-800 p-12 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No campaigns found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Create your first promotion campaign to get started</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedPromotions.map(promotion => (
                <div
                  key={promotion.id}
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-red-100 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition group"
                >
                  {/* Card Header - Status Bar */}
                  <div
                    className={`h-1 ${
                      promotion.status === "ACTIVE"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : promotion.status === "SCHEDULED"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}
                  ></div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Code & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
                          <p className="text-xs font-bold text-red-600 dark:text-red-300 uppercase tracking-wider">
                            {promotion.code}
                          </p>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{promotion.title}</h3>
                      </div>
                      <StatusBadge status={promotion.status} />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {promotion.description}
                    </p>

                    {/* Discount Value */}
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-4 border border-red-100 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Discount Value</span>
                        <div className="flex items-center gap-2">
                          {promotion.discountType === "PERCENTAGE" ? (
                            <>
                              <span className="text-2xl font-bold text-red-600 dark:text-red-300">
                                {promotion.discountValue}%
                              </span>
                              <TypeBadge type="PERCENTAGE" />
                            </>
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-red-600 dark:text-red-300">
                                ৳{promotion.discountValue}
                              </span>
                              <TypeBadge type="FIXED" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                          Usage: {promotion.usedCount} / {promotion.maxUses}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {((promotion.usedCount / promotion.maxUses) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-full transition-all duration-300"
                          style={{ width: `${(promotion.usedCount / promotion.maxUses) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-zinc-700">
                      <p>
                        {new Date(promotion.startDate).toLocaleDateString()} -
                        {new Date(promotion.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(promotion)}
                        className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm(promotion.id, promotion.title)}
                        className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredPromotions.length > 0 && (
              <div className="flex items-center justify-between bg-white/95 dark:bg-zinc-900/95 rounded-xl shadow-md border border-red-100 dark:border-zinc-800 px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage + 1}</span> of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{totalPages || 1}</span> •{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{filteredPromotions.length}</span> campaigns
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <PromotionModal
          show={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingPromotion(null);
          }}
          promotion={editingPromotion}
          onSave={handleAddPromotion}
        />
        <DeleteConfirmModal
          show={deleteConfirm.show}
          onClose={() => setDeleteConfirm({ show: false, promotionId: 0, title: "" })}
          onConfirm={() => handleDeletePromotion(deleteConfirm.promotionId)}
          title={deleteConfirm.title}
        />
      </div>
    </>
  );
}