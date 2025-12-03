import AppButton from "../../components/UI/AppButton";
import type { Session } from "../../entities/type";

interface Props {
  year: number;
  month: number;
  today: Date;
  daysInMonth: number;
  firstDayOfWeek: number;
  WEEKDAYS: string[];
  sessions: Session[];
  formatDate: (day: number) => string;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  onSelectDate: (date: string) => void;
}

export default function SessionCalendar({
  year,
  month,
  today,
  daysInMonth,
  firstDayOfWeek,
  WEEKDAYS,
  sessions,
  formatDate,
  goToPrevMonth,
  goToNextMonth,
  onSelectDate,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <AppButton
          onClick={goToPrevMonth}
          className="text-blue-700 border-blue-300"
        >
          ←
        </AppButton>
        <span className="font-semibold text-lg text-blue-700 dark:text-blue-200 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
          {new Date(year, month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <AppButton
          onClick={goToNextMonth}
          className="text-blue-700 border-blue-300"
        >
          →
        </AppButton>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-1">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-blue-600 dark:text-blue-300 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 pb-4">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {[...Array(daysInMonth)].map((_, i) => {
          const dateStr = formatDate(i + 1);
          const isToday =
            year === today.getFullYear() &&
            month === today.getMonth() &&
            i + 1 === today.getDate();
          return (
            <button
              key={dateStr}
              className={`flex flex-col items-center min-h-[70px] bg-white dark:bg-zinc-900 rounded-lg shadow p-2 hover:ring-2 ring-blue-500 transition
                ${isToday ? "border-2 border-blue-500 dark:border-blue-400" : ""}
              `}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="text-lg font-bold text-blue-700 dark:text-blue-200">{i + 1}</span>
              <span className="text-xs text-blue-600 dark:text-blue-300">{dateStr}</span>
              <span className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {sessions.filter(s => s.session_date === dateStr).length > 0
                  ? `${sessions.filter(s => s.session_date === dateStr).length} sessions`
                  : ""}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}