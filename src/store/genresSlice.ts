import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Genre } from '../entities/type';
import { type GenreApiDTO } from "../dto/dto";
import { get, post, put, remove } from '../client/axiosCilent';

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/genres`;

function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Backend response type - matches MovieResponseDTO structure
type GenreApiResponse = {
  id: number;
  name: string;
  icon?: string;
  deleted?: boolean;
};

type ApiResponse<T> = {
  status: 'SUCCESS' | 'FAILURE' | 'ERROR';
  data: T;
  message?: string;
};

export const fetchGenres = createAsyncThunk<Genre[]>(
  'genres/fetchGenres',
  async () => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<GenreApiResponse[]>>(API_URL, { headers });
    const data = res.data.data;
    return Array.isArray(data)
      ? data.map((g: GenreApiResponse) => ({
          genre_id: g.id,
          genre_name: g.name,
          icon: g.icon,
          deleted: g.deleted || false,
        }))
      : [];
  }
);

export const addGenreAsync = createAsyncThunk<Genre, Genre>(
  'genres/addGenre',
  async (genre) => {
    const payload: Omit<GenreApiDTO, 'id'> = {
      name: genre.genre_name,
      icon: genre.icon,
    };
    const headers = getAuthHeaders();
    const res = await post<ApiResponse<GenreApiResponse>>(API_URL, payload, { headers });
    const g = res.data.data;
    return {
      genre_id: g.id,
      genre_name: g.name,
      icon: g.icon,
      deleted: g.deleted || false,
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
    const headers = getAuthHeaders();
    const res = await put<ApiResponse<GenreApiResponse>>(`${API_URL}/${genre.genre_id}`, payload, { headers });
    const g = res.data.data;
    return {
      genre_id: g.id,
      genre_name: g.name,
      icon: g.icon,
      deleted: g.deleted || false,
    };
  }
);

export const deleteGenreAsync = createAsyncThunk<Genre, number>(
  'genres/deleteGenre',
  async (genre_id, { getState }) => {
    const headers = getAuthHeaders();
    await remove<ApiResponse<Record<string, never>>>(`${API_URL}/${genre_id}`, { headers });
    
    // Backend returns success without genre data, so fetch from state
    const state = getState() as { genres: { items: Genre[] } };
    const genre = state.genres.items.find(g => g.genre_id === genre_id);
    
    if (genre) {
      return { ...genre, deleted: true };
    }
    
    throw new Error("Genre not found in state");
  }
);

export const restoreGenreAsync = createAsyncThunk<Genre, number>(
  'genres/restoreGenre',
  async (genre_id) => {
    const headers = getAuthHeaders();
    const res = await put<ApiResponse<GenreApiResponse>>(`${API_URL}/${genre_id}/restore`, {}, { headers });
    const g = res.data.data;
    return {
      genre_id: g.id,
      genre_name: g.name,
      icon: g.icon,
      deleted: g.deleted || false,
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
      .addCase(addGenreAsync.pending, state => {
        state.error = null;
      })
      .addCase(addGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        state.items.push(action.payload);
      })
      .addCase(addGenreAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to add genre";
      })
      .addCase(updateGenreAsync.pending, state => {
        state.error = null;
      })
      .addCase(updateGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex(g => g.genre_id === action.payload.genre_id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateGenreAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update genre";
      })
      .addCase(deleteGenreAsync.pending, state => {
        state.error = null;
      })
      .addCase(deleteGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex(g => g.genre_id === action.payload.genre_id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGenreAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete genre";
      })
      .addCase(restoreGenreAsync.pending, state => {
        state.error = null;
      })
      .addCase(restoreGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex(g => g.genre_id === action.payload.genre_id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(restoreGenreAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to restore genre";
      });
  },
});

export default genresSlice.reducer;