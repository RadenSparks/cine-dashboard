import { type Tier } from "../../../entities/type";
import { getTierStyle } from "../userHelper";

export default function TierSelector({
  value,
  onChange,
  tiers,
}: {
  value: number | undefined;
  onChange: (tier: number) => void;
  tiers: Tier[];
}) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {tiers.map(tier => (
        <button
          key={tier.code}
          type="button"
          className={`transition px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border-2
            ${getTierStyle(tier.code)}
            ${
              value === tier.id
                ? "ring-2 ring-blue-400 border-blue-500 scale-105 shadow"
                : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
            }
          `}
          aria-pressed={value === tier.id}
          onClick={() => onChange(tier.id)}
        >
          {tier.name}
          <span className="ml-1 text-[10px] font-normal opacity-70">
            {tier.requiredPoints} pts
          </span>
        </button>
      ))}
    </div>
  );
}