import { Select, SelectItem } from "@heroui/react";
import type { Genre } from "@/shared/types/entities";

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

export default function MoviesFiltersBar({
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
}: MoviesFiltersBarProps) {
  const durationOptions = [
    { value: "", label: "All durations" },
    { value: "90", label: "90+ minutes" },
    { value: "120", label: "120+ minutes" },
    { value: "150", label: "150+ minutes" },
  ];

  const nowShowingOptions = [
    { value: "all", label: "All states" },
    { value: "now", label: "Now showing" },
    { value: "soon", label: "Coming soon" },
    { value: "ended", label: "Ended" },
  ];

  const selectClasses = {
    trigger:
      "h-[46px] rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-none hover:border-slate-300 dark:hover:border-slate-600",
    popoverContent: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl",
    listbox: "bg-white dark:bg-slate-800",
    listboxWrapper: "max-h-[220px]",
    value: "text-sm text-slate-700 dark:text-slate-100",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <label className="field-label">Search</label>
        <input
          type="text"
          placeholder="Movie title or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="field-label">Genre</label>
        <Select
          items={[{ genre_id: 0, genre_name: "All genres" }, ...genres]}
          selectedKeys={genreFilter === "" ? [] : [String(genreFilter)]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0];
            setGenreFilter(value === "0" || !value ? "" : Number(value));
          }}
          disabled={loading}
          aria-label="Genre filter"
          classNames={selectClasses}
        >
          {[{ genre_id: 0, genre_name: "All genres" }, ...genres].map((genre) => (
            <SelectItem key={String(genre.genre_id)} textValue={genre.genre_name} className="text-slate-700 dark:text-slate-100">
              {genre.genre_name}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div>
        <label className="field-label">Duration</label>
        <Select
          items={durationOptions}
          selectedKeys={durationFilter === "" ? [] : [String(durationFilter)]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0];
            setDurationFilter(value === "" || !value ? "" : Number(value));
          }}
          disabled={loading}
          aria-label="Duration filter"
          classNames={selectClasses}
        >
          {durationOptions.map((option) => (
            <SelectItem key={option.value || "all"} textValue={option.label} className="text-slate-700 dark:text-slate-100">
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div>
        <label className="field-label">Release state</label>
        <Select
          items={nowShowingOptions}
          selectedKeys={nowShowingFilter === "all" ? [] : [nowShowingFilter]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as "all" | "now" | "soon" | "ended";
            setNowShowingFilter(value || "all");
          }}
          disabled={loading}
          aria-label="Status filter"
          classNames={selectClasses}
        >
          {nowShowingOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label} className="text-slate-700 dark:text-slate-100">
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
