import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from "../entities/type";
import type { SessionApiDTO, ApiResponse } from "../dto/dto";
import { get, post, put, remove } from "../client/axiosCilent";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/sessions`;

function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Fetch all sessions
export const fetchSessions = createAsyncThunk<Session[]>(
  'sessions/fetchSessions',
  async () => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<Session[]>>(API_URL, { headers });
    return Array.isArray(res.data.data) ? res.data.data : [];
  }
);

// Fetch sessions by room id
export const fetchSessionsByRoomId = createAsyncThunk<Session[], number>(
  'sessions/fetchSessionsByRoomId',
  async (roomId) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<Session[]>>(`${API_URL}?roomId=${roomId}`, { headers });
    return Array.isArray(res.data.data) ? res.data.data : [];
  }
);

// Add a session
export const addSessionAsync = createAsyncThunk<Session, SessionApiDTO>(
  'sessions/addSession',
  async (session) => {
    const headers = getAuthHeaders();
    const res = await post<ApiResponse<Session>>(API_URL, session, { headers });
    return res.data.data;
  }
);

// Update a session
export const updateSession = createAsyncThunk<Session, SessionApiDTO>(
  'sessions/updateSession',
  async (session) => {
    if (!session.id) throw new Error("Session id is required for update");
    const headers = getAuthHeaders();
    const res = await put<ApiResponse<Session>>(`${API_URL}/${session.id}`, session, { headers });
    return res.data.data;
  }
);

// Delete a session (soft delete)
export const deleteSessionAsync = createAsyncThunk<Session, number>(
  'sessions/deleteSession',
  async (id, { getState }) => {
    const headers = getAuthHeaders();
    await remove<ApiResponse<Record<string, never>>>(`${API_URL}/${id}`, { headers });
    
    // Get session from state and mark as deleted
    const state = getState() as { sessions: { items: Session[] } };
    const session = state.sessions.items.find(s => s.id === id);
    
    if (session) {
      return { ...session, deleted: true };
    }
    
    throw new Error("Session not found in state");
  }
);

// Restore a deleted session
export const restoreSession = createAsyncThunk<Session, number>(
  'sessions/restoreSession',
  async (id) => {
    const headers = getAuthHeaders();
    const res = await put<ApiResponse<Session>>(`${API_URL}/${id}/restore`, {}, { headers });
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
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update session";
      })
      .addCase(deleteSessionAsync.pending, state => {
        state.error = null;
      })
      .addCase(deleteSessionAsync.fulfilled, (state, action: PayloadAction<Session>) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteSessionAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete session";
      })
      .addCase(restoreSession.pending, state => {
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<Session>) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
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