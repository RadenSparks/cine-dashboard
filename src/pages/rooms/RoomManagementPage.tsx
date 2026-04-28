import { useRef, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import {
  fetchRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  restoreRoom,
  updateSeat,
  fetchSeatsByRoom,
} from "../../store/slices";
import { SatelliteToast, type ToastNotification } from "../../components/UI/SatelliteToast";
import Loading from "../../components/UI/Loading";
import type { Room, Seat } from "../../entities/type";
import { RoomPageHeader } from "./modules/RoomPageHeader";
import { RoomListSection } from "./modules/RoomListSection";
import { RoomModals } from "./modules/RoomModals";

const ROWS = 8;
const COLS = 10;

export default function RoomManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms = [] } = useSelector((state: RootState) => state.rooms);
  const { seatsByRoom } = useSelector((state: RootState) => state.seats);

  const validRooms = useMemo(
    () => Array.isArray(rooms) ? rooms.filter(r => r && typeof r.id === "number" && r.roomName) : [],
    [rooms]
  );
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const selectedRoom = validRooms.find(r => r.id === selectedRoomId) ?? null;

  const [localPremiumSeats, setLocalPremiumSeats] = useState<string[]>([]);
  const [localEmptySeats, setLocalEmptySeats] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRoom) {
      const roomSeats = seatsByRoom[selectedRoom.id] || [];
      setLocalPremiumSeats(roomSeats.filter(s => s.seatType === 'PREMIUM' && !s.empty).map(s => s.seatCode));
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
        // Ensure room.id is always a valid number
        const roomId = typeof room.id === 'number' ? room.id : null;
        if (roomId !== null) {
          dispatch(fetchSeatsByRoom(roomId));
        }
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
    if (typeof room.id !== 'number') {
      console.warn('Invalid room ID:', room.id);
      return;
    }
    setEditRoomName(room.roomName);
    setEditRoomRows(room.rowSize);
    setEditRoomCols(room.columnSize);
    setSelectedRoomId(room.id);
    setShowEditModal(true);
  }

  async function handleCreateRoom() {
    if (!newRoomName || !newRoomRows || !newRoomCols) return;
    try {
      await dispatch(addRoom({
        roomName: newRoomName,
        rowSize: newRoomRows,
        columnSize: newRoomCols,
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
        rowSize: editRoomRows,
        columnSize: editRoomCols,
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
    if (typeof room.id !== 'number') {
      console.warn('Invalid room ID:', room.id);
      return;
    }
    setSelectedRoomId(room.id);
    setShowConfigModal(true);
  }

  async function handleUpdateSeats() {
    if (!selectedRoom || typeof selectedRoom.id !== 'number') {
      console.warn('Invalid selected room:', selectedRoom);
      return;
    }
    setSaving(true);
    try {
      const res = await dispatch(fetchSeatsByRoom(selectedRoom.id));
      const seats = res.payload as Seat[];
      const updatePromises = seats
        .map(seat => {
          const shouldBePremium = localPremiumSeats.includes(seat.seatCode);
          const shouldBeEmpty = localEmptySeats.includes(seat.seatCode);
          const currentSeatType = seat.seatType === 'PREMIUM' ? true : false;
          if (currentSeatType !== shouldBePremium || seat.empty !== shouldBeEmpty) {
            return dispatch(updateSeat({
              id: seat.id,
              seatType: shouldBePremium ? 'PREMIUM' : 'STANDARD',
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
    dispatch(restoreRoom(id))
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
    <div className="w-full space-y-6">
      <SatelliteToast ref={toastRef} />

      {initialLoading ? (
        <Loading fullscreen={false} />
      ) : (
        <>
          <RoomPageHeader />

          <RoomListSection
            rooms={validRooms}
            seatsByRoom={seatsByRoom}
            onConfig={openConfigModal}
            onEdit={openEditModal}
            onDelete={(id) => {
              setRoomToDelete(id);
              setShowDeleteModal(true);
            }}
            onCreate={() => setShowCreateModal(true)}
            onReactivate={handleReactivateRoom}
          />

          <RoomModals
            showCreateModal={showCreateModal}
            onCreateModalClose={() => setShowCreateModal(false)}
            roomName={newRoomName}
            setRoomName={setNewRoomName}
            roomRows={newRoomRows}
            setRoomRows={setNewRoomRows}
            roomCols={newRoomCols}
            setRoomCols={setNewRoomCols}
            onCreateRoom={handleCreateRoom}
            showEditModal={showEditModal}
            onEditModalClose={() => setShowEditModal(false)}
            editRoomName={editRoomName}
            setEditRoomName={setEditRoomName}
            editRoomRows={editRoomRows}
            setEditRoomRows={setEditRoomRows}
            editRoomCols={editRoomCols}
            setEditRoomCols={setEditRoomCols}
            onEditRoom={handleEditRoom}
            showDeleteModal={showDeleteModal}
            onDeleteModalClose={() => setShowDeleteModal(false)}
            roomToDelete={roomToDelete}
            onDeleteRoom={handleDeleteRoom}
            showConfigModal={showConfigModal}
            onConfigModalClose={() => setShowConfigModal(false)}
            hoveredSeat={hoveredSeat}
            setHoveredSeat={setHoveredSeat}
            filter={filter}
            setFilter={setFilter}
            localPremiumSeats={localPremiumSeats}
            setLocalPremiumSeats={setLocalPremiumSeats}
            localEmptySeats={localEmptySeats}
            setLocalEmptySeats={setLocalEmptySeats}
            onUpdateSeats={handleUpdateSeats}
            saving={saving}
            selectedRoom={selectedRoom}
            loading={initialLoading}
          />
        </>
      )}
    </div>
  );
}