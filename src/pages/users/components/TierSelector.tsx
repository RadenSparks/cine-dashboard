import { tiers, tierStyles } from "../userHelper";

export default function TierSelector({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (tier: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {tiers.map(tier => (
        <button
          key={tier.tier_id}
          type="button"
          className={`transition px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border-2
            ${
              value === tier.tier_id
                ? "ring-2 ring-blue-400 border-blue-500 scale-105 shadow"
                : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
            }
            ${tierStyles[tier.tier_id]}
          `}
          aria-pressed={value === tier.tier_id}
          onClick={() => onChange(tier.tier_id)}
        >
          {tier.tier_name}
          <span className="ml-1 text-[10px] font-normal opacity-70">
            {tier.points_required} pts
          </span>
        </button>
      ))}
    </div>
  );
}