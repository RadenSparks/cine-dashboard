type DeleteConfirmModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export function DeleteConfirmModal({ show, onClose, onConfirm, title }: DeleteConfirmModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full">
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
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
