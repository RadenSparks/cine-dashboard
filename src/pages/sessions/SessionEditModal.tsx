import { useState, useMemo, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, type RootState } from "../../store/store";
import { fetchRooms } from "../../store/slices";
import type { Movie, Session } from "../../entities/type";
import AppButton from "../../components/UI/AppButton";

interface SessionEditModalProps {
  show: boolean;
  onClose: () => void;
  session: Session | null;
  modalMovieId: number | null;
  setModalMovieId: (id: number | null) => void;
  modalRoom: number | null;
  setModalRoom: (roomId: number | null) => void;
  modalDate: string;
  setModalDate: (date: string) => void;
  modalStart: string;
  setModalStart: (time: string) => void;
  modalEnd: string;
  basePrice: number;
  onUpdate: () => void;
}

export default function SessionEditModal({
  show,
  onClose,
  session,
  modalMovieId,
  setModalMovieId,
  modalRoom,
  setModalRoom,
  modalDate,
  setModalDate,
  modalStart,
  setModalStart,
  modalEnd,
  basePrice,
  onUpdate,
}: SessionEditModalProps) {
  // Redux state
  const dispatch = useAppDispatch();
  const { items: allMovies } = useAppSelector((state: RootState) => state.movies);
  const { rooms: allRooms } = useAppSelector((state: RootState) => state.rooms);
  const { items: allGenresData } = useAppSelector((state: RootState) => state.genres);

  // Use ref to track if fetch has already been initiated
  const fetchInitiatedRef = useRef(false);

  // Local search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "duration" | "rating">("title");

  // Get genres from Redux store
  const allGenres = useMemo(() => {
    return allGenresData.map((genre) => ({
      id: genre.genre_id,
      name: genre.genre_name,
    }));
  }, [allGenresData]);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return allMovies
      .filter((m: Movie) => {
        const matchesSearch = !searchQuery ||
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre = !selectedGenreFilter || m.genre_ids?.includes(selectedGenreFilter);
        const notDeleted = !m.deleted;

        return matchesSearch && matchesGenre && notDeleted;
      })
      .sort((a: Movie, b: Movie) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "duration") return (a.duration || 0) - (b.duration || 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [allMovies, searchQuery, selectedGenreFilter, sortBy]);

  // Fetch rooms on mount
  useEffect(() => {
    if (fetchInitiatedRef.current) return;

    if (allRooms.length === 0) {
      fetchInitiatedRef.current = true;
      dispatch(fetchRooms()).catch((err: unknown) => console.error("Failed to fetch rooms:", err));
    }
  }, [dispatch, allRooms.length]);

  if (!show || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-blue-100 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-6 text-blue-700 dark:text-blue-200 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>Edit Session</h3>

        <div className="flex flex-col gap-5 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>

          {/* Movie Selection with Search and Filters */}
          <div className="border-b pb-5 border-blue-100 dark:border-zinc-700">
            <label className="text-sm font-semibold text-blue-700 dark:text-blue-200 block mb-3">
              Movie:
            </label>
            
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by title or description..."
              className="w-full border rounded px-3 py-2 mb-3 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Genre Filter and Sort Controls */}
            <div className="flex gap-3 mb-3 flex-wrap">
              <select
                className="flex-1 min-w-[120px] border rounded px-2 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-sm"
                value={selectedGenreFilter ?? ""}
                onChange={(e) => setSelectedGenreFilter(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All Genres</option>
                {allGenres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              <select
                className="flex-1 min-w-[120px] border rounded px-2 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "title" | "duration" | "rating")}
              >
                <option value="title">Sort by Title</option>
                <option value="duration">Sort by Duration</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>

            {/* Movie List */}
            <div className="border rounded-lg max-h-[300px] overflow-y-auto bg-blue-50 dark:bg-zinc-800 border-blue-200 dark:border-zinc-700">
              {filteredMovies.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No movies found</div>
              ) : (
                filteredMovies.map(m => (
                  <button
                    key={m.id}
                    className={`w-full text-left p-3 border-b border-blue-200 dark:border-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-700 transition ${
                      modalMovieId === m.id ? "bg-blue-200 dark:bg-zinc-600" : ""
                    }`}
                    onClick={() => setModalMovieId(m.id)}
                  >
                    <div className="font-semibold text-blue-700 dark:text-blue-200">{m.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Duration: {m.duration} min • Rating: {m.rating || "N/A"} ★
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Room Selection */}
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Room:
            <select
              value={modalRoom ? String(modalRoom) : ""}
              onChange={(e) => setModalRoom(e.target.value ? Number(e.target.value) : null)}
              className="w-full border rounded px-2 py-2 mt-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
            >
              <option value="">Select a room...</option>
              {allRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomName} ({room.capacity} seats)
                </option>
              ))}
            </select>
          </label>

          {/* Date Selection */}
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Date:
            <input
              type="date"
              className="w-full border rounded px-2 py-2 mt-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalDate}
              onChange={e => setModalDate(e.target.value)}
            />
          </label>

          {/* Start Time */}
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Start Time:
            <input
              type="time"
              step={300}
              className="w-full border rounded px-2 py-2 mt-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalStart}
              onChange={e => setModalStart(e.target.value)}
            />
          </label>

          {/* End Time (Auto-calculated) */}
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            End Time:
            <input
              type="time"
              className="w-full border rounded px-2 py-2 mt-2 bg-gray-100 dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base"
              value={modalEnd}
              readOnly
              tabIndex={-1}
            />
          </label>

          {/* Base Price (Auto-filled from movie) */}
          <label className="text-sm font-semibold text-blue-700 dark:text-blue-200">
            Base Price:
            <input
              type="number"
              step={0.01}
              className="w-full border rounded px-2 py-2 mt-2 bg-gray-100 dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base cursor-not-allowed"
              value={basePrice}
              readOnly
              disabled
              tabIndex={-1}
            />
          </label>

          {/* Update Button */}
          <AppButton
            className="mt-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
            onClick={onUpdate}
            disabled={!modalMovieId || !modalRoom || !modalDate || !modalStart}
          >
            Update Session
          </AppButton>
        </div>
      </div>
    </div>
  );
}
