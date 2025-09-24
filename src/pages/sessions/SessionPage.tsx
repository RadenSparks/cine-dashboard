import { useState, useEffect } from "react";
import AppButton from "../../components/UI/AppButton";
import SessionTimeline from "./SessionTimeline";
import Loading from "../../components/UI/Loading";
import SessionAddModal from "./SessionAddModal";
import SessionBoardView from "./SessionBoardView";
import SessionCalendar from "./SessionCalendar";

// Mock data for movies and rooms
const movies = [
  { id: 1, title: "Movie A", duration: 120, premiere_date: "2025-01-01", genre_ids: [1, 2] },
  { id: 2, title: "Movie B", duration: 90, premiere_date: "2025-02-01", genre_ids: [2, 3] },
  { id: 3, title: "Movie C", duration: 150, premiere_date: "2025-03-01", genre_ids: [1, 4] },
  { id: 4, title: "Movie D", duration: 120, premiere_date: "2025-04-01", genre_ids: [3, 5] },
  { id: 5, title: "Movie E", duration: 90, premiere_date: "2025-05-01", genre_ids: [2, 5] },
];
const rooms = ["Room 1", "Room 2", "Room 3"];

// Mock data for sessions
const mockSessions = [
  { session_id: 1, movie_id: 1, room_id: 1, session_date: "2025-09-22" },
  { session_id: 2, movie_id: 2, room_id: 2, session_date: "2025-09-23" },
  { session_id: 3, movie_id: 3, room_id: 1, session_date: "2025-09-24" },
  { session_id: 4, movie_id: 4, room_id: 3, session_date: "2025-09-22" },
  { session_id: 5, movie_id: 5, room_id: 2, session_date: "2025-09-25" },
];

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
  const date = new Date(0, 0, 0, h, m + mins);
  return date.toTimeString().slice(0, 5);
}

export default function ShowtimePage() {
  // --- State ---
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Page loading state ---
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  // Sessions for the week (mock data)
  const weekDates = getCurrentWeekDates();
  const [sessions, setSessions] = useState(mockSessions);

  // --- Modal State ---
  const [modalMovieId, setModalMovieId] = useState<number | null>(null);
  const [modalRoom, setModalRoom] = useState<string>(rooms[0]);
  const [modalDate, setModalDate] = useState(weekDates[0].date);
  const [modalStart, setModalStart] = useState("10:00");

  // Calculate end time
  const selectedMovie = movies.find(m => m.id === modalMovieId);
  const modalEnd = selectedMovie ? addMinutesToTime(modalStart, selectedMovie.duration) : "";

  // --- Add Session Handler ---
  function handleAddSession() {
    const sessionDate = selectedDate || modalDate;
    if (!modalMovieId || !modalRoom || !sessionDate || !modalStart) return;
    const movie = movies.find(m => m.id === modalMovieId);
    const room_id = rooms.findIndex(r => r === modalRoom) + 1;
    setSessions(prev => [
      ...prev,
      {
        session_id: prev.length + 1,
        movie_id: movie?.id ?? 0,
        room_id,
        session_date: sessionDate,
      },
    ]);
    setShowAddModal(false);
    setModalMovieId(null);
    setModalRoom(rooms[0]);
    setModalDate(weekDates[0].date);
    setModalStart("10:00");
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
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading />
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
          🎬 Sessions
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950 py-10 hide-scrollbar">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 xl:px-16">
        <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-200 tracking-tight drop-shadow">
          🎬 Sessions
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-zinc-800 p-8 mb-10">
          {/* Top controls: Timeline/Calendar toggle and Add Session */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              {!selectedDate && (
                <AppButton
                  onClick={() => setShowTimeline(t => !t)}
                  className="text-blue-700 border-blue-300"
                >
                  {showTimeline ? "Show Calendar View" : "Show Timeline View"}
                </AppButton>
              )}
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
            onClose={() => setShowAddModal(false)}
            movies={movies}
            rooms={rooms}
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
            onAdd={() => {
              setModalDate(selectedDate || modalDate);
              handleAddSession();
            }}
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
                rooms={rooms}
                sessions={sessions}
              />
            </div>
          )}

          {/* --- 3. Board (Kanban) View for a selected date --- */}
          {selectedDate && (
            <SessionBoardView
              selectedDate={selectedDate}
              sessions={sessions}
              movies={movies}
              rooms={rooms}
              onBack={() => setSelectedDate(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}