import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { addGenre, softDeleteGenre, restoreGenre, updateGenreIcon } from "../../store/genresSlice";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Undo2Icon, Trash2Icon } from "lucide-react";
import { CardStack } from "../../components/UI/CardStack";
import { genreIconMap, getGenreIcon } from "../../utils/genreIcons";
import AppButton from "../../components/UI/AppButton";
import Loading from "../../components/UI/Loading";
import { SatelliteToast } from "../../components/UI/SatelliteToast";

// List of available icons for dropdowns and selection
const availableIcons = Object.entries(genreIconMap).map(([name, icon]) => ({ name, icon }));

export default function GenresPage() {
  const genres = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();
  const [newGenreName, setNewGenreName] = useState("");
  const [stackMode, setStackMode] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].name);
  const [loading, setLoading] = useState(true);

  // Satellite toast ref
  const toastRef = useRef<{ showNotification: (options: Omit<unknown, "id">) => void }>(null);

  // Simulate loading or wait for data fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Add genre with selected icon
  const handleAddGenre = () => {
    if (newGenreName && !genres.some(g => g.genre_name === newGenreName)) {
      const newId = genres.length ? Math.max(...genres.map(g => g.genre_id)) + 1 : 1;
      dispatch(addGenre({ genre_id: newId, genre_name: newGenreName, icon: selectedIcon }));
      setNewGenreName("");
      setSelectedIcon(availableIcons[0].name);
      toastRef.current?.showNotification({
        title: "Genre Added",
        content: `Genre "${newGenreName}" was added successfully.`,
        accentColor: "#22c55e",
        position: "top-right",
        longevity: 3000,
      });
    } else {
      toastRef.current?.showNotification({
        title: "Genre Exists",
        content: `Genre "${newGenreName}" already exists.`,
        accentColor: "#f59e42",
        position: "top-right",
        longevity: 3000,
      });
    }
  };

  const handleSoftDeleteGenre = useCallback((genre_id: number) => {
    dispatch(softDeleteGenre(genre_id));
    const genre = genres.find(g => g.genre_id === genre_id);
    toastRef.current?.showNotification({
      title: "Genre Deleted",
      content: `Genre "${genre?.genre_name}" was deleted.`,
      accentColor: "#ef4444",
      position: "top-right",
      longevity: 3000,
    });
  }, [dispatch, genres]);

  const handleRestoreGenre = useCallback((genre_id: number) => {
    dispatch(restoreGenre(genre_id));
    const genre = genres.find(g => g.genre_id === genre_id);
    toastRef.current?.showNotification({
      title: "Genre Restored",
      content: `Genre "${genre?.genre_name}" was restored.`,
      accentColor: "#22c55e",
      position: "top-right",
      longevity: 3000,
    });
  }, [dispatch, genres]);

  // Update icon for existing genre (Redux)
  const handleUpdateGenreIcon = (genre_id: number, iconName: string) => {
    dispatch(updateGenreIcon({ genre_id, icon: iconName }));
    const genre = genres.find(g => g.genre_id === genre_id);
    toastRef.current?.showNotification({
      title: "Icon Updated",
      content: `Icon for "${genre?.genre_name}" updated.`,
      accentColor: "#2563eb",
      position: "top-right",
      longevity: 2000,
    });
  };

  // Memoize the stack cards for performance
  const STACK_CARDS = useMemo(() =>
    genres.map(genre => ({
      id: genre.genre_id,
      name: genre.genre_name,
      designation: genre.deleted ? "Deleted" : "Active",
      content: (
        <div className="flex flex-col items-center gap-2">
          <div className="mb-3">
            {getGenreIcon(genre.icon)}
          </div>
          <span className="font-bold text-xl mb-2 text-blue-700 dark:text-blue-200">{genre.genre_name}</span>
          <div className="flex gap-2 mt-2">
            {genre.deleted ? (
              <button
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600/80 text-white font-semibold text-sm shadow hover:bg-green-500 transition"
                onClick={() => handleRestoreGenre(genre.genre_id)}
              >
                <Undo2Icon className="w-4 h-4" />
                Restore
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600/80 text-white font-semibold text-sm shadow hover:bg-red-500 transition"
                onClick={() => handleSoftDeleteGenre(genre.genre_id)}
                disabled={genres.filter(g => !g.deleted).length === 1}
                title={genres.filter(g => !g.deleted).length === 1 ? "At least one active genre required" : ""}
              >
                <Trash2Icon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      ),
    }))
  , [genres, handleRestoreGenre, handleSoftDeleteGenre]);

  // Filter genres by search in grid view
  const filteredGenres = useMemo(() =>
    genres.filter(g =>
      g.genre_name.toLowerCase().includes(search.toLowerCase())
    ),
    [genres, search]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10">
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
          🎭 Genre
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-blue-100 dark:border-zinc-800 p-8 mb-10">
          <h3 className="text-xl font-bold mb-6 text-blue-700 dark:text-blue-200">Add New Genre</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={newGenreName}
              onChange={e => setNewGenreName(e.target.value)}
              placeholder="Add genre"
              className="border px-4 py-2 rounded-lg w-full text-base focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            {/* Streamlined icon selection */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="border rounded-lg px-2 py-2 text-base bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-200"
                value={selectedIcon}
                onChange={e => setSelectedIcon(e.target.value)}
                aria-label="Select genre icon"
              >
                {availableIcons.map(iconObj => (
                  <option key={iconObj.name} value={iconObj.name}>
                    {iconObj.name}
                  </option>
                ))}
              </select>
              <span className="ml-2">{getGenreIcon(selectedIcon)}</span>
            </div>
            <AppButton
              color="success"
              className="w-full sm:w-auto"
              onClick={handleAddGenre}
            >
              Add
            </AppButton>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-blue-100 dark:border-zinc-800 p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-200">Genres List</h3>
            {!stackMode && (
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search genres by name"
                className="border px-4 py-2 rounded-lg w-full md:w-64 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            )}
            <button
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm shadow hover:bg-blue-200 transition w-full md:w-auto"
              onClick={() => setStackMode(!stackMode)}
            >
              {stackMode ? "Show Grid View" : "Show Stack Cards"}
            </button>
          </div>
          <hr className="mb-8 border-blue-100 dark:border-zinc-800" />
          {stackMode ? (
            <div className="flex items-center justify-center min-h-[32rem]">
              <CardStack items={STACK_CARDS} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredGenres.map(genre => (
                <div
                  key={genre.genre_id}
                  className={`bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-blue-100 dark:border-zinc-800 p-6 flex flex-col items-center justify-between min-h-[260px] transition hover:shadow-xl ${genre.deleted ? "opacity-60 grayscale" : ""}`}
                >
                  <div className="mb-3 flex flex-col items-center">
                    {getGenreIcon(genre.icon)}
                  </div>
                  <span className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-200">{genre.genre_name}</span>
                  {/* Dropdown for icon selection */}
                  <div className="flex items-center gap-2 mb-2 w-full justify-center">
                    <select
                      className="border rounded-lg px-2 py-1 text-base bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-200"
                      value={genre.icon || availableIcons[0].name}
                      onChange={e => handleUpdateGenreIcon(genre.genre_id, e.target.value)}
                      disabled={genre.deleted}
                    >
                      {availableIcons.map(iconObj => (
                        <option key={iconObj.name} value={iconObj.name}>
                          {iconObj.name}
                        </option>
                      ))}
                    </select>
                    <span className="ml-2">
                      {getGenreIcon(genre.icon)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {genre.deleted ? (
                      <AppButton
                        color="success"
                        onClick={() => handleRestoreGenre(genre.genre_id)}
                        icon={<Undo2Icon className="w-5 h-5" />}
                      >
                        Restore
                      </AppButton>
                    ) : (
                      <AppButton
                        color="danger"
                        disabled={genres.filter(g => !g.deleted).length === 1}
                        title={genres.filter(g => !g.deleted).length === 1 ? "At least one active genre required" : ""}
                        onClick={() => handleSoftDeleteGenre(genre.genre_id)}
                        icon={<Trash2Icon className="w-5 h-5" />}
                      >
                        Delete
                      </AppButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}