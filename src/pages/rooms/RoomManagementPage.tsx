import { useRef, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import {
  fetchRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../../store/roomsSlice";
import { updateSeat, fetchSeatsByRoom } from "../../store/seatsSlice";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";
import RoomTable from "./rooms/RoomTable";
import CreateRoomModal from "./rooms/CreateRoomModal";
import EditRoomModal from "./rooms/EditRoomModal";
import DeleteRoomModal from "./rooms/DeleteRoomModal";
import RoomConfigModal from "./rooms/RoomConfigModal";
import type { Room, Seat } from "../../entities/type";

const ROWS = 8;
const COLS = 10;

export default function RoomManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms = [], loading } = useSelector((state: RootState) => state.rooms);
  const { seatsByRoom } = useSelector((state: RootState) => state.seats);

  const validRooms = useMemo(
    () => Array.isArray(rooms) ? rooms.filter(r => r && typeof r.id === "number") : [],
    [rooms]
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const selectedRoom = validRooms.find(r => r.id === selectedRoomId) ?? null;

  const [localPremiumSeats, setLocalPremiumSeats] = useState<string[]>([]);
  const [localEmptySeats, setLocalEmptySeats] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRoom) {
      const roomSeats = seatsByRoom[selectedRoom.id] || [];
      setLocalPremiumSeats(roomSeats.filter(s => s.premium && !s.empty).map(s => s.seatCode));
      setLocalEmptySeats(roomSeats.filter(s => s.empty).map(s => s.seatCode));
    }
  }, [seatsByRoom, selectedRoom]);

  const [filter, setFilter] = useState<"all" | "economy" | "premium">("all");
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomRows, setNewRoomRows] = useState(ROWS);
  const [newRoomCols, setNewRoomCols] = useState(COLS);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomRows, setEditRoomRows] = useState(8);
  const [editRoomCols, setEditRoomCols] = useState(12);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);

  const [showConfigModal, setShowConfigModal] = useState(false);

  const [saving, setSaving] = useState(false);

  // Local toast ref
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void }>(null);

  useEffect(() => {
    setInitialLoading(true);
    const timer = setTimeout(() => setInitialLoading(false), 400);
    return () => clearTimeout(timer);
  }, [rooms]);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    // When rooms change, fetch seats for all rooms
    if (validRooms.length > 0) {
      validRooms.forEach(room => {
        dispatch(fetchSeatsByRoom(room.id));
      });
    }
  }, [dispatch, validRooms, validRooms.length]);

  // Action handlers use toastRef
  async function handleDeleteRoom(id: number) {
    try {
      await dispatch(deleteRoom(id));
      await dispatch(fetchRooms());
      toastRef.current?.showNotification?.({
        title: "Room Disabled",
        content: `Room has been disabled.`,
        accentColor: "#dc2626",
        position: "bottom-right",
        longevity: 4000,
      });
    } catch {
      toastRef.current?.showNotification?.({
        title: "Disable Failed",
        content: `Failed to disable room.`,
        accentColor: "#dc2626",
        position: "bottom-right",
        longevity: 4000,
      });
    }
    setShowDeleteModal(false);
    setRoomToDelete(null);
    if (selectedRoomId === id) setSelectedRoomId(null);
  }

  function openEditModal(room: Room) {
    setEditRoomName(room.roomName);
    setEditRoomRows(room.roomRow ? room.roomRow.charCodeAt(0) - 64 : 8);
    setEditRoomCols(room.roomColumn);
    setSelectedRoomId(room.id);
    setShowEditModal(true);
  }

  async function handleCreateRoom() {
    if (!newRoomName || !newRoomRows || !newRoomCols) return;
    try {
      await dispatch(addRoom({
        roomName: newRoomName,
        roomRow: String.fromCharCode(64 + newRoomRows),
        roomColumn: newRoomCols,
        roomLayout: "",
        premiumSeats: "",
        emptySeats: [],
      }));
      await dispatch(fetchRooms()); // <-- ensure table updates
      toastRef.current?.showNotification?.({
        title: "Room Created",
        content: `Room "${newRoomName}" added.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 3000,
      });
    } catch {
      toastRef.current?.showNotification?.({
        title: "Create Failed",
        content: `Failed to create room.`,
        accentColor: "#dc2626",
        position: "bottom-right",
        longevity: 3000,
      });
    }
    setShowCreateModal(false);
    setNewRoomName("");
    setNewRoomRows(ROWS);
    setNewRoomCols(COLS);
  }

  async function handleEditRoom() {
    if (!selectedRoom) return;
    try {
      await dispatch(updateRoom({
        ...selectedRoom,
        roomName: editRoomName,
        roomRow: String.fromCharCode(64 + editRoomRows),
        roomColumn: editRoomCols,
      }));
      await dispatch(fetchRooms()); // <-- ensure table updates
      toastRef.current?.showNotification?.({
        title: "Room Updated",
        content: `Room "${editRoomName}" updated.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 3000,
      });
    } catch {
      toastRef.current?.showNotification?.({
        title: "Update Failed",
        content: `Failed to update room.`,
        accentColor: "#dc2626",
        position: "bottom-right",
        longevity: 3000,
      });
    }
    setShowEditModal(false);
  }

  function openConfigModal(room: Room) {
    setSelectedRoomId(room.id);
    setShowConfigModal(true);
  }

  async function handleUpdateSeats() {
    if (!selectedRoom) return;
    setSaving(true);
    try {
      const res = await dispatch(fetchSeatsByRoom(selectedRoom.id));
      const seats = res.payload as Seat[];
      const updatePromises = seats
        .map(seat => {
          const shouldBePremium = localPremiumSeats.includes(seat.seatCode);
          const shouldBeEmpty = localEmptySeats.includes(seat.seatCode);
          if ((seat.premium ?? false) !== shouldBePremium || (seat.empty ?? false) !== shouldBeEmpty) {
            return dispatch(updateSeat({
              id: seat.id,
              roomId: seat.roomId,
              seatCode: seat.seatCode,
              seatRow: seat.seatRow,
              seatColumn: seat.seatColumn,
              seatType: seat.seatType,
              status: shouldBeEmpty ? "EMPTY" : seat.status,
              premium: shouldBePremium,
              empty: shouldBeEmpty,
            })).unwrap();
          }
          return null;
        })
        .filter(Boolean);
      await Promise.all(updatePromises);

      await dispatch(fetchSeatsByRoom(selectedRoom.id)); // <-- ensure seat grid updates
      await dispatch(fetchRooms()); // <-- ensure table updates

      toastRef.current?.showNotification?.({
        title: "Seat Configuration Saved",
        content: `Seat configuration for "${selectedRoom.roomName}" saved.`,
        accentColor: "#2563eb",
        position: "bottom-right",
        longevity: 3000,
      });
    } catch {
      toastRef.current?.showNotification?.({
        title: "Seat Update Failed",
        content: `Failed to update seat configuration.`,
        accentColor: "#dc2626",
        position: "bottom-right",
        longevity: 3000,
      });
    }
    setSaving(false);
    setShowConfigModal(false);
  }

  function handleReactivateRoom(id: number) {
    const room = validRooms.find(r => r.id === id);
    if (!room) return;
    dispatch(updateRoom({ ...room, deleted: false }))
      .then(() => {
        dispatch(fetchRooms());
        toastRef.current?.showNotification?.({
          title: "Room Reactivated",
          content: `Room "${room.roomName}" is now active.`,
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 4000,
        });
      });
  }

  // Always render SatelliteToast outside conditional logic!
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16">
        {initialLoading ? (
          <Loading />
        ) : (
          <>
            {/* ...your page content... */}
            <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
              🏟️ Room Management
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-800 p-8 mb-10">
              <RoomTable
                rooms={validRooms}
                seatsByRoom={seatsByRoom}
                onConfig={openConfigModal}
                onEdit={openEditModal}
                onDelete={id => { setRoomToDelete(id); setShowDeleteModal(true); }}
                onCreate={() => setShowCreateModal(true)}
                onReactivate={handleReactivateRoom}
              />
            </div>
            <CreateRoomModal
              open={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              roomName={newRoomName}
              setRoomName={setNewRoomName}
              roomRows={newRoomRows}
              setRoomRows={setNewRoomRows}
              roomCols={newRoomCols}
              setRoomCols={setNewRoomCols}
              onCreate={handleCreateRoom}
            />
            <EditRoomModal
              open={showEditModal}
              onClose={() => setShowEditModal(false)}
              roomName={editRoomName}
              setRoomName={setEditRoomName}
              roomRows={editRoomRows}
              setRoomRows={setEditRoomRows}
              roomCols={editRoomCols}
              setRoomCols={setEditRoomCols}
              onEdit={handleEditRoom}
            />
            <DeleteRoomModal
              open={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onDelete={() => roomToDelete !== null && handleDeleteRoom(roomToDelete)}
            />
            <RoomConfigModal
              open={showConfigModal}
              onClose={() => setShowConfigModal(false)}
              room={selectedRoom}
              filter={filter}
              setFilter={setFilter}
              hoveredSeat={hoveredSeat}
              setHoveredSeat={setHoveredSeat}
              localPremiumSeats={localPremiumSeats}
              setLocalPremiumSeats={setLocalPremiumSeats}
              localEmptySeats={localEmptySeats}
              setLocalEmptySeats={setLocalEmptySeats}
              onUpdateSeats={handleUpdateSeats}
              loading={loading}
              saving={saving}
            />
          </>
        )}
        {/* SatelliteToast is always rendered here */}
        <SatelliteToast ref={toastRef} />
      </div>
    </div>
  );
}