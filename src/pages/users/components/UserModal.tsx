import { AnimatePresence, motion } from "framer-motion";
import AppButton from "../../../components/UI/AppButton";
import { roleStyles} from "../userHelper";
import TierSelector from "./TierSelector";
import { type User } from "../../../entities/type";
import { useState, useEffect } from "react";

interface UserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function UserModal({ open, user, onClose, onSave }: UserModalProps) {
  const [editingUser, setEditingUser] = useState<User | null>(user);

  useEffect(() => {
    setEditingUser(user);
  }, [user]);

  if (!editingUser) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100/60 to-white/80 dark:from-zinc-900/80 dark:to-zinc-800/80"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="relative bg-white/90 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-900 dark:to-blue-700">
              <span className="text-lg font-bold text-white">
                {editingUser.id ? "Edit User" : "Add User"}
              </span>
              <button
                className="rounded-full p-2 hover:bg-blue-600/30 transition"
                onClick={onClose}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Form */}
            <form
              className="flex flex-col gap-5 px-8 py-8"
              onSubmit={e => {
                e.preventDefault();
                if (editingUser) onSave(editingUser);
              }}
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Name"
                  value={editingUser.name}
                  onChange={e =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  required
                  minLength={2}
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Email"
                  type="email"
                  value={editingUser.email}
                  onChange={e =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  required
                />
              </div>
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Phone Number
                </label>
                <input
                  className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="Phone Number"
                  value={editingUser.phoneNumber}
                  onChange={e =>
                    setEditingUser({
                      ...editingUser,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Role
                </label>
                <div className="flex gap-2 mt-1">
                  {["USER", "ADMIN"].map(role => (
                    <button
                      key={role}
                      type="button"
                      className={`transition px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border-2
                        ${
                          editingUser.role === role
                            ? "ring-2 ring-blue-400 border-blue-500 scale-105 shadow"
                            : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                        }
                        ${roleStyles[role]}
                      `}
                      aria-pressed={editingUser.role === role}
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          role: role as "ADMIN" | "USER",
                        })
                      }
                    >
                      {role === "ADMIN" ? "Admin" : "User"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Tier
                </label>
                <TierSelector
                  value={editingUser.tier}
                  onChange={tier =>
                    setEditingUser({
                      ...editingUser,
                      tier,
                    })
                  }
                />
              </div>
              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Points
                </label>
                <input
                  className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  type="number"
                  min={0}
                  placeholder="Points"
                  value={editingUser.points ?? 0}
                  onChange={e =>
                    setEditingUser({
                      ...editingUser,
                      points: Number(e.target.value),
                    })
                  }
                />
              </div>
              {/* Active */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={editingUser.active}
                    onChange={e =>
                      setEditingUser({
                        ...editingUser,
                        active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <AppButton color="danger" type="button" onClick={onClose}>
                  Cancel
                </AppButton>
                <AppButton color="success" type="submit">
                  {editingUser.id ? "Update" : "Add"}
                </AppButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}