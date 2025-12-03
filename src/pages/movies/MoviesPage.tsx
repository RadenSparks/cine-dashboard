import { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import {
  fetchMovies,
} from "../../store/moviesSlice";
import { fetchGenres } from "../../store/genresSlice";
import { fetchFolderListAsync } from "../../store/imagesSlice";
import MovieFormModal from "./components/MovieFormModal";
import MovieDetailsModal from "./components/MovieDetailsModal";
import MoviesFiltersBar from "./components/MoviesFiltersBar";
import MoviesTableContainer from "./components/MoviesTableContainer";
import Loading from "../../components/UI/Loading";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import { type Movie } from "../../entities/type";
import { type MovieApiDTO } from "../../dto/dto";
import { useMovieCRUD } from "./hooks/useMovieCRUD";

// --- Main Page ---
export default function MoviesPage() {
  const { items: movies, loading, pagination } = useSelector((state: RootState) => state.movies);
  const { items: genres, loading: genresLoading } = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  // Movie CRUD hook
  const { addMovie, updateMovie, deleteMovie, restoreMovie } = useMovieCRUD({
    toastRef,
  });

  const [editing, setEditing] = useState<Movie | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [newMovie, setNewMovie] = useState<Movie>({
    id: 0,
    title: "",
    description: "",
    duration: 120,
    premiere_date: new Date().toISOString().slice(0, 10),
    poster: "",
    genre_ids: [],
    rating: 0,
    deleted: false,
    images: [],
    teaser: "",
  });
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);

  // --- Search & Filter State ---
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<number | "">("");
  const [durationFilter, setDurationFilter] = useState<number | "">("");
  const [nowShowingFilter, setNowShowingFilter] = useState<"all" | "now" | "soon" | "ended">("all");

  // Fetch movies and genres on mount
  useEffect(() => {
    dispatch(fetchMovies({ page: currentPage, size: pageSize }));
    dispatch(fetchGenres());
    dispatch(fetchFolderListAsync());
  }, [currentPage, pageSize, dispatch]);

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
    let result = movies;
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

  const prepareMovieForApi = (movie: Movie): MovieApiDTO => {
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
      genres: validGenreIds,
      rating: movie.rating,
      teaser: movie.teaser,
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
    const result = await addMovie(prepareMovieForApi(newMovie));
    if (result.success) {
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
        teaser: "",
        images: [],
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
    const result = await updateMovie(prepareMovieForApi(editing!));
    if (result.success) {
      setEditing(null);
    }
  };

  const handleDeleteMovie = async (id: number) => {
    await deleteMovie(id);
  };

  const handleRestoreMovie = async (id: number) => {
    await restoreMovie(id);
  };

  if (loading || genresLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading />
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          🎬 Movies
        </h2>
      </div>
    );
  }

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full mx-auto px-1 md:px-2 xl:px-4 min-h-[600px] hide-scrollbar">
        <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-2xl p-10 w-full mt-10 border border-blue-100 dark:border-zinc-800 overflow-x-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 tracking-tight drop-shadow font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
                🎬 Movies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Browse, manage, and organize your movie catalog</p>
            </div>
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-1.5 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold font-red-rose whitespace-nowrap ml-6 text-sm"
              style={{ fontFamily: 'Red Rose, sans-serif' }}
              onClick={() => setShowAdd(true)}
            >
              + Add Movie
            </button>
          </div>

          {/* Filters Bar */}
          <div className="mb-6">
            <MoviesFiltersBar
              search={search}
              setSearch={setSearch}
              genreFilter={genreFilter}
              setGenreFilter={setGenreFilter}
              durationFilter={durationFilter}
              setDurationFilter={setDurationFilter}
              nowShowingFilter={nowShowingFilter}
              setNowShowingFilter={setNowShowingFilter}
              genres={genres}
              loading={loading}
            />
          </div>

          {/* Movies Table with Pagination */}
          <MoviesTableContainer
            movies={filteredMovies}
            genres={genres}
            loading={loading}
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            totalElements={pagination.totalElements}
            onPageChange={(page) => setCurrentPage(page)}
            onEdit={handleEditMovie}
            onDelete={handleDeleteMovie}
            onRestore={handleRestoreMovie}
            onViewDetails={setDetailMovie}
          />
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