"use client";
import React, { useRef, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
} from "motion/react";

const gradients = [
  "bg-gradient-to-br from-blue-400 via-purple-300 to-pink-200",
  "bg-gradient-to-br from-green-300 via-yellow-200 to-orange-200",
  "bg-gradient-to-br from-indigo-300 via-blue-200 to-cyan-200",
  "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-100",
];


export function DraggableCardContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function DraggableCardBody({
  children,
  className,
  style,
  gradientIndex = 0, // NEW: pass index for gradient
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  gradientIndex?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });


  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 };

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [25, -25]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-25, 25]), springConfig);
  const opacity = useSpring(useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseX, [-300, 0, 300], [0.2, 0, 0.2]), springConfig);

  useEffect(() => {
    function updateConstraints() {
      if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        setConstraints({
          left: -cardRect.left,
          right: window.innerWidth - cardRect.right,
          top: -cardRect.top,
          bottom: window.innerHeight - cardRect.bottom,
        });
      }
    }
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } =
      cardRef.current?.getBoundingClientRect() ?? { width: 0, height: 0, left: 0, top: 0 };
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      drag
      dragConstraints={constraints}
      dragElastic={0.7}
      style={{
        ...style,
        rotateX,
        rotateY,
        opacity,
        willChange: "transform",
      }}
      animate={controls}
      whileHover={{ scale: 1.04 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        `absolute h-56 w-56 overflow-hidden rounded-2xl shadow-xl border-2 border-white/70 dark:border-zinc-800
         ${gradients[gradientIndex % gradients.length]}`,
        "flex flex-col items-center justify-center",
        className,
      )}
    >
      {children}
      <motion.div
        style={{ opacity: glareOpacity }}
        className="pointer-events-none absolute inset-0 select-none"
      />
    </motion.div>
  );
}

export default function Page() {
  return (
    <div className="relative h-[80vh] w-full bg overflow-hidden">
      <DraggableCardContainer className="flex h-full w-full gap-4 p-4">
        <DraggableCardBody className="flex-1">Card 1</DraggableCardBody>
        <DraggableCardBody className="flex-1">Card 2</DraggableCardBody>
        <DraggableCardBody className="flex-1">Card 3</DraggableCardBody>
      </DraggableCardContainer>
    </div>
  );
}
