import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { createFolderAsync } from "../../../store/slices";
import type { ToastNotification } from "../../../components/UI/SatelliteToast";

interface FolderCreatorProps {
  onFolderCreated?: (folderName: string) => void;
  disabled?: boolean;
  toastRef: React.RefObject<{
    showNotification: (options: Omit<ToastNotification, "id">) => void;
  } | null>;
}

const FolderCreator: React.FC<FolderCreatorProps> = ({
  onFolderCreated,
  disabled,
  toastRef,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateFolder = async () => {
    const name = newFolderName?.trim();
    if (!name) return;

    setCreating(true);
    try {
      await dispatch(createFolderAsync(name)).unwrap();
      setNewFolderName("");
      toastRef.current?.showNotification({
        title: "Folder created",
        content: `Folder "${name}" created.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 2000,
      });
      onFolderCreated?.(name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toastRef.current?.showNotification({
        title: "Folder creation failed",
        content: msg || "Failed to create folder.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 3000,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900/60 shadow-sm">
      <input
        type="text"
        placeholder="New folder name..."
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
        disabled={creating || disabled}
        className="w-full px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-800 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 disabled:bg-gray-100 dark:disabled:bg-slate-700"
      />
      <button
        onClick={handleCreateFolder}
        disabled={!newFolderName.trim() || creating || disabled}
        className="w-full px-3 py-2 bg-emerald-600 dark:bg-emerald-700 text-white text-sm font-semibold rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition"
        type="button"
      >
        {creating ? "Creating..." : "Create"}
      </button>
    </div>
  );
};

export default FolderCreator;
