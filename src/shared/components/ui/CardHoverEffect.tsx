import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

interface CardHoverEffectProps {
  children: React.ReactNode;
  className?: string;
  deleted?: boolean;
}

export function CardWithHover({
  children,
  className,
  deleted = false,
}: CardHoverEffectProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group block p-2 h-full w-full"
      onMouseEnter={() => !deleted && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && !deleted && (
          <motion.span
            className="absolute inset-0 h-full w-full bg-gradient-to-br from-green-500/20 via-green-500/25 to-blue-500/15 dark:from-green-500/25 dark:via-green-500/30 dark:to-blue-500/20 block rounded-xl pointer-events-none"
            layoutId="cardHoverBackground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.15 },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, delay: 0.2 },
            }}
          />
        )}
      </AnimatePresence>
      <div
        className={cn(
          "rounded-xl h-full w-full relative z-20 overflow-hidden",
          deleted && "opacity-65",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
