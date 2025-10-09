import { useState, useRef, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import {
  fetchUsers,
  addUser,        // <-- use addUser instead of registerUser
  updateUser,
  deactivateUser,
  restoreUser,

} from "../../store/userSlice";
import { fetchMilestoneTiers } from "../../store/milestoneTierSlice";
import { type User, type Tier } from "../../entities/type";
import { User2Icon } from "lucide-react";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";
import UserStatCards from "./components/UserStatCards";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import { fallbackTiers, roleStyles, tierStyles } from "./userHelper";

export default function UserPage() {
  const dispatch = useDispatch<AppDispatch>();
  const usersRaw = useSelector((state: RootState) => state.users.users);
  const users = useMemo(() => Array.isArray(usersRaw) ? usersRaw : [], [usersRaw]);
  const loading = useSelector((state: RootState) => state.users.loading);
  const error = useSelector((state: RootState) => state.users.error);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);


  // Get tiers from slice and map to Tier type
  const milestoneTiersRaw = useSelector((state: RootState) => state.milestoneTiers.tiers) ?? [];
  const milestoneTiers: Tier[] = milestoneTiersRaw.map(tier => ({
    id: tier.id,
    name: tier.name,
    code: tier.code,
    requiredPoints: tier.requiredPoints,
  }));

  // Use milestoneTiers everywhere, fallback only if empty
  const tiersToUse: Tier[] = milestoneTiers.length > 0 ? milestoneTiers : fallbackTiers;

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchMilestoneTiers());
  }, [dispatch]);

  // Stat calculations
  const totalUsers = users.length;
  const deactivatedUsers = useMemo(() => users.filter(u => !u.active).length, [users]);
  const recentlyJoinedUser = useMemo(() => {
    if (!users.length) return null;
    return users.reduce((latest, user) => (user.id > latest.id ? user : latest), users[0]);
  }, [users]);

  // Add/Edit user handler (API)
  const handleSaveUser = async (user: User) => {
    try {
      const assignedTier = tiersToUse.find(t => t.id === user.mileStoneTier?.id) ?? tiersToUse[0];
      if (!user.id || user.id === 0) {
        // Add user
        await dispatch(addUser({
          name: user.name,
          email: user.email,
          password: user.password,
          phoneNumber: user.phoneNumber,
          role: user.role ?? "USER",
          active: user.active ?? true,
          tierPoint: user.tierPoint ?? assignedTier.requiredPoints,
          mileStoneTier: assignedTier,
        })).unwrap();

        // Immediately refetch users to get the latest data from backend
        await dispatch(fetchUsers());

        toastRef.current?.showNotification({
          title: "User Added",
          content: `User "${user.name}" added successfully.`,
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 2500,
        });
      } else {
        // Edit user
        await dispatch(updateUser({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          phoneNumber: user.phoneNumber,
          role: user.role,
          active: user.active,
          tierPoint: user.tierPoint ?? assignedTier.requiredPoints,
          mileStoneTier: assignedTier,
        })).unwrap();
        await dispatch(fetchUsers());
        toastRef.current?.showNotification({
          title: "User Updated",
          content: `User "${user.name}" updated successfully.`,
          accentColor: "#2563eb",
          position: "bottom-right",
          longevity: 2500,
        });
      }
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to save user.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 2500,
      });
    }
    setEditingUser(null);
  };

  // Toggle active/deactivated status (API soft delete)
  const handleToggleActive = async (user: User) => {
    try {
      if (user.active) {
        await dispatch(deactivateUser(user.id)).unwrap();
        toastRef.current?.showNotification({
          title: "User Deactivated",
          content: `User "${user.name}" is now deactivated.`,
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 2500,
        });
      } else {
        // Restore user
        await dispatch(restoreUser(user.id)).unwrap();
        toastRef.current?.showNotification({
          title: "User Restored",
          content: `User "${user.name}" is now active.`,
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 2500,
        });
      }
    } catch {
      toastRef.current?.showNotification({
        title: "Error",
        content: "Failed to update user status.",
        accentColor: "#ef4444",
        position: "bottom-right",
        longevity: 2500,
      });
    }
  };

  // Filtered users
  const filteredUsers = users.filter(
    u =>
      (u.name?.toLowerCase?.() ?? "").includes(search.toLowerCase()) ||
      (u.email?.toLowerCase?.() ?? "").includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Get tier name by user's mileStoneTier object
  const getTierName = (mileStoneTier?: Tier) =>
    mileStoneTier?.name || "—";

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16 min-h-[400px] hide-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loading />
            <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow flex items-center justify-center gap-2 mt-8">
              <User2Icon className="w-8 h-8 text-blue-700 dark:text-blue-200" />
              Users
            </h2>
          </div>
        ) : (
          <>
            {/* Page Title */}
            <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow flex items-center justify-center gap-2 mt-8">
              <User2Icon className="w-8 h-8 text-blue-700 dark:text-blue-200" />
              Users
            </h2>
            {/* Stat Cards */}
            <UserStatCards
              totalUsers={totalUsers}
              recentlyJoinedUser={recentlyJoinedUser}
              deactivatedUsers={deactivatedUsers}
            />
            {/* Tier Manager Button */}
            {/* <div className="flex justify-end mb-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition"
                onClick={() => setTierManagerOpen(true)}
              >
                Manage Tiers
              </button>
            </div> */}
            {/* User Table */}
            <div className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-2xl p-10 w-full mt-2 border border-blue-100 dark:border-zinc-800 overflow-x-hidden">
              <UserTable
                users={pagedUsers}
                search={search}
                setSearch={setSearch}
                setEditingUser={setEditingUser}
                handleToggleActive={handleToggleActive}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                filteredUsers={filteredUsers}
                getTierName={getTierName}
                roleStyles={roleStyles}
                tierStyles={tierStyles}
                loading={loading}
                error={error}
              />
            </div>
          </>
        )}
      </div>
      {/* <TierManagerModal open={tierManagerOpen} onClose={() => setTierManagerOpen(false)}>
        <TierManager />
      </TierManagerModal> */}
      <UserModal
        open={!!editingUser && !loading}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
        tiers={tiersToUse}
      />
    </>
  );
}