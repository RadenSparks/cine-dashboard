import { AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../../components/UI/ConfirmationModal";
import SessionAddModal from "../SessionAddModal";
import SessionEditModal from "../SessionEditModal";
import type { Session } from "../../../entities/type";

interface SessionModalsProps {
  showAddModal: boolean;
  onAddModalClose: () => void;
  allMovies: any[];
  weekDates: { label: string; date: string }[];
  selectedDate: string | null;
  modalMovieId: number | null;
  setModalMovieId: (id: number | null) => void;
  modalRoom: number | null;
  setModalRoom: (room: number | null) => void;
  modalDate: string;
  setModalDate: (date: string) => void;
  modalStart: string;
  setModalStart: (time: string) => void;
  basePrice: number;
  onAddSession: () => void;

  showEditModal: boolean;
  onEditModalClose: () => void;
  editingSession: Session | null;
  modalEnd: string;
  onUpdateSession: () => void;

  confirmAction: { type: "delete" | "restore"; sessionId: number } | null;
  isProcessing: boolean;
  onConfirmAction: () => void;
  onCancelAction: () => void;
}

export function SessionModals({
  showAddModal,
  onAddModalClose,
  allMovies,
  weekDates,
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
        allMovies={allMovies}
        weekDates={weekDates}
        selectedDate={selectedDate}
        modalMovieId={modalMovieId}
        setModalMovieId={setModalMovieId}
        modalRoom={modalRoom}
        setModalRoom={setModalRoom}
        modalDate={modalDate}
        setModalDate={setModalDate}
        modalStart={modalStart}
        setModalStart={setModalStart}
        basePrice={basePrice}
        onAdd={onAddSession}
      />
      {editingSession && (
        <SessionEditModal
          open={showEditModal}
          onClose={onEditModalClose}
          session={editingSession}
          allMovies={allMovies}
          weekDates={weekDates}
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
        confirmText={confirmAction?.type === "delete" ? "Delete" : "Restore"}
        cancelText="Cancel"
        isDangerous={confirmAction?.type === "delete"}
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
        isOpen={!!confirmAction}
        isProcessing={isProcessing}
      />
    </AnimatePresence>
  );
}
