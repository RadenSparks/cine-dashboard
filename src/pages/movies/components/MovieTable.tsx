import React from "react";
import { FilmIcon, RocketLaunchIcon, FaceSmileIcon } from "@heroicons/react/24/solid";
import { ActivityIcon, SwordsIcon, VenetianMaskIcon } from "lucide-react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { type Movie } from "../../../store/moviesSlice";

type Genre = {
  genre_id: number;
  genre_name: string;
};

const genreIcons: Record<string, React.ReactElement> = {
  "Action": <SwordsIcon className="w-4 h-4 mr-1 inline" />,
  "Sci-Fi": <RocketLaunchIcon className="w-4 h-4 mr-1 inline" />,
  "Comedy": <FaceSmileIcon className="w-4 h-4 mr-1 inline" />,
  "Drama": <VenetianMaskIcon className="w-4 h-4 mr-1 inline" />,
  "Crime": <ActivityIcon className="w-4 h-4 mr-1 inline" />,
};

interface MovieTableProps {
  movies: Movie[];
  genres: Genre[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onDetail: (movie: Movie) => void;
}

export default function MovieTable({
  movies,
  genres,
  onEdit,
  onDelete,
  onRestore,
  onDetail,
}: MovieTableProps) {
  function isNowShowing(premiere_date: string): boolean {
    const premiere = new Date(premiere_date);
    const now = new Date();
    const oneMonthLater = new Date(premiere);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return premiere <= now && now <= oneMonthLater;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow w-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-blue-50 dark:bg-zinc-800">
            <th className="p-3 text-left font-semibold">Poster</th>
            <th className="p-3 text-left font-semibold">Title</th>
            <th className="p-3 text-left font-semibold">Genre</th>
            <th className="p-3 text-left font-semibold">Duration</th>
            <th className="p-3 text-left font-semibold">Year</th>
            <th className="p-3 text-left font-semibold">Now Showing</th> {/* New column */}
            <th className="p-3 text-left font-semibold">Description</th>
            <th className="p-3 text-left font-semibold">Status</th>
            <th className="p-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr
              key={movie.movie_id}
              className={`border-t transition ${movie.deleted ? "opacity-60 bg-gray-100 dark:bg-zinc-800" : "hover:bg-blue-50 dark:hover:bg-zinc-800"}`}
            >
              <td className="p-3">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded shadow" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </td>
              <td className="p-3">{movie.title}</td>
              <td className="p-3">
                <div className="flex flex-col gap-1">
                  {movie.genre_ids.length > 0
                    ? movie.genre_ids
                        .map(id => genres.find(g => g.genre_id === id)?.genre_name)
                        .filter(Boolean)
                        .map(name => (
                          <span
                            key={name}
                            className="inline-flex items-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-semibold"
                          >
                            {typeof name === "string" && genreIcons[name] ? genreIcons[name] : <FilmIcon className="w-4 h-4 mr-1 inline" />}
                            {name}
                          </span>
                        ))
                    : <span className="text-gray-400">Unknown</span>
                  }
                </div>
              </td>
              <td className="p-3">{movie.duration} min</td>
              <td className="p-3">{movie.premiere_date.slice(0, 4)}</td>
              {/* Now Showing column */}
              <td className="p-3 text-center">
                {!movie.deleted && (
                  isNowShowing(movie.premiere_date) ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-bold animate-pulse">
                      Now Showing
                    </span>
                  ) : new Date(movie.premiere_date) > new Date() ? (
                    <span className="inline-block px-2 py-0.5 rounded bg-yellow-400 text-white text-xs font-bold">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-300 text-gray-700 text-xs font-semibold">
                      Ended
                    </span>
                  )
                )}
              </td>
              <td className="p-3">{movie.description ? movie.description.slice(0, 40) + (movie.description.length > 40 ? "..." : "") : "-"}</td>
              <td className="p-3">
                {movie.deleted ? (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 dark:bg-zinc-700 dark:text-gray-300">Deleted</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                )}
              </td>
              <td className="p-3 align-middle">
                <div className="flex gap-2 items-center">
                  <button
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center"
                    title="View Details"
                    onClick={() => onDetail(movie)}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    onClick={() => onEdit(movie)}
                    disabled={movie.deleted}
                    title={movie.deleted ? "Restore to edit" : "Edit"}
                  >
                    Edit
                  </button>
                  {movie.deleted ? (
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      onClick={() => onRestore(movie.movie_id)}
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      onClick={() => onDelete(movie.movie_id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {movies.length === 0 && (
            <tr>
              <td colSpan={9} className="p-3 text-center text-gray-400">No movies found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}