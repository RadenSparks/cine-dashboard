import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import {
  fetchGenres,
  addGenreAsync,
  updateGenreAsync,
  deleteGenreAsync,
  restoreGenreAsync,
} from "../../store/genresSlice";
import { useState, useMemo, useEffect, useRef } from "react";
import { genreIconMap } from "../../utils/genreIcons";
import Loading from "../../components/UI/Loading";
import { SatelliteToast } from "../../components/UI/SatelliteToast";
import AddGenreForm from "./components/AddGenreForm";
import GenreGrid from "./components/GenreGrid";
import GenreStack from "./components/GenreStack";

// List of available icons for dropdowns and selection
const availableIcons = Object.entries(genreIconMap).map(([name, icon]) => ({ name, icon }));

export default function GenresPage() {
  const { items: genres, loading } = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();
  const [newGenreName, setNewGenreName] = useState("");
  const [stackMode, setStackMode] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].name);
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");
  const [editingGenreIcon, setEditingGenreIcon] = useState(availableIcons[0].name);
  const [showDeleted, setShowDeleted] = useState(false);

  // Satellite toast ref
  const toastRef = useRef<{ showNotification: (options: Omit<unknown, "id">) => void }>(null);

  // Fetch genres on mount
  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  // Add genre with selected icon
  const handleAddGenre = async () => {
    if (newGenreName && !genres.some(g => g.genre_name === newGenreName)) {
      const newId = genres.length ? Math.max(...genres.map(g => g.genre_id)) + 1 : 1;
      try {
        await dispatch(addGenreAsync({ genre_id: newId, genre_name: newGenreName, icon: selectedIcon })).unwrap();
        setNewGenreName("");
        setSelectedIcon(availableIcons[0].name);
        toastRef.current?.showNotification({
          title: "Genre Added",
          content: `Genre "${newGenreName}" was added successfully.`,
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 3000,
        });
      } catch {
        toastRef.current?.showNotification({
          title: "Error",
          content: "Failed to add genre.",
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 3000,
        });
      }
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

  const handleDeleteGenre = async (genre_id: number) => {
    if (typeof genre_id !== "number") return;
    try {
      await dispatch(deleteGenreAsync(genre_id)).unwrap();
      toastRef.current?.showNotification({
        title: "Genre Deleted",
        content: `Genre deleted.`,
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to delete genre.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    }
  };

  const handleRestoreGenre = async (genre_id: number) => {
    if (typeof genre_id !== "number") return;
    try {
      await dispatch(restoreGenreAsync(genre_id)).unwrap();
      toastRef.current?.showNotification({
        title: "Genre Restored",
        content: `Genre restored successfully.`,
        accentColor: "#22c55e",
        position: "bottom-right",
        longevity: 3000,
      });
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to restore genre.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    }
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
  const handleUpdateGenre = async () => {
    if (
      editingGenreId !== null &&
      typeof editingGenreId === "number" &&
      editingGenreName.trim() &&
      !genres.some(
        g =>
          g.genre_name === editingGenreName.trim() &&
          g.genre_id !== editingGenreId
      )
    ) {
      try {
        await dispatch(
          updateGenreAsync({
            genre_id: editingGenreId,
            genre_name: editingGenreName.trim(),
            icon: editingGenreIcon,
          })
        ).unwrap();
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
      } catch {
        toastRef.current?.showNotification({
          title: "Error",
          content: "Failed to update genre.",
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 3000,
        });
      }
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

  // Update: Use only g.genre_name for filtering, since your Genre type does not have 'name'
  const filteredGenres = useMemo(
    () =>
      genres
        .filter(g => showDeleted ? g.deleted : !g.deleted)
        .filter(g =>
          (g.genre_name ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
        ),
    [genres, search, showDeleted]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          🎭 Genres
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Manage movie genres and organize your catalog</p>
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
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-200 font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
              {showDeleted ? "Deleted Genres" : "Genres List"}
            </h3>
            {!stackMode && (
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search genres by name"
                className="border px-4 py-2 rounded-lg w-full md:w-64 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none font-farro" style={{ fontFamily: 'Farro, sans-serif' }}
              />
            )}
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg font-semibold text-sm shadow transition w-full md:w-auto font-red-rose` + (
                  showDeleted
                    ? " bg-red-100 text-red-700 hover:bg-red-200"
                    : " bg-blue-100 text-blue-700 hover:bg-blue-200"
                )}
                onClick={() => {
                  setShowDeleted(!showDeleted);
                  setSearch("");
                }}
                style={{ fontFamily: 'Red Rose, sans-serif' }}
              >
                {showDeleted ? "Show Active" : "Show Deleted"}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm shadow hover:bg-blue-200 transition w-full md:w-auto font-red-rose"
                onClick={() => setStackMode(!stackMode)}
                style={{ fontFamily: 'Red Rose, sans-serif' }}
              >
                {stackMode ? "Show Grid View" : "Show Stack Cards"}
              </button>
            </div>
          </div>
          <hr className="mb-8 border-blue-100 dark:border-zinc-800" />
          {stackMode ? (
            <GenreStack
              genres={genres}
              onRestore={handleRestoreGenre}
              onDelete={handleDeleteGenre}
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
              onDelete={handleDeleteGenre}
              onRestore={handleRestoreGenre}
              onUpdateIcon={handleUpdateGenre}
            />
          )}
        </div>
      </div>
    </div>
  );
}