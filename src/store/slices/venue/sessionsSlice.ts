import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { type Session } from '@/shared/types/entities';
import {
  type SessionApiDTO,
  type CreateSessionRequestDTO,
  type UpdateSessionRequestDTO,
  type DeleteSessionRequestDTO,
} from '@/shared/types/dto';
import { get, post, put, remove } from '@/shared/api/apiClient';
import { API_ENDPOINTS, getAuthHeaders } from '@/store/utils/apiConfig';

type ApiResponseWrapper<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

/**
 * Helper function to map SessionApiDTO from API to frontend Session type
 * Centralizes the transformation logic
 */
function mapSessionApiDTOToSession(dto: SessionApiDTO): Session {
  return {
    id: dto.id,
    movieId: dto.movieId,
    movieTitle: dto.movieTitle,
    movieDuration: dto.movieDuration,
    roomId: dto.roomId,
    roomName: dto.roomName,
    startTime: dto.startTime,
    endTime: dto.endTime,
    basePrice: dto.basePrice,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    deleted: dto.deleted,
  };
}

export const fetchSessions = createAsyncThunk<Session[]>(
  'sessions/fetchSessions',
  async () => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<SessionApiDTO[]>>(API_ENDPOINTS.SESSIONS, { headers });
    const data = Array.isArray(res.data.data) ? res.data.data : [];
    return data.map(mapSessionApiDTOToSession);
  }
);

export const fetchSessionsByRoomId = createAsyncThunk<Session[], number>(
  'sessions/fetchSessionsByRoomId',
  async (roomId) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<SessionApiDTO[]>>(
      `${API_ENDPOINTS.SESSIONS}?roomId=${roomId}`,
      { headers }
    );
    const data = Array.isArray(res.data.data) ? res.data.data : [];
    return data.map(mapSessionApiDTOToSession);
  }
);

export const addSessionAsync = createAsyncThunk<Session, CreateSessionRequestDTO>(
  'sessions/addSession',
  async (sessionRequest) => {
    const headers = getAuthHeaders();

    const startTime = sessionRequest.startTime.includes('T')
      ? sessionRequest.startTime
      : `${new Date().toISOString().split('T')[0]}T${sessionRequest.startTime}:00`;
    const endTime = sessionRequest.endTime.includes('T')
      ? sessionRequest.endTime
      : `${new Date().toISOString().split('T')[0]}T${sessionRequest.endTime}:00`;

    const payload: CreateSessionRequestDTO = {
      movieId: sessionRequest.movieId,
      roomId: sessionRequest.roomId,
      startTime,
      endTime,
      basePrice: sessionRequest.basePrice,
    };

    const res = await post<ApiResponseWrapper<SessionApiDTO>>(API_ENDPOINTS.SESSIONS, payload, { headers });
    return mapSessionApiDTOToSession(res.data.data);
  }
);

export const updateSession = createAsyncThunk<Session, UpdateSessionRequestDTO>(
  'sessions/updateSession',
  async (sessionRequest) => {
    if (!sessionRequest.id) throw new Error("Session id is required for update");
    const headers = getAuthHeaders();

    const payload: UpdateSessionRequestDTO = {
      id: sessionRequest.id,
      movieId: sessionRequest.movieId,
      roomId: sessionRequest.roomId,
      basePrice: sessionRequest.basePrice,
    };

    if (sessionRequest.startTime) {
      payload.startTime = sessionRequest.startTime.includes('T')
        ? sessionRequest.startTime
        : `${new Date().toISOString().split('T')[0]}T${sessionRequest.startTime}:00`;
    }

    if (sessionRequest.endTime) {
      payload.endTime = sessionRequest.endTime.includes('T')
        ? sessionRequest.endTime
        : `${new Date().toISOString().split('T')[0]}T${sessionRequest.endTime}:00`;
    }

    const res = await put<ApiResponseWrapper<SessionApiDTO>>(
      `${API_ENDPOINTS.SESSIONS}/${sessionRequest.id}`,
      payload,
      { headers }
    );
    return mapSessionApiDTOToSession(res.data.data);
  }
);

export const deleteSessionAsync = createAsyncThunk<Session, number>(
  'sessions/deleteSession',
  async (id, { getState }) => {
    const headers = getAuthHeaders();
    const deleteRequest: DeleteSessionRequestDTO = { id };
    await remove<ApiResponseWrapper<Record<string, never>>>(
      `${API_ENDPOINTS.SESSIONS}/${deleteRequest.id}`,
      { headers }
    );

    const state = getState() as { sessions: { items: Session[] } };
    const session = state.sessions.items.find(s => s.id === id);

    if (session) {
      return { ...session, deleted: true };
    }

    throw new Error("Session not found in state");
  }
);

export const restoreSession = createAsyncThunk<Session, number>(
  'sessions/restoreSession',
  async (id) => {
    const headers = getAuthHeaders();
    const res = await put<ApiResponseWrapper<Session>>(`${API_ENDPOINTS.SESSIONS}/${id}/restore`, {}, { headers });
    return res.data.data;
  }
);

interface SessionsState {
  items: Session[];
  loading: boolean;
  error: string | null;
}

const initialState: SessionsState = {
  items: [],
  loading: false,
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSessions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchSessionsByRoomId.pending, state => {
        state.error = null;
      })
      .addCase(fetchSessionsByRoomId.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchSessionsByRoomId.rejected, (state, action) => {
        state.error = action.error.message || null;
      })
      .addCase(addSessionAsync.pending, state => {
        state.error = null;
      })
      .addCase(addSessionAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(addSessionAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to add session";
      })
      .addCase(updateSession.pending, state => {
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action: PayloadAction<Session>) => {
        const idx = state.items.findIndex((s: Session) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update session";
      })
      .addCase(deleteSessionAsync.pending, state => {
        state.error = null;
      })
      .addCase(deleteSessionAsync.fulfilled, (state, action: PayloadAction<Session>) => {
        const idx = state.items.findIndex((s: Session) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteSessionAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete session";
      })
      .addCase(restoreSession.pending, state => {
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<Session>) => {
        const idx = state.items.findIndex((s: Session) => s.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.error = action.error.message || "Failed to restore session";
      });
  }
});

export default sessionsSlice.reducer;
