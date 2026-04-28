import { AnimatePresence } from "framer-motion";
import CreateRoomModal from "../rooms/CreateRoomModal";
import EditRoomModal from "../rooms/EditRoomModal";
import DeleteRoomModal from "../rooms/DeleteRoomModal";
import RoomConfigModal from "../rooms/RoomConfigModal";
import type { Room } from "../../../entities/type";

interface RoomModalsProps {
  showCreateModal: boolean;
  onCreateModalClose: () => void;
  roomName: string;
  setRoomName: (name: string) => void;
  roomRows: number;
  setRoomRows: (rows: number) => void;
  roomCols: number;
  setRoomCols: (cols: number) => void;
  onCreateRoom: () => void;

  showEditModal: boolean;
  onEditModalClose: () => void;
  editRoomName: string;
  setEditRoomName: (name: string) => void;
  editRoomRows: number;
  setEditRoomRows: (rows: number) => void;
  editRoomCols: number;
  setEditRoomCols: (cols: number) => void;
  onEditRoom: () => void;

  showDeleteModal: boolean;
  onDeleteModalClose: () => void;
  roomToDelete: number | null;
  onDeleteRoom: (id: number) => void;

  showConfigModal: boolean;
  onConfigModalClose: () => void;
  hoveredSeat: string | null;
  setHoveredSeat: (seat: string | null) => void;
  filter: "all" | "economy" | "premium";
  setFilter: (filter: "all" | "economy" | "premium") => void;
  localPremiumSeats: string[];
  setLocalPremiumSeats: (seats: string[]) => void;
  localEmptySeats: string[];
  setLocalEmptySeats: (seats: string[]) => void;
  onUpdateSeats: () => void;
  saving: boolean;

  // RoomConfigModal props
  selectedRoom: Room | null;
  loading: boolean;
}

export function RoomModals({
  showCreateModal,
  onCreateModalClose,
  roomName,
  setRoomName,
  roomRows,
  setRoomRows,
  roomCols,
  setRoomCols,
  onCreateRoom,

  showEditModal,
  onEditModalClose,
  editRoomName,
  setEditRoomName,
  editRoomRows,
  setEditRoomRows,
  editRoomCols,
  setEditRoomCols,
  onEditRoom,

  showDeleteModal,
  onDeleteModalClose,
  roomToDelete,
  onDeleteRoom,

  showConfigModal,
  onConfigModalClose,
  hoveredSeat,
  setHoveredSeat,
  filter,
  setFilter,
  localPremiumSeats,
  setLocalPremiumSeats,
  localEmptySeats,
  setLocalEmptySeats,
  onUpdateSeats,
  saving,
  selectedRoom,
  loading,
}: RoomModalsProps) {
  return (
    <AnimatePresence>
      <CreateRoomModal
        open={showCreateModal}
        onClose={onCreateModalClose}
        roomName={roomName}
        setRoomName={setRoomName}
        roomRows={roomRows}
        setRoomRows={setRoomRows}
        roomCols={roomCols}
        setRoomCols={setRoomCols}
        onCreate={onCreateRoom}
      />
      <EditRoomModal
        open={showEditModal}
        onClose={onEditModalClose}
        roomName={editRoomName}
        setRoomName={setEditRoomName}
        roomRows={editRoomRows}
        setRoomRows={setEditRoomRows}
        roomCols={editRoomCols}
        setRoomCols={setEditRoomCols}
        onEdit={onEditRoom}
      />
      <DeleteRoomModal
        open={showDeleteModal}
        onClose={onDeleteModalClose}
        onDelete={onDeleteRoom}
      />
      <RoomConfigModal
        open={showConfigModal}
        onClose={onConfigModalClose}
        room={selectedRoom}
        loading={loading}
        hoveredSeat={hoveredSeat}
        setHoveredSeat={setHoveredSeat}
        filter={filter}
        setFilter={setFilter}
        localPremiumSeats={localPremiumSeats}
        setLocalPremiumSeats={setLocalPremiumSeats}
        localEmptySeats={localEmptySeats}
        setLocalEmptySeats={setLocalEmptySeats}
        onUpdateSeats={onUpdateSeats}
        saving={saving}
      />
    </AnimatePresence>
  );
}
