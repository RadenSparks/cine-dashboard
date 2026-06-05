import { AnimatePresence, motion } from "framer-motion";

interface MediaPreviewModalProps {
  previewUrl: string | null;
  onClose: () => void;
}

export function MediaPreviewModal({ previewUrl, onClose }: MediaPreviewModalProps) {
  return (
    <AnimatePresence>
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[99999] isolation-isolate flex items-center justify-center bg-black/60 p-4 backdrop-blur-md pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.96, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="dashboard-panel max-w-[92vw] max-h-[92vh] rounded-xl p-4"
          >
            <div className="relative overflow-hidden rounded-lg">
              <button
                aria-label="Close preview"
                onClick={onClose}
                className="absolute right-3 top-3 z-[100001] rounded-full border border-slate-200 bg-white/85 p-2 text-slate-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800/85 dark:text-slate-200"
                type="button"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center justify-center" style={{ width: "88vw", height: "80vh", maxWidth: "1200px", maxHeight: "86vh" }}>
                <img src={previewUrl} alt="Preview" className="max-h-full max-w-full rounded-xl object-contain" draggable={false} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
