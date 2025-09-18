import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { HomeIcon, FilmIcon, TicketIcon, UserIcon, Cog6ToothIcon, CalendarDaysIcon, CurrencyDollarIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { IconMenu2, IconCategory, IconDashboard } from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { TextGenerateEffect } from "../UI/TextGeneratedEffect";

const navItems = [
  { name: "Dashboard", icon: <HomeIcon className="h-5 w-5" />, path: "/" },
  { name: "Movies", icon: <FilmIcon className="h-5 w-5" />, path: "/movies" },
  { name: "Genres", icon: <IconCategory className="h-5 w-5" />, path: "/genres" },
  { name: "Bookings", icon: <TicketIcon className="h-5 w-5" />, path: "/bookings" },
  { name: "Session", icon: <CalendarDaysIcon className="h-5 w-5" />, path: "/sessions" },
  { name: "Users", icon: <UserIcon className="h-5 w-5" />, path: "/users" },
  { name: "Transactions", icon: <CurrencyDollarIcon className="h-5 w-5" />, path: "/transactions" },
  { name: "Promotions", icon: <SparklesIcon className="h-5 w-5" />, path: "/promotions" },
  { name: "Settings", icon: <Cog6ToothIcon className="h-5 w-5" />, path: "/settings" },

];

const admin = {
  id: 1,
  name: "Admin User",
  designation: "Administrator",
  image: "https://randomuser.me/api/portraits/men/32.jpg",
};

const quotes = [
  "May the Force be with you.",
  "Here's looking at you, kid.",
  "I'll be back.",
  "To infinity and beyond!",
  "You talking to me?",
  "Why so serious?",
  "Life finds a way.",
  "I see dead people.",
  "Houston, we have a problem.",
  "Keep your friends close, but your enemies closer."
];

function SidebarQuoteBox({ open }: { open: boolean }) {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="mx-6 mt-2 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-100/60 via-blue-200/40 to-blue-300/10 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-blue-900/10 shadow-inner p-4"
    >
      <div className="relative w-full">
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: "radial-gradient(circle at 60% 40%, rgba(59,130,246,0.18) 0%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-2 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-70 rounded-full blur-sm" />
        <TextGenerateEffect
          words={quote}
          className="text-xl md:text-2xl text-center px-2 py-2"
          filter={true}
          duration={0.7}
        />
      </div>
    </motion.div>
  );
}

function SidebarAvatar({ open }: { open: boolean }) {
  const [hovered, setHovered] = useState(false);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.currentTarget.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  return (
    <div className="flex flex-col items-center mb-8 mt-2 group relative">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative"
      >
        <AnimatePresence>
          {hovered && open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 260, damping: 10 },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              style={{
                translateX: translateX,
                rotate: rotate,
                whiteSpace: "nowrap",
              }}
              className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
            >
              <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
              <div className="relative z-30 text-base font-bold text-white">
                {admin.name}
              </div>
              <div className="text-xs text-white">{admin.designation}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative">
          <motion.img
            src={admin.image}
            alt={admin.name}
            height={open ? 120 : 40}
            width={open ? 120 : 40}
            className={cn(
              "object-cover object-top transition-all duration-300 group-hover:z-30 shadow-lg relative z-10",
              open
                ? "h-28 w-28 rounded-[1.75rem] border-4 border-white group-hover:scale-105"
                : "h-10 w-10 rounded-xl border-2 border-white"
            )}
            onMouseMove={handleMouseMove}
            animate={{
              scale: open ? 1 : 0.7,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ onWidthChange }: { onWidthChange?: (w: number) => void }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SIDEBAR_TRANSITION = 0.6; // seconds

  useEffect(() => {
    if (onWidthChange) {
      if (window.innerWidth < 768) {
        onWidthChange(0);
      } else {
        onWidthChange(open ? 260 : 60);
      }
    }
    const handleResize = () => {
      if (onWidthChange) {
        if (window.innerWidth < 768) {
          onWidthChange(0);
        } else {
          onWidthChange(open ? 260 : 60);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, onWidthChange]);

  const sidebarWidth = open ? 260 : 60;

  const desktopSidebar = (
    <motion.aside
      className={cn(
        "hidden md:flex flex-col fixed top-0 left-0 h-screen bg-neutral-100 dark:bg-neutral-800 shadow-xl z-30",
        open ? "min-w-[260px] w-[260px]" : "min-w-[60px] w-[60px]"
      )}
      style={{
        minWidth: sidebarWidth,
        width: sidebarWidth,
      }}
      animate={{ width: sidebarWidth }}
      transition={{ duration: SIDEBAR_TRANSITION, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex flex-col items-center mt-8 mb-2">
        <IconDashboard className="h-10 w-10 text-blue-600 mb-2" />
      </div>
      <SidebarAvatar open={open} />
      <div className="mx-6 mb-4 border-b border-gray-200 dark:border-neutral-700" />
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-2 rounded transition group/sidebar",
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
              )
            }
            end={item.path === '/'
            }
          >
            {item.icon}
            <motion.span
              animate={{
                opacity: open ? 1 : 0,
                width: open ? 'auto' : 0,
                display: open ? 'inline-block' : 'none',
              }}
              className="text-sm whitespace-pre transition-all duration-200"
            >
              {item.name}
            </motion.span>
          </NavLink>
        ))}
      </nav>
      <AnimatePresence>
        {open && <SidebarQuoteBox open={open} />}
      </AnimatePresence>
    </motion.aside>
  );

  // Mobile sidebar drawer unchanged
  const mobileSidebar = (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-4 bg-neutral-100 dark:bg-neutral-800">
        <IconMenu2
          className="h-6 w-6 text-neutral-800 dark:text-neutral-200 cursor-pointer"
          onClick={() => setMobileOpen(true)}
        />
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 flex flex-col p-8"
          >
            <div className="flex justify-end mb-8">
              <IconCategory
                className="h-6 w-6 text-neutral-800 dark:text-neutral-200 cursor-pointer"
                onClick={() => setMobileOpen(false)}
              />
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 p-3 rounded transition text-lg",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "hover:bg-neutral-200 text-neutral-700 dark:text-neutral-200"
                    )
                  }
                  end={item.path === '/'
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}