import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Genre } from '../entities/type';
import { type GenreApiDTO } from "../dto/dto";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/genres`;

function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const fetchGenres = createAsyncThunk<Genre[]>(
  'genres/fetchGenres',
  async () => {
    const res = await fetch(API_URL, { headers: { "Content-Type": "application/json", ...getAuthHeaders() } });
    const data = await res.json();
    // Map API response to frontend type
    return Array.isArray(data.data)
      ? data.data.map((g: GenreApiDTO) => ({
          genre_id: g.id ?? 0,
          genre_name: g.name ?? "",
          icon: g.icon,
          deleted: false,
        }))
      : [];
  }
);

export const addGenreAsync = createAsyncThunk<Genre, Genre>(
  'genres/addGenre',
  async (genre) => {
    const payload: GenreApiDTO = {
      name: genre.genre_name,
      icon: genre.icon,
      id: genre.genre_id,
    };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add genre");
    // Map API response to frontend type
    const g = data.data;
    return {
      genre_id: g.id ?? 0,
      genre_name: g.name ?? "",
      icon: g.icon,
      deleted: false,
    };
  }
);

export const updateGenreAsync = createAsyncThunk<Genre, Genre>(
  'genres/updateGenre',
  async (genre) => {
    const payload: GenreApiDTO = {
      id: genre.genre_id,
      name: genre.genre_name,
      icon: genre.icon,
    };
    const res = await fetch(`${API_URL}/${genre.genre_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update genre");
    // Map API response to frontend type
    const g = data.data;
    return {
      genre_id: g.id ?? 0,
      genre_name: g.name ?? "",
      icon: g.icon,
      deleted: false,
    };
  }
);

export const deleteGenreAsync = createAsyncThunk<Genre, number>(
  'genres/deleteGenre',
  async (genre_id) => {
    const res = await fetch(`${API_URL}/${genre_id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete genre");
    // The backend may not return the updated genre, so we mark it as deleted here.
    return {
      genre_id,
      genre_name: data.data?.name ?? "",
      icon: data.data?.icon,
      deleted: true,
    };
  }
);

interface GenresState {
  items: Genre[];
  loading: boolean;
  error: string | null;
}

const initialState: GenresState = {
  items: [],
  loading: false,
  error: null,
};

const genresSlice = createSlice({
  name: 'genres',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGenres.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGenres.fulfilled, (state, action: PayloadAction<Genre[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchGenres.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch genres";
      })
      .addCase(addGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        state.items.push(action.payload);
      })
      .addCase(updateGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex(g => g.genre_id === action.payload.genre_id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex(g => g.genre_id === action.payload.genre_id);
        if (idx !== -1) state.items[idx].deleted = true;
      });
  },
});

export default genresSlice.reducer;