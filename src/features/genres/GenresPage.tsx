import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tags } from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addGenreAsync,
  deleteGenreAsync,
  fetchGenres,
  restoreGenreAsync,
  updateGenreAsync,
} from "@/store/slices";
import { genreIconMap } from "@/shared/utils/genreIcons";
import Loading from "@/shared/components/ui/Loading";
import { SatelliteToast, type ToastNotification } from "@/shared/components/ui/SatelliteToast";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import AddGenreForm from "./components/AddGenreForm";
import GenreGrid from "./components/GenreGrid";
import GenreStack from "./components/GenreStack";
import { PageIntro, SectionCard } from "@/shared/components/ui/DashboardPrimitives";

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
  const [confirmDeleteGenreId, setConfirmDeleteGenreId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);



  const handleAddGenre = async () => {
    if (newGenreName && !genres.some((genre) => genre.genre_name === newGenreName)) {
      const newId = genres.length ? Math.max(...genres.map((genre) => genre.genre_id)) + 1 : 1;
      try {
        await dispatch(addGenreAsync({ genre_id: newId, genre_name: newGenreName, icon: selectedIcon })).unwrap();
        setNewGenreName("");
        setSelectedIcon(availableIcons[0].name);
        toastRef.current?.showNotification({ title: "Genre added", content: `Genre "${newGenreName}" was added successfully.`, accentColor: "#22c55e", position: "bottom-right", longevity: 3000 });
      } catch {
        toastRef.current?.showNotification({ title: "Error", content: "Failed to add genre.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
      }
    } else {
      toastRef.current?.showNotification({ title: "Genre exists", content: `Genre "${newGenreName}" already exists.`, accentColor: "#f59e0b", position: "bottom-right", longevity: 3000 });
    }
  };

  const handleConfirmDeleteGenre = async () => {
    if (confirmDeleteGenreId === null) return;
    setIsProcessing(true);
    try {
      await dispatch(deleteGenreAsync(confirmDeleteGenreId)).unwrap();
      toastRef.current?.showNotification({ title: "Genre deleted", content: "Genre deleted. Use the deleted view to restore it.", accentColor: "#22c55e", position: "bottom-right", longevity: 3000 });
    } catch {
      toastRef.current?.showNotification({ title: "Error", content: "Failed to delete genre.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
    } finally {
      setIsProcessing(false);
      setConfirmDeleteGenreId(null);
    }
  };

  const handleRestoreGenre = async (genreId: number) => {
    try {
      await dispatch(restoreGenreAsync(genreId)).unwrap();
      toastRef.current?.showNotification({ title: "Genre restored", content: "Genre restored successfully.", accentColor: "#22c55e", position: "bottom-right", longevity: 3000 });
    } catch {
      toastRef.current?.showNotification({ title: "Error", content: "Failed to restore genre.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
    }
  };

  const handleEditGenre = (genreId: number) => {
    const genre = genres.find((item) => item.genre_id === genreId);
    if (!genre) return;
    setEditingGenreId(genre.genre_id);
    setEditingGenreName(genre.genre_name);
    setEditingGenreIcon(genre.icon || availableIcons[0].name);
  };

  const handleUpdateGenre = async () => {
    if (editingGenreId !== null && editingGenreName.trim() && !genres.some((genre) => genre.genre_name === editingGenreName.trim() && genre.genre_id !== editingGenreId)) {
      try {
        await dispatch(updateGenreAsync({ genre_id: editingGenreId, genre_name: editingGenreName.trim(), icon: editingGenreIcon })).unwrap();
        toastRef.current?.showNotification({ title: "Genre updated", content: `Genre "${editingGenreName}" was updated.`, accentColor: "#2563eb", position: "bottom-right", longevity: 3000 });
        setEditingGenreId(null);
        setEditingGenreName("");
        setEditingGenreIcon(availableIcons[0].name);
      } catch {
        toastRef.current?.showNotification({ title: "Error", content: "Failed to update genre.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
      }
    } else {
      toastRef.current?.showNotification({ title: "Update failed", content: "Genre name must be unique and not empty.", accentColor: "#ef4444", position: "bottom-right", longevity: 3000 });
    }
  };

  const filteredGenres = useMemo(
    () =>
      genres
        .filter((genre) => (showDeleted ? genre.deleted : !genre.deleted))
        .filter((genre) => (genre.genre_name ?? "").toLowerCase().includes(search.toLowerCase())),
    [genres, search, showDeleted],
  );

  if (loading) return <Loading fullscreen={false} />;

  return (
    <div className="w-full space-y-6">
      <SatelliteToast ref={toastRef} />
      <PageIntro
        eyebrow="Catalog taxonomy"
        title="Genres workspace"
        description="Maintain the genre system that powers catalog filters, labels, and discovery across the dashboard."
        icon={Tags}
        showEvervault={true}
      />

      <AddGenreForm
        newGenreName={newGenreName}
        setNewGenreName={setNewGenreName}
        selectedIcon={selectedIcon}
        setSelectedIcon={setSelectedIcon}
        availableIcons={availableIcons}
        onAdd={handleAddGenre}
      />

      <SectionCard
        title={showDeleted ? "Deleted genres" : "Genre library"}
        description="Search, edit, delete, restore, or switch presentation modes without changing the underlying genre CRUD behavior."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="status-pill-info"
              onClick={() => {
                setShowDeleted(!showDeleted);
                setSearch("");
              }}
            >
              {showDeleted ? "Show active" : "Show deleted"}
            </button>
            <button type="button" className="status-pill-warning" onClick={() => setStackMode(!stackMode)}>
              {stackMode ? "Grid view" : "Stack cards"}
            </button>
          </div>
        }
      >
        {!stackMode ? (
          <div className="mb-6 max-w-sm">
            <label className="field-label">Search genres</label>
            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search genres by name" />
          </div>
        ) : null}

        {stackMode ? (
          <GenreStack genres={genres} onRestore={handleRestoreGenre} onDelete={(genreId) => setConfirmDeleteGenreId(genreId)} />
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
            onDelete={(genreId) => setConfirmDeleteGenreId(genreId)}
            onRestore={handleRestoreGenre}
            onUpdateIcon={handleUpdateGenre}
          />
        )}
      </SectionCard>

      <ConfirmationModal
        isOpen={confirmDeleteGenreId !== null}
        title="Delete genre"
        message="This genre will be removed from the active catalog. You can restore it later from the deleted view."
        actionLabel="Delete"
        isDangerous
        isLoading={isProcessing}
        onConfirm={handleConfirmDeleteGenre}
        onCancel={() => setConfirmDeleteGenreId(null)}
      />
    </div>
  );
}
