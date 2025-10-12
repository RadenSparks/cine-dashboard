import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Seat } from "../entities/type";
import type { SeatApiDTO, ApiResponse } from "../dto/dto";
import { getAuthHeaders } from "../lib/auth";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/seats`;

export const fetchSeats = createAsyncThunk<Seat[]>(
  "seats/fetchSeats",
  async () => {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data: ApiResponse<Seat[]> = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  }
);

// Fetch all seats for a room
export const fetchSeatsByRoom = createAsyncThunk<Seat[], number>(
  "seats/fetchSeatsByRoom",
  async (roomId) => {
    const res = await fetch(`${API_URL}/room/${roomId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data: ApiResponse<Seat[]> = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  }
);

// Fetch a single seat by room and seat id
export const fetchSeatById = createAsyncThunk<Seat, { roomId: number; seatId: number }>(
  "seats/fetchSeatById",
  async ({ roomId, seatId }) => {
    const res = await fetch(`${API_URL}/${roomId}/seats/${seatId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data: ApiResponse<Seat> = await res.json();
    return data.data;
  }
);

// Update a seat
export const updateSeat = createAsyncThunk<Seat, SeatApiDTO>(
  "seats/updateSeat",
  async (seat) => {
    if (!seat.id) throw new Error("Seat id is required for update");
    const res = await fetch(`${API_URL}/${seat.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(seat),
    });
    const data: ApiResponse<Seat> = await res.json();
    return data.data;
  }
);

// Add a seat
export const addSeat = createAsyncThunk<Seat, SeatApiDTO>(
  "seats/addSeat",
  async (seat) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(seat),
    });
    const data: ApiResponse<Seat> = await res.json();
    return data.data;
  }
);

// Delete a seat
export const deleteSeat = createAsyncThunk<number, number>(
  "seats/deleteSeat",
  async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return id;
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
        const idx = state.seats.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.seats[idx] = action.payload;
      })
      .addCase(addSeat.fulfilled, (state, action) => {
        state.seats.push(action.payload);
      })
      .addCase(deleteSeat.fulfilled, (state, action) => {
        state.seats = state.seats.filter(s => s.id !== action.payload);
      });
  }
});

export default seatsSlice.reducer;