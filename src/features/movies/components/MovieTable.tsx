import { type Genre, type Movie } from "@/shared/types/entities";
import { getGenreIcon } from "@/shared/utils/genreIcons";
import AppButton from "@/shared/components/ui/AppButton";
import { StatusPill } from "@/shared/components/ui/DashboardPrimitives";
import { TableRowWithHover } from "@/shared/components/ui/TableRowHoverEffect";

interface MovieTableProps {
  movies: Movie[];
  genres: Genre[];
  onEdit: (movie: Movie) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onDetail: (movie: Movie) => void;
}

function getReleaseState(premiereDate: string) {
  const premiere = new Date(premiereDate);
  const now = new Date();
  const oneMonthLater = new Date(premiere);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  if (premiere <= now && now <= oneMonthLater) return "Now showing";
  if (new Date(premiereDate) > new Date()) return "Coming soon";
  return "Ended";
}

export default function MovieTable({ movies, genres, onEdit, onDelete, onRestore, onDetail }: MovieTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="dashboard-table min-w-[980px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <th>Poster</th>
            <th>Title</th>
            <th>Genres</th>
            <th>Duration</th>
            <th>Year</th>
            <th>Rating</th>
            <th>Release</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => {
            const releaseState = getReleaseState(movie.premiere_date);
            return (
              <TableRowWithHover key={movie.id} deleted={movie.deleted}>
                <td>
                  {movie.poster ?? movie.images?.[0]?.url ? (
                    <img
                      src={movie.poster ?? movie.images?.[0]?.url}
                      alt={movie.title}
                      className="h-16 w-12 rounded-xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700">
                      N/A
                    </div>
                  )}
                </td>
                <td>
                  <div className="font-semibold text-slate-900 dark:text-white">{movie.title}</div>
                  <div className="helper-copy max-w-[240px]">{movie.description?.slice(0, 76) || "No description available."}</div>
                </td>
                <td>
                  <div className="flex max-w-[220px] flex-wrap gap-2">
                    {(Array.isArray(movie.genre_ids) ? movie.genre_ids : [])
                      .map((id) => genres.find((genre) => genre.genre_id === id))
                      .filter(Boolean)
                      .map((genre) => (
                        <span
                          key={genre!.genre_id}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-700/60 dark:bg-sky-500/12 dark:text-sky-100"
                        >
                          {getGenreIcon(genre!.icon)}
                          {genre!.genre_name}
                        </span>
                      ))}
                  </div>
                </td>
                <td>{movie.duration} min</td>
                <td>{movie.premiere_date.slice(0, 4)}</td>
                <td>{typeof movie.rating === "number" ? movie.rating.toFixed(1) : "N/A"}</td>
                <td>
                  <StatusPill tone={releaseState === "Now showing" ? "success" : releaseState === "Coming soon" ? "info" : "neutral"}>{releaseState}</StatusPill>
                </td>
                <td>
                  {movie.deleted ? <StatusPill tone="danger">Deleted</StatusPill> : <StatusPill tone="success">Active</StatusPill>}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <AppButton color="default" variant="soft" size="sm" onClick={() => onDetail(movie)}>
                      Details
                    </AppButton>
                    {movie.deleted ? (
                      <AppButton color="success" variant="soft" size="sm" onClick={() => onRestore(movie.id)}>
                        Restore
                      </AppButton>
                    ) : (
                      <>
                        <AppButton color="primary" variant="soft" size="sm" onClick={() => onEdit(movie)}>
                          Edit
                        </AppButton>
                        <AppButton color="danger" variant="soft" size="sm" onClick={() => onDelete(movie.id)}>
                          Delete
                        </AppButton>
                      </>
                    )}
                  </div>
                </td>
              </TableRowWithHover>
            );
          })}
          {movies.length === 0 && (
            <tr>
              <td colSpan={9} className="py-10 text-center text-slate-400">No movies found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
