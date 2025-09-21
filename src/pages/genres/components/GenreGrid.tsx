import GenreCard from "./GenreCard";
import { type Genre } from "../../../entities/type";

type IconOption = { name: string; icon: React.ReactNode };

interface GenreGridProps {
  genres: Genre[];
  availableIcons: IconOption[];
  editingGenreId: number | null;
  setEditingGenreId: (id: number | null) => void;
  editingGenreName: string;
  setEditingGenreName: (name: string) => void;
  editingGenreIcon: string;
  setEditingGenreIcon: (icon: string) => void;
  onEdit: (id: number) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onUpdateIcon: (id: number, icon: string) => void;
}

export default function GenreGrid({
  genres,
  availableIcons,
  editingGenreId,
  setEditingGenreId,
  editingGenreName,
  setEditingGenreName,
  editingGenreIcon,
  setEditingGenreIcon,
  onEdit,
  onUpdate,
  onDelete,
  onRestore,
  onUpdateIcon,
}: GenreGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {genres.map((genre) => (
        <GenreCard
          key={genre.genre_id}
          genre={genre}
          availableIcons={availableIcons}
          editingGenreId={editingGenreId}
          setEditingGenreId={setEditingGenreId}
          editingGenreName={editingGenreName}
          setEditingGenreName={setEditingGenreName}
          editingGenreIcon={editingGenreIcon}
          setEditingGenreIcon={setEditingGenreIcon}
          onEdit={onEdit}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onRestore={onRestore}
          onUpdateIcon={onUpdateIcon}
        />
      ))}
    </div>
  );
}