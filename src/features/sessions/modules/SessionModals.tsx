import { AnimatePresence } from "framer-motion";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import SessionAddModal from "../SessionAddModal";
import SessionEditModal from "../SessionEditModal";
import type { Session } from "@/shared/types/entities";

interface SessionModalsProps {
  showAddModal: boolean;
  onAddModalClose: () => void;
  selectedDate: string | null;
  modalMovieId: number | null;
  setModalMovieId: (id: number | null) => void;
  modalRoom: number | null;
  setModalRoom: (room: number | null) => void;
  modalDate: string;
  setModalDate: (date: string) => void;
  modalStart: string;
  setModalStart: (time: string) => void;
  modalEnd: string;
  basePrice: number;
  onAddSession: () => void;

  showEditModal: boolean;
  onEditModalClose: () => void;
  editingSession: Session | null;
  onUpdateSession: () => void;

  confirmAction: { type: "delete" | "restore"; sessionId: number } | null;
  isProcessing: boolean;
  onConfirmAction: () => void;
  onCancelAction: () => void;
}

export function SessionModals({
  showAddModal,
  onAddModalClose,
  selectedDate,
  modalMovieId,
  setModalMovieId,
  modalRoom,
  setModalRoom,
  modalDate,
  setModalDate,
  modalStart,
  setModalStart,
  basePrice,
  onAddSession,

  showEditModal,
  onEditModalClose,
  editingSession,
  modalEnd,
  onUpdateSession,

  confirmAction,
  isProcessing,
  onConfirmAction,
  onCancelAction,
}: SessionModalsProps) {
  return (
    <AnimatePresence>
      <SessionAddModal
        open={showAddModal}
        onClose={onAddModalClose}
        selectedDate={selectedDate}
        modalMovieId={modalMovieId}
        setModalMovieId={setModalMovieId}
        modalRoom={modalRoom}
        setModalRoom={setModalRoom}
        modalDate={modalDate}
        setModalDate={setModalDate}
        modalStart={modalStart}
        setModalStart={setModalStart}
        modalEnd={modalEnd}
        basePrice={basePrice}
        onAdd={onAddSession}
      />
      {editingSession && (
        <SessionEditModal
          open={showEditModal}
          onClose={onEditModalClose}
          session={editingSession}
          modalMovieId={modalMovieId}
          setModalMovieId={setModalMovieId}
          modalRoom={modalRoom}
          setModalRoom={setModalRoom}
          modalDate={modalDate}
          setModalDate={setModalDate}
          modalStart={modalStart}
          setModalStart={setModalStart}
          modalEnd={modalEnd}
          basePrice={basePrice}
          onUpdate={onUpdateSession}
        />
      )}
      <ConfirmationModal
        title={confirmAction?.type === "delete" ? "Delete Session" : "Restore Session"}
        message={
          confirmAction?.type === "delete"
            ? "Are you sure you want to delete this session? This action cannot be undone."
            : "Restore this session?"
        }
        actionLabel={confirmAction?.type === "delete" ? "Delete" : "Restore"}
        cancelLabel="Cancel"
        isDangerous={confirmAction?.type === "delete"}
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
        isOpen={!!confirmAction}
        isLoading={isProcessing}
      />
    </AnimatePresence>
  );
}
