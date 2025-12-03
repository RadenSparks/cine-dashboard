import AppButton from "../../components/UI/AppButton";
import type { Session, Movie } from "../../entities/type";

interface Props {
  selectedDate: string;
  sessions: Session[];
  movies: Movie[];
  rooms: string[];
  onBack: () => void;
}

// Helper: mock start/end time if not present (for demo)
function getSessionTime(session: Session, idx: number): { start: string; end: string } {
  const baseHour = 9 + (idx % 8) * 2;
  const start = `${String(baseHour).padStart(2, "0")}:00`;
  const end = `${String(baseHour + 2).padStart(2, "0")}:00`;
  return { start, end };
}

type DisplaySession = Session & {
  start: string;
  end: string;
  movie: string;
  room: string;
};

export default function SessionBoardView({ selectedDate, sessions, movies, rooms, onBack }: Props) {
  return (
    <div>
      <div className="flex items-center mb-4">
        <AppButton
          onClick={onBack}
          className="mr-4 text-blue-700 dark:text-blue-200 border-blue-300"
        >
          ← Back to Calendar
        </AppButton>
        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-200 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>Sessions for: {selectedDate}</h3>
      </div>
      <div className="flex gap-6 overflow-x-auto">
        {["Morning", "Afternoon", "Evening", "Night"].map(slot => (
          <div key={slot} className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 min-w-[250px] flex-1 border border-blue-100 dark:border-zinc-800">
            <div className="font-semibold mb-2 text-blue-700 dark:text-blue-200 font-red-rose" style={{ fontFamily: 'Red Rose, sans-serif' }}>{slot}</div>
            <div className="flex flex-col gap-3">
              {sessions
                .filter(s => typeof s.room_id === "number" && typeof s.movie_id === "number")
                .map((s, idx): DisplaySession => {
                  const { start, end } = getSessionTime(s, idx);
                  return {
                    ...s,
                    start,
                    end,
                    movie: movies.find(m => m.id === s.movie_id)?.title || "Unknown",
                    room:
                      typeof s.room_id === "number" && rooms[s.room_id - 1]
                        ? rooms[s.room_id - 1]
                        : `Room ${s.room_id ?? "?"}`,
                  };
                })
                .filter(
                  s =>
                    s.session_date === selectedDate &&
                    (slot === "Morning"
                      ? s.start < "12:00"
                      : slot === "Afternoon"
                      ? s.start >= "12:00" && s.start < "17:00"
                      : slot === "Evening"
                      ? s.start >= "17:00" && s.start < "21:00"
                      : s.start >= "21:00")
                )
                .map((s) => (
                  <div key={s.session_id} className="bg-blue-50 dark:bg-zinc-800 rounded shadow p-3 flex flex-col items-center border border-blue-100 dark:border-zinc-700">
                    <div className="font-bold text-blue-700 dark:text-blue-200">{s.movie}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">{s.start} • {s.room}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}