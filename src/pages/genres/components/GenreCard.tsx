import { getGenreIcon } from "../../../utils/genreIcons";
import AppButton from "../../../components/UI/AppButton";
import { type Genre } from "../../../entities/type";

type IconOption = { name: string; icon: React.ReactNode };

interface GenreCardProps {
  genre: Genre;
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

export default function GenreCard({
  genre,
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
}: GenreCardProps) {
  const isEditing = editingGenreId === genre.genre_id;

  // When editing, update the genre's icon in real time for preview
  const currentIcon = isEditing ? editingGenreIcon : genre.icon;

  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-blue-100 dark:border-zinc-800 p-6 flex flex-col items-center justify-between min-h-[260px] transition hover:shadow-xl ${genre.deleted ? "opacity-60 grayscale" : ""}`}
    >
      <div className="mb-3 flex flex-col items-center">
        {getGenreIcon(currentIcon)}
        {isEditing && (
          <span className="text-xs text-blue-500 dark:text-blue-300 mt-1">
            Preview
          </span>
        )}
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editingGenreName}
            onChange={e => setEditingGenreName(e.target.value)}
            className="border rounded-lg px-2 py-1 text-base mb-2 w-full text-blue-700 dark:text-blue-200 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
            disabled={genre.deleted}
          />
          <select
            className="border rounded-lg px-2 py-1 text-base bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-200 mb-2 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
            value={editingGenreIcon}
            onChange={e => setEditingGenreIcon(e.target.value)}
            disabled={genre.deleted}
          >
            {availableIcons.map((iconObj) => (
              <option key={iconObj.name} value={iconObj.name}>
                {iconObj.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <AppButton color="success" onClick={onUpdate} disabled={genre.deleted}>
              Update
            </AppButton>
            <AppButton color="danger" onClick={() => setEditingGenreId(null)}>
              Cancel
            </AppButton>
          </div>
        </>
      ) : (
        <>
          <span className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-200 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>
            {genre.genre_name}
          </span>
          <div className="flex gap-2 mt-2">
            <AppButton
              color="primary"
              onClick={() => onEdit(genre.genre_id)}
              disabled={genre.deleted}
            >
              Edit
            </AppButton>
            {genre.deleted ? (
              <AppButton
                color="success"
                onClick={() => onRestore(genre.genre_id)}
              >
                Restore
              </AppButton>
            ) : (
              <AppButton
                color="danger"
                onClick={() => onDelete(genre.genre_id)}
              >
                Delete
              </AppButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}