import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, type RootState } from "../../store/store";
import { fetchSessions, addSessionAsync, updateSession, deleteSessionAsync, restoreSession, fetchMovies, fetchGenres } from "../../store/slices";
import type { CreateSessionRequestDTO, UpdateSessionRequestDTO } from "../../dto/dto";
import type { Session } from "../../entities/type";
import type { ToastNotification } from "../../components/UI/SatelliteToast";
import AppButton from "../../components/UI/AppButton";
import { SatelliteToast } from "../../components/UI/SatelliteToast";
import ConfirmationModal from "../../components/UI/ConfirmationModal";
import SessionTimeline from "./SessionTimeline";
import Loading from "../../components/UI/Loading";
import SessionAddModal from "./SessionAddModal";
import SessionEditModal from "./SessionEditModal";
import SessionBoardView from "./SessionBoardView";
import SessionCalendar from "./SessionCalendar";

function getCurrentWeekDates(today = new Date()) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      label: weekDays[i],
      date: d.toISOString().slice(0, 10),
    };
  });
}

function addMinutesToTime(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + mins;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

export default function ShowtimePage() {
  // Redux state
  const dispatch = useAppDispatch();
  const { items: allMovies, loading: moviesLoading } = useAppSelector((state: RootState) => state.movies);
  const { items: sessions, loading: sessionsLoading } = useAppSelector((state: RootState) => state.sessions);

  // Toast ref
  const toastRef = useRef<{ showNotification: (options: Omit<ToastNotification, "id">) => void } | null>(null);

  // Use ref to track if fetch has already been initiated
  const fetchInitiatedRef = useRef(false);

  // --- Page loading state ---
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Only fetch if we haven't already initiated a fetch
    if (fetchInitiatedRef.current) return;
    
    setLoading(true);
    fetchInitiatedRef.current = true;
    Promise.all([
      dispatch(fetchMovies({ page: 0, size: 100 })),
      dispatch(fetchGenres()),
      dispatch(fetchSessions())
    ]).finally(() => setLoading(false));
  }, [dispatch]); // Empty array: run only once on mount

  // --- UI State ---
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showDeletedSessions, setShowDeletedSessions] = useState(false);

  // --- Confirmation Modal State ---
  const [confirmAction, setConfirmAction] = useState<{ type: "delete" | "restore"; sessionId: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Modal State ---
  const weekDates = getCurrentWeekDates();
  const [modalMovieId, setModalMovieId] = useState<number | null>(null);
  const [modalRoom, setModalRoom] = useState<number | null>(null);
  const [modalDate, setModalDate] = useState(weekDates[0].date);
  const [modalStart, setModalStart] = useState("10:00");

  // Calculate end time and auto-fill base price based on selected movie duration and price
  const selectedMovie = allMovies.find(m => m.id === modalMovieId);
  const modalEnd = selectedMovie ? addMinutesToTime(modalStart, selectedMovie.duration) : "";
  const basePrice = selectedMovie?.rating ? Math.round(selectedMovie.rating * 10) : 100;

  // Helper to calculate end date (handles midnight wraparound)
  function getEndDateTime(date: string, startTime: string, endTime: string): string {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startTotalMins = startH * 60 + startM;
    const endTotalMins = endH * 60 + endM;
    
    // If end time is earlier than start time (in minutes), it means it's the next day
    if (endTotalMins < startTotalMins) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      return nextDate.toISOString().slice(0, 10);
    }
    return date;
  }

  // --- Add Session Handler ---
  async function handleAddSession() {
    const sessionDate = selectedDate || modalDate;
    if (!modalMovieId || !modalRoom || !sessionDate || !modalStart || !modalEnd || basePrice <= 0) {
      toastRef.current?.showNotification({ 
        title: "Error", 
        content: "Please fill in all required fields", 
        position: "bottom-right",
        accentColor: "#ef4444",
        longevity: 3000,
      });
      return;
    }

    // Build ISO datetime strings with correct date for end time (handles midnight wraparound)
    const startDateTime = `${sessionDate}T${modalStart}:00`;
    const endDate = getEndDateTime(sessionDate, modalStart, modalEnd);
    const endDateTime = `${endDate}T${modalEnd}:00`;

    const createRequest: CreateSessionRequestDTO = {
      movieId: modalMovieId,
      roomId: modalRoom,
      startTime: startDateTime,
      endTime: endDateTime,
      basePrice,
    };

    console.log("Adding session with payload:", createRequest);

    try {
      await dispatch(addSessionAsync(createRequest)).unwrap();
      
      // Show success toast
      toastRef.current?.showNotification({ 
        title: "Success", 
        content: "Session added successfully!", 
        position: "bottom-right", 
        accentColor: "#22c55e",
        longevity: 3500,
      });
      
      // Refetch sessions to update the UI
      dispatch(fetchSessions());
      
      // Reset modal
      setShowAddModal(false);
      setModalMovieId(null);
      setModalRoom(null);
      setModalDate(weekDates[0].date);
      setModalStart("10:00");
    } catch (error) {
      console.error("Failed to add session:", error);
      const msg = error instanceof Error ? error.message : "Failed to add session. Please try again.";
      toastRef.current?.showNotification({ 
        title: "Error", 
        content: msg, 
        position: "bottom-right", 
        accentColor: "#ef4444",
        longevity: 3000,
      });
    }
  }

  // --- Update Session Handler ---
  async function handleUpdateSession() {
    if (!editingSession || !modalMovieId || !modalRoom || !modalDate || !modalStart) {
      toastRef.current?.showNotification({ 
        title: "Error", 
        content: "Please fill in all required fields", 
        position: "bottom-right",
        accentColor: "#ef4444",
        longevity: 3000,
      });
      return;
    }

    // Build ISO datetime strings with correct date for end time (handles midnight wraparound)
    const startDateTime = `${modalDate}T${modalStart}:00`;
    const endDate = getEndDateTime(modalDate, modalStart, modalEnd);
    const endDateTime = `${endDate}T${modalEnd}:00`;

    const updateRequest: UpdateSessionRequestDTO = {
      id: editingSession.id,
      movieId: modalMovieId,
      roomId: modalRoom,
      startTime: startDateTime,
      endTime: endDateTime,
      basePrice,
    };

    console.log("Updating session with payload:", updateRequest);

    try {
      await dispatch(updateSession(updateRequest)).unwrap();
      
      // Show success toast
      toastRef.current?.showNotification({ 
        title: "Success", 
        content: "Session updated successfully!", 
        position: "bottom-right", 
        accentColor: "#22c55e",
        longevity: 3500,
      });
      
      // Refetch sessions to update the UI
      dispatch(fetchSessions());
      
      // Reset modal
      setShowEditModal(false);
      setEditingSession(null);
      setModalMovieId(null);
      setModalRoom(null);
      setModalDate(weekDates[0].date);
      setModalStart("10:00");
    } catch (error) {
      console.error("Failed to update session:", error);
      const msg = error instanceof Error ? error.message : "Failed to update session. Please try again.";
      toastRef.current?.showNotification({ 
        title: "Error", 
        content: msg, 
        position: "bottom-right", 
        accentColor: "#ef4444",
        longevity: 3000,
      });
    }
  }

  // --- Open Edit Modal ---
  function openEditModal(session: Session) {
    setEditingSession(session);
    setModalMovieId(session.movieId);
    setModalRoom(session.roomId);
    setModalDate(session.startTime.split('T')[0]);
    setModalStart(session.startTime.split('T')[1].slice(0, 5));
    setShowEditModal(true);
  }

  // --- Delete Session Handler ---
  async function handleDeleteSession(sessionId: number) {
    // Show confirmation modal
    setConfirmAction({ type: "delete", sessionId });
  }

  // --- Restore Session Handler ---
  async function handleRestoreSession(sessionId: number) {
    // Show confirmation modal
    setConfirmAction({ type: "restore", sessionId });
  }

  // --- Handle Confirmation ---
  async function handleConfirmAction() {
    if (!confirmAction) return;

    setIsProcessing(true);
    try {
      if (confirmAction.type === "delete") {
        // Show processing toast
        toastRef.current?.showNotification({
          title: "Processing",
          content: "Deleting session...",
          position: "bottom-right",
          accentColor: "#3b82f6",
          longevity: 2000,
        });

        console.log("Deleting session:", confirmAction.sessionId);
        await dispatch(deleteSessionAsync(confirmAction.sessionId)).unwrap();

        // Refetch sessions to update the UI
        await dispatch(fetchSessions()).unwrap();

        // Show success toast
        setTimeout(() => {
          toastRef.current?.showNotification({
            title: "Deleted Successfully",
            content: "Session has been deleted. Use 'Show Deleted' to restore it.",
            position: "bottom-right",
            accentColor: "#22c55e",
            longevity: 4000,
          });
        }, 300);
      } else if (confirmAction.type === "restore") {
        // Show processing toast
        toastRef.current?.showNotification({
          title: "Restoring",
          content: "Session is being restored...",
          position: "bottom-right",
          accentColor: "#3b82f6",
          longevity: 2000,
        });

        console.log("Restoring session:", confirmAction.sessionId);
        await dispatch(restoreSession(confirmAction.sessionId)).unwrap();

        // Refetch sessions to update the UI
        await dispatch(fetchSessions()).unwrap();

        // Show success toast
        setTimeout(() => {
          toastRef.current?.showNotification({
            title: "Restored Successfully",
            content: "Session has been restored and is now available.",
            position: "bottom-right",
            accentColor: "#22c55e",
            longevity: 4000,
          });
        }, 300);
      }
    } catch (error) {
      console.error("Failed to confirm action:", error);
      const msg = error instanceof Error ? error.message : "Action failed. Please try again.";
      setTimeout(() => {
        toastRef.current?.showNotification({
          title: "Action Failed",
          content: msg,
          position: "bottom-right",
          accentColor: "#ef4444",
          longevity: 3500,
        });
      }, 300);
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  }

  // Calendar state for month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const { year, month } = calendarMonth;
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function goToPrevMonth() {
    setCalendarMonth(prev => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  }

  function goToNextMonth() {
    setCalendarMonth(prev => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  }

  function formatDate(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // --- UI ---
  if (loading || moviesLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
        <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loading />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16">
        <h2 className="text-3xl font-extrabold mb-2 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow font-audiowide" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          🎬 Sessions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8 font-farro" style={{ fontFamily: 'Farro, sans-serif' }}>Schedule movie sessions and manage screening times</p>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-800 p-8 mb-10">
          {/* Top controls: Timeline/Calendar toggle and Add Session */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex gap-4">
              {!selectedDate && (
                <AppButton
                  onClick={() => setShowTimeline(t => !t)}
                  className="text-blue-700 border-blue-300"
                >
                  {showTimeline ? "Show Calendar View" : "Show Timeline View"}
                </AppButton>
              )}
              <AppButton
                onClick={() => setShowDeletedSessions(t => !t)}
                className={showDeletedSessions ? "bg-gradient-to-r from-orange-600 to-orange-400 text-white" : "text-gray-700 border-gray-300"}
              >
                {showDeletedSessions ? "Hide Deleted Sessions" : "Show Deleted Sessions"}
              </AppButton>
            </div>
            <div>
              {selectedDate && !showAddModal && (
                <AppButton
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                >
                  + Add Session
                </AppButton>
              )}
            </div>
          </div>

          {/* Add Session Modal */}
          <SessionAddModal
            show={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setModalMovieId(null);
              setModalRoom(null);
              setModalDate(weekDates[0].date);
              setModalStart("10:00");
            }}
            modalMovieId={modalMovieId}
            setModalMovieId={setModalMovieId}
            modalRoom={modalRoom}
            setModalRoom={setModalRoom}
            modalDate={modalDate}
            setModalDate={setModalDate}
            modalStart={modalStart}
            setModalStart={setModalStart}
            modalEnd={modalEnd}
            selectedDate={selectedDate}
            basePrice={basePrice}
            onAdd={() => {
              setModalDate(selectedDate || modalDate);
              handleAddSession();
            }}
          />

          {/* Edit Session Modal */}
          <SessionEditModal
            show={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingSession(null);
              setModalMovieId(null);
              setModalRoom(null);
              setModalDate(weekDates[0].date);
              setModalStart("10:00");
            }}
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
            onUpdate={handleUpdateSession}
          />

          {/* --- 1. Calendar View --- */}
          {!showTimeline && !selectedDate && (
            <SessionCalendar
              year={year}
              month={month}
              today={today}
              daysInMonth={daysInMonth}
              firstDayOfWeek={firstDayOfWeek}
              WEEKDAYS={WEEKDAYS}
              sessions={sessions}
              showDeletedSessions={showDeletedSessions}
              formatDate={formatDate}
              goToPrevMonth={goToPrevMonth}
              goToNextMonth={goToNextMonth}
              onSelectDate={setSelectedDate}
            />
          )}

          {/* --- 2. Timeline View (current week only) --- */}
          {showTimeline && !selectedDate && (
            <div>
              <SessionTimeline
                weekLabel="This Week"
                weekDates={weekDates}
                rooms={[]}
                sessions={sessions}
                showDeletedSessions={showDeletedSessions}
                onEditSession={openEditModal}
                onDeleteSession={handleDeleteSession}
                onRestoreSession={handleRestoreSession}
              />
            </div>
          )}

          {/* --- 3. Board (Kanban) View for a selected date --- */}
          {selectedDate && (
            <SessionBoardView
              selectedDate={selectedDate}
              sessions={sessions}
              movies={allMovies}
              rooms={[]}
              showDeletedSessions={showDeletedSessions}
              onBack={() => setSelectedDate(null)}
              onEditSession={openEditModal}
              onDeleteSession={handleDeleteSession}
              onRestoreSession={handleRestoreSession}
            />
          )}
        </div>
      </div>
      <SatelliteToast ref={toastRef} />
      <ConfirmationModal
        isOpen={confirmAction !== null}
        title={confirmAction?.type === "delete" ? "Delete Session" : "Restore Session"}
        message={
          confirmAction?.type === "delete"
            ? "This session will be soft deleted and can be restored later. Are you sure you want to proceed?"
            : "This session will be restored and become available again. Are you sure?"
        }
        actionLabel={confirmAction?.type === "delete" ? "Delete" : "Restore"}
        isDangerous={confirmAction?.type === "delete"}
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}