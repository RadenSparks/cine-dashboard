import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { type RootState, type AppDispatch } from "../../../store/store";
import {
  createMilestoneTier,
  updateMilestoneTier,
  deleteMilestoneTier,
} from "../../../store/milestoneTierSlice";
import { type Tier } from "../../../entities/type";
import { type MileStoneTierApiDTO } from "../../../dto/dto";
import { getTierStyle } from "../userHelper";

export default function TierManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { tiers = [], loading, error } = useSelector((state: RootState) => state.milestoneTiers);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [form, setForm] = useState<Omit<Tier, "id"> & { code: MileStoneTierApiDTO["code"] }>({
    name: "",
    requiredPoints: 0,
    code: "BRONZE",
  });

  // Fill form when editing
  const startEdit = (tier: Tier) => {
    setEditingTier(tier);
    setForm({
      name: tier.name,
      requiredPoints: tier.requiredPoints,
      code: tier.code as MileStoneTierApiDTO["code"],
    });
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingTier) {
      await dispatch(
        updateMilestoneTier({
          id: editingTier.id,
          name: form.name,
          requiredPoints: form.requiredPoints,
          code: form.code,
        })
      );
      setEditingTier(null);
    } else {
      await dispatch(
        createMilestoneTier({
          name: form.name,
          requiredPoints: form.requiredPoints,
          code: form.code,
        })
      );
    }
    setForm({ name: "", requiredPoints: 0, code: "BRONZE" });
  };

  // Delete
  const handleDelete = async (id: number) => {
    await dispatch(deleteMilestoneTier(id));
    if (editingTier?.id === id) setEditingTier(null);
  };

  return (
    <div>
      <h3 className="font-bold text-xl mb-4 text-blue-700 dark:text-blue-200">Tier Management</h3>
      {/* Render available tiers as cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {tiers.map(tier => (
          <div key={tier.id} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 flex flex-col items-center">
            <span className={getTierStyle(tier.code) + " mb-2"}>
              {tier.name}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Code: {tier.code}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Milestone: {tier.requiredPoints} pts
            </span>
          </div>
        ))}
      </div>
      {/* Tier form */}
      <div className="mb-6 flex flex-col gap-3">
        <input
          className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full"
          placeholder="Tier Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input
          className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full"
          type="number"
          min={0}
          placeholder="Required Points"
          value={form.requiredPoints}
          onChange={e => setForm(f => ({ ...f, requiredPoints: Number(e.target.value) }))}
        />
        <input
          className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full"
          placeholder="Tier Code"
          value={form.code}
          onChange={e => setForm(f => ({ ...f, code: e.target.value as MileStoneTierApiDTO["code"] }))}
          list="tier-codes"
        />
        <datalist id="tier-codes">
          <option value="BRONZE" />
          <option value="SILVER" />
          <option value="GOLD" />
          <option value="PLATINUM" />
          <option value="DIAMOND" />
        </datalist>
        <div className="flex gap-2 mt-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
            onClick={handleSave}
            disabled={loading}
          >
            {editingTier ? "Update" : "Add"} Tier
          </button>
          {editingTier && (
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
              onClick={() => {
                setEditingTier(null);
                setForm({ name: "", requiredPoints: 0, code: "BRONZE" });
              }}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
      {/* Tier list for edit/delete */}
      <ul className="space-y-2">
        {tiers.map(tier => (
          <li key={tier.id} className="flex items-center justify-between bg-blue-50 dark:bg-zinc-800 px-4 py-2 rounded">
            <span>
              <span className="font-semibold">{tier.name}</span>{" "}
              <span className="text-xs text-gray-500">
                ({tier.requiredPoints} pts, {tier.code})
              </span>
            </span>
            <span className="flex gap-2">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1 px-3 rounded transition"
                onClick={() => startEdit(tier)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded transition"
                onClick={() => handleDelete(tier.id)}
                disabled={loading}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
      {loading && <div className="text-blue-500 text-sm mt-4">Saving...</div>}
    </div>
  );
}