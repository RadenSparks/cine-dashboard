"use client";

import { useId, memo, useRef, useCallback, useEffect, type CSSProperties } from "react";
import { Film, Clock, Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { animate } from "framer-motion";

/* =========================================================
   Internal GlowingEffect for Movie Cards
   ========================================================= */
interface InternalGlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
  gradient?: string;
  staticMode?: boolean;
  staticAngle?: number;
  borderRadius: string;
}

const InternalGlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = false,
    gradient,
    staticMode = false,
    staticAngle = 0,
    borderRadius,
  }: InternalGlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current || staticMode) return;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current!;
          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;
          if (e) lastPosition.current = { x: mouseX, y: mouseY };

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");
          if (!isActive) return;

          const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;
          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => element.style.setProperty("--start", String(value)),
          });
        });
      },
      [inactiveZone, proximity, movementDuration, staticMode]
    );

    useEffect(() => {
      if (disabled) return;

      const element = containerRef.current;
      if (!element) return;

      if (staticMode) {
        element.style.setProperty("--start", String(staticAngle));
        element.style.setProperty("--active", "1");
        return;
      }

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      document.body.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        document.body.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("scroll", handleScroll);
      };
    }, [handleMove, disabled, staticMode, staticAngle]);

    const fallbackGradient = `
      radial-gradient(circle, #a663eb 10%, #a663eb00 20%),
      radial-gradient(circle at 40% 40%, #1aa6eb 5%, #1aa6eb00 15%),
      radial-gradient(circle at 60% 60%, #a663eb 10%, #a663eb00 20%),
      radial-gradient(circle at 40% 60%, #1aa6eb 10%, #1aa6eb00 20%),
      repeating-conic-gradient(
        from 236.84deg at 50% 50%,
        #a663eb 0%,
        #1aa6eb calc(25% / 5),
        #a663eb calc(50% / 5),
        #1aa6eb calc(75% / 5),
        #a663eb calc(100% / 5)
      )
    `;

    const finalGradient = gradient || fallbackGradient;

    return (
      <div
        ref={containerRef}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": staticMode ? staticAngle : "0",
            "--active": staticMode ? "1" : "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-times": "5",
            "--gradient": finalGradient,
            borderRadius: borderRadius,
          } as CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity z-[9999]",
          blur > 0 && "blur-[var(--blur)]",
          className,
          disabled && "hidden"
        )}
      >
        <div
          className={cn(
            "glow",
            "rounded-[inherit]",
            'after:content-[""] after:rounded-[inherit] after:absolute after:inset-0',
            "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
            "after:[background:var(--gradient)] after:[background-attachment:fixed]",
            "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
            "after:[mask-clip:padding-box,border-box]",
            "after:[mask-composite:intersect]",
            "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
          )}
        />
      </div>
    );
  }
);

InternalGlowingEffect.displayName = "InternalGlowingEffect";

interface StyledMovieCardProps {
  title: string;
  description: string;
  poster?: string;
  rating?: number;
  duration?: number;
  genre?: string;
}

export const StyledMovieCard = memo(function StyledMovieCard({
  title,
  description,
  poster,
  rating = 0,
  duration = 0,
  genre = "Cinema",
}: StyledMovieCardProps) {
  const internalId = useId().replace(/:/g, "");
  const cardId = `movie-card-${internalId}`;

  return (
    <div
      id={cardId}
      className="movie-card-root relative"
      style={{
        width: "320px",
        height: "auto",
      }}
    >
      <style>{`
        #${cardId}.movie-card-root {
          position: relative;
          font-family: var(--font-body, system-ui, sans-serif);
        }
        #${cardId} .glass-container {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 1.5rem;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(30,41,59,0.94) 0%, rgba(15,23,42,0.96) 100%);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          z-index: 10;
        }
        #${cardId} .chronicle-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(34,211,238,0.08) 1px, transparent 1px);
          background-size: 1.3rem 1.3rem;
          opacity: 0.4;
          z-index: 1;
        }
        #${cardId} .lamp-effect-top {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 1px;
              background: linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent);
          box-shadow: 0 1px 4px 0px rgba(34,211,238,0.4), 0 2px 10px 2px rgba(34,211,238,0.2);
          z-index: 50;
        }
        #${cardId} .lamp-effect {
          position: relative;
          width: 100%;
          height: 2px;
          overflow: hidden;
          margin: 1.5rem 0;
        }
        #${cardId} .lamp-effect::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent);
          opacity: 0.4;
          transition: opacity 0.4s ease, width 0.4s ease;
        }
        #${cardId} .glass-container:hover .lamp-effect::before {
          opacity: 0.8;
          width: 80%;
        }
        #${cardId} .movie-title {
          font-size: 1.5rem;
          color: rgba(34,211,238,1);
          text-align: center;
          margin: 0.5rem 0 1rem 0;
          font-weight: 700;
          font-family: var(--font-headline, system-ui, sans-serif);
          line-height: 1.2;
        }
        #${cardId} .movie-description {
          color: rgba(148,163,184,1);
          font-size: 0.85rem;
          line-height: 1.5;
          text-align: center;
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        #${cardId} .movie-meta {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1rem;
          font-size: 0.85rem;
          color: rgba(34,211,238,0.8);
        }
        #${cardId} .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>

      <InternalGlowingEffect
        spread={80}
        glow={true}
        proximity={64}
        inactiveZone={0.01}
        blur={0}
        borderWidth={1}
        staticMode={false}
        staticAngle={0}
        className="absolute inset-0 pointer-events-none"
        borderRadius="1.5rem"
      />

      <div
        className="glass-container"
        style={{
          borderWidth: "1px",
          borderColor: "#00A7FA",
          borderStyle: "solid",
          borderRadius: "1.5rem",
        }}
      >
        <div className="lamp-effect-top" />
        <div className="chronicle-dots" />

        <div className="relative z-20 flex flex-col h-full">
          {/* Poster Image */}
          {poster && (
            <div className="mb-4 flex justify-center">
              <img
                src={poster}
                alt={title}
                className="w-24 h-36 object-cover rounded-lg border border-amber-700/20 shadow-lg"
              />
            </div>
          )}

          {/* Title */}
          <h3 className="movie-title">{title}</h3>

          {/* Divider */}
          <div className="lamp-effect" />

          {/* Description */}
          <p className="movie-description">{description}</p>

          {/* Meta Info */}
          <div className="movie-meta">
            {rating > 0 && (
              <div className="meta-item">
                <Star size={16} className="text-amber-600" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            {duration > 0 && (
              <div className="meta-item">
                <Clock size={16} className="text-rose-600" />
                <span>{duration}m</span>
              </div>
            )}
            <div className="meta-item">
              <Film size={16} className="text-purple-600" />
              <span>{genre}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

StyledMovieCard.displayName = "StyledMovieCard";
