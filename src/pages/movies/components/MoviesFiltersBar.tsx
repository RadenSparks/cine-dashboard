import React from "react";
import { Select, SelectItem } from "@heroui/react";
import type { Genre } from "../../../entities/type";

interface MoviesFiltersBarProps {
  search: string;
  setSearch: (search: string) => void;
  genreFilter: number | "";
  setGenreFilter: (genre: number | "") => void;
  durationFilter: number | "";
  setDurationFilter: (duration: number | "") => void;
  nowShowingFilter: "all" | "now" | "soon" | "ended";
  setNowShowingFilter: (filter: "all" | "now" | "soon" | "ended") => void;
  genres: Genre[];
  loading?: boolean;
}

const MoviesFiltersBar: React.FC<MoviesFiltersBarProps> = ({
  search,
  setSearch,
  genreFilter,
  setGenreFilter,
  durationFilter,
  setDurationFilter,
  nowShowingFilter,
  setNowShowingFilter,
  genres,
  loading,
}) => {
  const durationOptions = [
    { value: "", label: "All Durations" },
    { value: "90", label: "90+ minutes" },
    { value: "120", label: "120+ minutes" },
    { value: "150", label: "150+ minutes" },
  ];

  const nowShowingOptions = [
    { value: "all", label: "All" },
    { value: "now", label: "Now Showing" },
    { value: "soon", label: "Coming Soon" },
    { value: "ended", label: "Ended" },
  ];

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-blue-200 dark:border-zinc-700 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Movie title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-blue-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-zinc-700 text-sm"
          />
        </div>

        {/* Genre Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Genre
          </label>
          <Select
            items={[{ genre_id: 0, genre_name: "All Genres" }, ...genres]}
            selectedKeys={genreFilter === "" ? [] : [String(genreFilter)]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];
              setGenreFilter(value === "0" || !value ? "" : Number(value));
            }}
            disabled={loading}
            aria-label="Genre filter"
            classNames={{
              trigger: "h-10 rounded-lg bg-white dark:bg-zinc-700 border-2 border-blue-400 dark:border-blue-500 text-gray-900 dark:text-gray-100 font-medium shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors",
              selectorIcon: genreFilter === "" ? "opacity-100" : "hidden",
              popoverContent: "bg-white dark:bg-zinc-700 border-2 border-blue-400 dark:border-blue-500 shadow-lg",
              listbox: "bg-white dark:bg-zinc-700",
              listboxWrapper: "max-h-[200px]",
            }}
          >
            {[{ genre_id: 0, genre_name: "All Genres" }, ...genres].map(
              (genre) => (
                <SelectItem
                  key={String(genre.genre_id)}
                  textValue={genre.genre_name}
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-600 font-medium"
                >
                  {genre.genre_name}
                </SelectItem>
              )
            )}
          </Select>
        </div>

        {/* Duration Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Duration
          </label>
          <Select
            items={durationOptions}
            selectedKeys={durationFilter === "" ? [] : [String(durationFilter)]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0];
              setDurationFilter(value === "" || !value ? "" : Number(value));
            }}
            disabled={loading}
            aria-label="Duration filter"
            classNames={{
              trigger: "h-10 rounded-lg bg-white dark:bg-zinc-700 border-2 border-blue-400 dark:border-blue-500 text-gray-900 dark:text-gray-100 font-medium shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors",
              selectorIcon: durationFilter === "" ? "opacity-100" : "hidden",
              popoverContent: "bg-white dark:bg-zinc-700 border-2 border-blue-400 dark:border-blue-500 shadow-lg",
              listbox: "bg-white dark:bg-zinc-700",
              listboxWrapper: "max-h-[200px]",
            }}
          >
            {durationOptions.map((option) => (
              <SelectItem
                key={option.value || "all"}
                textValue={option.label}
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-600 font-medium"
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Now Showing Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <Select
            items={nowShowingOptions}
            selectedKeys={nowShowingFilter === "all" ? [] : [nowShowingFilter]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as
                | "all"
                | "now"
                | "soon"
                | "ended";
              setNowShowingFilter(value || "all");
            }}
            disabled={loading}
            aria-label="Status filter"
            classNames={{
              trigger: "h-10 rounded-lg bg-white dark:bg-zinc-700 border-2 border-blue-400 dark:border-blue-500 text-gray-900 dark:text-gray-100 font-medium shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors",
              selectorIcon: nowShowingFilter === "all" ? "opacity-100" : "hidden",
              popoverContent: "bg-white dark:bg-zinc-700 border-2 border-blue-400 dark:border-blue-500 shadow-lg",
              listbox: "bg-white dark:bg-zinc-700",
              listboxWrapper: "max-h-[200px]",
            }}
          >
            {nowShowingOptions.map((option) => (
              <SelectItem
                key={option.value}
                textValue={option.label}
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-700 hover:bg-blue-100 dark:hover:bg-zinc-600 font-medium"
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MoviesFiltersBar;
