import { getGenreIcon } from "@/shared/utils/genreIcons";
import AppButton from "@/shared/components/ui/AppButton";
import { SectionCard } from "@/shared/components/ui/DashboardPrimitives";

export default function AddGenreForm({
  newGenreName,
  setNewGenreName,
  selectedIcon,
  setSelectedIcon,
  availableIcons,
  onAdd,
}: {
  newGenreName: string;
  setNewGenreName: (v: string) => void;
  selectedIcon: string;
  setSelectedIcon: (v: string) => void;
  availableIcons: { name: string; icon: React.ReactNode }[];
  onAdd: () => void;
}) {
  return (
    <SectionCard title="Create genre" description="Add a new genre label and choose the icon used throughout the catalog.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="field-label">Genre name</label>
          <input type="text" value={newGenreName} onChange={(event) => setNewGenreName(event.target.value)} placeholder="Add genre" />
        </div>
        <div className="w-full sm:w-[220px]">
          <label className="field-label">Icon</label>
          <div className="flex items-center gap-3">
            <select value={selectedIcon} onChange={(event) => setSelectedIcon(event.target.value)} aria-label="Select genre icon">
              {availableIcons.map((iconObj) => (
                <option key={iconObj.name} value={iconObj.name}>
                  {iconObj.name}
                </option>
              ))}
            </select>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-100">
              {getGenreIcon(selectedIcon)}
            </span>
          </div>
        </div>
        <AppButton color="success" onClick={onAdd}>
          Add genre
        </AppButton>
      </div>
    </SectionCard>
  );
}
