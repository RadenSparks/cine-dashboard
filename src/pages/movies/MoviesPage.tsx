import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { addMovie, updateMovie, type Movie } from "../../store/moviesSlice";
import MovieTable from "./components/MovieTable";
import MovieFormModal from "./components/MovieFormModal";
import MovieDetailsModal from "./components/MovieDetailsModal";

// --- Main Page ---
export default function MoviesPage() {
  const movies = useSelector((state: RootState) => state.movies);
  const genres = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();

  const [editing, setEditing] = useState<Movie | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMovie, setNewMovie] = useState<Movie>({
    movie_id: movies.length ? Math.max(...movies.map(m => m.movie_id)) + 1 : 1,
    title: "",
    description: "",
    duration: 120,
    premiere_date: new Date().toISOString().slice(0, 10),
    poster: "",
    genre_ids: genres[0] ? [genres[0].genre_id] : [],
    deleted: false,
  });
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);

  // --- Search & Filter State ---
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<number | "">( "");
  const [durationFilter, setDurationFilter] = useState<number | "">("");
  const [nowShowingFilter, setNowShowingFilter] = useState<"all" | "now" | "soon" | "ended">("all");
  const [page, setPage] = useState(1);

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
    let result = movies.filter(m => !m.deleted);

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

  // --- Pagination (frontend only, backend logic to be implemented) ---
  const pageSize = 5;
  const totalPages = Math.ceil(filteredMovies.length / pageSize);
  const pagedMovies = filteredMovies.slice((page - 1) * pageSize, page * pageSize);

  // CRUD Handlers
  const handleAddMovie = () => {
    dispatch(addMovie({ ...newMovie, movie_id: movies.length ? Math.max(...movies.map(m => m.movie_id)) + 1 : 1 }));
    setShowAdd(false);
    setNewMovie({
      movie_id: movies.length ? Math.max(...movies.map(m => m.movie_id)) + 2 : 2,
      title: "",
      description: "",
      duration: 120,
      premiere_date: new Date().toISOString().slice(0, 10),
      poster: "",
      genre_ids: genres[0] ? [genres[0].genre_id] : [],
      deleted: false,
    });
  };

  const handleEditMovie = (movie: Movie) => setEditing(movie);

  const handleUpdateMovie = () => {
    if (editing) {
      dispatch(updateMovie(editing));
      setEditing(null);
    }
  };

  const handleDeleteMovie = (id: number) => {
    const movie = movies.find(m => m.movie_id === id);
    if (movie) {
      dispatch(updateMovie({ ...movie, deleted: true }));
    }
  };

  const handleRestoreMovie = (id: number) => {
    const movie = movies.find(m => m.movie_id === id);
    if (movie) {
      dispatch(updateMovie({ ...movie, deleted: false }));
    }
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

  return (
    <>
      <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-2xl p-10 w-full max-w-[1500px] mx-auto mt-10 border border-blue-100 dark:border-zinc-800 transition-all">
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