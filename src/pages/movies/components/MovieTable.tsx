import { type Movie } from "../../../entities/type";
import { getGenreIcon } from "../../../utils/genreIcons";
import AppButton from "../../../components/UI/AppButton";
import { type Genre } from "../../../entities/type";

interface MovieTableProps {
  movies: Movie[];
  genres: Genre[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onDetail: (movie: Movie) => void;
}

const MovieTable = ({ movies, genres, onEdit, onDelete, onDetail }: MovieTableProps) => {
  function isNowShowing(premiere_date: string): boolean {
    const premiere = new Date(premiere_date);
    const now = new Date();
    const oneMonthLater = new Date(premiere);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    return premiere <= now && now <= oneMonthLater;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow w-full hide-scrollbar">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-blue-50 dark:bg-zinc-800">
            <th className="p-3 text-left font-semibold w-24">Poster</th>
            <th className="p-3 text-left font-semibold w-56">Title</th>
            <th className="p-3 text-left font-semibold w-40">Genre</th>
            <th className="p-3 text-left font-semibold w-24">Duration</th>
            <th className="p-3 text-left font-semibold w-20">Year</th>
            <th className="p-3 text-left font-semibold w-20">Rating</th>
            <th className="p-3 text-center font-semibold w-32">Now Showing</th>
            <th className="p-3 text-left font-semibold w-24">Status</th>
            <th className="p-3 text-left font-semibold w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr
              key={movie.id}
              className={`border-t transition ${movie.deleted ? "opacity-60 bg-gray-100 dark:bg-zinc-800" : "hover:bg-blue-50 dark:hover:bg-zinc-800"}`}
            >
              <td className="p-3 w-24">
                {movie.poster ? (
                  <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded shadow" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </td>
              <td className="p-3 w-56">{movie.title}</td>
              <td className="p-3 w-40">
                <div className="flex flex-col gap-1">
                  {(Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0
                    ? movie.genre_ids
                    : [])
                    .map(id => genres.find(g => g.genre_id === id))
                    .filter(Boolean)
                    .map(genre => (
                      <span
                        key={genre!.genre_id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-200 via-blue-100 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 text-blue-900 dark:text-blue-100 font-semibold text-xs shadow-sm border border-blue-300 dark:border-blue-800"
                      >
                        {getGenreIcon(genre!.icon)}
                        {genre!.genre_name}
                      </span>
                    ))}
                </div>
              </td>
              <td className="p-3 w-24">{movie.duration} min</td>
              <td className="p-3 w-20">
                {typeof movie.premiere_date === "string" && movie.premiere_date.length >= 4
                  ? movie.premiere_date.slice(0, 4)
                  : <span className="text-gray-400">N/A</span>
                }
              </td>
              <td className="p-3 w-20">
                {typeof movie.rating === "number"
                  ? <span className="font-bold text-blue-700 dark:text-blue-200">{movie.rating.toFixed(1)}</span>
                  : <span className="text-gray-400">N/A</span>
                }
              </td>
              <td className="p-3 w-32 text-center">
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
              <td className="p-3 w-24">
                {movie.deleted ? (
                  <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Deleted</span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Active</span>
                )}
              </td>
              <td className="p-3 w-32">
                <div className="flex gap-2">
                  <AppButton color="primary" onClick={() => onDetail(movie)}>
                    Details
                  </AppButton>
                  <AppButton color="success" onClick={() => onEdit(movie)} disabled={movie.deleted}>
                    Edit
                  </AppButton>
                  <AppButton color="danger" onClick={() => onDelete(movie.id)} disabled={movie.deleted}>
                    Delete
                  </AppButton>
                  {/* If you implement restore, enable this button */}
                  {/* {movie.deleted && (
                    <AppButton color="success" onClick={() => onRestore(movie.id)}>
                      Restore
                    </AppButton>
                  )} */}
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
};

export default MovieTable;