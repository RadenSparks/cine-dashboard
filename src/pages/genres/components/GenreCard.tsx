import { getGenreIcon } from "../../../utils/genreIcons";
import AppButton from "../../../components/UI/AppButton";
import { Undo2Icon, Trash2Icon } from "lucide-react";
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
  onUpdateIcon,
}: GenreCardProps) {
  const isEditing = editingGenreId === genre.genre_id;
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-blue-100 dark:border-zinc-800 p-6 flex flex-col items-center justify-between min-h-[260px] transition hover:shadow-xl ${genre.deleted ? "opacity-60 grayscale" : ""}`}
    >
      <div className="mb-3 flex flex-col items-center">
        {getGenreIcon(genre.icon)}
      </div>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editingGenreName}
            onChange={e => setEditingGenreName(e.target.value)}
            className="border rounded-lg px-2 py-1 text-base mb-2 w-full text-blue-700 dark:text-blue-200"
          />
          <select
            className="border rounded-lg px-2 py-1 text-base bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-200 mb-2"
            value={editingGenreIcon}
            onChange={e => setEditingGenreIcon(e.target.value)}
          >
            {availableIcons.map((iconObj) => (
              <option key={iconObj.name} value={iconObj.name}>
                {iconObj.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <AppButton color="success" onClick={onUpdate}>
              Update
            </AppButton>
            <AppButton color="danger" onClick={() => setEditingGenreId(null)}>
              Cancel
            </AppButton>
          </div>
        </>
      ) : (
        <>
          <span className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-200">
            {genre.genre_name}
          </span>
          <div className="flex items-center gap-2 mb-2 w-full justify-center">
            <select
              className="border rounded-lg px-2 py-1 text-base bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-200"
              value={genre.icon || availableIcons[0].name}
              onChange={e => onUpdateIcon(genre.genre_id, e.target.value)}
              disabled={genre.deleted}
            >
              {availableIcons.map((iconObj) => (
                <option key={iconObj.name} value={iconObj.name}>
                  {iconObj.name}
                </option>
              ))}
            </select>
            <span className="ml-2">{getGenreIcon(genre.icon)}</span>
          </div>
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
                icon={<Undo2Icon className="w-5 h-5" />}
              >
                Restore
              </AppButton>
            ) : (
              <AppButton
                color="danger"
                onClick={() => onDelete(genre.genre_id)}
                icon={<Trash2Icon className="w-5 h-5" />}
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