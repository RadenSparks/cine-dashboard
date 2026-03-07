import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangleIcon } from "lucide-react";
import AppButton from "./AppButton";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Reusable confirmation modal for confirming destructive actions
 * (delete, restore, etc.)
 *
 * @example
 * const [showConfirm, setShowConfirm] = useState(false);
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   title="Delete Session"
 *   message="This session will be permanently deleted. This action cannot be undone."
 *   actionLabel="Delete"
 *   isDangerous={true}
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export default function ConfirmationModal({
  isOpen,
  title,
  message,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
              onClick={onCancel}
              aria-label="Close"
              disabled={isLoading}
            >
              ×
            </button>
            <div className="flex items-center justify-center gap-2 mb-6">
              {isDangerous && (
                <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <h3 className={`text-2xl font-bold text-center ${
                isDangerous 
                  ? "text-red-700 dark:text-red-400" 
                  : "text-gray-800 dark:text-gray-100"
              }`}>
                {title}
              </h3>
            </div>
            <p className="mb-6 text-base text-gray-700 dark:text-gray-200 text-center">
              {message}
            </p>
            <div className="flex gap-4 justify-end">
              <AppButton
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </AppButton>
              <AppButton
                className={`px-4 py-2 rounded shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                  isDangerous
                    ? "bg-gradient-to-r from-red-600 to-red-400"
                    : "bg-gradient-to-r from-blue-600 to-blue-400"
                }`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : actionLabel}
              </AppButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
