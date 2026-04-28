import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import AppButton from "./AppButton";
import { SimpleTooltip } from "./Tooltip";
import { cn } from "../../lib/utils";

export function PageIntro({
  eyebrow,
  title,
  description,
  badge,
  actions,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <section className="dashboard-panel overflow-hidden rounded-[32px] p-6 md:p-7">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_auto] xl:items-center">
        <div className="min-w-0">
          {eyebrow ? <div className="page-eyebrow">{eyebrow}</div> : null}
          <div className="mt-4 flex min-w-0 items-start gap-4">
            {Icon ? (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_56%,#3b82f6_100%)] text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.88)]">
                <Icon className="h-6 w-6" />
              </span>
            ) : null}
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="page-title">{title}</h1>
                {badge ? <span className="status-pill-info">{badge}</span> : null}
              </div>
              {description ? <p className="page-description mt-3 max-w-3xl">{description}</p> : null}
            </div>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("dashboard-panel rounded-[28px] p-6", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
          {description ? <p className="body-copy mt-1 max-w-3xl">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  support,
  tone = "primary",
}: {
  title: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  support?: string;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    primary: "border-sky-200/80",
    success: "border-emerald-200/80",
    warning: "border-amber-200/80",
    danger: "border-red-200/80",
  };
  const iconTone = {
    primary: "bg-sky-50 text-sky-700 dark:bg-sky-500/12 dark:text-sky-100",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-200",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-200",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/12 dark:text-red-200",
  };

  return (
    <div className={cn("dashboard-stat-card", toneClasses[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">{title}</div>
        {Icon ? (
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10", iconTone[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-[2rem] font-black tracking-[-0.04em] text-slate-950 dark:text-white">{value}</div>
      {support ? <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">{support}</div> : null}
      {detail ? <div className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{detail}</div> : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const className =
    tone === "success"
      ? "status-pill-success"
      : tone === "warning"
        ? "status-pill-warning"
        : tone === "danger"
          ? "status-pill-danger"
          : tone === "info"
            ? "status-pill-info"
            : "status-pill-neutral";
  return <span className={className}>{children}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</div>
      <div className="body-copy mt-2">{body}</div>
    </div>
  );
}

export function ActionButton({
  children,
  tooltip,
  tone = "primary",
  variant = "solid",
  size = "md",
  className = "",
  icon,
  ...props
}: {
  children: ReactNode;
  tooltip?: ReactNode;
  tone?: "primary" | "danger" | "success" | "default";
  variant?: "solid" | "soft" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: ReactElement;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const button = (
    <AppButton {...props} color={tone} variant={variant} size={size} icon={icon} className={className}>
      {children}
    </AppButton>
  );

  return tooltip ? <SimpleTooltip content={tooltip}>{button}</SimpleTooltip> : button;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
  className = "",
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: Array<number | string> = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i += 1) pages.push(i);
      return pages;
    }

    pages.push(0);
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages - 2, currentPage + 1);
    if (startPage > 1) pages.push("...");
    for (let i = startPage; i <= endPage; i += 1) pages.push(i);
    if (endPage < totalPages - 2) pages.push("...");
    pages.push(totalPages - 1);
    return pages;
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/78", className)}>
      <div className="flex flex-wrap justify-center gap-2">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              disabled={loading}
              className={cn(
                "flex h-10 min-w-[40px] items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
                currentPage === page
                  ? "border-sky-700 bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700",
              )}
            >
              {(page as number) + 1}
            </button>
          ),
        )}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">Page {currentPage + 1} of {totalPages}</div>
    </div>
  );
}
