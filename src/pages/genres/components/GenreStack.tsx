import { CardStack } from "../../../components/UI/CardStack";
import { getGenreIcon } from "../../../utils/genreIcons";
import { Undo2Icon, Trash2Icon } from "lucide-react";
import { type Genre } from "../../../entities/type";

interface GenreStackProps {
  genres: Genre[];
  onRestore: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function GenreStack({ genres, onRestore, onDelete }: GenreStackProps) {
  const STACK_CARDS = genres.map((genre) => ({
    id: genre.genre_id,
    name: genre.genre_name,
    designation: genre.deleted ? "Deleted" : "Active",
    content: (
      <div className="flex flex-col items-center gap-2">
        <div className="mb-3">{getGenreIcon(genre.icon)}</div>
        <span className="font-bold text-xl mb-2 text-blue-700 dark:text-blue-200">{genre.genre_name}</span>
        <div className="flex gap-2 mt-2">
          {genre.deleted ? (
            <button
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600/80 text-white font-semibold text-sm shadow hover:bg-green-500 transition"
              onClick={() => onRestore(genre.genre_id)}
              disabled
            >
              <Undo2Icon className="w-4 h-4" />
              Restore
            </button>
          ) : (
            <button
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600/80 text-white font-semibold text-sm shadow hover:bg-red-500 transition"
              onClick={() => onDelete(genre.genre_id)}
            >
              <Trash2Icon className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <div className="flex items-center justify-center min-h-[32rem]">
      <CardStack items={STACK_CARDS} />
    </div>
  );
}