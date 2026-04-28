import { useState, useMemo, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, type RootState } from "../../store/store";
import { fetchRooms } from "../../store/slices";
import type { Movie } from "../../entities/type";
import AppButton from "../../components/UI/AppButton";

interface SessionAddModalProps {
  open: boolean;
  onClose: () => void;
  modalMovieId: number | null;
  setModalMovieId: (id: number | null) => void;
  modalRoom: number | null;
  setModalRoom: (roomId: number | null) => void;
  modalDate: string;
  setModalDate: (date: string) => void;
  modalStart: string;
  setModalStart: (time: string) => void;
  modalEnd: string;
  selectedDate: string | null;
  basePrice: number;
  onAdd: () => void;
}

export default function SessionAddModal({
  open,
  onClose,
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
  basePrice,
  onAdd,
}: SessionAddModalProps) {
  // Redux state - MOVE ALL HOOKS BEFORE ANY CONDITIONAL
  const dispatch = useAppDispatch();
  const { items: allMovies, loading: moviesLoading } = useAppSelector((state: RootState) => state.movies);
  const { rooms: allRooms, loading: roomsLoading } = useAppSelector((state: RootState) => state.rooms);
  const { items: allGenresData } = useAppSelector((state: RootState) => state.genres);

  // Use ref to track if fetch has already been initiated (prevent double fetches)
  const fetchInitiatedRef = useRef(false);
  
  // Local search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"title" | "duration" | "rating">("title");

  // Get genres from Redux store - maps genre_id to genre_name
  const allGenres = useMemo(() => {
    return allGenresData.map((genre) => ({
      id: genre.genre_id,
      name: genre.genre_name,
    }));
  }, [allGenresData]);

  // Filter and sort movies - apply search and genre filters
  const filteredMovies = useMemo(() => {
    return allMovies
      .filter((m: Movie) => {
        // Apply search filter
        const matchesSearch = !searchQuery || 
                            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Apply genre filter
        const matchesGenre = !selectedGenreFilter || m.genre_ids?.includes(selectedGenreFilter);
        
        // Don't filter out deleted movies for selection, but can filter them later if needed
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

  // Fetch data on mount only - use ref to prevent double fetches
  useEffect(() => {
    // Only fetch if we haven't already initiated a fetch
    if (fetchInitiatedRef.current) return;
    
    // Only fetch rooms if missing; movies should come from SessionPage
    if (allRooms.length === 0) {
      fetchInitiatedRef.current = true;
      dispatch(fetchRooms()).catch((err: unknown) => console.error("Failed to fetch rooms:", err));
    }
  }, [dispatch, allRooms.length]); // Include dispatch and allRooms.length in deps

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative border border-blue-100 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 dark:hover:text-blue-200 text-3xl z-10"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-200 font-audiowide sticky top-0 bg-white dark:bg-zinc-900 p-6 border-b border-blue-100 dark:border-zinc-800" style={{ fontFamily: 'Audiowide, sans-serif' }}>Add Session</h3>

        <div className="p-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Movie Selection & Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="border rounded-lg p-4 bg-slate-700/30 border-slate-700/60 dark:border-slate-700/40">
                <label className="text-sm font-semibold text-slate-100 dark:text-slate-50 block mb-3">
                  Movie Selection
                </label>
                
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  className="w-full border rounded-lg px-3 py-2 mb-3 bg-slate-700/50 dark:bg-slate-800 border-slate-600/60 dark:border-slate-700/60 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Genre Filter and Sort Controls */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  <select
                    className="flex-1 min-w-[140px] border rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={selectedGenreFilter ?? ""}
                    onChange={(e) => setSelectedGenreFilter(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">All Genres</option>
                    {allGenres.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>

                  <select
                    className="flex-1 min-w-[140px] border rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "title" | "duration" | "rating")}
                  >
                    <option value="title">Sort by Title</option>
                    <option value="duration">Sort by Duration</option>
                    <option value="rating">Sort by Rating</option>
                  </select>
                </div>

                {/* Movie List */}
                <div className="border rounded-lg max-h-[400px] overflow-y-auto bg-slate-700/50 dark:bg-slate-800 border-slate-600/60 dark:border-slate-700/60 divide-y divide-slate-700/60 dark:divide-slate-700">
                  {moviesLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading movies...</div>
                  ) : filteredMovies.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No movies found</div>
                  ) : (
                    filteredMovies.map(m => {
                      const isSelected = modalMovieId === m.id;
                      return (
                      <button
                        key={m.id}
                        className={`w-full text-left p-4 hover:bg-blue-50 dark:hover:bg-zinc-700 transition border-l-4 ${
                          isSelected 
                            ? "border-l-blue-600 bg-blue-50 dark:bg-zinc-700" 
                            : "border-l-transparent"
                        }`}
                        onClick={() => setModalMovieId(m.id)}
                      >
                        <div className={`font-semibold ${
                          isSelected 
                            ? "text-blue-900 dark:text-slate-50" 
                            : "text-blue-900 dark:text-slate-100 hover:text-blue-900 dark:hover:text-slate-50"
                        }`}>{m.title}</div>
                        <div className={`text-xs ${
                          isSelected 
                            ? "text-blue-700 dark:text-slate-300" 
                            : "text-blue-700 dark:text-slate-300 hover:text-blue-900 dark:hover:text-slate-200"
                        } mt-1 space-x-2`}>
                          <span>⏱ {m.duration}m</span>
                          <span>⭐ {m.rating || "N/A"}</span>
                        </div>
                      </button>
                    );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Movie Preview & Selected Movie Info */}
            <div className="lg:col-span-1 space-y-4">
              {modalMovieId && allMovies.find(m => m.id === modalMovieId) && (() => {
                const selectedMovie = allMovies.find(m => m.id === modalMovieId);
                return (
                  <div className="border rounded-lg overflow-hidden bg-slate-700/30 border-slate-700/60 dark:border-slate-700/40">
                    {/* Movie Poster */}
                    <div className="min-h-[500px] bg-gradient-to-br from-blue-200 to-blue-400 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center overflow-hidden">
                      {selectedMovie?.poster ? (
                        <img 
                          src={selectedMovie.poster} 
                          alt={selectedMovie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-4xl mb-2">🎬</div>
                          <div className="text-sm font-semibold text-slate-100 dark:text-slate-50">No Poster</div>
                        </div>
                      )}
                    </div>

                    {/* Movie Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Selected Movie</div>
                        <div className="font-bold text-blue-900 dark:text-slate-50 line-clamp-2 mt-1">{selectedMovie?.title}</div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="font-semibold text-blue-900 dark:text-slate-50">{selectedMovie?.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                          <span className="font-semibold text-blue-900 dark:text-blue-200">⭐ {selectedMovie?.rating || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">${basePrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {!modalMovieId && (
                <div className="border rounded-lg border-dashed border-blue-300 dark:border-zinc-600 p-8 text-center bg-blue-50 dark:bg-zinc-800">
                  <div className="text-4xl mb-2">🎬</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Select a movie to see preview</div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields - Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-blue-100 dark:border-zinc-700">
            
            {/* Room Selection */}
            <div>
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200 block mb-2">
                Room *
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={modalRoom ? String(modalRoom) : ""}
                onChange={e => setModalRoom(e.target.value ? Number(e.target.value) : null)}
                disabled={roomsLoading}
              >
                <option value="">Select a room</option>
                {allRooms.map(r => (
                  <option key={r.id} value={String(r.id)}>{r.roomName}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200 block mb-2">
                Date *
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedDate || modalDate}
                onChange={e => setModalDate(e.target.value)}
                disabled={!!selectedDate}
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200 block mb-2">
                Start Time *
              </label>
              <input
                type="time"
                step={300}
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-zinc-800 border-blue-200 dark:border-zinc-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={modalStart}
                onChange={e => setModalStart(e.target.value)}
              />
            </div>

            {/* End Time (Auto-calculated) */}
            <div>
              <label className="text-sm font-semibold text-blue-700 dark:text-blue-200 block mb-2">
                End Time (auto)
              </label>
              <input
                type="time"
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 dark:bg-zinc-700 border-blue-200 dark:border-zinc-600 text-base"
                value={modalEnd}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-blue-100 dark:border-zinc-700">
            <AppButton
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white"
              onClick={onAdd}
              disabled={!modalMovieId || !modalRoom || !(selectedDate || modalDate) || !modalStart}
            >
              Add Session
            </AppButton>
            <AppButton
              color="danger"
              variant="soft"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}