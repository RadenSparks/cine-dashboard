"use client";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={cn("w-6 h-6", className)}>
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-6 h-6", className)}>
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

type Step = { text: string };

export function LogoutLoader({
  show,
  steps,
  duration = 2000,
}: {
  show: boolean;
  steps: Step[];
  duration?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!show) {
      setCurrent(0);
      return;
    }
    if (current < steps.length - 1) {
      const t = setTimeout(() => setCurrent((c) => c + 1), duration);
      return () => clearTimeout(t);
    }
  }, [show, current, steps.length, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xl"
        >
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl px-10 py-12 min-w-[340px] max-w-xs border border-blue-200 dark:border-blue-900">
            <div className="mb-8 flex flex-col items-center">
              <svg width={48} height={48} viewBox="0 0 48 48" fill="none">
                <circle cx={24} cy={24} r={24} fill="#3B82F6" fillOpacity={0.15} />
                <path d="M32 24l-8 8m0 0l-8-8m8 8V12" stroke="#3B82F6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="mt-4 text-lg font-semibold text-blue-700 dark:text-blue-300">Logging out...</span>
            </div>
            <div className="space-y-4">
              {steps.map((step, idx) => {
                const isActive = idx === current;
                const isDone = idx < current;
                return (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <span>
                      {isDone ? (
                        <CheckFilled className="text-lime-500" />
                      ) : isActive ? (
                        <CheckFilled className="text-blue-600 dark:text-blue-400 animate-pulse" />
                      ) : (
                        <CheckIcon className="text-neutral-400" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-base",
                        isActive && "font-bold text-blue-700 dark:text-blue-300",
                        isDone && "text-lime-600 dark:text-lime-400",
                        !isActive && !isDone && "text-neutral-500 dark:text-neutral-400"
                      )}
                    >
                      {step.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}