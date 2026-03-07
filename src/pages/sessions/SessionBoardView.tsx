import AppButton from "../../components/UI/AppButton";
import type { Session, Movie } from "../../entities/type";

interface Props {
  selectedDate: string;
  sessions: Session[];
  movies: Movie[];
  rooms: string[];
  showDeletedSessions: boolean;
  onBack: () => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: number) => void;
  onRestoreSession: (sessionId: number) => void;
}

// Helper: extract start/end time from ISO datetime string
function getSessionTime(session: Session): { start: string; end: string } {
  const startTime = session.startTime.split('T')[1]?.slice(0, 5) || "09:00";
  const endTime = session.endTime.split('T')[1]?.slice(0, 5) || "11:00";
  return { start: startTime, end: endTime };
}

type DisplaySession = Session & {
  start: string;
  end: string;
  movie: string;
  room: string;
};

export default function SessionBoardView({ selectedDate, sessions, movies, rooms, showDeletedSessions, onBack, onEditSession, onDeleteSession, onRestoreSession }: Props) {
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
                .filter((s: Session) => (showDeletedSessions || !s.deleted) && typeof s.roomId === "number" && typeof s.movieId === "number")
                .map((s: Session): DisplaySession => {
                  const { start, end } = getSessionTime(s);
                  return {
                    ...s,
                    start,
                    end,
                    movie: movies.find(m => m.id === s.movieId)?.title || "Unknown",
                    room:
                      typeof s.roomId === "number" && rooms[s.roomId - 1]
                        ? rooms[s.roomId - 1]
                        : `Room ${s.roomId ?? "?"}`,
                  };
                })
                .filter(
                  (s: DisplaySession) => {
                    const sessionDate = s.startTime.split('T')[0]; // Extract date from ISO datetime
                    return sessionDate === selectedDate &&
                    (slot === "Morning"
                      ? s.start < "12:00"
                      : slot === "Afternoon"
                      ? s.start >= "12:00" && s.start < "17:00"
                      : slot === "Evening"
                      ? s.start >= "17:00" && s.start < "21:00"
                      : s.start >= "21:00");
                  }
                )
                .map((s: DisplaySession) => (
                  <div key={s.id} className={`rounded shadow p-3 flex flex-col items-center border transition ${s.deleted ? 'bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 opacity-60' : 'bg-blue-50 dark:bg-zinc-800 border-blue-100 dark:border-zinc-700 hover:shadow-md'}`}>
                    <div className={`font-bold ${s.deleted ? 'text-gray-500 dark:text-gray-400' : 'text-blue-700 dark:text-blue-200'}`}>{s.movie}</div>
                    <div className={`text-xs ${s.deleted ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-300'}`}>{s.start} • {s.room}</div>
                    <div className="flex gap-2 mt-2">
                      {s.deleted ? (
                        <button
                          onClick={() => onRestoreSession(s.id)}
                          className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onEditSession(s)}
                            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteSession(s.id)}
                            className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}