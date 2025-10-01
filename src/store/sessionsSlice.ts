import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Session } from "../entities/type";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/sessions`;

export const fetchSessions = createAsyncThunk<Session[]>(
  'sessions/fetchSessions',
  async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  }
);

export const addSessionAsync = createAsyncThunk<Session, Omit<Session, 'session_id'>>(
  'sessions/addSession',
  async (session) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
    const data = await res.json();
    return data.data;
  }
);

export const deleteSessionAsync = createAsyncThunk<number, number>(
  'sessions/deleteSession',
  async (session_id) => {
    await fetch(`${API_URL}/${session_id}`, { method: "DELETE" });
    return session_id;
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
      .addCase(fetchSessions.pending, state => { state.loading = true; })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addSessionAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteSessionAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.session_id !== action.payload);
      });
  }
});

export default sessionsSlice.reducer;