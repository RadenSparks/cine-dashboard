import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { useCurrentUser } from "@/shared/lib/useCurrentUser";
import { dashboardNavItems, dashboardNavSections, getRoleLabel } from "@/shared/config/dashboardNavigation";
import { TextGenerateEffect as TextGeneratedEffect } from "@/shared/components/ui/TextGeneratedEffect";
import { SidebarAvatar } from "./SidebarAvatar";

const movieQuotes = [
  "May the Force be with you.",
  "I'll be back.",
  "Here's looking at you, kid.",
  "To infinity and beyond!",
  "Why so serious?",
  "Life finds a way.",
  "I see dead people.",
  "Houston, we have a problem.",
  "Keep your friends close, but your enemies closer.",
  "After all, tomorrow is another day.",
];

function buildDisplayName(email?: string) {
  if (!email) return "Dashboard operator";
  const [name] = email.split("@");
  return name || "Dashboard operator";
}

function UserChip({ name, role }: { name: string; role?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold uppercase text-slate-900 shadow-[0_8px_16px_-4px_rgba(34,211,238,0.4)]">
        {name.slice(0, 2)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-100">{name}</div>
        <div className="truncate text-[11px] uppercase tracking-[0.16em] text-cyan-300">{getRoleLabel(role)}</div>
      </div>
    </div>
  );
}

function SidebarQuoteBox({ open }: { open: boolean }) {
  const [quote] = useState(() => movieQuotes[Math.floor(Math.random() * movieQuotes.length)]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[20px] border border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 px-4 py-3 shadow-[0_10px_24px_-12px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/30 dark:border-cyan-600/50 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-500/15 dark:shadow-[0_10px_24px_-12px_rgba(34,211,238,0.2)] dark:ring-1 dark:ring-cyan-500/30 hover:shadow-[0_12px_32px_-12px_rgba(34,211,238,0.25)] dark:hover:shadow-[0_12px_32px_-12px_rgba(34,211,238,0.3)] transition-shadow duration-300"
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/90 dark:text-cyan-300 font-bold">Featured</div>
      <div className="mt-2 text-xs leading-6 text-cyan-200 dark:text-cyan-100">
        <TextGeneratedEffect 
          words={quote}
          className="text-cyan-200 dark:text-cyan-100"
          filter={true}
          duration={0.3}
        />
      </div>
    </motion.div>
  );
}

export default function Sidebar({ onWidthChange }: { onWidthChange?: (w: number) => void }) {
  const currentUser = useCurrentUser();
  const location = useLocation();

  const getInitialDesktopOpen = () =>
    typeof window !== "undefined" ? window.innerWidth >= 1280 : true;

  const [open, setOpen] = useState(getInitialDesktopOpen);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCompactDesktop, setIsCompactDesktop] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 1400 : false));

  const displayName = useMemo(() => buildDisplayName(currentUser?.email), [currentUser?.email]);
  const desktopExpandedWidth = isCompactDesktop ? 272 : 296;
  const desktopWidth = open ? desktopExpandedWidth : 92;

  useEffect(() => {
    const syncWidth = () => {
      const nextIsCompactDesktop = window.innerWidth < 1400;
      setIsCompactDesktop(nextIsCompactDesktop);
      if (!onWidthChange) return;
      onWidthChange(window.innerWidth < 768 ? 0 : (open ? (nextIsCompactDesktop ? 272 : 296) : 92));
    };

    syncWidth();
    window.addEventListener("resize", syncWidth);
    return () => window.removeEventListener("resize", syncWidth);
  }, [onWidthChange, open]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const renderDesktopNav = () =>
    open ? (
      <nav className="space-y-4 pb-1">
        {dashboardNavSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <div className="px-2">
                    <span className="inline-flex rounded-full border border-cyan-500/50 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200 shadow-[0_6px_12px_-8px_rgba(34,211,238,0.2)] dark:border-cyan-400/60 dark:bg-gradient-to-r dark:from-cyan-500/30 dark:to-blue-500/20 dark:text-cyan-100 dark:shadow-[0_6px_12px_-8px_rgba(34,211,238,0.25)]">
                {section.label}
              </span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex h-[50px] items-center gap-3 overflow-hidden rounded-[18px] border px-3 py-2 transition",
                        isActive
                          ? "active border-cyan-400/60 bg-slate-800/60 text-cyan-300 shadow-[0_6px_12px_-8px_rgba(34,211,238,0.15)] dark:border-cyan-400/50 dark:bg-slate-800/60 dark:text-cyan-200 dark:shadow-[0_6px_12px_-8px_rgba(34,211,238,0.2)]"
                          : "border-transparent bg-transparent text-slate-400 hover:border-cyan-400/40 hover:bg-slate-800/40 hover:text-cyan-300 dark:text-slate-400 dark:hover:border-cyan-400/40 dark:hover:bg-slate-800/40 dark:hover:text-cyan-300",
                      )
                    }
                  >
                    <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-cyan-500 opacity-0 transition group-[.active]:opacity-100 dark:from-cyan-400 dark:to-cyan-500" />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-cyan-400/40 bg-slate-800/60 text-cyan-300 transition group-hover:border-cyan-300/60 group-hover:bg-slate-700/80 dark:border-cyan-400/50 dark:bg-slate-800/60 dark:text-cyan-300 dark:group-hover:border-cyan-300/60 dark:group-hover:bg-slate-700/80">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-100">{item.name}</div>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    ) : (
      <nav className="space-y-1 pb-1">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-[50px] items-center justify-center overflow-hidden rounded-[18px] border px-0 py-0 transition",
                  isActive
                    ? "active border-cyan-400/60 bg-slate-800/60 text-cyan-300 shadow-[0_6px_12px_-8px_rgba(34,211,238,0.15)] dark:border-cyan-400/50 dark:bg-slate-800/60 dark:text-cyan-200"
                    : "border-transparent bg-transparent text-slate-400 hover:border-cyan-400/40 hover:bg-slate-800/40 hover:text-cyan-300 dark:text-slate-400 dark:hover:border-cyan-400/40 dark:hover:bg-slate-800/40 dark:hover:text-cyan-300",
                )
              }
            >
              <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-cyan-500 opacity-0 transition group-[.active]:opacity-100" />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-cyan-400/40 bg-slate-800/60 text-cyan-300 transition group-hover:border-cyan-300/60 group-hover:bg-slate-700/80 dark:border-cyan-400/50 dark:bg-slate-800/60 dark:text-cyan-300 dark:group-hover:border-cyan-300/60 dark:group-hover:bg-slate-700/80">
                <Icon className="h-4.5 w-4.5" />
              </span>
            </NavLink>
          );
        })}
      </nav>
    );

  return (
    <>
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen overflow-hidden border-r border-slate-600/40 bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/92 text-slate-100 shadow-[0_20px_48px_-24px_rgba(15,23,42,0.3)] dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-900/98 dark:via-slate-900/96 dark:to-slate-950/98 dark:text-slate-100 dark:shadow-[0_20px_48px_-24px_rgba(0,0,0,0.5)] md:flex",
          open ? (isCompactDesktop ? "w-[272px]" : "w-[296px]") : "w-[92px]",
        )}
        animate={{ width: desktopWidth }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden px-3 py-3.5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_65%)]" />
          <div className="pointer-events-none absolute -left-10 bottom-16 h-40 w-40 rounded-full bg-cyan-400/8 blur-3xl dark:bg-cyan-500/5" />

          <div className="relative z-10 flex h-full min-h-0 flex-col gap-0">
            <div className="shrink-0 flex justify-center">
              <button
                type="button"
                className={cn(
                  "relative flex items-center justify-center overflow-hidden rounded-[14px] border-2 transition-all group",
                  open
                    ? "w-full h-12 px-3 border-cyan-400/60 bg-gradient-to-br from-slate-700 to-slate-800 hover:border-cyan-300/80 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 text-cyan-300 hover:text-cyan-200 shadow-[0_8px_16px_-4px_rgba(34,211,238,0.2)] hover:shadow-[0_10px_20px_-4px_rgba(34,211,238,0.3)] dark:border-cyan-500/50 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 dark:hover:border-cyan-400/70 dark:hover:bg-slate-700 dark:text-cyan-400 dark:hover:text-cyan-300 gap-2"
                    : "h-10 w-10 border-slate-600/50 bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:border-cyan-400/50 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 text-slate-400 hover:text-cyan-300 shadow-md hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-cyan-400/60 dark:text-slate-500 dark:hover:text-cyan-300"
                )}
                onClick={() => setOpen((value) => !value)}
                title={open ? "Collapse" : "Expand"}
              >
                <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <IconMenu2 className="relative z-10 h-4 w-4 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" />
                {open && (
                  <span className="relative z-10 text-sm font-semibold hidden sm:inline">
                    {open ? "Collapse" : "Expand"}
                  </span>
                )}
              </button>
            </div>

            <div className={cn("shrink-0 flex flex-col items-center justify-center", open && "pt-3")}>
              <SidebarAvatar
                open={open}
                userEmail={currentUser?.email || "user@example.com"}
                userRole={currentUser?.role}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"
            />

            <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1 hide-scrollbar">
              {renderDesktopNav()}
            </div>

            <div className="shrink-0 space-y-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"
              />
              <AnimatePresence mode="wait">
                <SidebarQuoteBox open={open} />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-700/50 bg-gradient-to-r from-slate-800/95 via-slate-800/90 to-slate-900/92 px-4 py-3 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/98 md:hidden">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-cyan-400/80 dark:text-cyan-300 font-bold">WyvernBox</div>
          <div className="text-sm font-bold text-slate-100 dark:text-slate-50">Dashboard</div>
        </div>
        <button
          type="button"
          className="rounded-xl border-2 border-cyan-400/50 bg-slate-700/60 p-2 text-cyan-300 shadow-md hover:border-cyan-300/80 hover:bg-slate-600 hover:text-cyan-200 hover:shadow-lg transition-all dark:border-cyan-500/40 dark:bg-slate-800/60 dark:text-cyan-400 dark:hover:border-cyan-400/70 dark:hover:bg-slate-700 dark:hover:text-cyan-300"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/55 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="flex h-full w-[86%] max-w-sm flex-col overflow-hidden bg-gradient-to-br from-slate-900/98 via-slate-900/96 to-slate-950/98 px-5 py-6 text-slate-100 shadow-2xl border-l border-slate-800/60"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="shrink-0 space-y-6">
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    className="rounded-xl border-2 border-cyan-400/50 bg-slate-800/60 p-2 text-cyan-400 hover:border-cyan-300/80 hover:bg-slate-700/80 hover:text-cyan-300 transition-all"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                  >
                    <IconX className="h-5 w-5" />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 px-4 py-4 shadow-lg">
                  <UserChip name={displayName} role={currentUser?.role} />
                </div>
              </div>

              <nav className="mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1 hide-scrollbar">
                {dashboardNavSections.map((section) => (
                  <div key={section.label} className="space-y-2">
                    <div className="px-1">
                      <span className="inline-flex rounded-full border border-cyan-500/50 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200 shadow-[0_8px_16px_-12px_rgba(34,211,238,0.2)]">
                        {section.label}
                      </span>
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/"}
                          className={({ isActive }) =>
                            cn(
                              "flex min-h-[74px] items-start gap-3 rounded-[22px] border-2 px-3 py-3 transition",
                              isActive
                                ? "border-cyan-400/60 bg-slate-800/60 text-cyan-300 shadow-[0_8px_16px_-12px_rgba(34,211,238,0.2)]"
                                : "border-transparent bg-transparent text-slate-400 hover:border-cyan-400/40 hover:bg-slate-800/40 hover:text-cyan-300 hover:shadow-[0_6px_12px_-8px_rgba(34,211,238,0.15)]",
                            )
                          }
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-slate-800/60 border border-cyan-400/30">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-slate-100">{item.name}</div>
                            <div className="mt-1 min-h-[2.5rem] text-xs leading-5 text-slate-300">{item.description}</div>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="mt-6 shrink-0 pb-2">
                <SidebarQuoteBox open />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
