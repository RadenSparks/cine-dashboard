import React from "react";
import { motion } from "framer-motion";

export function LampContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full bg-slate-950 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Lamp effect background */}
      <motion.div
        initial={{ opacity: 0.5, y: 50 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/40 to-blue-500/30 rounded-full blur-3xl opacity-60 dark:opacity-40"
      />
      
      {/* Secondary lamp effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
        className="absolute -bottom-20 right-1/4 w-72 h-72 bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-full blur-3xl opacity-50 dark:opacity-30"
      />

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
