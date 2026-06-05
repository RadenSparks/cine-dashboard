"use client";
import { useMotionValue } from "motion/react";
import { useState, useEffect, type MouseEvent } from "react";
import { useMotionTemplate, motion } from "motion/react";
import { cn } from "@/shared/lib/utils";
import { generateRandomString } from "@/shared/lib/generateRandomString";

// --- Types ---
type EvervaultCardProps = {
  text?: React.ReactNode;
  className?: string;
  externalMouseX?: number;
  externalMouseY?: number;
};

import type { MotionValue } from "motion";

type CardPatternProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  randomString: string;
};

type IconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

// --- Main Card ---
export const EvervaultCard = ({ text, className, externalMouseX, externalMouseY }: EvervaultCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    const str = generateRandomString(1500);
    setRandomString(str);
  }, []);

  useEffect(() => {
    if (externalMouseX !== undefined && externalMouseY !== undefined) {
      mouseX.set(externalMouseX);
      mouseY.set(externalMouseY);
    }
  }, [externalMouseX, externalMouseY, mouseX, mouseY]);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);

    const str = generateRandomString(1500);
    setRandomString(str);
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className={cn(
        "w-full h-full relative group/card overflow-hidden rounded-xl cursor-pointer",
        className
      )}
    >
      <CardPattern
        mouseX={mouseX}
        mouseY={mouseY}
        randomString={randomString}
      />
    </div>
  );
};

// --- Card Pattern ---
export function CardPattern({ mouseX, mouseY, randomString }: CardPatternProps) {
  const maskImage = useMotionTemplate`radial-gradient(600px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-hover/card:opacity-60 backdrop-blur-xl transition duration-500"
        style={style}
      />
      <motion.div
        className="absolute inset-0 opacity-0 mix-blend-overlay group-hover/card:opacity-50"
        style={style}
      >
        <p className="absolute inset-x-0 top-0 text-[10px] h-full break-words whitespace-pre-wrap text-white/40 font-mono font-bold transition duration-500 overflow-hidden">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
}


// --- Icon ---
export const Icon = ({ className, ...rest }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
