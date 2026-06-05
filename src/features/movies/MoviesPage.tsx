import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Film } from "lucide-react";
import type { Movie } from "@/shared/types/entities";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchFolderListAsync, fetchGenres, fetchMovies } from "@/store/slices";
import type { MovieApiDTO } from "@/shared/types/dto";
import { useMovieCRUD } from "./hooks/useMovieCRUD";
import MovieFormModal from "./components/MovieFormModal";
import MovieDetailsModal from "./components/MovieDetailsModal";
import MoviesFiltersBar from "./components/MoviesFiltersBar";
import MoviesTableContainer from "./components/MoviesTableContainer";
import Loading from "@/shared/components/ui/Loading";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import { PageIntro, SectionCard } from "@/shared/components/ui/DashboardPrimitives";
import { SatelliteToast, type ToastNotification } from "@/shared/components/ui/SatelliteToast";

export default function MoviesPage() {
  const { items: movies, loading, pagination } = useSelector((state: RootState) => state.movies);
  const { items: genres, loading: genresLoading } = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);
  const { addMovie, updateMovie, deleteMovie, restoreMovie } = useMovieCRUD({ toastRef });

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
  const [confirmDeleteMovieId, setConfirmDeleteMovieId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<number | "">("");
  const [durationFilter, setDurationFilter] = useState<number | "">("");
  const [nowShowingFilter, setNowShowingFilter] = useState<"all" | "now" | "soon" | "ended">("all");

  useEffect(() => {
    dispatch(fetchMovies({ page: currentPage, size: pageSize }));
    dispatch(fetchGenres());
    dispatch(fetchFolderListAsync());
  }, [currentPage, pageSize, dispatch]);

  function isNowShowing(premiereDate: string) {
    const premiere = new Date(premiereDate);
    const now = new Date();
    const oneMonthLater = new Date(premiere);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return premiere <= now && now <= oneMonthLater;
  }

  function isComingSoon(premiereDate: string) {
    return new Date(premiereDate) > new Date();
  }

  function isEnded(premiereDate: string) {
    const premiere = new Date(premiereDate);
    const oneMonthLater = new Date(premiere);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return new Date() > oneMonthLater;
  }

  const filteredMovies = useMemo(() => {
    let result = movies;
    if (search.trim()) {
      result = result.filter((movie) => movie.title.toLowerCase().includes(search.toLowerCase()) || (movie.description || "").toLowerCase().includes(search.toLowerCase()));
    }
    if (genreFilter) result = result.filter((movie) => movie.genre_ids.includes(Number(genreFilter)));
    if (durationFilter) result = result.filter((movie) => movie.duration >= Number(durationFilter));
    if (nowShowingFilter === "now") result = result.filter((movie) => isNowShowing(movie.premiere_date));
    else if (nowShowingFilter === "soon") result = result.filter((movie) => isComingSoon(movie.premiere_date));
    else if (nowShowingFilter === "ended") result = result.filter((movie) => isEnded(movie.premiere_date));
    return result;
  }, [movies, search, genreFilter, durationFilter, nowShowingFilter]);



  const prepareMovieForApi = (movie: Movie): MovieApiDTO => {
    const validGenreIds = movie.genre_ids.filter((id) => genres.some((genre) => genre.genre_id === id));
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

  const handleAddMovie = async () => {
    if (!newMovie.premiere_date) {
      toastRef.current?.showNotification({ title: "Error", content: "Premiere date is required.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
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

  const handleUpdateMovie = async () => {
    if (!editing?.premiere_date) {
      toastRef.current?.showNotification({ title: "Error", content: "Premiere date is required.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
      return;
    }
    const result = await updateMovie(prepareMovieForApi(editing));
    if (result.success) setEditing(null);
  };

  const handleConfirmDeleteMovie = async () => {
    if (confirmDeleteMovieId === null) return;
    setIsProcessing(true);
    try {
      await deleteMovie(confirmDeleteMovieId);
    } finally {
      setIsProcessing(false);
      setConfirmDeleteMovieId(null);
    }
  };

  if (loading || genresLoading) {
    return <Loading fullscreen={false} />;
  }

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full space-y-6">
        <PageIntro
          eyebrow="Catalog management"
          title="Movies workspace"
          description="Review release readiness, search the catalog, and keep movie records consistent without leaving the dashboard rhythm."
          actions={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="inline-flex min-h-[44px] items-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(37,99,235,0.75)] transition hover:brightness-105"
                style={{ fontFamily: "Red Rose, sans-serif" }}
              >
                Add movie
              </button>
            </div>
          }
          icon={Film}
          showEvervault={true}
        />

        <SectionCard title="Catalog filters" description="Refine the movie list by metadata, timing, and release state.">
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
        </SectionCard>

        <SectionCard title="Movie records" description="Use the table below to inspect, edit, remove, or restore movie records without changing the underlying CRUD flow.">
          <MoviesTableContainer
            movies={filteredMovies}
            genres={genres}
            loading={loading}
            totalPages={pagination?.totalPages || 0}
            currentPage={pagination?.currentPage || 0}
            totalElements={pagination?.totalElements || filteredMovies.length}
            onPageChange={(page) => setCurrentPage(page)}
            onEdit={(movie) => setEditing({ ...movie })}
            onDelete={(id) => setConfirmDeleteMovieId(id)}
            onRestore={(id) => void restoreMovie(id)}
            onViewDetails={setDetailMovie}
          />
        </SectionCard>
      </div>

      <MovieFormModal
        show={showAdd || !!editing}
        editing={editing}
        newMovie={newMovie}
        genres={genres}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        onChange={(movie) => {
          if (editing) setEditing(movie);
          else setNewMovie(movie);
        }}
        onSubmit={() => {
          if (editing) void handleUpdateMovie();
          else void handleAddMovie();
        }}
      />

      <MovieDetailsModal movie={detailMovie} genres={genres} onClose={() => setDetailMovie(null)} />

      <ConfirmationModal
        isOpen={confirmDeleteMovieId !== null}
        title="Delete movie"
        message="This movie will be deleted from the active catalog. You can restore it later from the same workspace."
        actionLabel="Delete"
        isDangerous
        isLoading={isProcessing}
        onConfirm={handleConfirmDeleteMovie}
        onCancel={() => setConfirmDeleteMovieId(null)}
      />
    </>
  );
}
