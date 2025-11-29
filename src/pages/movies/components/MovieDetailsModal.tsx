import { AnimatePresence, motion } from "framer-motion";
import { type Movie } from "../../../entities/type";
import AppButton from "../../../components/UI/AppButton";
import { getGenreIcon } from "../../../utils/genreIcons";
import { type Genre } from "../../../entities/type";
import { useState } from "react";

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
  // Gallery slider and actions are embedded in the modal (no separate manager route)
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  
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
              {(() => {
                const posterSrc = movie.poster ?? movie.images?.[0]?.url;
                return posterSrc ? (
                  <img
                    src={posterSrc}
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
                );
              })()}
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

              {/* --- Image gallery assigned to this movie (GallerySlider) --- */}
              <div className="mb-6">
                <div className="font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase text-xs tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  Gallery
                </div>
                {movie.images && movie.images.length > 0 ? (
                  <div>
                    <div className="flex gap-3 overflow-x-auto pb-3 mb-2" style={{ scrollbarWidth: "thin" }}>
                      {movie.images.map((img, idx) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => img.url && setExpandedImageUrl(img.url)}
                          className="relative group flex-shrink-0 hover:opacity-90 transition"
                          title={`${img.name}${img.folderName ? ` (${img.folderName})` : ''}`}
                        >
                          <div className="w-20 h-28 rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-600 shadow-sm hover:shadow-md transition bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            {img.url ? (
                              <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-gray-400 text-xs text-center px-1">
                                {img.name}
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                          </div>
                          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-blue-500 text-white">{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {movie.images.length} image{movie.images.length !== 1 ? 's' : ''} · Click to enlarge
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No gallery images assigned</p>
                  </div>
                )}
              </div>

              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </div>

            <div className="flex justify-end items-center gap-4">
              <AppButton color="primary" type="button" onClick={onClose}>
                Close
              </AppButton>
            </div>
          </div>

        </motion.div>

        {/* Expanded Image Modal */}
        {expandedImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[101] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setExpandedImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expandedImageUrl}
                alt="Expanded view"
                className="w-full h-full object-contain rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setExpandedImageUrl(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition z-10"
                aria-label="Close image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}