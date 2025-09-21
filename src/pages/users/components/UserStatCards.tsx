import { Users, UserPlus, UserX } from "lucide-react";

export default function UserStatCards({
  totalUsers,
  recentlyJoinedUser,
  deactivatedUsers,
}: {
  totalUsers: number;
  recentlyJoinedUser: { name: string; email: string } | null;
  deactivatedUsers: number;
}) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard
        icon={<Users className="w-6 h-6" />}
        label="Total Users"
        value={totalUsers}
        color="bg-blue-100 text-blue-700"
      />
      <StatCard
        icon={<UserPlus className="w-6 h-6" />}
        label="Recently Joined"
        value={recentlyJoinedUser ? recentlyJoinedUser.name : "—"}
        color="bg-green-100 text-green-700"
        subtext={recentlyJoinedUser ? recentlyJoinedUser.email : ""}
      />
      <StatCard
        icon={<UserX className="w-6 h-6" />}
        label="Deactivated Users"
        value={deactivatedUsers}
        color="bg-red-100 text-red-700"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: string;
  subtext?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl shadow-md border border-blue-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-6 py-5 w-full`}>
      <div className={`mb-2 flex items-center justify-center w-10 h-10 rounded-full ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</div>
      {subtext && <div className="text-xs mt-1 text-blue-600 dark:text-blue-300">{subtext}</div>}
    </div>
  );
}