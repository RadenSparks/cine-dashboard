import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { addGenre, softDeleteGenre, restoreGenre, updateGenre, updateGenreIcon } from "../../store/genresSlice";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { genreIconMap } from "../../utils/genreIcons";
import Loading from "../../components/UI/Loading";
import { SatelliteToast } from "../../components/UI/SatelliteToast";
import AddGenreForm from "./components/AddGenreForm";
import GenreGrid from "./components/GenreGrid";
import GenreStack from "./components/GenreStack";

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
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");
  const [editingGenreIcon, setEditingGenreIcon] = useState(availableIcons[0].name);

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
        position: "bottom-right",
        longevity: 3000,
      });
    } else {
      toastRef.current?.showNotification({
        title: "Genre Exists",
        content: `Genre "${newGenreName}" already exists.`,
        accentColor: "#f59e42",
        position: "bottom-right",
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
      position: "bottom-right",
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
      position: "bottom-right",
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
      position: "bottom-right",
      longevity: 2000,
    });
  };

  // Edit genre - populate fields for editing
  const handleEditGenre = (genre_id: number) => {
    const genre = genres.find(g => g.genre_id === genre_id);
    if (genre) {
      setEditingGenreId(genre.genre_id);
      setEditingGenreName(genre.genre_name);
      setEditingGenreIcon(genre.icon || availableIcons[0].name);
    }
  };

  // Update genre (name and icon)
  const handleUpdateGenre = () => {
    if (
      editingGenreId !== null &&
      editingGenreName.trim() &&
      !genres.some(
        g =>
          g.genre_name === editingGenreName.trim() &&
          g.genre_id !== editingGenreId
      )
    ) {
      dispatch(
        updateGenre({
          genre_id: editingGenreId,
          genre_name: editingGenreName.trim(),
          icon: editingGenreIcon,
        })
      );
      toastRef.current?.showNotification({
        title: "Genre Updated",
        content: `Genre "${editingGenreName}" was updated.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 3000,
      });
      setEditingGenreId(null);
      setEditingGenreName("");
      setEditingGenreIcon(availableIcons[0].name);
    } else {
      toastRef.current?.showNotification({
        title: "Update Failed",
        content: "Genre name must be unique and not empty.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
          🎭 Genre
        </h2>
        <AddGenreForm
          newGenreName={newGenreName}
          setNewGenreName={setNewGenreName}
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          availableIcons={availableIcons}
          onAdd={handleAddGenre}
        />
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
            <GenreStack
              genres={genres}
              onRestore={handleRestoreGenre}
              onDelete={handleSoftDeleteGenre}
            />
          ) : (
            <GenreGrid
              genres={filteredGenres}
              availableIcons={availableIcons}
              editingGenreId={editingGenreId}
              setEditingGenreId={setEditingGenreId}
              editingGenreName={editingGenreName}
              setEditingGenreName={setEditingGenreName}
              editingGenreIcon={editingGenreIcon}
              setEditingGenreIcon={setEditingGenreIcon}
              onEdit={handleEditGenre}
              onUpdate={handleUpdateGenre}
              onDelete={handleSoftDeleteGenre}
              onRestore={handleRestoreGenre}
              onUpdateIcon={handleUpdateGenreIcon}
            />
          )}
        </div>
      </div>
    </div>
  );
}