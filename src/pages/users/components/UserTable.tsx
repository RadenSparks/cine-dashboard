import AppButton from "../../../components/UI/AppButton";
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
  roleStyles,
  loading,
  error,
}: UserTableProps) {
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && !loading) {
      onPageChange?.(newPage);
    }
  };

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
              tierPoint: 0,
              mileStoneTier: undefined,
            })
          }
        >
          + Add User
        </AppButton>
      </div>
      {/* Table */}
      <div className="rounded-2xl overflow-x-auto border border-blue-100 dark:border-zinc-800 shadow-lg bg-white/80 dark:bg-zinc-900/80 hide-scrollbar max-h-96">
        {loading ? (
          <div className="py-10 text-center text-blue-600 font-bold">Loading users...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600 font-bold">{error}</div>
        ) : (
          <table className="min-w-full table-auto rounded-lg overflow-hidden">
            <thead className="sticky top-0 bg-gray-100 dark:bg-neutral-800 z-10">
              <tr className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 font-asul" style={{ fontFamily: 'Asul, sans-serif' }}>
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
                  <tr key={user.id} className={`border-t border-gray-100 dark:border-neutral-800 font-farro`} style={{ fontFamily: 'Farro, sans-serif' }}>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={roleStyles[user.role ?? "USER"]}>
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={getTierStyle(user.mileStoneTier?.code)}>
                        {user.mileStoneTier?.name?.replace(/ ?tier$/i, "") ?? "—"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-semibold dark:bg-indigo-900 dark:text-indigo-200">
                        {user.tierPoint ?? 0}
                      </span>
                      {/* <span className="ml-2">
                        {user.mileStoneTier?.name ?? "—"}
                      </span> */}
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
                        {user.active ? "Deactivate" : "Restore"}
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
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
      />
    </>
  );
}

function Pagination({
  currentPage,
  onPageChange,
  totalPages,
  loading,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalElements: number;
  loading?: boolean;
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages - 2, currentPage + 1);
      
      if (startPage > 1) pages.push('...');
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 2) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 mt-6">

      <div className="flex gap-1 flex-wrap justify-center">
        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                currentPage === page
                  ? 'bg-blue-600 text-white border border-blue-700'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              type="button"
            >
              {(page as number) + 1}
            </button>
          )
        )}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
}