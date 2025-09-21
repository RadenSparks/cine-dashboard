import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Movie = {
  movie_id: number;
  title: string;
  description?: string;
  duration: number;
  premiere_date: string;
  poster?: string;
  genre_ids: number[];
  rating?: number; // <-- NEW
  deleted?: boolean;
};

const initialState: Movie[] = [
  {
    movie_id: 1,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    duration: 148,
    premiere_date: "2025-09-16",
    poster: "https://images-na.ssl-images-amazon.com/images/I/71uKM+LdgFL.jpg",
    genre_ids: [1, 3], // Example: Sci-Fi, Drama
    rating: 8.8, // <-- NEW
  },
  {
    movie_id: 2,
    title: "The Godfather",
    description: "The Godfather is a 1972 American crime drama following the powerful Corleone mafia family, particularly the patriarch, Vito, and his youngest son, Michael. The story chronicles Michael's transformation from a reluctant outsider to a ruthless Mafia boss, as he becomes entangled in the family's violent underworld and eventually succeeds his father. The film explores themes of family, power, loyalty, and the moral corruption of the American dream within the context of a Shakespearean-style tragedy.  ",
    duration: 175,
    premiere_date: "2025-10-01",
    poster: "https://www.lab111.nl/wp-content/uploads/2024/04/s-l1600.png",
    genre_ids: [2],
    rating: 9.2, // <-- NEW
  },
  {
    movie_id: 3,
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    duration: 169,
    premiere_date: "2024-08-01",
    poster: "https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SY679_.jpg",
    genre_ids: [1, 3],
  },
  {
    movie_id: 4,
    title: "Pacific Rim",
    description: "As a war between humankind and monstrous sea creatures wages on, a former pilot and a trainee are paired up to drive a seemingly obsolete giant robot.",
    duration: 131,
    premiere_date: "2024-07-10",
    poster: "https://images-na.ssl-images-amazon.com/images/I/51Qsnm2gUkL.jpg",
    genre_ids: [1, 3],
  },
  {
    movie_id: 5,
    title: "The Matrix",
    description: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    duration: 136,
    premiere_date: "2025-11-01",
    poster: "https://m.media-amazon.com/images/I/51EG732BV3L.jpg",
    genre_ids: [1, 3],
    rating: 8.7,
  },
  {
    movie_id: 6,
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    duration: 132,
    premiere_date: "2025-12-01",
    poster: "https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    genre_ids: [2, 3],
    rating: 8.6,
  },
  {
    movie_id: 7,
    title: "Avengers: Endgame",
    description: "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions and restore balance.",
    duration: 181,
    premiere_date: "2025-12-15",
    poster: "https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_SY679_.jpg",
    genre_ids: [1, 3],
    rating: 8.4,
  },
  {
    movie_id: 8,
    title: "Joker",
    description: "In Gotham City, mentally troubled comedian Arthur Fleck embarks on a downward spiral that leads to the creation of the iconic Joker.",
    duration: 122,
    premiere_date: "2026-01-10",
    poster: "https://m.media-amazon.com/images/I/71c05lTE03L._AC_SY679_.jpg",
    genre_ids: [2, 3],
    rating: 8.5,
  },
  {
    movie_id: 9,
    title: "Forrest Gump",
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, and more through the eyes of an Alabama man with a low IQ.",
    duration: 142,
    premiere_date: "2026-02-01",
    poster: "https://i.ebayimg.com/images/g/y9gAAOSwUQhi-9Nq/s-l1600.webp",
    genre_ids: [2, 3],
    rating: 8.8,
  },
  {
    movie_id: 10,
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    duration: 154,
    premiere_date: "2026-03-01",
    poster: "https://m.media-amazon.com/images/I/71c05lTE03L._AC_SY679_.jpg",
    genre_ids: [2, 3],
    rating: 8.9,
  },
];

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addMovie: (state, action: PayloadAction<Movie>) => {
      state.push(action.payload);
    },
    updateMovie: (state, action: PayloadAction<Movie>) => {
      const idx = state.findIndex(m => m.movie_id === action.payload.movie_id);
      if (idx !== -1) state[idx] = action.payload;
    },
    deleteMovie: (state, action: PayloadAction<number>) => {
      return state.filter(m => m.movie_id !== action.payload);
    },
  },
});

export const { addMovie, updateMovie, deleteMovie } = moviesSlice.actions;
export default moviesSlice.reducer;