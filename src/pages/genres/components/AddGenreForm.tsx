import { getGenreIcon } from "../../../utils/genreIcons";
import AppButton from "../../../components/UI/AppButton";

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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-blue-100 dark:border-zinc-800 p-8 mb-10">
      <h3 className="text-xl font-bold mb-6 text-blue-700 dark:text-blue-200 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>Add New Genre</h3>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          type="text"
          value={newGenreName}
          onChange={e => setNewGenreName(e.target.value)}
          placeholder="Add genre"
          className="border px-4 py-2 rounded-lg w-full text-base focus:ring-2 focus:ring-blue-400 focus:outline-none font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            className="border rounded-lg px-2 py-2 text-base bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-200 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}
            value={selectedIcon}
            onChange={e => setSelectedIcon(e.target.value)}
            aria-label="Select genre icon"
          >
            {availableIcons.map(iconObj => (
              <option key={iconObj.name} value={iconObj.name}>
                {iconObj.name}
              </option>
            ))}
          </select>
          <span className="ml-2">{getGenreIcon(selectedIcon)}</span>
        </div>
        <AppButton
          color="success"
          className="w-full sm:w-auto"
          onClick={onAdd}
        >
          Add
        </AppButton>
      </div>
    </div>
  );
}