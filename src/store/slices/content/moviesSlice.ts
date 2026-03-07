import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Movie } from '../../../entities/type';
import { type MovieApiDTO, type RetrieveImageDTO } from '../../../dto/dto';
import { get, post, put, remove } from '../../../client/axiosCilent';
import { API_ENDPOINTS, getAuthHeaders, BASE_API_URL } from '../../utils/apiConfig';
import { type Page, type PaginatedThunkResult, type ListSliceState } from '../../utils/sliceHelpers';

// Backend API response type
type MovieApiResponse = {
  id: number;
  title: string;
  description?: string;
  duration: number;
  premiereDate: string;
  poster?: string;
  genres: { id: number; name: string; icon?: string }[];
  rating?: number;
  deleted?: boolean;
  image?: RetrieveImageDTO[];
  teaser?: string;
};

/**
 * Helper function to map API response to frontend Movie type
 * Centralizes image URL construction and genre mapping logic
 */
function mapMovieResponseToMovie(m: MovieApiResponse): Movie {
  const imageUrl = `${BASE_API_URL}/images`;
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
          url: `${imageUrl}/${img.id}`,
        }))
      : [],
  };
}

type ApiResponseWrapper<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

export const fetchMovies = createAsyncThunk<
  PaginatedThunkResult<Movie>,
  { page?: number; size?: number }
>(
  'movies/fetchMovies',
  async ({ page = 0, size = 10 }) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<Page<MovieApiResponse>>>(
      `${API_ENDPOINTS.MOVIES}?page=${page}&size=${size}`,
      { headers }
    );
    const data = res.data.data;
    const items = Array.isArray(data.content)
      ? data.content.map(mapMovieResponseToMovie)
      : [];
    return {
      items,
      totalPages: data.page.totalPages,
      currentPage: data.page.number,
      totalElements: data.page.totalElement,
    };
  }
);

export const addMovieAsync = createAsyncThunk<Movie, MovieApiDTO>(
  'movies/addMovie',
  async (movieDto) => {
    const headers = getAuthHeaders();
    const res = await post<ApiResponseWrapper<MovieApiResponse>>(API_ENDPOINTS.MOVIES, movieDto, { headers });
    return mapMovieResponseToMovie(res.data.data);
  }
);

export const updateMovieAsync = createAsyncThunk<Movie, MovieApiDTO>(
  'movies/updateMovie',
  async (movieDto) => {
    if (!movieDto.id) throw new Error("Movie ID is required for update");
    const headers = getAuthHeaders();
    const res = await put<ApiResponseWrapper<MovieApiResponse>>(
      `${API_ENDPOINTS.MOVIES}/${movieDto.id}`,
      movieDto,
      { headers }
    );
    return mapMovieResponseToMovie(res.data.data);
  }
);

export const deleteMovieAsync = createAsyncThunk<Movie, number>(
  'movies/deleteMovie',
  async (id, { getState }) => {
    const headers = getAuthHeaders();
    const res = await remove<ApiResponseWrapper<MovieApiResponse>>(
      `${API_ENDPOINTS.MOVIES}/${id}`,
      { headers }
    );
    const m = res.data.data;
    if (m) {
      return { ...mapMovieResponseToMovie(m), deleted: true };
    }
    // Fallback: find in state and mark deleted
    const state = getState() as { movies: { items: Movie[] } };
    const movie = state.movies.items.find(m => m.id === id);
    if (movie) {
      return { ...movie, deleted: true };
    }
    throw new Error("Movie not found");
  }
);

export const restoreMovieAsync = createAsyncThunk<Movie, number>(
  'movies/restoreMovie',
  async (id) => {
    const headers = getAuthHeaders();
    const res = await put<ApiResponseWrapper<MovieApiResponse>>(
      `${API_ENDPOINTS.MOVIES}/${id}/restore`,
      {},
      { headers }
    );
    return mapMovieResponseToMovie(res.data.data);
  }
);

type MoviesState = ListSliceState<Movie>;

const initialState: MoviesState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  },
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
      .addCase(fetchMovies.fulfilled, (state, action: PayloadAction<PaginatedThunkResult<Movie>>) => {
        state.items = action.payload.items;
        state.pagination!.currentPage = action.payload.currentPage;
        state.pagination!.totalPages = action.payload.totalPages;
        state.pagination!.totalElements = action.payload.totalElements;
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
        const idx = state.items.findIndex((m: Movie) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteMovieAsync.fulfilled, (state, action: PayloadAction<Movie>) => {
        const idx = state.items.findIndex((m: Movie) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(restoreMovieAsync.fulfilled, (state, action: PayloadAction<Movie>) => {
        const idx = state.items.findIndex((m: Movie) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default moviesSlice.reducer;
