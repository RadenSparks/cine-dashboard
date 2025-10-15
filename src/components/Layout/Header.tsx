import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IconMenu2, IconX, IconBell, IconCalendar, IconMoon, IconSun, IconLogout } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { isAuthenticated } from "../../lib/auth";
import { LogoutLoader } from "../UI/LogoutLoader"; // Import the loader

const navLinks = [
  { name: "Dashboard", link: "/" },
  { name: "Movies", link: "/movies" },
  { name: "Bookings", link: "/bookings" },
  { name: "Showtimes", link: "/showtimes" },
  { name: "Users", link: "/users" },
  { name: "Transactions", link: "/transactions" },
  { name: "Promotions", link: "/promotions" },
  { name: "Settings", link: "/settings" },
];

const user = {
  name: "Admin User",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
};

const logoutSteps = [
  { text: "Ending session..." },
  { text: "Clearing user data..." },
  { text: "Redirecting to login..." },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Logout function with loader
  const handleLogout = () => {
    setUserMenuOpen(false);
    setShowLogoutLoader(true);
    setPendingLogout(true);
  };

  const handleLogoutComplete = React.useCallback(() => {
    if (pendingLogout) {
      localStorage.removeItem("cine-user-details");
      setPendingLogout(false);
      navigate("/login");
      // Don't setShowLogoutLoader(false) here, let navigation happen first
    }
  }, [pendingLogout, navigate]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>
      <LogoutLoader
        show={showLogoutLoader}
        steps={logoutSteps}
        duration={1000}
        onComplete={handleLogoutComplete}
      />
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b">
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16 flex items-center justify-between h-16">
          {/* Left: Logo and Dashboard Title */}
          <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
            <a
              href="/"
              className="flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black dark:text-white"
            >
              <img
                src="https://assets.aceternity.com/logo-dark.png"
                alt="logo"
                width={30}
                height={30}
                className="rounded"
              />
              <span className="font-semibold text-lg text-black dark:text-white whitespace-nowrap">Cine Dashboard</span>
            </a>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold ml-2 whitespace-nowrap">
              Admin
            </span>
          </div>
          {/* Center: Welcome Message */}
          <div className="flex-1 flex justify-center items-center min-w-0">
            <div className="px-4 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow transition duration-200 text-base truncate max-w-full md:max-w-[600px]">
              Welcome back, <span className="font-bold">{user.name}</span>!
            </div>
          </div>
          {/* Right: Icons & User */}
          <div className="flex items-center gap-2 relative flex-shrink-0 min-w-0">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
              <IconBell className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
              <IconCalendar className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <IconSun className="h-5 w-5 text-yellow-500" />
              ) : (
                <IconMoon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
              )}
            </button>
            {isAuthenticated() && (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Open user menu"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border-2 border-blue-500 object-cover"
                  />
                  <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200 hidden md:inline whitespace-nowrap">{user.name}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-neutral-900 shadow-lg border border-gray-100 dark:border-neutral-800 z-50"
                    >
                      <div className="flex flex-col py-2">
                        <span className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 font-semibold">
                          {user.name}
                        </span>
                        <hr className="my-1 border-gray-200 dark:border-neutral-800" />
                        <a href="#" className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-zinc-700 dark:text-zinc-200">
                          Profile
                        </a>
                        <a href="#" className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-zinc-700 dark:text-zinc-200">
                          Settings
                        </a>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition font-semibold"
                          onClick={handleLogout}
                          disabled={showLogoutLoader}
                        >
                          <IconLogout className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {/* Mobile Nav Toggle */}
            <div className="lg:hidden flex items-center">
              <IconMenu2
                className="h-6 w-6 text-black dark:text-white cursor-pointer"
                onClick={() => setMobileOpen(true)}
              />
            </div>
          </div>
        </div>
        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-0 top-0 z-50 flex flex-col items-start gap-4 rounded-lg bg-white px-4 py-8 shadow dark:bg-neutral-950"
            >
              <div className="flex w-full justify-between items-center mb-4">
                <a
                  href="/"
                  className="flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black dark:text-white"
                >
                  <img
                    src="https://assets.aceternity.com/logo-dark.png"
                    alt="logo"
                    width={30}
                    height={30}
                    className="rounded"
                  />
                  <span className="font-medium text-black dark:text-white">Cine Dashboard</span>
                </a>
                <IconX
                  className="h-6 w-6 text-black dark:text-white cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                />
              </div>
              {navLinks.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.link}
                  className={({ isActive }) =>
                    cn(
                      "w-full text-left px-4 py-2 rounded transition text-lg",
                      isActive
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                    )
                  }
                  end={item.link === "/"}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              <div className="flex items-center gap-3 mt-4">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                  <IconBell className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition">
                  <IconCalendar className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </button>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                  onClick={() => setDarkMode((d) => !d)}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <IconSun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <IconMoon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                  )}
                </button>
                {isAuthenticated() && (
                  <button
                    className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-red-600"
                    onClick={handleLogout}
                  >
                    <IconLogout className="h-5 w-5" />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}