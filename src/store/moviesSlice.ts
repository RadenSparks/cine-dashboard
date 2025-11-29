import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Movie, type ApiResponse } from '../entities/type';
import { type MovieApiDTO, type RetrieveImageDTO } from '../dto/dto';
import { get, post, put, remove } from '../client/axiosCilent';

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/movies`;

// Utility to get access token from localStorage
function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  return accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};
}

type Page<T> = {
  content : T[];
  page :{
    size : number;
    number : number;
    totalElement : number;
    totalPages : number;
  }
}

// Define the shape of the movie object as returned by the API
type MovieApiResponse = {
  id: number;
  title: string;
  description?: string;
  duration: number;
  premiereDate: string;
  poster?: string;
  genres: { id: number; name: string; icon?: string }[]; // <-- array of objects
  rating?: number;
  deleted?: boolean;
  image?: RetrieveImageDTO[];
  teaser?: string;
};

export const fetchMovies = createAsyncThunk<Movie[]>(
  'movies/fetchMovies',
  async () => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<Page<MovieApiResponse>>>(API_URL, { headers });
    const data = res.data;
    return Array.isArray(data.data.content)
      ? data.data.content.map((m): Movie => ({
          id: m.id,
          title: m.title,
          description: m.description,
          duration: m.duration,
          premiere_date: m.premiereDate,
          poster: m.poster,
          genre_ids: Array.isArray(m.genres) ? m.genres.map(g => g.id) : [],
          rating: m.rating,
          deleted: m.deleted,
          teaser: m.teaser,
          images: Array.isArray(m.image)
            ? m.image.map((img: RetrieveImageDTO) => ({
                id: img.id,
                name: img.name,
                size: img.size,
                contentType: img.contentType,
                url: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:17000/api/v1'}/images/${img.id}`,
              }))
            : [],
        }))
      : [];
  }
);

export const addMovieAsync = createAsyncThunk<Movie, MovieApiDTO>(
  'movies/addMovie',
  async (movieDto) => {
    const headers = getAuthHeaders();
    const res = await post<ApiResponse<MovieApiResponse>>(API_URL, movieDto, { headers });
    const m = res.data.data;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      duration: m.duration,
      premiere_date: m.premiereDate,
      poster: m.poster,
      genre_ids: Array.isArray(m.genres) ? m.genres.map(g => g.id) : [],
      rating: m.rating,
      deleted: m.deleted,
      images: Array.isArray(m.image)
        ? m.image.map((img: RetrieveImageDTO) => ({
            id: img.id,
            name: img.name,
            size: img.size,
            contentType: img.contentType,
            url: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:17000/api/v1'}/images/${img.id}`,
          }))
        : [],
    };
  }
);

export const updateMovieAsync = createAsyncThunk<Movie, MovieApiDTO>(
  'movies/updateMovie',
  async (movieDto) => {
    if (!movieDto.id) throw new Error("Movie ID is required for update");
    const headers = getAuthHeaders();
    const res = await put<ApiResponse<MovieApiResponse>>(`${API_URL}/${movieDto.id}`, movieDto, { headers });
    const m = res.data.data;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      duration: m.duration,
      premiere_date: m.premiereDate,
      poster: m.poster,
      genre_ids: Array.isArray(m.genres) ? m.genres.map(g => g.id) : [],
      rating: m.rating,
      deleted: m.deleted,
      teaser: m.teaser,
      images: Array.isArray(m.image)
        ? m.image.map((img: RetrieveImageDTO) => ({
            id: img.id,
            name: img.name,
            size: img.size,
            contentType: img.contentType,
            url: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:17000/api/v1'}/images/${img.id}`,
          }))
        : [],
    };
  }
);

// SOFT DELETE: backend marks as deleted, returns updated movie object
export const deleteMovieAsync = createAsyncThunk<Movie, number>(
  'movies/deleteMovie',
  async (id, { getState }) => {
    const headers = getAuthHeaders();
    const res = await remove<ApiResponse<MovieApiResponse>>(`${API_URL}/${id}`, { headers });
    const m = res.data.data;
    if (m) {
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        duration: m.duration,
        premiere_date: m.premiereDate,
        poster: m.poster,
        genre_ids: Array.isArray(m.genres) ? m.genres.map(g => g.id) : [],
        rating: m.rating,
        deleted: true,
        teaser: m.teaser,
        images: Array.isArray(m.image)
          ? m.image.map((img: RetrieveImageDTO) => ({
              id: img.id,
              name: img.name,
              size: img.size,
              contentType: img.contentType,
              url: `${import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:17000/api/v1'}/images/${img.id}`,
            }))
          : [],
      };
    }
    // fallback: find movie in state and mark as deleted
    const state = getState() as { movies: { items: Movie[] } };
    const movie = state.movies.items.find(m => m.id === id);
    if (movie) {
      return { ...movie, deleted: true };
    }
    throw new Error("Movie not found or backend did not return movie object");
  }
);

interface MoviesState {
  items: Movie[];
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  items: [],
  loading: false,
  error: null,
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMovies.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch movies";
      })
      .addCase(addMovieAsync.fulfilled, (state, action: PayloadAction<Movie>) => {
        state.items.push(action.payload);
      })
      .addCase(updateMovieAsync.fulfilled, (state, action: PayloadAction<Movie>) => {
        const idx = state.items.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      // SOFT DELETE: mark as deleted, don't remove from list
      .addCase(deleteMovieAsync.fulfilled, (state, action: PayloadAction<Movie>) => {
        const idx = state.items.findIndex(m => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default moviesSlice.reducer;