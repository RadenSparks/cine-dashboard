import { motion, AnimatePresence } from "framer-motion";
import AppButton from "../../../components/UI/AppButton";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  roomName: string;
  setRoomName: (v: string) => void;
  roomRows: number;
  setRoomRows: (v: number) => void;
  roomCols: number;
  setRoomCols: (v: number) => void;
  onCreate: () => void;
}

export default function CreateRoomModal({
  open,
  onClose,
  roomName,
  setRoomName,
  roomRows,
  setRoomRows,
  roomCols,
  setRoomCols,
  onCreate,
}: CreateRoomModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-200 text-center">Create Room</h3>
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                Room Name:
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  maxLength={32}
                />
              </label>
              {!roomName && (
                <span className="text-xs text-red-500">Room name is required.</span>
              )}
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                Rows:
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
                  value={roomRows}
                  onChange={e => setRoomRows(Math.min(15, Math.max(1, Number(e.target.value))))}
                  min={1}
                  max={15}
                  placeholder="Number of rows"
                />
              </label>
              {roomRows > 15 && (
                <span className="text-xs text-red-500">Maximum rows is 15.</span>
              )}
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                Columns:
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:ring-2 focus:ring-blue-400"
                  value={roomCols}
                  onChange={e => setRoomCols(Math.min(10, Math.max(1, Number(e.target.value))))}
                  min={1}
                  max={10}
                  placeholder="Number of columns"
                />
              </label>
              {roomCols > 10 && (
                <span className="text-xs text-red-500">Maximum columns is 10.</span>
              )}
              <AppButton
                className="mt-4 bg-gradient-to-r from-green-600 to-green-400 text-white font-bold py-2 rounded shadow hover:scale-105 transition-transform"
                onClick={onCreate}
                disabled={!roomName || roomRows > 15 || roomCols > 10}
              >
                Create Room
              </AppButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}