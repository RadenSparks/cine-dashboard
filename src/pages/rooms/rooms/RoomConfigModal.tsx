import { motion, AnimatePresence } from "framer-motion";
import AppButton from "../../../components/UI/AppButton";
import type { Room } from "../../../entities/type";

const ROWS = 8;
const COLS = 12;

function seatId(row: number, col: number) {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

interface RoomConfigModalProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  filter: "all" | "economy" | "premium";
  setFilter: (v: "all" | "economy" | "premium") => void;
  hoveredSeat: string | null;
  setHoveredSeat: (v: string | null) => void;
  localPremiumSeats: string[];
  setLocalPremiumSeats: (v: string[]) => void;
  localEmptySeats: string[];
  setLocalEmptySeats: (v: string[]) => void;
  onUpdateSeats: () => void;
  loading: boolean;
  saving?: boolean;
}

export default function RoomConfigModal({
  open,
  onClose,
  room,
  filter,
  setFilter,
  hoveredSeat,
  setHoveredSeat,
  localPremiumSeats,
  setLocalPremiumSeats,
  localEmptySeats,
  setLocalEmptySeats,
  onUpdateSeats,
  loading,
  saving = false,
}: RoomConfigModalProps) {
  if (!room) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl relative border border-blue-100 dark:border-zinc-800 flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            <div className="p-8 overflow-y-auto hide-scrollbar" style={{ maxHeight: "90vh" }}>
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200 text-center font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
                Configure Seats for {room.roomName}
              </h3>
              <div className="mt-4 flex gap-8 justify-center">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all
                    ${filter === "economy" ? "bg-green-200 scale-105 shadow" : "hover:bg-green-100"}
                  `}
                  onClick={() => setFilter(filter === "economy" ? "all" : "economy")}
                >
                  <span className="w-5 h-5 rounded-lg bg-green-200 border-2 border-green-500"></span>
                  <span className="text-base text-green-900 font-semibold font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>Economy</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all
                    ${filter === "premium" ? "bg-yellow-200 scale-105 shadow" : "hover:bg-yellow-100"}
                  `}
                  onClick={() => setFilter(filter === "premium" ? "all" : "premium")}
                >
                  <span className="w-5 h-5 rounded-lg bg-yellow-300 border-2 border-yellow-500"></span>
                  <span className="text-base text-yellow-900 font-semibold font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>Premium</span>
                </button>
              </div>
              <div className="flex flex-col items-center w-full mt-8 mb-2">
                <div className="flex justify-center w-full">
                  <div className="w-2/3 max-w-lg h-8 bg-blue-300 dark:bg-blue-900 rounded-t-2xl flex items-center justify-center shadow text-blue-900 dark:text-blue-200 font-semibold border-b-2 border-blue-500 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
                    Screen
                  </div>
                </div>
                <span className="text-xs text-blue-500 dark:text-blue-300 mt-1">Front</span>
              </div>
              <div
                className="w-full overflow-x-auto flex justify-center"
                style={{ minHeight: 420, overflow: "visible" }}
              >
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateRows: `repeat(${room.roomRow ?? ROWS}, 1fr)`,
                    gridTemplateColumns: `repeat(${room.roomColumn ?? COLS}, 1fr)`,
                    width: `min(${(room.roomColumn ?? COLS) * 3.2}rem, 100%)`,
                    maxWidth: "100%",
                    overflow: "visible",
                  }}
                >
                  {Array.from({
                    length:
                      typeof room.roomRow === "string"
                        ? room.roomRow.charCodeAt(0) - 64
                        : room.roomRow ?? ROWS,
                  }).map((_, rowIdx) =>
                    Array.from({ length: room.roomColumn ?? COLS }).map((_, colIdx) => {
                      const id = seatId(rowIdx, colIdx);
                      const isPremium = localPremiumSeats.includes(id);
                      const isEmpty = localEmptySeats.includes(id);

                      let shouldBlur = false;
                      if (filter === "economy" && !isEmpty && isPremium) shouldBlur = true;
                      if (filter === "premium" && !isEmpty && !isPremium) shouldBlur = true;

                      let switchTooltip = "";
                      if (!isEmpty && filter === "all") {
                        switchTooltip = isPremium
                          ? "Click to switch to Economy"
                          : "Click to switch to Premium";
                      }

                      const removeTooltip = "Remove seat";
                      const restoreTooltip = "Click to restore seat";

                      if (isEmpty) {
                        return (
                          <div key={id} className="relative flex items-center justify-center">
                            <button
                              className="w-10 h-10 aspect-square rounded-lg border-2 border-gray-300 bg-gray-100 dark:bg-zinc-900 text-gray-400 flex items-center justify-center font-bold text-sm opacity-50"
                              onClick={() => setLocalEmptySeats(localEmptySeats.filter(s => s !== id))}
                              aria-label={`Restore seat ${id}`}
                              title={restoreTooltip}
                              onMouseEnter={() => setHoveredSeat(id)}
                              onMouseLeave={() => setHoveredSeat(null)}
                            >
                              +
                            </button>
                            <AnimatePresence>
                              {hoveredSeat === id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: -35, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                  className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-4 py-2 rounded bg-black text-white text-xs shadow-lg pointer-events-none"
                                >
                                  {restoreTooltip}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={id}
                          className={`relative flex items-center justify-center group ${shouldBlur ? "opacity-30 grayscale pointer-events-none" : ""}`}
                          onMouseEnter={() => setHoveredSeat(id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                        >
                          <button
                            className={`w-10 h-10 aspect-square rounded-lg flex items-center justify-center border-2 font-bold text-sm transition-colors duration-200 shadow-sm
                              ${isPremium
                                ? "bg-yellow-300 text-yellow-900 border-yellow-500 ring-2 ring-yellow-400"
                                : "bg-green-200 text-green-900 border-green-500 hover:bg-green-300"}
                              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            onClick={() => {
                              let newPremiumSeats: string[];
                              if (filter === "economy") {
                                newPremiumSeats = localPremiumSeats.filter(s => s !== id);
                              } else if (filter === "premium") {
                                newPremiumSeats = localPremiumSeats.includes(id)
                                  ? localPremiumSeats
                                  : [...localPremiumSeats, id];
                              } else {
                                newPremiumSeats = localPremiumSeats.includes(id)
                                  ? localPremiumSeats.filter(s => s !== id)
                                  : [...localPremiumSeats, id];
                              }
                              setLocalPremiumSeats(newPremiumSeats);
                            }}
                            aria-label={`Seat ${id}`}
                            title={switchTooltip}
                          >
                            {id}
                          </button>
                          <AnimatePresence>
                            {hoveredSeat === id && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg border-2 border-white z-10"
                                style={{ fontSize: "1rem", cursor: "pointer" }}
                                title={removeTooltip}
                                onClick={e => {
                                  e.stopPropagation();
                                  setLocalEmptySeats([...localEmptySeats, id]);
                                }}
                                onMouseEnter={() => setHoveredSeat(id)}
                                onMouseLeave={() => setHoveredSeat(null)}
                              >
                                ×
                              </motion.button>
                            )}
                          </AnimatePresence>
                          <AnimatePresence>
                            {hoveredSeat === id && switchTooltip && filter === "all" && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: -35, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="absolute left-1/2 -translate-x-1/2 -top-10 z-50 px-4 py-2 rounded bg-black text-white text-xs shadow-lg pointer-events-none"
                              >
                                {switchTooltip}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ).flat()}
                </div>
              </div>
              <div className="flex flex-col items-center w-full mt-6">
                <div className="w-32 h-10 bg-gray-300 dark:bg-zinc-700 rounded-b-2xl flex items-center justify-center shadow text-gray-700 dark:text-gray-200 font-semibold border-t-2 border-gray-400">
                  Door
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6 w-full">
              <AppButton
                color="primary"
                className="w-full sm:w-auto"
                onClick={onUpdateSeats}
                disabled={loading || saving}
              >
                {(loading || saving) ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-t-blue-600 border-blue-200 rounded-full"></span>
                    Updating...
                  </span>
                ) : (
                  "Update Room Seats"
                )}
              </AppButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}