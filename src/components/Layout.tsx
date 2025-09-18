import Sidebar from './Layout/Sidebar'
import Header from './Layout/Header'
import Footer from './Layout/Footer'
import { AuroraBackground } from "../components/AuroraBackground"
import React, { useState, useEffect } from "react"

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  // Set initial sidebar width based on window size
  const getInitialSidebarWidth = () =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 0 : 260;

  const [sidebarWidth, setSidebarWidth] = useState(getInitialSidebarWidth);

  useEffect(() => {
    // Listen for window resize to update sidebar width
    const handleResize = () => {
      setSidebarWidth(window.innerWidth < 768 ? 0 : 260);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Match sidebar transition duration for smooth sync
  const SIDEBAR_TRANSITION = 0.6; // seconds

  return (
    <AuroraBackground showRadialGradient={true}>
      <div className="flex min-h-screen w-full bg-transparent overflow-x-hidden">
        <Sidebar onWidthChange={setSidebarWidth} />
        <div
          className="flex-1 flex flex-col min-h-screen transition-all"
          style={{
            marginLeft: sidebarWidth,
            transition: `margin-left ${SIDEBAR_TRANSITION}s cubic-bezier(0.4,0,0.2,1)`,
            minWidth: 0 // Prevent content overflow
          }}
        >
          <Header />
          <main className="flex-1 px-4 md:px-8 xl:px-16 w-full max-w-screen-2xl mx-auto min-w-0">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </AuroraBackground>
  );
}