import { AnimatePresence, motion } from "framer-motion";
import AppButton from "../../../components/UI/AppButton";
import { roleStyles } from "../userHelper";
import TierSelector from "./TierSelector";
import { type User, type Tier } from "../../../entities/type";
import { useState, useEffect } from "react";
import type { UserApiDTO } from "../../../dto/dto";

interface UserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: UserApiDTO) => void;
  tiers: Tier[];
}

function isValidPassword(password: string) {
  // At least 8 characters, one uppercase, one number, one special character
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

function isValidPhone(phone: string) {
  // Accepts numbers, spaces, dashes, parentheses, and must be 8-15 digits
  return /^(\+?\d{1,3}[- ]?)?\d{8,15}$/.test(phone.replace(/[^\d]/g, ""));
}

export default function UserModal({
  open,
  user,
  onClose,
  onSave,
  tiers,
}: UserModalProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Always map to a valid Tier object from tiers array
      let tierObj: Tier | undefined;
      if (user.mileStoneTier?.code) {
        tierObj = tiers.find(t => t.code === user.mileStoneTier?.code);
      } else if (user.tierPoint !== undefined) {
        // Fallback: find by points if code is missing
        tierObj = tiers.find(t => t.requiredPoints === user.tierPoint);
      }
      setEditingUser({
        ...user,
        mileStoneTier: tierObj ?? tiers[0], // fallback to first tier if not found
      });
    } else {
      setEditingUser(null);
    }
    setNewPassword("");
    setPasswordError(null);
  }, [user, tiers]);

  const validateAndSave = () => {
    if (!editingUser) return;
    if (!editingUser.mileStoneTier || !editingUser.mileStoneTier.code) {
      alert("Please select a tier.");
      return;
    }
    // Password validation
    if (
      (!editingUser.id && !isValidPassword(newPassword)) || // New user: password required
      (editingUser.id && newPassword && !isValidPassword(newPassword)) // Editing: only validate if password is set
    ) {
      setPasswordError(
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."
      );
      return;
    }
    if (!editingUser.id && !newPassword) {
      setPasswordError("Password is required for new users.");
      return;
    }
    setPasswordError(null);

    // Phone validation (if not empty)
    if (editingUser.phoneNumber && !isValidPhone(editingUser.phoneNumber)) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    setPhoneError(null);

    // const tierCode = editingUser.mileStoneTier.code;

    const userToSave: UserApiDTO = {
      ...(editingUser.id ? { id: editingUser.id } : {}), // Only set id if editing
      name: editingUser.name ?? "",
      email: editingUser.email ?? "",
      phoneNumber: editingUser.phoneNumber ?? "",
      role: editingUser.role ?? "USER",
      active: editingUser.active ?? true,
      tierPoint: editingUser.tierPoint ?? editingUser.mileStoneTier.requiredPoints,
      tierCode: editingUser.mileStoneTier.code,
      ...(editingUser.id
        ? (newPassword && newPassword.trim() !== "" ? { password: newPassword } : {})
        : { password: newPassword }) // For new user, always include password
    };

    onSave(userToSave);
  };

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
            className="relative bg-white/90 dark:bg-zinc-900/90 border border-blue-100 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden hide-scrollbar"
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
                validateAndSave();
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
                  disabled={!!editingUser.id} // <-- Disable if editing existing user
                />
              </div>
              {/* Password (Add or Reset) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {editingUser.id ? "Set New Password" : "Password"}{!editingUser.id && <span className="text-red-500">*</span>}
                </label>
                <input
                  className="border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder={editingUser.id ? "Leave blank to keep current password" : "Password"}
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required={!editingUser.id}
                  minLength={8}
                  autoComplete="new-password"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters, include an uppercase letter, a number, and a special character.
                </span>
                {passwordError && (
                  <div className="text-xs text-red-500 mt-1">{passwordError}</div>
                )}
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
                {phoneError && (
                  <div className="text-xs text-red-500 mt-1">{phoneError}</div>
                )}
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
                  value={editingUser.mileStoneTier?.id}
                  onChange={tierId => {
                    const selectedTier = tiers.find(t => t.id === tierId);
                    setEditingUser({
                      ...editingUser,
                      mileStoneTier: selectedTier,
                      tierPoint: selectedTier ? selectedTier.requiredPoints : 0,
                    });
                  }}
                  tiers={tiers}
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
                  value={editingUser.tierPoint ?? 0}
                  onChange={e =>
                    setEditingUser({
                      ...editingUser,
                      tierPoint: Number(e.target.value),
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