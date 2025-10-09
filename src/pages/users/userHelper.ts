// userHelpers.ts
export const roleStyles: Record<string, string> = {
  ADMIN: "bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow px-3 py-1 rounded-full border-0",
  USER: "bg-gradient-to-r from-yellow-200 to-gray-400 text-gray-800 font-semibold px-3 py-1 rounded-full border-0",
};

export const tierStyles: Record<string, string> = {
  BRONZE: "bg-gradient-to-r from-amber-400 to-yellow-700 text-black font-bold px-3 py-1 rounded-full border-0",
  SILVER: "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 font-bold px-3 py-1 rounded-full border-0",
  GOLD: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 font-bold px-3 py-1 rounded-full border-0",
  PLATINUM: "bg-gradient-to-r from-blue-300 to-white-600 text-blue-900 font-bold px-3 py-1 rounded-full border-0",
  DIAMOND: "bg-gradient-to-r from-indigo-300 to-indigo-700 text-white font-bold px-3 py-1 rounded-full border-0",
};

import { type Tier } from "../../entities/type";

export const fallbackTiers: Tier[] = [
  { id: 1, name: "Bronze", code: "BRONZE", requiredPoints: 0 },
  { id: 2, name: "Silver", code: "SILVER", requiredPoints: 100 },
  { id: 3, name: "Gold", code: "GOLD", requiredPoints: 500 },
  { id: 4, name: "Platinum", code: "PLATINUM", requiredPoints: 1000 },
  { id: 5, name: "Diamond", code: "DIAMOND", requiredPoints: 2000 },
];

export function getTierStyle(tierCode?: string) {
  return tierStyles[tierCode ?? "BRONZE"] || "bg-gray-200 text-gray-800 font-bold px-3 py-1 rounded-full border-0";
}