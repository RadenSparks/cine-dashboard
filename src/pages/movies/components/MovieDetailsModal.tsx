import { AnimatePresence, motion } from "framer-motion";
import { type Movie } from "../../../entities/type";
import AppButton from "../../../components/UI/AppButton";
import { getGenreIcon } from "../../../utils/genreIcons";
import { type Genre } from "../../../entities/type";

interface MovieDetailsModalProps {
  movie: Movie | null;
  genres: Genre[];
  onClose: () => void;
}

export default function MovieDetailsModal({
  movie,
  genres,
  onClose,
}: MovieDetailsModalProps) {
  if (!movie) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/60 to-white/80 dark:from-zinc-900/80 dark:to-zinc-800/80"
        style={{ minHeight: "100vh" }}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.85,
            rotateX: 24,
            y: 60,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: 0,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.85,
            rotateX: 12,
            y: 40,
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 18,
          }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-7xl w-full p-0 relative flex flex-col md:flex-row items-stretch my-12 border border-blue-100 dark:border-zinc-800 hide-scrollbar"
          style={{
            margin: "auto",
            position: "relative",
            maxHeight: "96vh",
            overflowY: "auto",
          }}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 text-3xl z-10 transition"
            onClick={onClose}
            aria-label="Close details"
          >
            &times;
          </button>
          {/* Poster Section */}
          <div className="flex flex-col items-center justify-center w-full md:w-[480px] p-0 bg-gradient-to-br from-blue-50 to-white dark:from-zinc-800 dark:to-zinc-900"
               style={{ height: "96vh", minHeight: "96vh" }}>
            <div className="w-full h-full flex justify-center items-center" style={{ height: "100%" }}>
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-xl shadow-xl border-2 border-blue-200 dark:border-blue-900 transition-all duration-300"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "1rem",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-xl text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>
          {/* Info Section */}
          <div className="flex-1 p-12 flex flex-col justify-between bg-white dark:bg-zinc-900 overflow-y-auto hide-scrollbar">
            <div>
              <h3 className="text-4xl font-extrabold mb-4 text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
                {movie.title}
              </h3>
              <div className="mb-6 text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                {movie.description || <span className="italic text-gray-400">No description</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase text-xs tracking-wider">Duration</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">{movie.duration} <span className="text-base font-medium">min</span></div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase text-xs tracking-wider">Premiere</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">
                    {typeof movie.premiere_date === "string" && movie.premiere_date.length >= 4
                      ? movie.premiere_date.slice(0, 4)
                      : <span className="text-gray-400">N/A</span>
                    }
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase text-xs tracking-wider">Rating</div>
                  {/* Rotten Tomatoes style */}
                  <div className="flex items-center gap-3">
                    {typeof movie.rating === "number" ? (
                      <>
                        <span
                          className={`inline-flex items-center justify-center rounded-full shadow-lg font-bold text-3xl w-16 h-16
                            ${movie.rating >= 6.0 ? "bg-red-500 text-white" : "bg-gray-400 text-white"}`}
                          title={movie.rating >= 6.0 ? "Fresh" : "Rotten"}
                        >
                          {movie.rating.toFixed(1)}
                        </span>
                        <span className="text-4xl">
                          {movie.rating >= 6.0 ? "🍅" : "💩"}
                        </span>
                        <span className="font-semibold text-lg text-gray-600 dark:text-gray-400 ml-2">
                          {movie.rating >= 6.0 ? "Fresh" : "Rotten"}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                  {/* IMDb style (uncomment to use) */}
                  <div className="flex items-center gap-3 mt-2">
                    {typeof movie.rating === "number" ? (
                      <span
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-yellow-400 text-black font-bold text-2xl shadow"
                        style={{ fontFamily: "Arial Black, Arial, sans-serif" }}
                        title="IMDb Rating"
                      >
                        IMDb&nbsp;{movie.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase text-xs tracking-wider">Genres</div>
                <div className="flex flex-wrap gap-3">
                  {(movie.genre_ids ?? [])
                    .map(id => genres.find(g => g.genre_id === id))
                    .filter(Boolean)
                    .map(genre => (
                      <span
                        key={genre!.genre_id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-200 via-blue-100 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 text-blue-900 dark:text-blue-100 font-semibold text-sm shadow-sm border border-blue-300 dark:border-blue-800"
                      >
                        {getGenreIcon(genre!.icon)}
                        {genre!.genre_name}
                      </span>
                    ))}
                </div>
              </div>
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase text-xs tracking-wider">Status</div>
                  <span
                    className={
                      movie.deleted
                        ? "inline-block px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 dark:bg-zinc-700 dark:text-gray-300 font-semibold"
                        : "inline-block px-3 py-1 text-sm rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold"
                    }
                  >
                    {movie.deleted ? "Deleted" : "Active"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <AppButton color="primary" type="button" onClick={onClose}>
                Close
              </AppButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}