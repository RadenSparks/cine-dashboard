import type { Genre, Movie } from "@/shared/types/entities";
import MovieTable from "./MovieTable";
import { Pagination } from "@/shared/components/ui/DashboardPrimitives";

interface MoviesTableContainerProps {
  movies: Movie[];
  genres: Genre[];
  loading?: boolean;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  onPageChange?: (page: number) => void;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movieId: number) => void;
  onRestore?: (movieId: number) => void;
  onViewDetails?: (movie: Movie) => void;
}

export default function MoviesTableContainer({
  movies,
  genres,
  loading,
  totalPages,
  currentPage,
  totalElements,
  onPageChange,
  onEdit,
  onDelete,
  onRestore,
  onViewDetails,
}: MoviesTableContainerProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && !loading) {
      onPageChange?.(newPage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/82">
        <MovieTable
          movies={movies}
          genres={genres}
          onEdit={onEdit ?? (() => {})}
          onDelete={onDelete ?? (() => {})}
          onRestore={onRestore ?? (() => {})}
          onDetail={onViewDetails ?? (() => {})}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/78">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{totalElements}</span> catalog records
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} loading={loading} className="border-none bg-transparent p-0 shadow-none" />
      </div>
    </div>
  );
}
