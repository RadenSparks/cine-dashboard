"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { StyledMovieCard } from "./StyledMovieCard";

interface MovieItem {
  id: string | number;
  title: string;
  description: string;
  poster?: string;
  rating?: number;
  duration?: number;
  genre?: string;
}

export const StyledMovieCarousel = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: MovieItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
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
        containerRef.current.style.setProperty("--animation-duration", "160s");
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
      ...Array.from({ length: minCards - items.length }, (_, i) => items[i % items.length]),
    ];
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full max-w-[100vw] overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-6 py-8",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {extendedItems.map((item, idx) =>
          item ? (
            <li
              key={`${item.id}-${idx}`}
              className="relative shrink-0"
            >
              <StyledMovieCard
                title={item.title}
                description={item.description}
                poster={item.poster}
                rating={item.rating}
                duration={item.duration}
                genre={item.genre}
              />
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};
