import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { addGenre, deleteGenre } from "../../store/genresSlice";
import { useState } from "react";

// Example genre posters (replace URLs with your own images if needed)
const genrePosters: Record<string, string> = {
  "Sci-Fi": "https://m.media-amazon.com/images/I/71c05lTE03L._AC_SY679_.jpg",
  "Crime": "https://m.media-amazon.com/images/I/51oBxmV-dML._AC_.jpg",
  "Drama": "https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_SY679_.jpg",
  "Comedy": "https://m.media-amazon.com/images/I/51zUbui+gbL._AC_.jpg",
  "Action": "https://m.media-amazon.com/images/I/81tC5lA2Q-L._AC_SY679_.jpg",
};

export default function GenresPage() {
  const genres = useSelector((state: RootState) => state.genres);
  const dispatch = useDispatch<AppDispatch>();
  const [newGenreName, setNewGenreName] = useState("");

  const handleAddGenre = () => {
    if (newGenreName && !genres.some(g => g.genre_name === newGenreName)) {
      const newId = genres.length ? Math.max(...genres.map(g => g.genre_id)) + 1 : 1;
      dispatch(addGenre({ genre_id: newId, genre_name: newGenreName }));
      setNewGenreName("");
    }
  };

  const handleDeleteGenre = (genre_id: number) => {
    dispatch(deleteGenre(genre_id));
  };

  return (
      <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl shadow-lg p-6 max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Genre Management</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newGenreName}
            onChange={e => setNewGenreName(e.target.value)}
            placeholder="Add genre"
            className="border px-2 py-1 rounded w-full"
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            onClick={handleAddGenre}
          >
            Add
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {genres.map(genre => (
            <div key={genre.genre_id} className="bg-white dark:bg-zinc-900 rounded-lg shadow hover:shadow-lg border border-gray-200 dark:border-zinc-800 p-4 flex flex-col items-center transition">
              <img
                src={genrePosters[genre.genre_name] || "https://via.placeholder.com/150x220?text=No+Image"}
                alt={genre.genre_name}
                className="w-32 h-44 object-cover rounded mb-2"
              />
              <span className="font-semibold text-lg mb-2">{genre.genre_name}</span>
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => handleDeleteGenre(genre.genre_id)}
                disabled={genres.length === 1}
                title={genres.length === 1 ? "At least one genre required" : ""}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
  );
}