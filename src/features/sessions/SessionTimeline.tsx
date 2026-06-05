import { useState, useRef, useEffect } from "react";
import type { Session } from "@/shared/types/entities";

type WeekDate = { label: string; date: string };

const DAY_START = 8 * 60;
const DAY_END = 24 * 60;
const CELL_WIDTH = 160;
const ROOM_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-red-500",
];

const STRIP_HEIGHT = 32;
const STRIP_MARGIN = 4;

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

type DisplaySession = Session & {
  start: string;
  end: string;
  room: string;
};

type StackSession = DisplaySession & { stack: number };

export default function SessionTimeline({
  weekLabel,
  weekDates,
  rooms,
  sessions,
  showDeletedSessions,
  onEditSession,
  onDeleteSession,
  onRestoreSession,
}: {
  weekLabel?: string;
  weekDates: WeekDate[];
  rooms: string[];
  sessions: Session[];
  showDeletedSessions?: boolean;
  onEditSession?: (session: Session) => void;
  onDeleteSession?: (sessionId: number) => void;
  onRestoreSession?: (sessionId: number) => void;
}) {
  // Helper: get sessions for a day
  function getSessionsForDay(date: string): DisplaySession[] {
    return sessions
      .filter(s => (showDeletedSessions || !s.deleted) && s.startTime.split('T')[0] === date)
      .map((s) => {
        // Extract actual time from ISO datetime string
        const startTime = s.startTime.split('T')[1]?.slice(0, 5) || "09:00";
        const endTime = s.endTime.split('T')[1]?.slice(0, 5) || "11:00";
        return {
          ...s,
          start: startTime,
          end: endTime,
          room: rooms[s.roomId - 1] || `Room ${s.roomId}`,
        };
      });
  }

  // Generate hour marks
  const hourMarks = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState<"left" | "right" | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const scrollStartX = useRef(0);

  useEffect(() => {
    if (!scrolling) return;
    const el = scrollRef.current;
    if (!el) return;

    let frame: number;
    const scrollStep = () => {
      if (scrolling === "left") el.scrollLeft -= 3;
      if (scrolling === "right") el.scrollLeft += 3;
      frame = requestAnimationFrame(scrollStep);
    };
    frame = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(frame);
  }, [scrolling]);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    setDragging(true);
    dragStartX.current = e.clientX;
    scrollStartX.current = el.scrollLeft;
  }

  function handleMouseUp() {
    setDragging(false);
    dragStartX.current = null;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;

    if (dragging && dragStartX.current !== null) {
      const delta = e.clientX - dragStartX.current;
      el.scrollLeft = scrollStartX.current - delta;
      return;
    }

    const { left, right } = el.getBoundingClientRect();
    const x = e.clientX;
    const edge = 40;
    if (x - left < edge) setScrolling("left");
    else if (right - x < edge) setScrolling("right");
    else setScrolling(null);
  }

  function handleMouseLeave() {
    setScrolling(null);
    setDragging(false);
    dragStartX.current = null;
  }

  return (
    <div>
      <div className="mb-3 font-semibold text-2xl leading-tight text-slate-900 dark:text-slate-100">
        {weekLabel ? `${weekLabel} — ` : ""}Weekly Room Timeline
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-100/80 px-5 py-4 text-base text-slate-700 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-300">
        <span className="font-medium">Drag horizontally or hover near the edges to scroll.</span>
      </div>
      <div
        className={`overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50/80 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 ${dragging ? "cursor-grabbing" : scrolling ? "cursor-ew-resize" : "cursor-grab"}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maxHeight: "100vh",
          overflowY: "auto",
          position: "relative",
          cursor: dragging ? "-webkit-grabbing, grabbing" : scrolling ? "ew-resize" : "-webkit-grab, grab",
          userSelect: dragging ? "none" : "auto",
        }}
        ref={scrollRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {(scrolling || dragging) && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
            <div className={`inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 transition-opacity duration-200 ${scrolling === 'left' ? 'opacity-100' : 'opacity-0'}`} style={{ marginLeft: 16 }}>
              <span className="text-base">←</span>
            </div>
            <div className={`inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100 transition-opacity duration-200 ${scrolling === 'right' ? 'opacity-100' : 'opacity-0'}`} style={{ marginRight: 16 }}>
              <span className="text-base">→</span>
            </div>
          </div>
        )}
        <div
          className="relative"
          style={{
            minWidth: hourMarks.length * CELL_WIDTH + 80,
            height: "auto",
            // Remove maxHeight and overflowY from here, keep it on parent
          }}
        >
          {/* Hide scrollbar for Chrome, Edge, Safari */}
          <style>
            {`
              .overflow-x-auto::-webkit-scrollbar {
                display: none;
              }
              .relative::-webkit-scrollbar {
                width: 8px;
                background: #f3f4f6;
              }
              .relative::-webkit-scrollbar-thumb {
                background: #c7d2fe;
                border-radius: 4px;
              }
            `}
          </style>
          {/* Sticky Timeframe Header (X axis) */}
          <div className="flex sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/95" style={{ height: 56 }}>
            <div style={{ width: 80, height: 56 }} className="bg-sky-100 border-r border-slate-200 dark:bg-slate-900 dark:border-slate-700" />
            {hourMarks.map((mark) => (
              <div
                key={mark}
                style={{ width: CELL_WIDTH, height: 56 }}
                className="flex items-center justify-center border-r border-slate-200 bg-slate-100 px-2 text-center text-base font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300"
              >
                {mark}
              </div>
            ))}
          </div>
          {/* Timeline Grid */}
          <div className="flex flex-col">
            {/* Days Rows */}
            {weekDates.map((day, rowIdx) => {
              const daySessions = getSessionsForDay(day.date)
                .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

              const stackedSessions: StackSession[] = [];
              const stacks: { end: number }[] = [];

              daySessions.forEach(session => {
                const startMins = timeToMinutes(session.start);
                // Find first stack where this session doesn't overlap
                let stackIdx = 0;
                while (
                  stacks[stackIdx] &&
                  stacks[stackIdx].end > startMins
                ) {
                  stackIdx++;
                }
                stackedSessions.push({ ...session, stack: stackIdx });
                stacks[stackIdx] = { end: timeToMinutes(session.end) };
              });

              const maxStack = Math.max(...stackedSessions.map(s => s.stack), 0) + 1;

              return (
                <div
                  key={day.date}
                  style={{
                    height: maxStack * (STRIP_HEIGHT + STRIP_MARGIN + 12) + 32,
                    position: "relative",
                    display: "flex",
                  }}
                  className={`${rowIdx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-950/80' : 'bg-white dark:bg-slate-900/80'} border-b border-slate-200 dark:border-slate-800`}
                >
                  {/* Day label (Y axis) */}
                  <div
                    style={{
                      width: 80,
                      height: maxStack * (STRIP_HEIGHT + STRIP_MARGIN + 12) + 32,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    className="sticky left-0 z-30 border-r border-slate-200 bg-sky-100/90 px-3 text-center dark:border-slate-700 dark:bg-slate-950/95"
                  >
                    <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{day.label}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{day.date}</div>
                  </div>
                  {/* Timeframe cells */}
                  <div style={{ position: "relative", width: hourMarks.length * CELL_WIDTH, height: maxStack * (STRIP_HEIGHT + STRIP_MARGIN + 12) + 32 }}>
                    {/* Vertical grid lines */}
                    {hourMarks.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          left: i * CELL_WIDTH,
                          top: 0,
                          width: 0,
                          height: "100%",
                          borderLeft: "1px dashed #c7d2fe",
                          zIndex: 0,
                        }}
                      />
                    ))}
                    {/* Session blocks */}
                    {stackedSessions.map((s, idx) => {
                      const startMins = Math.max(timeToMinutes(s.start), DAY_START);
                      const endMins = Math.min(timeToMinutes(s.end), DAY_END);
                      const left = ((startMins - DAY_START) / 60) * CELL_WIDTH;
                      const width = Math.max(((endMins - startMins) / 60) * CELL_WIDTH, 36);
                      // Use roomId for consistent color assignment, with fallback to prevent white background
                      const colorIndex = (s.roomId - 1) % ROOM_COLORS.length;
                      const colorClass = ROOM_COLORS[Math.max(0, colorIndex)];
                      const duration = timeToMinutes(s.end) - timeToMinutes(s.start);

                      const tooltipContent = (
                        <div>
                          <div className={`font-bold text-lg mb-2 ${s.deleted ? 'text-gray-300' : 'text-white'}`}>{s.movieTitle || "Unknown Movie"}</div>
                          <div className={`text-xs ${s.deleted ? 'text-gray-400' : 'text-gray-200'} mb-1`}>Room: <span className="font-semibold">{s.room}</span></div>
                          <div className={`text-xs ${s.deleted ? 'text-gray-400' : 'text-gray-200'} mb-1`}>Time: <span className="font-mono">{s.start}–{s.end}</span></div>
                          <div className={`text-xs ${s.deleted ? 'text-gray-400' : 'text-gray-200'} mb-3`}>Duration: <span className="font-mono">{duration} min</span></div>
                          <div className="flex gap-2">
                            {s.deleted ? (
                              <button
                                onClick={() => onRestoreSession?.(s.id)}
                                className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition transform-gpu hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => onEditSession?.(s)}
                                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition transform-gpu hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  Edit Session
                                </button>
                                <button
                                  onClick={() => onDeleteSession?.(s.id)}
                                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition transform-gpu hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );

                      return (
                        <SessionTooltip content={tooltipContent} key={`${s.room}-${s.start}-${s.end}-${day.date}-${idx}`}>
                          <div
                            className={`absolute rounded-2xl px-3 py-2 transition-transform duration-150 overflow-hidden text-white shadow-2xl ${s.deleted ? 'bg-gray-500 border border-gray-400 hover:bg-gray-600/95' : `${colorClass} border border-white/20 hover:z-50 hover:scale-105 hover:ring-4 hover:ring-sky-400/40 hover:shadow-[0_16px_40px_-26px_rgba(56,189,248,0.85)]`}`}
                            style={{
                              top: 8 + s.stack * (STRIP_HEIGHT + STRIP_MARGIN),
                              left,
                              width,
                              height: STRIP_HEIGHT,
                              minWidth: 120,
                              zIndex: s.deleted ? 1 : 2,
                              boxShadow: s.deleted ? "0 2px 10px rgba(0,0,0,0.22)" : "0 8px 24px rgba(15,23,42,0.22), inset 0 1px 1px rgba(255,255,255,0.08)",
                              cursor: "pointer",
                              opacity: s.deleted ? 0.75 : 1,
                            }}
                          >
                            <span className="font-bold text-base leading-tight truncate w-full">{s.movieTitle || "Session"}</span>
                            <span className={`font-mono text-sm mt-0.5 ${s.deleted ? 'text-gray-200' : 'text-gray-100'}`}>{s.start}–{s.end}</span>
                          </div>
                        </SessionTooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionTooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      <div
        className="relative inline-block"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="fixed left-1/2 bottom-8 z-[9999] flex flex-col items-center -translate-x-1/2 animate-fade-in">
          <div className="rounded-md bg-black px-6 py-4 text-xs shadow-2xl pointer-events-none flex items-center gap-4 border border-white/10">
            {content}
          </div>
        </div>
      )}
    </>
  );
}