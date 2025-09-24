import { useState, useRef, useEffect } from "react";
import type { Session } from "../../entities/type";

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
}: {
  weekLabel?: string;
  weekDates: WeekDate[];
  rooms: string[];
  sessions: Session[];
}) {
  // Helper: get sessions for a day
  function getSessionsForDay(date: string): DisplaySession[] {
    return sessions
      .filter(s => s.session_date === date)
      .map((s, idx) => {
        const baseHour = 9 + (idx % 8) * 2;
        const start = `${String(baseHour).padStart(2, "0")}:00`;
        const end = `${String(baseHour + 2).padStart(2, "0")}:00`;
        return {
          ...s,
          start,
          end,
          room: rooms[s.room_id - 1] || `Room ${s.room_id}`,
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

  useEffect(() => {
    if (!scrolling) return;
    const el = scrollRef.current;
    if (!el) return;

    let frame: number;
    const scrollStep = () => {
      // ↓↓↓ SCROLL SPEED REDUCED FROM 20 TO 5 ↓↓↓
      if (scrolling === "left") el.scrollLeft -= 3;
      if (scrolling === "right") el.scrollLeft += 3;
      frame = requestAnimationFrame(scrollStep);
    };
    frame = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(frame);
  }, [scrolling]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    const { left, right } = el.getBoundingClientRect();
    const x = e.clientX;
    const edge = 40; // px from edge to trigger scroll
    if (x - left < edge) setScrolling("left");
    else if (right - x < edge) setScrolling("right");
    else setScrolling(null);
  }

  function handleMouseLeave() {
    setScrolling(null);
  }

  return (
    <div>
      <div className="mb-2 font-semibold text-lg">
        {weekLabel ? `${weekLabel} — ` : ""}Weekly Room Timeline
      </div>
      <div
        className="overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maxHeight: "100vh",
          overflowY: "auto",
          position: "relative", // <-- Ensure relative positioning for sticky context
        }}
        ref={scrollRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
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
          <div className="flex sticky top-0 z-20 bg-white shadow" style={{ height: 56 }}>
            <div style={{ width: 80, height: 56 }} className="bg-blue-50 border-r border-blue-200" />
            {hourMarks.map((mark) => (
              <div
                key={mark}
                style={{ width: CELL_WIDTH, height: 56 }}
                className="py-3 px-2 border-r border-blue-200 text-center font-semibold text-blue-700 bg-blue-100"
              >
                <div>{mark}</div>
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
                    borderBottom: "1px solid #e5e7eb",
                    background: rowIdx % 2 === 0 ? "#f8fafc" : "#fff",
                    display: "flex",
                  }}
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
                      borderRight: "1px solid #e5e7eb",
                      background: "#e0e7ff",
                      position: "sticky",
                      left: 0,
                      zIndex: 30,
                      boxShadow: "2px 0 8px -2px #c7d2fe", // subtle shadow for separation
                    }}
                    className="sticky left-0 z-30"
                  >
                    <div className="font-semibold text-blue-700">{day.label}</div>
                    <div className="text-xs text-blue-400">{day.date}</div>
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
                      const colorClass = ROOM_COLORS[rooms.indexOf(s.room) % ROOM_COLORS.length];
                      const duration = timeToMinutes(s.end) - timeToMinutes(s.start);

                      const tooltipContent = (
                        <>
                          <div>
                            <div className="font-bold text-lg mb-2 text-white">{s.room}</div>
                            <div className="text-xs text-gray-200 mb-1">Room: <span className="font-semibold">{s.room}</span></div>
                            <div className="text-xs text-gray-200 mb-1">Time: <span className="font-mono">{s.start}–{s.end}</span></div>
                            <div className="text-xs text-gray-200">Duration: <span className="font-mono">{duration} min</span></div>
                          </div>
                        </>
                      );

                      return (
                        <SessionTooltip content={tooltipContent} key={`${s.room}-${s.start}-${s.end}-${day.date}-${idx}`}>
                          <div
                            className={`absolute ${colorClass} rounded-xl text-white px-2 py-1 shadow-lg flex items-center justify-center border-2 border-white
                              transition-transform duration-150
                              hover:z-50 hover:scale-105 hover:ring-4 hover:ring-blue-300`}
                            style={{
                              top: 8 + s.stack * (STRIP_HEIGHT + STRIP_MARGIN),
                              left,
                              width,
                              height: STRIP_HEIGHT,
                              minWidth: 36,
                              zIndex: 2,
                              boxShadow: "0 2px 8px rgba(30,64,175,0.12)",
                              cursor: "pointer",
                              opacity: 0.97,
                            }}
                          >
                            <span className="font-mono text-xs">{s.room}</span>
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