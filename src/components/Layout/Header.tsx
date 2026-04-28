import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { clearAuthData } from "../../lib/auth";
import { useCurrentUser } from "../../lib/useCurrentUser";
import { headerFallback, getNavItemForPath, getRoleLabel } from "../../data/dashboardNavigation";
import { LogoutLoader } from "../UI/LogoutLoader";

const logoutSteps = [{ text: "Ending session" }, { text: "Clearing tokens" }, { text: "Redirecting to login" }];

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function getDisplayName(email?: string) {
  if (!email) return "Dashboard operator";
  return email.split("@")[0] || "Dashboard operator";
}

interface UserMenuDropdownProps {
  open: boolean;
  displayName: string;
  currentUser: { email?: string; role?: string } | null;
  onLogout: () => void;
}

// User Menu Dropdown Component
// User Menu Dropdown Component
function UserMenuDropdown({ open, displayName, currentUser, onLogout }: UserMenuDropdownProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className="absolute right-0 mt-3 w-72 rounded-[24px] border border-slate-200/60 bg-gradient-to-br from-slate-50/98 to-slate-100/95 p-3 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.15)] backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/95 dark:shadow-[0_16px_40px_-28px_rgba(0,0,0,0.5)] dark:backdrop-blur"
        >
          <div className="rounded-2xl bg-gradient-to-br from-slate-50/60 to-slate-100/40 px-4 py-4 dark:bg-gradient-to-br dark:from-slate-800/60 dark:to-slate-900/50">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{displayName}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-200">{currentUser?.email || "operator@cine.local"}</div>
            <div className="mt-3 inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600 dark:border-cyan-400/50 dark:bg-cyan-500/20 dark:text-cyan-200">
              {getRoleLabel(currentUser?.role)}
            </div>
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300/60 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-700/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
            onClick={onLogout}
          >
            <IconLogout className="h-4 w-4" />
            Sign out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface HeaderInfoProps {
  currentNav: { icon: ComponentType<{ className?: string }>; name: string; description: string };
}

// Header Info Component
function HeaderInfo({ currentNav }: HeaderInfoProps) {
  const HeaderIcon = currentNav.icon ?? headerFallback.icon;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex h-8 items-center rounded-full border border-cyan-400/40 bg-cyan-400/15 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600 shadow-sm dark:border-cyan-400/60 dark:bg-cyan-500/25 dark:text-cyan-100">
          {formatToday()}
        </span>
      </div>
      <div className="mt-3 flex min-w-0 items-start gap-3 lg:gap-4">
        <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-[0_12px_24px_-16px_rgba(34,211,238,0.3)] dark:from-cyan-500 dark:to-blue-600 dark:text-slate-900 dark:shadow-[0_12px_24px_-16px_rgba(34,211,238,0.4)] lg:h-12 lg:w-12 font-bold">
          <HeaderIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[1.45rem] font-bold tracking-tight text-slate-900 dark:text-slate-50 lg:text-[1.8rem]">{currentNav.name}</h1>
          <div className="mt-1 max-w-3xl truncate text-sm leading-6 text-slate-600 dark:text-slate-200 lg:whitespace-normal">{currentNav.description}</div>
        </div>
      </div>
    </div>
  );
}

interface ThemeToggleProps {
  darkMode: boolean;
  onChange: (value: boolean) => void;
}

// Theme Toggle Button
function ThemeToggle({ darkMode, onChange }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="flex h-12 w-12 items-center justify-center rounded-[18px] border-2 border-cyan-400/40 bg-slate-100/80 text-cyan-700 shadow-md transition hover:border-cyan-400/60 hover:bg-slate-200/80 hover:text-cyan-800 dark:border-cyan-500/40 dark:bg-slate-800/60 dark:text-cyan-400 dark:hover:border-cyan-400/70 dark:hover:bg-slate-700 dark:hover:text-cyan-300 lg:h-14 lg:w-14 lg:rounded-[20px]"
      onClick={() => onChange(!darkMode)}
      aria-label="Toggle theme"
    >
      {darkMode ? <IconSun className="h-5 w-5 text-cyan-300" /> : <IconMoon className="h-5 w-5 text-cyan-700" />}
    </button>
  );
}

interface UserButtonProps {
  displayName: string;
  currentUser: { email?: string; role?: string } | null;
  onClick: () => void;
}

// User Button Component
function UserButton({ displayName, currentUser, onClick }: UserButtonProps) {
  return (
    <button
      type="button"
      className="flex h-12 min-w-[210px] items-center gap-3 rounded-[18px] border-2 border-cyan-400/40 bg-slate-100/80 px-3 shadow-[0_12px_20px_-16px_rgba(34,211,238,0.1)] transition hover:border-cyan-400/60 hover:bg-slate-200/80 dark:border-cyan-500/40 dark:bg-slate-800/60 dark:shadow-[0_12px_20px_-16px_rgba(34,211,238,0.2)] dark:hover:border-cyan-400/70 dark:hover:bg-slate-700 lg:h-14 lg:min-w-[256px] lg:rounded-[22px]"
      onClick={onClick}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold uppercase text-slate-950 shadow-[0_8px_16px_-4px_rgba(34,211,238,0.3)] dark:from-cyan-500 dark:to-blue-600 dark:text-slate-900 dark:shadow-[0_8px_16px_-4px_rgba(34,211,238,0.4)]">
        {displayName.slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{displayName}</div>
        <div className="hidden truncate text-xs text-slate-600 dark:text-slate-200 lg:block">{currentUser?.email || "dashboard operator"}</div>
        <div className="truncate text-[11px] text-slate-600 dark:text-slate-200 lg:hidden">{getRoleLabel(currentUser?.role)}</div>
      </div>
    </button>
  );
}

export default function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [darkMode, setDarkMode] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const currentNav = useMemo(() => getNavItemForPath(location.pathname) ?? headerFallback, [location.pathname]);
  const displayName = getDisplayName(currentUser?.email);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setShowLogoutLoader(true);
  };

  return (
    <>
      <LogoutLoader
        show={showLogoutLoader}
        steps={logoutSteps}
        duration={620}
        title="Signing out"
        onComplete={() => {
          clearAuthData();
          setShowLogoutLoader(false);
          navigate("/login", { replace: true });
        }}
      />

      <header className="sticky top-0 z-20 hidden border-b border-slate-200/60 bg-gradient-to-br from-slate-50/95 via-slate-100/90 to-slate-200/92 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.1)] backdrop-blur-lg dark:border-slate-800/60 dark:bg-gradient-to-br dark:from-slate-900/98 dark:via-slate-900/96 dark:to-slate-950/98 dark:shadow-[0_12px_28px_-18px_rgba(0,0,0,0.5)] md:block relative">
        {/* Lamp line effect for visual separation */}
        <motion.div
          className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent dark:via-cyan-400/40"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_58%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_58%)]" />
        <div className="mx-auto flex min-h-[84px] w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:min-h-[92px] lg:gap-6 lg:px-8 xl:px-14 relative z-10">
          {/* Left: Header Info */}
          <HeaderInfo currentNav={currentNav} />

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle darkMode={darkMode} onChange={setDarkMode} />

            <div className="relative">
              <UserButton displayName={displayName} currentUser={currentUser} onClick={() => setUserMenuOpen((v) => !v)} />
              <UserMenuDropdown open={userMenuOpen} displayName={displayName} currentUser={currentUser} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
