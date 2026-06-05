import { useState, type Dispatch, type SetStateAction } from "react";
import { SectionCard } from "@/shared/components/ui/DashboardPrimitives";
import SessionCalendar from "../SessionCalendar";
import SessionTimeline from "../SessionTimeline";
import SessionBoardView from "../SessionBoardView";
import AppButton from "@/shared/components/ui/AppButton";
import type { Movie, Session } from "@/shared/types/entities";

interface SessionViewsProps {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  showTimeline: boolean;
  setShowTimeline: (show: boolean) => void;
  sessions: Session[];
  allMovies: Movie[];
  weekDates: { label: string; date: string }[];
  showDeletedSessions: boolean;
  setShowDeletedSessions: Dispatch<SetStateAction<boolean>>;
  onAddSession: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: number) => void;
  onRestoreSession: (sessionId: number) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SessionViews({
  selectedDate,
  setSelectedDate,
  showTimeline,
  setShowTimeline,
  sessions,
  allMovies,
  weekDates,
  showDeletedSessions,
  setShowDeletedSessions,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onRestoreSession,
}: SessionViewsProps) {
  // Calendar state for month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const { year, month } = calendarMonth;
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AppButton
            onClick={() => setShowTimeline(false)}
            variant={!showTimeline ? "solid" : "ghost"}
            size="sm"
          >
            Calendar View
          </AppButton>
          <AppButton
            onClick={() => setShowTimeline(true)}
            variant={showTimeline ? "solid" : "ghost"}
            size="sm"
          >
            Timeline View
          </AppButton>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100">
            <AppButton
              type="button"
              onClick={() => setShowDeletedSessions((prev) => !prev)}
              size="sm"
              variant={showDeletedSessions ? "solid" : "ghost"}
              color="danger"
              className="rounded-full"
              aria-pressed={showDeletedSessions}
            >
              {showDeletedSessions ? "Hide deleted" : "Show deleted"}
            </AppButton>
          </div>
        </div>
        <AppButton onClick={onAddSession} size="sm">
          + Add Session
        </AppButton>
      </div>

      <SectionCard title="Session Schedule" description="View and manage movie sessions across all rooms">
        {showTimeline ? (
          <SessionTimeline
            weekDates={weekDates}
            rooms={[]}
            sessions={sessions.filter(s => !s.deleted || showDeletedSessions)}
            showDeletedSessions={showDeletedSessions}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
            onRestoreSession={onRestoreSession}
          />
        ) : !selectedDate ? (
          <SessionCalendar
            year={year}
            month={month}
            today={today}
            daysInMonth={daysInMonth}
            firstDayOfWeek={firstDayOfWeek}
            WEEKDAYS={WEEKDAYS}
            sessions={sessions.filter(s => !s.deleted || showDeletedSessions)}
            showDeletedSessions={showDeletedSessions}
            formatDate={formatDate}
            goToPrevMonth={goToPrevMonth}
            goToNextMonth={goToNextMonth}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <SessionBoardView
            selectedDate={selectedDate}
            sessions={sessions.filter(s => !s.deleted || showDeletedSessions)}
            movies={allMovies}
            rooms={[]}
            showDeletedSessions={showDeletedSessions}
            onBack={() => setSelectedDate(null)}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
            onRestoreSession={onRestoreSession}
          />
        )}
      </SectionCard>
    </div>
  );
}
