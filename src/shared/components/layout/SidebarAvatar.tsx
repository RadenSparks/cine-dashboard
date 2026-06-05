import { useState, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

const springConfig = { stiffness: 100, damping: 15 };

interface SidebarAvatarProps {
  open: boolean;
  userEmail: string;
  userRole?: string;
}

export function SidebarAvatar({ open, userEmail, userRole }: SidebarAvatarProps) {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!open || !containerRef.current) return;
    const halfWidth = containerRef.current.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
  };

  const initials = userEmail.split("@")[0]?.slice(0, 2).toUpperCase() || "OP";

  if (!open) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center"
      >
        <div className="group relative flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-bold uppercase text-slate-950 shadow-[0_10px_20px_-4px_rgba(34,211,238,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(34,211,238,0.5)] transition-all duration-300 border-2 border-cyan-300/60 hover:border-cyan-200/80 font-semibold">
          {initials}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="avatar-expanded"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative space-y-0 z-20"
      >
        {/* Avatar Container */}
        <div className="relative flex items-center justify-center">
          <motion.div
            className="relative h-20 w-20 rounded-[16px] group"
            style={{
              rotateZ: rotate,
              x: translateX,
            } as CSSProperties}
          >
            <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_12px_24px_-6px_rgba(34,211,238,0.3)] group-hover:shadow-[0_16px_32px_-4px_rgba(34,211,238,0.4)] transition-shadow duration-300 border-2 border-cyan-300/60 group-hover:border-cyan-200/80" />
            <div className="absolute inset-0 flex items-center justify-center rounded-[16px] text-lg font-bold text-slate-950">
              {initials}
            </div>
          </motion.div>

          {/* Hover Tooltip */}
          <AnimatePresence mode="popLayout">
            {hovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 12 }}
                transition={{ duration: 0.25 }}
                className="absolute -bottom-20 left-1/2 w-36 -translate-x-1/2 transform z-50"
              >
                <div className="rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 p-3 shadow-[0_16px_40px_-12px_rgba(34,211,238,0.3)] border-2 border-cyan-300/80 backdrop-blur-sm">
                  <div className="text-xs font-bold text-slate-900 text-center truncate">
                    {userEmail.split("@")[0]}
                  </div>
                  {userRole && (
                    <div className="text-[10px] text-cyan-600 text-center uppercase tracking-widest mt-1.5 font-semibold">
                      {userRole}
                    </div>
                  )}
                </div>
                {/* Tooltip Gradient Lines */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 flex gap-1.5 z-50">
                  <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" style={{ width: "24px", opacity: 0.7 }} />
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent" style={{ width: "20px", opacity: 0.6 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
