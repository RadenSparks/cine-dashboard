import { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import {
  fetchMovies,
  addMovieAsync,
  updateMovieAsync,
  deleteMovieAsync,
} from "../../store/moviesSlice";
import { fetchGenres } from "../../store/genresSlice";
import MovieTable from "./components/MovieTable";
import MovieFormModal from "./components/MovieFormModal";
import MovieDetailsModal from "./components/MovieDetailsModal";
import Loading from "../../components/UI/Loading";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import { type Movie } from "../../entities/type";
import { type MovieApiDTO } from "../../dto/dto";

// --- Main Page ---
export default function MoviesPage() {
  const { items: movies, loading } = useSelector((state: RootState) => state.movies);
  const { items: genres, loading: genresLoading } = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const [editing, setEditing] = useState<Movie | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMovie, setNewMovie] = useState<Movie>({
    id: 0,
    title: "",
    description: "",
    duration: 120,
    premiere_date: new Date().toISOString().slice(0, 10),
    poster: "",
    genre_ids: [],
    rating: 0, // Default rating
    deleted: false,
  });
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);

  // --- Search & Filter State ---
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<number | "">( "");
  const [durationFilter, setDurationFilter] = useState<number | "">("");
  const [nowShowingFilter, setNowShowingFilter] = useState<"all" | "now" | "soon" | "ended">("all");
  const [page, setPage] = useState(1);

  // Fetch movies and genres on mount
  useEffect(() => {
    dispatch(fetchMovies());
    dispatch(fetchGenres());
    // eslint-disable-next-line
  }, []);

  // --- Filtering Logic ---
  function isNowShowing(premiere_date: string) {
    const premiere = new Date(premiere_date);
    const now = new Date();
    const oneMonthLater = new Date(premiere);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return premiere <= now && now <= oneMonthLater;
  }
  function isComingSoon(premiere_date: string) {
    return new Date(premiere_date) > new Date();
  }
  function isEnded(premiere_date: string) {
    const premiere = new Date(premiere_date);
    const oneMonthLater = new Date(premiere);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return new Date() > oneMonthLater;
  }

  const filteredMovies = useMemo(() => {
    let result = movies; // <-- Remove the .filter(m => !m.deleted)
    if (search.trim()) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.description || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (genreFilter) {
      result = result.filter(m => m.genre_ids.includes(Number(genreFilter)));
    }
    if (durationFilter) {
      result = result.filter(m => m.duration >= Number(durationFilter));
    }
    if (nowShowingFilter === "now") {
      result = result.filter(m => isNowShowing(m.premiere_date));
    } else if (nowShowingFilter === "soon") {
      result = result.filter(m => isComingSoon(m.premiere_date));
    } else if (nowShowingFilter === "ended") {
      result = result.filter(m => isEnded(m.premiere_date));
    }
    return result;
  }, [movies, search, genreFilter, durationFilter, nowShowingFilter]);

  // --- Pagination (frontend only) ---
  const pageSize = 5;
  const totalPages = Math.ceil(filteredMovies.length / pageSize);
  const pagedMovies = filteredMovies.slice((page - 1) * pageSize, page * pageSize);

  const prepareMovieForApi = (movie: Movie): MovieApiDTO => {
    // Only include genre_ids that exist in the loaded genres
    const validGenreIds = movie.genre_ids.filter(id =>
      genres.some(g => g.genre_id === id)
    );
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      premiereDate: movie.premiere_date,
      poster: movie.poster,
      genres: validGenreIds, // only valid IDs
      rating: movie.rating,
    };
  };

  // CRUD Handlers
  const handleAddMovie = async () => {
    if (!newMovie.premiere_date) {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Premiere date is required.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
      return;
    }
    try {
      await dispatch(addMovieAsync(prepareMovieForApi(newMovie))).unwrap();
      setShowAdd(false);
      setNewMovie({
        id: 0,
        title: "",
        description: "",
        duration: 120,
        premiere_date: new Date().toISOString().slice(0, 10),
        poster: "",
        genre_ids: [],
        rating: 0,
        deleted: false,
      });
      toastRef.current?.showNotification({
        title: "Movie Added",
        content: `Movie "${newMovie.title}" was added successfully.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 3000,
      });
      // No need to refetch, state is already updated
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to add movie.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditing({ ...movie });
  };

  const handleUpdateMovie = async () => {
    if (!editing?.premiere_date) {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Premiere date is required.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
      return;
    }
    try {
      await dispatch(updateMovieAsync(prepareMovieForApi(editing!))).unwrap();
      setEditing(null);
      toastRef.current?.showNotification({
        title: "Movie Updated",
        content: `Movie "${editing.title}" was updated.`,
        accentColor: "#f59e42",
        position: "bottom-right",
        longevity: 3000,
      });
      // No need to refetch, state is already updated
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to update movie.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    }
  };

  const handleDeleteMovie = async (id: number) => {
    try {
      await dispatch(deleteMovieAsync(id)).unwrap();
      toastRef.current?.showNotification({
        title: "Movie Deleted",
        content: `Movie was deleted.`,
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
      // No need to refetch, state is already updated
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to delete movie.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    }
  };

  const handleRestoreMovie = async () => {
    // If your API supports restore, implement here. Otherwise, just refetch.
    dispatch(fetchMovies());
  };

  // --- Pagination Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // Filter options
  const nowShowingOptions = [
    { value: "all", label: "All" },
    { value: "now", label: "Now Showing" },
    { value: "soon", label: "Coming Soon" },
    { value: "ended", label: "Ended" },
  ];

  if (loading || genresLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading />
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
          🎬 Movies
        </h2>
      </div>
    );
  }

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16 min-h-[400px] hide-scrollbar">
        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-2xl p-10 w-full mt-10 border border-blue-100 dark:border-zinc-800 overflow-x-hidden">
          <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
            🎬 Movies
          </h2>
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by title or description"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Genre</label>
              <select
                value={genreFilter}
                onChange={e => { setGenreFilter(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-base"
              >
                <option value="">All</option>
                {genres.map(g => (
                  <option key={g.genre_id} value={g.genre_id}>{g.genre_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Min Duration</label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 90"
                value={durationFilter}
                onChange={e => { setDurationFilter(e.target.value ? Number(e.target.value) : ""); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 w-24 text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Show</label>
              <select
                value={nowShowingFilter}
                onChange={e => { setNowShowingFilter(e.target.value as "all" | "now" | "soon" | "ended"); setPage(1); }}
                className="px-3 py-2 rounded-lg border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-base"
              >
                {nowShowingOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold text-base md:ml-2"
              onClick={() => setShowAdd(true)}
            >
              + Add Movie
            </button>
          </div>
          {/* Movie Table */}
          <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-zinc-800 shadow-lg bg-white/80 dark:bg-zinc-900/80">
            <MovieTable
              movies={pagedMovies}
              genres={genres}
              onEdit={handleEditMovie}
              onDelete={handleDeleteMovie}
              onRestore={handleRestoreMovie}
              onDetail={setDetailMovie}
            />
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 font-semibold text-base transition"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="font-bold text-blue-700 dark:text-blue-200 text-base">
              Page {page} of {totalPages || 1}
            </span>
            <button
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 font-semibold text-base transition"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Add/Edit Movie Modal */}
      <MovieFormModal
        show={showAdd || !!editing}
        editing={editing}
        newMovie={newMovie}
        genres={genres}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        onChange={movie => {
          if (editing) setEditing(movie);
          else setNewMovie(movie);
        }}
        onSubmit={() => {
          if (editing) handleUpdateMovie();
          else handleAddMovie();
        }}
      />
      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={detailMovie}
        genres={genres}
        onClose={() => setDetailMovie(null)}
      />
    </>
  );
}