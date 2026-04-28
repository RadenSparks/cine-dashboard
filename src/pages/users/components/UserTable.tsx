import AppButton from "../../../components/UI/AppButton";
import { Pagination, StatusPill } from "../../../components/UI/DashboardPrimitives";
import { type User } from "../../../entities/type";
import { getTierStyle } from "../userHelper";

interface UserTableProps {
  users: User[];
  search: string;
  setSearch: (s: string) => void;
  setEditingUser: (u: User) => void;
  handleToggleActive: (u: User) => void;
  currentPage: number;
  onPageChange?: (page: number) => void;
  totalPages: number;
  totalElements: number;
  getTierName: (mileStoneTier?: User["mileStoneTier"]) => string;
  roleStyles: Record<string, string>;
  tierStyles: Record<number, string>;
  loading?: boolean;
  error?: string | null;
}

export default function UserTable({
  users,
  search,
  setSearch,
  setEditingUser,
  handleToggleActive,
  currentPage,
  onPageChange,
  totalPages,
  totalElements,
  loading,
  error,
}: UserTableProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && !loading) onPageChange?.(newPage);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="field-label">Search</label>
          <input type="text" placeholder="Search by name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <AppButton
          color="primary"
          onClick={() =>
            setEditingUser({
              id: 0,
              name: "",
              email: "",
              password: "",
              phoneNumber: "",
              role: "USER",
              active: true,
              tierPoint: 0,
              mileStoneTier: undefined,
            })
          }
        >
          Add user
        </AppButton>
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/82">
        {loading ? (
          <div className="py-10 text-center text-sky-600 font-semibold">Loading users...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600 font-semibold">{error}</div>
        ) : (
          <table className="dashboard-table min-w-[880px]">
            <thead className="sticky top-0 z-10">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tier</th>
                <th>Points</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role === "ADMIN" ? <StatusPill tone="info">Admin</StatusPill> : <StatusPill tone="neutral">User</StatusPill>}</td>
                    <td>
                      <span className={getTierStyle(user.mileStoneTier?.code)}>
                        {user.mileStoneTier?.name?.replace(/ ?tier$/i, "") ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill-warning">{user.tierPoint ?? 0}</span>
                    </td>
                    <td>{user.active ? <StatusPill tone="success">Active</StatusPill> : <StatusPill tone="danger">Deactivated</StatusPill>}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <AppButton className="!px-3.5" color="primary" variant="soft" size="sm" onClick={() => setEditingUser(user)}>
                          Edit
                        </AppButton>
                        <AppButton className="!px-3.5" color={user.active ? "danger" : "success"} variant="soft" size="sm" onClick={() => handleToggleActive(user)}>
                          {user.active ? "Deactivate" : "Restore"}
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/78">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">{totalElements}</span> user records
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} loading={loading} className="border-none bg-transparent p-0 shadow-none" />
      </div>
    </div>
  );
}
