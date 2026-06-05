import { useEffect, useState } from "react";
import AppButton from "@/shared/components/ui/AppButton";
import type { Promotion } from "@/shared/mocks";

type PromotionModalProps = {
  show: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onSave: (promotion: Promotion) => void;
};

const emptyPromotion = (): Promotion => ({
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
});

export function PromotionModal({ show, onClose, promotion, onSave }: PromotionModalProps) {
  const [formData, setFormData] = useState<Promotion>(promotion ?? emptyPromotion());

  useEffect(() => {
    setFormData(promotion ?? emptyPromotion());
  }, [promotion, show]);

  const handleSubmit = () => {
    if (!formData.code || !formData.title || formData.discountValue <= 0) return;
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {promotion ? "Edit Promotion" : "Create New Promotion"}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Promotion Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(event) => setFormData({ ...formData, code: event.target.value })}
              placeholder="e.g., SUMMER25"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              placeholder="Promotion title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              placeholder="Describe what this promotion offers"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(event) => setFormData({ ...formData, discountType: event.target.value as Promotion["discountType"] })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Discount Value</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(event) => setFormData({ ...formData, discountValue: Number(event.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Maximum Uses</label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(event) => setFormData({ ...formData, maxUses: Number(event.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) => setFormData({ ...formData, endDate: event.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(event) => setFormData({ ...formData, status: event.target.value as Promotion["status"] })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex justify-end gap-3 sticky bottom-0">
          <AppButton color="default" variant="soft" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
            {promotion ? "Update Promotion" : "Create Promotion"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
