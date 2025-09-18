import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { selectRoom, updateRoom } from "../../store/roomsSlice";
import { Tabs } from "../../components/UI/SwappingTabs";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppButton from "../../components/UI/AppButton";
import { SatelliteToast } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";

const ROWS = 8;
const COLS = 12;

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | unknown;
};

function seatId(row: number, col: number) {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export default function RoomManagementPage() {
  const rooms = useSelector((state: RootState) => state.rooms.rooms);
  const selectedRoomId = useSelector((state: RootState) => state.rooms.selectedRoomId);
  const dispatch = useDispatch<AppDispatch>();

  const selectedRoom = rooms.find(r => r.room_id === selectedRoomId);

  // Local premium seats state
  const [localPremiumSeats, setLocalPremiumSeats] = useState<string[]>(
    selectedRoom?.premium_seats?.split(",").filter(Boolean) ?? []
  );

  useEffect(() => {
    setLocalPremiumSeats(selectedRoom?.premium_seats?.split(",").filter(Boolean) ?? []);
  }, [selectedRoom]);

  const [filter, setFilter] = useState<"all" | "economy" | "premium">("all");
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const toastRef = useRef<{ showNotification: (options: Omit<unknown, "id">) => void }>(null);

  useEffect(() => {
    setInitialLoading(true);
    const timer = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedRoomId]);

  if (initialLoading) {
    return <Loading />;
  }

  function isSeatVisible(id: string, premiumSeatsArr: string[]) {
    if (filter === "all") return true;
    if (filter === "economy") return !premiumSeatsArr.includes(id);
    if (filter === "premium") return premiumSeatsArr.includes(id);
    return true;
  }

  const handleSeatClick = (row: number, col: number) => {
    if (!selectedRoom) return;
    const id = seatId(row, col);

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
  };

  // Prepare tabs for rooms
  const roomTabs: Tab[] = rooms.map(room => ({
    title: room.room_name,
    value: String(room.room_id),
  }));
  const activeTab = roomTabs.find(tab => tab.value === String(selectedRoomId));

  const handleRoomTabChange = (tab: Tab) => {
    dispatch(selectRoom(Number(tab.value)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16">
        <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
          🏟️ Room Management
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-800 p-8 mb-10">
          {/* Room Tabs */}
          <div className="mb-6">
            <Tabs
              tabs={roomTabs}
              containerClassName="mb-4"
              activeTabClassName="bg-blue-200 dark:bg-blue-900"
              tabClassName="text-blue-700 dark:text-blue-200 font-semibold"
              contentClassName=""
              activeTab={activeTab}
              onTabChange={handleRoomTabChange}
            />
          </div>
          <h3 className="text-xl font-bold mb-6 text-blue-700 dark:text-blue-200">Seat Configuration</h3>
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-blue-50 dark:bg-zinc-800 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-zinc-700 w-full max-w-5xl relative flex flex-col items-center">
              {/* Screen Indicator */}
              <div className="flex flex-col items-center w-full mb-6">
                <div className="flex justify-center w-full">
                  <div className="w-2/3 max-w-lg h-8 bg-blue-400 dark:bg-blue-700 rounded-t-2xl flex items-center justify-center shadow text-white font-bold text-lg tracking-wide border-b-4 border-blue-600">
                    SCREEN
                  </div>
                </div>
                <span className="text-xs text-blue-700 dark:text-blue-200 mt-1">Facing this direction</span>
              </div>
              {/* Seat Grid */}
              <div
                className="flex flex-col gap-3 items-center py-4"
                style={{
                  minHeight: 420,
                  width: `${COLS * 3.5}rem`, // 3.5rem per seat, adjust as needed
                  maxWidth: "100%",
                }}
              >
                {Array.from({ length: ROWS }).map((_, rowIdx) => (
                  <div key={rowIdx} className="flex gap-3 justify-center">
                    {Array.from({ length: COLS }).map((_, colIdx) => {
                      const id = seatId(rowIdx, colIdx);
                      const isPremium = localPremiumSeats.includes(id);
                      const visible = isSeatVisible(id, localPremiumSeats);

                      // Tooltip message only when filter is "all"
                      let tooltipMsg = "";
                      if (filter === "all") {
                        tooltipMsg = isPremium
                          ? "Click to change to Economy"
                          : "Click to change to Premium";
                      }

                      return (
                        <div
                          key={colIdx}
                          className="relative"
                          onMouseEnter={() => setHoveredSeat(id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                        >
                          {/* Seat button */}
                          <button
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 font-bold text-xs transition-colors duration-200 shadow-sm
                              ${isPremium
                                ? "bg-yellow-300 text-yellow-900 border-yellow-500 ring-2 ring-yellow-400"
                                : "bg-green-200 text-green-900 border-green-500 hover:bg-green-300"}
                              ${!visible ? "opacity-30 pointer-events-none" : ""}
                              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            onClick={() => handleSeatClick(rowIdx, colIdx)}
                            aria-label={`Seat ${id}`}
                            disabled={!visible}
                          >
                            {id}
                          </button>
                          {/* Animated Tooltip only when filter is "all" */}
                          <AnimatePresence>
                            {hoveredSeat === id && tooltipMsg && filter === "all" && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: -30, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="absolute left-1/2 -translate-x-1/2 -top-8 z-50 px-3 py-1 rounded bg-black text-white text-xs shadow-lg pointer-events-none"
                              >
                                {tooltipMsg}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Door Indicator */}
              <div className="flex flex-col items-center w-full mt-6">
                <div className="flex justify-center w-full">
                  <div className="w-32 h-10 bg-gray-300 dark:bg-zinc-700 rounded-b-2xl flex items-center justify-center shadow text-gray-700 dark:text-gray-200 font-semibold border-t-2 border-gray-400">
                   Door
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entrance/Exit</span>
              </div>
              {/* Legend */}
              <div className="mt-8 flex gap-8 justify-center">
                <button
                  type="button"
                  className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all
                    ${filter === "economy" ? "bg-green-200 scale-105 shadow" : "hover:bg-green-100"}
                  `}
                  onClick={() => setFilter(filter === "economy" ? "all" : "economy")}
                >
                  <span className="w-5 h-5 rounded-lg bg-green-200 border-2 border-green-500"></span>
                  <span className="text-base text-green-900 font-semibold">Economy</span>
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all
                    ${filter === "premium" ? "bg-yellow-200 scale-105 shadow" : "hover:bg-yellow-100"}
                  `}
                  onClick={() => setFilter(filter === "premium" ? "all" : "premium")}
                >
                  <span className="w-5 h-5 rounded-lg bg-yellow-300 border-2 border-yellow-500"></span>
                  <span className="text-base text-yellow-900 font-semibold">Premium</span>
                </button>
              </div>
              {/* Update Button */}
              <AppButton
                color="primary"
                className="mt-6 w-full sm:w-auto"
                onClick={async () => {
                  if (!selectedRoom) return;
                  setLoading(true);
                  // Simulate async update (replace with real API if needed)
                  await new Promise(res => setTimeout(res, 1200));
                  dispatch(
                    updateRoom({
                      ...selectedRoom,
                      premium_seats: localPremiumSeats.join(","),
                    })
                  );
                  setLoading(false);
                  toastRef.current?.showNotification({
                    title: "Room Updated",
                    content: `Seat configuration for "${selectedRoom.room_name}" saved.`,
                    accentColor: "#2563eb",
                    position: "bottom-right",
                    longevity: 3000,
                  });
                }}
                disabled={loading}
              >
                {loading ? <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-t-blue-600 border-blue-200 rounded-full"></span>Updating...</span> : "Update Room Seats"}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
      <SatelliteToast ref={toastRef} />
    </div>
  );
}