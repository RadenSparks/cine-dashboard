import AppButton from "../../components/UI/AppButton";

interface SessionAddModalProps {
  show: boolean;
  onClose: () => void;
  movies: { id: number; title: string; duration: number }[];
  rooms: string[];
  modalMovieId: number | null;
  setModalMovieId: (id: number | null) => void;
  modalRoom: string;
  setModalRoom: (room: string) => void;
  modalDate: string;
  setModalDate: (date: string) => void;
  modalStart: string;
  setModalStart: (time: string) => void;
  modalEnd: string;
  selectedDate: string | null;
  onAdd: () => void;
}

export default function SessionAddModal({
  show,
  onClose,
  movies,
  rooms,
  modalMovieId,
  setModalMovieId,
  modalRoom,
  setModalRoom,
  modalDate,
  setModalDate,
  modalStart,
  setModalStart,
  modalEnd,
  selectedDate,
  onAdd,
}: SessionAddModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-6 w-full max-w-md relative border border-blue-100 dark:border-zinc-800">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-200">Add Session</h3>
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Movie:
            <select
              className="w-full border rounded px-2 py-1 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalMovieId ?? ""}
              onChange={e => setModalMovieId(Number(e.target.value))}
            >
              <option value="">Select a movie</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Room:
            <select
              className="w-full border rounded px-2 py-1 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalRoom}
              onChange={e => setModalRoom(e.target.value)}
            >
              {rooms.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Date:
            <input
              type="date"
              className="w-full border rounded px-2 py-1 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={selectedDate || modalDate}
              onChange={e => setModalDate(e.target.value)}
              disabled={!!selectedDate}
            />
          </label>
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Start Time:
            <input
              type="time"
              className="w-full border rounded px-2 py-1 mt-1 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalStart}
              onChange={e => setModalStart(e.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            End Time:
            <input
              type="time"
              className="w-full border rounded px-2 py-1 mt-1 bg-gray-100 dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalEnd}
              readOnly
              tabIndex={-1}
            />
          </label>
          <AppButton
            className="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
            onClick={onAdd}
            disabled={!modalMovieId || !modalRoom || !(selectedDate || modalDate) || !modalStart}
          >
            Add Session
          </AppButton>
        </div>
      </div>
    </div>
  );
}