import { motion } from "framer-motion";

const SvgLoader = () => (
  <div className="dashboard-panel flex items-center gap-4 rounded-xl px-6 py-5">
    <motion.div
      className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-sky-200 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_60%,#3b82f6_100%)] text-white shadow-[0_16px_36px_-22px_rgba(37,99,235,0.78)]"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 5h14v14H5z" />
        <path d="M9 9h6v6H9z" />
      </svg>
    </motion.div>
    <div>
      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">Loading workspace</div>
      <div className="text-sm text-slate-700 dark:text-slate-200">Preparing the latest dashboard view.</div>
    </div>
  </div>
);

interface LoadingProps {
  fullscreen?: boolean;
}

const Loading = ({ fullscreen = true }: LoadingProps) => {
  const containerClass = fullscreen ? "flex min-h-[100vh] items-center justify-center" : "flex items-center justify-center";
  return (
    <div className={containerClass}>
      <SvgLoader />
    </div>
  );
};

export default Loading;
