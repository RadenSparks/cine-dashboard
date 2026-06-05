import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clapperboard } from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchGenres, fetchMovies, fetchUsers } from "@/store/slices";
import Loading from "@/shared/components/ui/Loading";
import ProtectedRoute from "@/shared/components/routing/ProtectedRoute";
import { useCurrentUser } from "@/shared/lib/useCurrentUser";
import formatDateTime from "@/shared/lib/dateCalculate";
import { EmptyState, PageIntro, SectionCard, StatusPill } from "@/shared/components/ui/DashboardPrimitives";
import { StyledMovieCarousel } from "@/shared/components/ui/StyledMovieCarousel";
import { MOCK_NOW_SHOWING_MOVIES } from "@/shared/mocks";

const chartPalette = ["#2563eb", "#0ea5e9", "#f59e0b", "#16a34a", "#0f172a"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getReleaseState(premiereDate: string) {
  const date = new Date(premiereDate);
  const now = new Date();
  const oneMonthLater = new Date(date);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  if (date > now) return "Coming soon";
  if (now <= oneMonthLater) return "Now showing";
  return "Completed";
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: movies, loading } = useSelector((state: RootState) => state.movies);
  const genres = useSelector((state: RootState) => state.genres.items);
  const currentUser = useCurrentUser();

  useEffect(() => {
    dispatch(fetchMovies({ page: 0, size: 100 }));
    dispatch(fetchGenres());
    dispatch(fetchUsers({ page: 0, size: 10 }));
  }, [dispatch]);

  const monthlyTrend = useMemo(() => {
    const bucket = new Map<string, number>();
    movies.forEach((movie) => {
      const date = new Date(movie.premiere_date);
      const key = date.toLocaleDateString("en-US", { month: "short" });
      bucket.set(key, (bucket.get(key) ?? 0) + 1);
    });

    return Array.from(bucket.entries()).map(([month, total]) => ({ month, total }));
  }, [movies]);

  const genreBreakdown = useMemo(() => {
    return genres
      .map((genre) => ({
        name: genre.genre_name,
        total: movies.filter((movie) => movie.genre_ids.includes(genre.genre_id)).length,
      }))
      .filter((entry) => entry.total > 0)
      .slice(0, 5);
  }, [genres, movies]);

  const recentMovies = useMemo(
    () =>
      [...movies]
        .sort((left, right) => new Date(right.premiere_date).getTime() - new Date(left.premiere_date).getTime())
        .slice(0, 6),
    [movies],
  );

  const nowShowingMovies = useMemo(() => {
    // Try to get now showing movies from the API first
    const apiNowShowing = movies
      .filter((movie) => getReleaseState(movie.premiere_date) === "Now showing")
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        description: movie.description || "No description available",
        poster: movie.poster,
        rating: movie.rating,
        duration: movie.duration,
        genre: movie.genre_ids?.length > 0 
          ? genres.find((g) => g.genre_id === movie.genre_ids[0])?.genre_name || "Cinema"
          : "Cinema",
      }));

    // Use mock data if no API results or use a mix for development
    return apiNowShowing.length > 0 ? apiNowShowing : MOCK_NOW_SHOWING_MOVIES;
  }, [movies, genres]);

  if (loading) {
    return <Loading fullscreen={false} />;
  }

  return (
    <ProtectedRoute>
      <div className="w-full space-y-6">
        <PageIntro
          eyebrow="Operations overview"
          title="WyvernBox Dashboard"
          description="Track ticketing operations, release activity, customer demand, and bookings from a centralized cinema dashboard."
          badge={currentUser?.role || "ADMIN"}
          icon={Clapperboard}
          showEvervault={true}
        />

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Now Showing</h3>
          {nowShowingMovies.length > 0 ? (
            <StyledMovieCarousel
              items={nowShowingMovies}
              direction="left"
              speed="slow"
              pauseOnHover={true}
            />
          ) : (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <p className="text-slate-600 dark:text-slate-300">No movies currently showing. Check back soon!</p>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Release momentum" description="Monthly release count based on premiere dates in the current movie dataset.">
            {monthlyTrend.length ? (
              <div className="h-[340px] rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardMovieFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#dbeafe" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 18, borderColor: "#cbd5e1" }} />
                    <Area type="monotone" dataKey="total" stroke="#2563eb" fill="url(#dashboardMovieFill)" strokeWidth={3} name="Movies released" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No release data yet" body="Movie premiere dates will populate this chart once catalog items are loaded." />
            )}
          </SectionCard>

          <SectionCard title="Genre balance" description="Top genres represented by the current movie records.">
            {genreBreakdown.length ? (
              <div className="grid gap-4 md:grid-cols-[0.56fr_0.44fr] md:items-center">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip contentStyle={{ borderRadius: 18, borderColor: "#cbd5e1" }} />
                      <Pie data={genreBreakdown} dataKey="total" nameKey="name" innerRadius={58} outerRadius={100} paddingAngle={4}>
                        {genreBreakdown.map((entry, index) => (
                          <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {genreBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-3 text-sm shadow-[0_14px_30px_-26px_rgba(37,99,235,0.12)] dark:border-slate-700 dark:bg-slate-900/82">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
                        {entry.name}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatNumber(entry.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No genre mix available" body="Once movies and genres overlap, the dashboard will show how the catalog is distributed." />
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="Recent releases" description="The newest movie records currently available in the dashboard.">
            {recentMovies.length ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/82">
                <table className="dashboard-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Movie</th>
                      <th>Premiere</th>
                      <th>Duration</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMovies.map((movie) => {
                      const state = getReleaseState(movie.premiere_date);
                      const tone = state === "Now showing" ? "success" : state === "Coming soon" ? "info" : "neutral";
                      return (
                        <tr key={movie.id}>
                          <td>
                            <div className="font-semibold text-slate-900 dark:text-white">{movie.title}</div>
                            <div className="helper-copy">{movie.description?.slice(0, 84) || "No summary available."}</div>
                          </td>
                          <td>{formatDateTime(movie.premiere_date)}</td>
                          <td>{movie.duration} min</td>
                          <td>{movie.rating?.toFixed?.(1) ?? movie.rating ?? "N/A"}</td>
                          <td><StatusPill tone={tone as "success" | "info" | "neutral"}>{state}</StatusPill></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No releases to show" body="Load movie data to see recent additions and release timing." />
            )}
          </SectionCard>
        </div>
      </div>
    </ProtectedRoute>
  );
}
