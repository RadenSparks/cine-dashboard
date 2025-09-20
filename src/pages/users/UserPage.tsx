import { useState, useRef, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../../store/store";
import { addUser, updateUser } from "../../store/userSlice";
import { type User } from "../../entities/type";
import { User2Icon } from "lucide-react";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";
import UserStatCards from "./components/UserStatCards";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import { tiers, roleStyles, tierStyles } from "./userHelper";

export default function UserPage() {
  const users = useSelector((state: RootState) => state.users.users);
  const dispatch = useDispatch();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Loading state for page transition
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // Stat calculations
  const totalUsers = users.length;
  const deactivatedUsers = useMemo(() => users.filter(u => !u.active).length, [users]);
  const recentlyJoinedUser = useMemo(() => {
    if (!users.length) return null;
    return users.reduce((latest, user) => (user.id > latest.id ? user : latest), users[0]);
  }, [users]);

  // Add/Edit user handler
  const handleSaveUser = (user: User) => {
    if (user.id) {
      dispatch(updateUser(user));
      toastRef.current?.showNotification({
        title: "User Updated",
        content: `User "${user.name}" updated successfully.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 2500,
      });
    } else {
      const newId = Math.max(0, ...users.map(u => u.id)) + 1;
      dispatch(addUser({ ...user, id: newId }));
      toastRef.current?.showNotification({
        title: "User Added",
        content: `User "${user.name}" added successfully.`,
        accentColor: "#22c55e",
        position: "bottom-right",
        longevity: 2500,
      });
    }
    setEditingUser(null);
  };

  // Toggle active/deactivated status (soft delete)
  const handleToggleActive = (user: User) => {
    dispatch(updateUser({ ...user, active: !user.active }));
    toastRef.current?.showNotification({
      title: user.active ? "User Deactivated" : "User Activated",
      content: `User "${user.name}" is now ${user.active ? "deactivated" : "active"}.`,
      accentColor: user.active ? "#ef4444" : "#22c55e",
      position: "bottom-right",
      longevity: 2500,
    });
  };

  // Filtered users
  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Get tier name by id
  const getTierName = (tierId?: number) =>
    tiers.find(t => t.tier_id === tierId)?.tier_name || "—";

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
              />
            </div>
          </>
        )}
      </div>
      <UserModal
        open={!!editingUser && !loading}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />
    </>
  );
}