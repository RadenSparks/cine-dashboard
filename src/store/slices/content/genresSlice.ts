import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Genre } from '@/shared/types/entities';
import { type GenreApiDTO } from '@/shared/types/dto';
import { get, post, put, remove } from '@/shared/api/apiClient';
import { API_ENDPOINTS, getAuthHeaders } from '@/store/utils/apiConfig';
import { type SimpleListSliceState } from '@/store/utils/sliceHelpers';

// Backend response type
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
    const res = await get<ApiResponse<GenreApiResponse[]>>(API_ENDPOINTS.GENRES, { headers });
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
    const res = await post<ApiResponse<GenreApiResponse>>(API_ENDPOINTS.GENRES, payload, { headers });
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
    const res = await put<ApiResponse<GenreApiResponse>>(`${API_ENDPOINTS.GENRES}/${genre.genre_id}`, payload, { headers });
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
    await remove<ApiResponse<Record<string, never>>>(`${API_ENDPOINTS.GENRES}/${genre_id}`, { headers });
    
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
    const res = await put<ApiResponse<GenreApiResponse>>(`${API_ENDPOINTS.GENRES}/${genre_id}/restore`, {}, { headers });
    const g = res.data.data;
    return {
      genre_id: g.id,
      genre_name: g.name,
      icon: g.icon,
      deleted: g.deleted || false,
    };
  }
);

type GenresState = SimpleListSliceState<Genre>;

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
        const idx = state.items.findIndex((g: Genre) => g.genre_id === action.payload.genre_id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateGenreAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update genre";
      })
      .addCase(deleteGenreAsync.pending, state => {
        state.error = null;
      })
      .addCase(deleteGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex((g: Genre) => g.genre_id === action.payload.genre_id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteGenreAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete genre";
      })
      .addCase(restoreGenreAsync.pending, state => {
        state.error = null;
      })
      .addCase(restoreGenreAsync.fulfilled, (state, action: PayloadAction<Genre>) => {
        const idx = state.items.findIndex((g: Genre) => g.genre_id === action.payload.genre_id);
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
