"use client";

import { cn } from "../../lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    image?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else if (speed === "slow") {
        containerRef.current.style.setProperty("--animation-duration", "160s"); // much slower
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  // Ensure enough cards to fill the width of the page
  const minCards = 8;
  let extendedItems = items;
  if (items.length > 0 && items.length < minCards) {
    extendedItems = [
      ...items,
      ...Array.from({ length: minCards - items.length }, (_, i) => items[i % items.length])
    ];
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full max-w-[100vw] overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-8 py-8",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {extendedItems.map((item, idx) =>
          item ? (
            <li
              className="relative w-[420px] max-w-full shrink-0 rounded-3xl border border-b-0 border-blue-200 bg-gradient-to-br from-blue-100 via-blue-50 to-white px-10 py-8 md:w-[520px] dark:border-blue-700 dark:bg-gradient-to-br dark:from-blue-900 dark:via-blue-800 dark:to-blue-950 shadow-xl"
              key={item.quote + item.name + idx}
            >
              <blockquote>
                <div
                  aria-hidden="true"
                  className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                ></div>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.quote}
                    className="w-32 h-48 object-cover rounded-xl mb-4 mx-auto border shadow"
                  />
                )}
                <span className="relative z-20 text-lg leading-[1.6] font-bold text-blue-800 dark:text-blue-200 block text-center mb-2">
                  {item.quote}
                </span>
                <div className="relative z-20 mt-2 flex flex-row items-center justify-center">
                  <span className="flex flex-col gap-1 text-center">
                    <span className="text-base font-medium text-blue-600 dark:text-blue-300">
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-300">
                      {item.title}
                    </span>
                  </span>
                </div>
              </blockquote>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};
