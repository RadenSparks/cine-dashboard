import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, UserRound, Users } from "lucide-react";
import type { Tier, User } from "@/shared/types/entities";
import type { UserApiDTO } from "@/shared/types/dto";
import type { AppDispatch, RootState } from "@/store/store";
import {
  addUser,
  deactivateUser,
  fetchMilestoneTiers,
  fetchUsers,
  restoreUser,
  updateUser,
} from "@/store/slices";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import Loading from "@/shared/components/ui/Loading";
import { PageIntro, SectionCard, StatCard } from "@/shared/components/ui/DashboardPrimitives";
import { SatelliteToast, type ToastNotification } from "@/shared/components/ui/SatelliteToast";
import UserModal from "./components/UserModal";
import UserTable from "./components/UserTable";
import { fallbackTiers } from "./userHelper";

export default function UserPage() {
  const dispatch = useDispatch<AppDispatch>();
  const usersRaw = useSelector((state: RootState) => state.users.users);
  const users = useMemo(() => (Array.isArray(usersRaw) ? usersRaw : []), [usersRaw]);
  const pagination = useSelector((state: RootState) => state.users.pagination);
  const loading = useSelector((state: RootState) => state.users.loading);
  const error = useSelector((state: RootState) => state.users.error);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [confirmAction, setConfirmAction] = useState<{ type: "deactivate"; userId: number; userName: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  const milestoneTiersRaw = useSelector((state: RootState) => state.milestoneTiers.tiers) ?? [];
  const milestoneTiers: Tier[] = milestoneTiersRaw.map((tier) => ({
    id: tier.id,
    name: tier.name,
    code: tier.code,
    requiredPoints: tier.requiredPoints,
  }));
  const tiersToUse: Tier[] = milestoneTiers.length > 0 ? milestoneTiers : fallbackTiers;

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, size: pageSize }));
    dispatch(fetchMilestoneTiers());
  }, [currentPage, pageSize, dispatch]);

  const totalUsers = pagination.totalElements || users.length;
  const deactivatedUsers = useMemo(() => users.filter((user) => !user.active).length, [users]);
  const adminUsers = useMemo(() => users.filter((user) => user.role === "ADMIN").length, [users]);
  const recentlyJoinedUser = useMemo(() => {
    if (!users.length) return null;
    return users.reduce((latest, user) => (user.id > latest.id ? user : latest), users[0]);
  }, [users]);

  const handleSaveUser = async (user: UserApiDTO) => {
    try {
      const assignedTier = tiersToUse.find((tier) => tier.code === user.tierCode) ?? tiersToUse[0];
      if (!user.tierCode || user.tierCode.trim() === "") {
        toastRef.current?.showNotification({ title: "Error", content: "Please select a tier before saving.", accentColor: "#ef4444", position: "bottom-right", longevity: 2500 });
        return;
      }

      if (!user.id || user.id === 0) {
        if (!user.password || user.password.trim() === "") {
          toastRef.current?.showNotification({ title: "Error", content: "Password is required when creating a new user.", accentColor: "#ef4444", position: "bottom-right", longevity: 2500 });
          return;
        }
        await dispatch(addUser({
          name: user.name,
          email: user.email,
          password: user.password,
          phoneNumber: user.phoneNumber,
          role: user.role ?? "USER",
          active: user.active ?? true,
          tierPoint: user.tierPoint ?? assignedTier.requiredPoints,
          tierCode: assignedTier.code,
        })).unwrap();

        await dispatch(fetchUsers({ page: currentPage, size: pageSize }));
        toastRef.current?.showNotification({ title: "User added", content: `User "${user.name}" added successfully.`, accentColor: "#22c55e", position: "bottom-right", longevity: 2500 });
      } else {
        const updatePayload: UserApiDTO = {
          id: user.id ?? 0,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          active: user.active,
          tierPoint: user.tierPoint ?? assignedTier.requiredPoints,
          tierCode: assignedTier.code,
          ...(user.password && user.password.trim() !== "" ? { password: user.password } : {}),
        };
        await dispatch(updateUser(updatePayload)).unwrap();
        await dispatch(fetchUsers({ page: currentPage, size: pageSize }));
        toastRef.current?.showNotification({ title: "User updated", content: `User "${user.name}" updated successfully.`, accentColor: "#2563eb", position: "bottom-right", longevity: 2500 });
      }
    } catch {
      toastRef.current?.showNotification({ title: "Error", content: "Failed to save user.", accentColor: "#ef4444", position: "bottom-right", longevity: 2500 });
    }
    setEditingUser(null);
  };

  const performRestoreUser = async (user: User) => {
    try {
      await dispatch(restoreUser(user.id)).unwrap();
      toastRef.current?.showNotification({ title: "User restored", content: `User "${user.name}" is now active.`, accentColor: "#22c55e", position: "bottom-right", longevity: 2500 });
    } catch {
      toastRef.current?.showNotification({ title: "Error", content: "Failed to restore user.", accentColor: "#ef4444", position: "bottom-right", longevity: 2500 });
    }
  };

  const handleToggleActive = (user: User) => {
    if (user.active) setConfirmAction({ type: "deactivate", userId: user.id, userName: user.name });
    else void performRestoreUser(user);
  };

  const handleConfirmDeactivateUser = async () => {
    if (confirmAction?.type !== "deactivate") return;
    setIsProcessing(true);
    try {
      await dispatch(deactivateUser(confirmAction.userId)).unwrap();
      toastRef.current?.showNotification({ title: "User deactivated", content: `User "${confirmAction.userName}" is now deactivated.`, accentColor: "#ef4444", position: "bottom-right", longevity: 2500 });
    } catch {
      toastRef.current?.showNotification({ title: "Error", content: "Failed to deactivate user.", accentColor: "#ef4444", position: "bottom-right", longevity: 2500 });
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  const getTierName = (mileStoneTier?: Tier) => mileStoneTier?.name || "—";

  if (loading && !users.length) return <Loading fullscreen={false} />;

  return (
    <>
      <SatelliteToast ref={toastRef} />
      <div className="w-full space-y-6">
        <PageIntro
          eyebrow="Access administration"
          title="Users workspace"
          description="Manage customer and admin accounts, keep access healthy, and adjust tier assignments without changing the underlying account flows."
          icon={ShieldCheck}
          showEvervault={true}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total users" value={totalUsers} detail="All user records available to this dashboard." icon={Users} support="Registered accounts" />
          <StatCard title="Admins" value={adminUsers} detail="Accounts with elevated workspace permissions." icon={ShieldCheck} support="Privileged access" />
          <StatCard title="Deactivated" value={deactivatedUsers} detail="Accounts currently blocked from active use." tone="danger" support="Inactive access" />
          <StatCard title="Newest record" value={recentlyJoinedUser?.name ?? "None"} detail={recentlyJoinedUser?.email ?? "No user data loaded yet."} icon={UserRound} tone="success" support="Latest join" />
        </div>

        <SectionCard title="User records" description="Search, edit, deactivate, and restore accounts from a unified table surface.">
          <UserTable
            users={users}
            search={search}
            setSearch={setSearch}
            setEditingUser={setEditingUser}
            handleToggleActive={handleToggleActive}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            getTierName={getTierName}
            roleStyles={{}}
            tierStyles={{}}
            loading={loading}
            error={error}
          />
        </SectionCard>
      </div>

      <UserModal open={!!editingUser && !loading} user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} tiers={tiersToUse} />

      <ConfirmationModal
        isOpen={confirmAction !== null}
        title="Deactivate user"
        message={`Are you sure you want to deactivate user "${confirmAction?.userName}"? They will no longer be able to access the system.`}
        actionLabel="Deactivate"
        cancelLabel="Cancel"
        isDangerous
        isLoading={isProcessing}
        onConfirm={handleConfirmDeactivateUser}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
