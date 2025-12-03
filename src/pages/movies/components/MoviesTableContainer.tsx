import React from "react";
import MovieTable from "./MovieTable";
import type { Movie, Genre } from "../../../entities/type";

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

const MoviesTableContainer: React.FC<MoviesTableContainerProps> = ({
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
}) => {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && !loading) {
      onPageChange?.(newPage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-blue-200 dark:border-zinc-700 shadow-sm">
        <MovieTable
          movies={movies}
          genres={genres}
          onEdit={onEdit ?? (() => {})}
          onDelete={onDelete ?? (() => {})}
          onRestore={onRestore ?? (() => {})}
          onDetail={onViewDetails ?? (() => {})}
        />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages} • {totalElements} total movies
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              type="button"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || loading}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesTableContainer;
