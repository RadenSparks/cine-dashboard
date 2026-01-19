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
        <div className="flex flex-col items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex gap-1 flex-wrap justify-center">
            {(() => {
              const pages: (number | string)[] = [];
              const maxVisible = 5;
              
              if (totalPages <= maxVisible) {
                for (let i = 0; i < totalPages; i++) pages.push(i);
              } else {
                pages.push(0);
                const startPage = Math.max(1, currentPage - 1);
                const endPage = Math.min(totalPages - 2, currentPage + 1);
                
                if (startPage > 1) pages.push('...');
                for (let i = startPage; i <= endPage; i++) pages.push(i);
                if (endPage < totalPages - 2) pages.push('...');
                pages.push(totalPages - 1);
              }
              return pages;
            })().map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border border-blue-700'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  type="button"
                >
                  {(page as number) + 1}
                </button>
              )
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviesTableContainer;
