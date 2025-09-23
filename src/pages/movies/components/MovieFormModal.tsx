import { AnimatePresence, motion } from "framer-motion";
import { type Movie } from "../../../entities/type";
import { Select, SelectItem } from "@heroui/react";
import { useMemo, useRef, useState } from "react";
import AppButton from "../../../components/UI/AppButton"; // Adjust the import path as necessary
import { type Genre } from "../../../entities/type";

interface MovieFormModalProps {
  show: boolean;
  editing: Movie | null;
  newMovie: Movie;
  genres: Genre[];
  onClose: () => void;
  onChange: (movie: Movie) => void;
  onSubmit: () => void;
}

export default function MovieFormModal({
  show,
  editing,
  newMovie,
  genres,
  onClose,
  onChange,
  onSubmit,
}: MovieFormModalProps) {
  const current = editing ?? newMovie;
  const genreIds = useMemo(
    () => (Array.isArray(current.genre_ids) ? current.genre_ids : []),
    [current.genre_ids]
  );

  // For displaying selected genres as comma-separated names
  const selectedGenreNames = useMemo(
    () =>
      genres
        .filter(g => genreIds.includes(g.genre_id))
        .map(g => g.genre_name)
        .join(", ") || "Select genres",
    [genreIds, genres]
  );

  // Local state for the date input (to allow manual typing)
  const [dateInput, setDateInput] = useState(
    current.premiere_date && /^\d{4}-\d{2}-\d{2}$/.test(current.premiere_date)
      ? current.premiere_date
      : ""
  );

  // Keep dateInput in sync with current.premiere_date
  if (
    current.premiere_date !== dateInput &&
    /^\d{4}-\d{2}-\d{2}$/.test(current.premiere_date)
  ) {
    setDateInput(current.premiere_date);
  }

  // Convert string date to CalendarDate for DatePicker (Hero UI expects CalendarDate or null

  // Ref for DatePicker popover container
  const modalRef = useRef<HTMLDivElement>(null);

  // Validation logic for the form
  const formValid =
    current.title.length >= 2 &&
    genreIds.length > 0 &&
    current.duration >= 1 &&
    !!current.premiere_date &&
    (
      !current.poster ||
      /^https?:\/\/.+/.test(current.poster)
    ) &&
    (typeof current.rating === "undefined" || (current.rating >= 0 && current.rating <= 10));

  return show && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/60 to-white/80 dark:from-zinc-900/80 dark:to-zinc-800/80"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="relative bg-white/90 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl p-0 overflow-hidden hide-scrollbar"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Hide scrollbar for Webkit browsers */}
          <style>
            {`
              .modal-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <div className="modal-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-900 dark:to-blue-700">
              <span className="text-lg font-bold text-white">
                {editing ? "Edit Movie" : "Add Movie"}
              </span>
              <button
                className="rounded-full p-2 hover:bg-blue-600/30 transition"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Form + Poster Preview */}
            <div className="flex flex-col md:flex-row gap-8 p-8">
              {/* Poster Preview */}
              <div className="flex flex-col items-center md:w-1/3 w-full mb-4 md:mb-0">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-blue-100 dark:border-zinc-800 p-4 flex flex-col items-center w-full">
                  <div className="text-base font-semibold text-blue-700 dark:text-blue-200 mb-2 text-center tracking-wide">
                    Poster Preview
                  </div>
                  {current.poster ? (
                    <img
                      src={current.poster}
                      alt={current.title}
                      className="w-[220px] h-[330px] object-cover rounded-xl shadow-xl border-2 border-blue-200 dark:border-blue-900 transition-all duration-300"
                      style={{ maxWidth: "100%", maxHeight: "48vh" }}
                    />
                  ) : (
                    <div className="w-[220px] h-[330px] flex items-center justify-center bg-gray-200 rounded-xl text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
              </div>
              {/* Form Fields */}
              <form
                className="flex-1 space-y-5"
                onSubmit={e => {
                  e.preventDefault();
                  if (formValid) onSubmit();
                }}
              >
                {/* Title */}
                <div>
                  <label htmlFor="movie-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="movie-title"
                    type="text"
                    value={current.title}
                    onChange={e => onChange({ ...current, title: e.target.value })}
                    placeholder="Enter movie title"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    required
                    minLength={2}
                  />
                  {current.title.length < 2 && (
                    <p className="text-xs text-red-500 mt-1">Title must be at least 2 characters.</p>
                  )}
                </div>
                {/* Genres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Genres <span className="text-red-500">*</span>
                  </label>
                  <Select
                    selectionMode="multiple"
                    selectedKeys={genreIds.map(String)}
                    onSelectionChange={keys => {
                      const selected = Array.from(keys as Set<string>).map(Number);
                      onChange({ ...current, genre_ids: selected });
                    }}
                    placeholder="Select genres"
                    classNames={{
                      base: "w-full",
                      trigger: "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-200 font-semibold pr-3",
                      listbox: "max-h-60 overflow-y-auto bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 z-[100]",
                      listboxWrapper: "z-[100]",
                    }}
                    aria-label="Select genres"
                    renderValue={() => (
                      <span>
                        {selectedGenreNames}
                      </span>
                    )
                    }
                    selectorIcon={<></>} // <-- Fix: use empty fragment
                  >
                    {genres.map(genre => {
                      const isSelected = genreIds.includes(genre.genre_id);
                      return (
                        <SelectItem key={genre.genre_id.toString()} textValue={genre.genre_name}>
                          <span className="flex items-center">
                            <span
                              className={`inline-block w-2.5 h-2.5 rounded-full mr-2 border border-blue-400 ${
                                isSelected
                                  ? "bg-blue-500 dark:bg-blue-400"
                                  : "bg-transparent"
                              }`}
                            />
                            {genre.genre_name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </Select>
                  {genreIds.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Select at least one genre.</p>
                  )}
                </div>
                {/* Duration */}
                <div>
                  <label htmlFor="movie-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="movie-duration"
                    type="number"
                    value={current.duration}
                    onChange={e => onChange({ ...current, duration: Number(e.target.value) })}
                    placeholder="e.g. 120"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    min={1}
                    required
                  />
                  {(!current.duration || current.duration < 1) && (
                    <p className="text-xs text-red-500 mt-1">Duration must be at least 1 minute.</p>
                  )}
                </div>
                {/* Premiere Date */}
                <div>
                  <label htmlFor="movie-premiere" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Premiere Date <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    {/* Date Input */}
                    <div className="relative w-full">
                      {/* Hero UI Calendar Icon (left) */}
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 pointer-events-none">
                        {/* Calendar Icon */}
                        <svg
                          className="w-5 h-5"
                          aria-hidden="true"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" className="stroke-current" />
                          <path d="M16 2v4M8 2v4M3 10h18" className="stroke-current" />
                        </svg>
                      </span>
                      <input
                        id="movie-premiere"
                        type="date"
                        value={dateInput}
                        onChange={e => {
                          setDateInput(e.target.value);
                          onChange({
                            ...current,
                            premiere_date: e.target.value,
                          });
                        }}
                        required
                        className="border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 pl-10 pr-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none text-blue-700 dark:text-blue-200 font-semibold transition-all shadow-sm"
                        style={{
                          minWidth: 0,
                          fontSize: "1rem",
                          height: "44px",
                          // Hide native calendar icon (for Chrome/Edge)
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                    </div>
                  </div>
                  {!current.premiere_date && (
                    <p className="text-xs text-red-500 mt-1">Premiere date is required.</p>
                  )}
                </div>
                {/* Poster */}
                <div>
                  <label htmlFor="movie-poster" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Poster URL
                  </label>
                  <input
                    id="movie-poster"
                    type="url"
                    value={current.poster || ""}
                    onChange={e => onChange({ ...current, poster: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    pattern="https?://.+"
                  />
                  {(current.poster && !/^https?:\/\/.+/.test(current.poster)) && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid URL (starting with http:// or https://).</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Optional. Leave blank if no poster is available.</p>
                </div>
                {/* Description */}
                <div>
                  <label htmlFor="movie-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Description
                  </label>
                  <textarea
                    id="movie-description"
                    value={current.description || ""}
                    onChange={e => onChange({ ...current, description: e.target.value })}
                    placeholder="Enter a brief description (optional)"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    rows={8}
                    maxLength={500}
                    style={{ minHeight: "160px" }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(current.description || "").length}/500 characters
                  </p>
                </div>
                {/* Rating */}
                <div>
                  <label htmlFor="movie-rating" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Rating (0.0–10.0)
                  </label>
                  <input
                    id="movie-rating"
                    type="number"
                    step="0.1"
                    min={0}
                    max={10}
                    value={typeof current.rating === "number" ? current.rating : ""}
                    onChange={e => onChange({ ...current, rating: e.target.value === "" ? undefined : Math.max(0, Math.min(10, Number(e.target.value))) })}
                    placeholder="e.g. 8.5"
                    className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                  {(typeof current.rating === "number" && (current.rating < 0 || current.rating > 10)) && (
                    <p className="text-xs text-red-500 mt-1">Rating must be between 0 and 10.</p>
                  )}
                </div>
                {/* Actions */}
                <div className="flex justify-end gap-2 mt-6">
                  <AppButton color="danger" type="button" onClick={onClose}>
                    Cancel
                  </AppButton>
                  <AppButton color="success" type="submit" disabled={!formValid}>
                    {editing ? "Update" : "Add"}
                  </AppButton>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}