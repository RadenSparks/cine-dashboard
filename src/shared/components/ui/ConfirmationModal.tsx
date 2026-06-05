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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/58 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            className="dashboard-panel relative w-full max-w-md rounded-xl p-8"
          >
            <button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
              onClick={onCancel}
              aria-label="Close"
              disabled={isLoading}
            >
              ×
            </button>
            <div className="mb-6 flex items-center gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border ${
                isDangerous
                  ? "border-red-200 bg-red-50 text-red-600 dark:border-red-700/60 dark:bg-red-500/12 dark:text-red-200"
                  : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-500/12 dark:text-sky-100"
              }`}>
                <AlertTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="page-eyebrow">{isDangerous ? "Confirm destructive action" : "Confirm action"}</div>
                <h3 className={`mt-3 text-2xl font-bold ${isDangerous ? "text-red-700 dark:text-red-300" : "text-slate-900 dark:text-white"}`}>{title}</h3>
              </div>
            </div>
            <p className="mb-6 text-base leading-7 text-slate-700 dark:text-slate-200">{message}</p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AppButton color="default" variant="soft" onClick={onCancel} disabled={isLoading}>
                {cancelLabel}
              </AppButton>
              <AppButton color={isDangerous ? "danger" : "primary"} onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? "Processing..." : actionLabel}
              </AppButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
