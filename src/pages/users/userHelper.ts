// userHelpers.ts

export const tiers = [
  { tier_id: 1, tier_name: "Bronze", points_required: 0 },
  { tier_id: 2, tier_name: "Silver", points_required: 100 },
  { tier_id: 3, tier_name: "Gold", points_required: 500 },
  { tier_id: 4, tier_name: "Platinum", points_required: 1000 },
];

export const roleStyles: Record<string, string> = {
  ADMIN: "bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow px-3 py-1 rounded-full border-0",
  USER: "bg-gradient-to-r from-yellow-200 to-gray-400 text-gray-800 font-semibold px-3 py-1 rounded-full border-0",
};

export const tierStyles: Record<number, string> = {
  1: "bg-gradient-to-r from-amber-400 to-yellow-700 text-black-900 font-bold px-3 py-1 rounded-full border-0",
  2: "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900 font-bold px-3 py-1 rounded-full border-0",
  3: "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 font-bold px-3 py-1 rounded-full border-0",
  4: "bg-gradient-to-r from-blue-300 to-white-600 text-blue-900 font-bold px-3 py-1 rounded-full border-0",
};