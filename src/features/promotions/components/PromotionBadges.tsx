import type { Promotion } from "@/shared/mocks";

export function PromotionStatusBadge({ status }: { status: Promotion["status"] }) {
  const statusStyles: Record<Promotion["status"], string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    EXPIRED: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  };

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>{status}</span>;
}

export function PromotionTypeBadge({ type }: { type: Promotion["discountType"] }) {
  const typeStyles: Record<Promotion["discountType"], string> = {
    PERCENTAGE: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    FIXED: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  };

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeStyles[type]}`}>{type}</span>;
}
