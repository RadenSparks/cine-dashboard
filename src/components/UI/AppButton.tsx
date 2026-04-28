import React from "react";
import { cn } from "../../lib/utils";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  gradient?: string;
  color?: "primary" | "danger" | "success" | "default";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "soft" | "ghost";
  icon?: React.ReactElement;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const colorMap = {
  primary: {
    solid:
      "border-transparent bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_54%,#3b82f6_100%)] text-white shadow-[0_18px_40px_-24px_rgba(37,99,235,0.85)] hover:brightness-105",
    soft:
      "border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 dark:border-sky-700/60 dark:bg-sky-500/12 dark:text-sky-100 dark:hover:bg-sky-500/18",
    ghost:
      "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
  },
  danger: {
    solid:
      "border-transparent bg-[linear-gradient(135deg,#b91c1c_0%,#dc2626_54%,#ef4444_100%)] text-white shadow-[0_18px_40px_-24px_rgba(220,38,38,0.82)] hover:brightness-105",
    soft:
      "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-700/60 dark:bg-red-500/12 dark:text-red-200 dark:hover:bg-red-500/18",
    ghost:
      "border-transparent bg-transparent text-red-700 hover:bg-red-50 dark:text-red-200 dark:hover:bg-red-500/12",
  },
  success: {
    solid:
      "border-transparent bg-[linear-gradient(135deg,#166534_0%,#16a34a_56%,#22c55e_100%)] text-white shadow-[0_18px_40px_-24px_rgba(22,163,74,0.82)] hover:brightness-105",
    soft:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-500/12 dark:text-emerald-200 dark:hover:bg-emerald-500/18",
    ghost:
      "border-transparent bg-transparent text-emerald-700 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-500/12",
  },
  default: {
    solid:
      "border-slate-200 bg-white text-slate-700 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.48)] hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700",
    soft:
      "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700",
    ghost:
      "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
  },
};

const sizeMap = {
  sm: "min-h-[36px] px-3.5 py-2 text-sm",
  md: "min-h-[42px] px-4 py-2.5 text-sm",
  lg: "min-h-[48px] px-5 py-3 text-[15px]",
};

const AppButtonComponent: React.FC<AppButtonProps> = ({
  children,
  gradient,
  color = "primary",
  size = "md",
  variant = "solid",
  icon,
  className = "",
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border font-semibold tracking-[0.01em] transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/70 dark:focus-visible:ring-sky-700/40",
        sizeMap[size],
        gradient ? "" : colorMap[color][variant],
        disabled && "cursor-not-allowed pointer-events-none opacity-45 saturate-50",
        className,
      )}
      style={{
        ...(gradient ? { background: gradient } : {}),
        fontFamily: "Red Rose, sans-serif",
      }}
      {...props}
    >
      {icon ? <span className="inline-flex items-center">{icon}</span> : null}
      {children}
    </button>
  );
};

const MemoizedAppButton = React.memo(AppButtonComponent);

export default MemoizedAppButton;
