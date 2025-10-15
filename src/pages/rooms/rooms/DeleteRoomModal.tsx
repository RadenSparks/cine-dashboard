import { motion, AnimatePresence } from "framer-motion";
import AppButton from "../../../components/UI/AppButton";

interface DeleteRoomModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteRoomModal({
  open,
  onClose,
  onDelete,
}: DeleteRoomModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6 text-red-700 dark:text-red-300 text-center">Delete Room</h3>
            <p className="mb-6 text-base text-gray-700 dark:text-gray-200 text-center">
              Are you sure you want to delete this room? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <AppButton
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:scale-105 transition-transform"
                onClick={onClose}
              >
                Cancel
              </AppButton>
              <AppButton
                className="bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
                onClick={onDelete}
              >
                Delete
              </AppButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}