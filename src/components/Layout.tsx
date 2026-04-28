import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AuroraBackground } from "./AuroraBackground";
import Footer from "./Layout/Footer";
import Header from "./Layout/Header";
import Sidebar from "./Layout/Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const getInitialSidebarWidth = () =>
    typeof window !== "undefined"
      ? window.innerWidth < 768
        ? 0
        : window.innerWidth < 1280
          ? 92
          : 296
      : 296;

  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarWidth(window.innerWidth < 768 ? 0 : window.innerWidth < 1280 ? 92 : 296);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AuroraBackground showRadialGradient className="min-h-screen">
      <div className="flex h-screen w-full overflow-hidden bg-transparent flex-col">
        <div className="flex flex-1 min-h-0">
          <Sidebar onWidthChange={setSidebarWidth} />
          <motion.div
            className="flex flex-1 flex-col w-full min-h-0"
            animate={{ marginLeft: sidebarWidth }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ minWidth: 0 }}
          >
            <Header />
            <main className="mx-auto flex w-full max-w-screen-2xl flex-1 min-w-0 overflow-auto px-4 pb-10 pt-5 md:px-6 md:pb-12 md:pt-6 lg:px-8 lg:pt-8 xl:px-14 hide-scrollbar">
              {children}
            </main>
            <Footer />
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}
