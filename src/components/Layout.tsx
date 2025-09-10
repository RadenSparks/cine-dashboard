import Sidebar from './Layout/Sidebar'
import Header from './Layout/Header'
import Footer from './Layout/Footer'
import { AuroraBackground } from "../components/AuroraBackground"
import React, { useState } from "react"

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  // Match sidebar transition duration for smooth sync
  const SIDEBAR_TRANSITION = 0.6; // seconds

  return (
    <AuroraBackground showRadialGradient={true}>
      <div className="flex min-h-screen w-full bg-transparent overflow-x-hidden">
        <Sidebar onWidthChange={setSidebarWidth} />
        <div
          className="flex-1 flex flex-col transition-all"
          style={{
            marginLeft: sidebarWidth,
            transition: `margin-left ${SIDEBAR_TRANSITION}s cubic-bezier(0.4,0,0.2,1)`,
            minWidth: 0 // Prevent content overflow
          }}
        >
          <Header />
          <main className="flex-0 px-0 md:px-0 w-full max-w-screen-2xl mx-auto min-w-0">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </AuroraBackground>
  );
}