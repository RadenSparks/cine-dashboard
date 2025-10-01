import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Seat } from "../entities/type";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/seats`;

export const fetchSeats = createAsyncThunk<Seat[]>(
  "seats/fetchSeats",
  async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  }
);

export const updateSeat = createAsyncThunk<Seat, Seat>(
  "seats/updateSeat",
  async (seat) => {
    const res = await fetch(`${API_URL}/${seat.seat_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seat),
    });
    const data = await res.json();
    return data.data;
  }
);

export const addSeat = createAsyncThunk<Seat, Omit<Seat, "seat_id">>(
  "seats/addSeat",
  async (seat) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seat),
    });
    const data = await res.json();
    return data.data;
  }
);

export const deleteSeat = createAsyncThunk<number, number>(
  "seats/deleteSeat",
  async (seat_id) => {
    await fetch(`${API_URL}/${seat_id}`, { method: "DELETE" });
    return seat_id;
  }
);

interface SeatsState {
  seats: Seat[];
  loading: boolean;
  error: string | null;
}

const initialState: SeatsState = {
  seats: [],
  loading: false,
  error: null,
};

const seatsSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSeats.pending, state => { state.loading = true; })
      .addCase(fetchSeats.fulfilled, (state, action) => {
        state.loading = false;
        state.seats = action.payload;
      })
      .addCase(fetchSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(updateSeat.fulfilled, (state, action) => {
        const idx = state.seats.findIndex(s => s.seat_id === action.payload.seat_id);
        if (idx !== -1) state.seats[idx] = action.payload;
      })
      .addCase(addSeat.fulfilled, (state, action) => {
        state.seats.push(action.payload);
      })
      .addCase(deleteSeat.fulfilled, (state, action) => {
        state.seats = state.seats.filter(s => s.seat_id !== action.payload);
      });
  }
});

export default seatsSlice.reducer;