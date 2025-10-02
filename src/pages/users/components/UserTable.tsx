import AppButton from "../../../components/UI/AppButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type User } from "../../../entities/type";

interface UserTableProps {
  users: User[];
  search: string;
  setSearch: (s: string) => void;
  setEditingUser: (u: User) => void;
  handleToggleActive: (u: User) => void;
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  filteredUsers: User[];
  getTierName: (tierId?: number) => string;
  roleStyles: Record<string, string>;
  tierStyles: Record<number, string>;
  loading?: boolean; // <-- Add this
  error?: string | null; // <-- Add this
}

export default function UserTable({
  users,
  search,
  setSearch,
  setEditingUser,
  handleToggleActive,
  page,
  setPage,
  totalPages,
  getTierName,
  roleStyles,
  tierStyles,
  loading, // <-- Add this
  error, // <-- Add this
}: UserTableProps) {

  return (
    <>
      {/* Search & Add */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-blue-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
          />
        </div>
        <AppButton
          color="primary"
          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold text-base"
          onClick={() =>
            setEditingUser({
              id: 0,
              name: "",
              email: "",
              password: "",
              phoneNumber: "",
              role: "USER",
              active: true,
              tier: 1,
              points: 0,
            })
          }
        >
          + Add User
        </AppButton>
      </div>
      {/* Table */}
      <div className="rounded-2xl overflow-x-auto border border-blue-100 dark:border-zinc-800 shadow-lg bg-white/80 dark:bg-zinc-900/80 hide-scrollbar">
        {loading ? (
          <div className="py-10 text-center text-blue-600 font-bold">Loading users...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600 font-bold">{error}</div>
        ) : (
          <table className="min-w-full table-auto rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200">
                <th className="p-3 font-semibold text-left">Name</th>
                <th className="p-3 font-semibold text-left">Email</th>
                {/* Remove Password column */}
                <th className="p-3 font-semibold text-left">Role</th>
                <th className="p-3 font-semibold text-left">Tier</th>
                <th className="p-3 font-semibold text-left">Points</th>
                <th className="p-3 font-semibold text-left">Active</th>
                <th className="p-3 font-semibold text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user: User) => (
                  <tr key={user.id} className={`border-t border-gray-100 dark:border-neutral-800`}>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    {/* Remove Password cell */}
                    <td className="p-3">
                      <span className={roleStyles[user.role ?? "USER"]}>
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={tierStyles[user.tier ?? 1]}>
                        {getTierName(user.tier)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-semibold dark:bg-indigo-900 dark:text-indigo-200">
                        {user.points ?? 0}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.active ? (
                        <span className="inline-block px-2 py-1 rounded bg-lime-100 text-lime-700 text-xs font-semibold dark:bg-lime-900 dark:text-lime-300">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold dark:bg-red-900 dark:text-red-300">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      <AppButton className="!px-3 !py-1.5 !text-sm" onClick={() => setEditingUser(user)}>
                        Edit
                      </AppButton>
                      <AppButton
                        className="!px-3 !py-1.5 !text-sm"
                        color={user.active ? "danger" : "success"}
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </AppButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </>
  );
}

function Pagination({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition disabled:opacity-50"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={`px-3 py-1 rounded-full font-semibold text-sm transition ${
            page === i + 1
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
          }`}
          onClick={() => setPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition disabled:opacity-50"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}