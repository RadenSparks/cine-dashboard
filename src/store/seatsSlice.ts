import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Seat } from "../entities/type";
import type { ApiResponse } from "../dto/dto";
import { get, put } from "../client/axiosCilent";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/seats`;

function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Fetch all seats for a room - GET /api/v1/seats/rooms/{roomId}
export const fetchSeatsByRoom = createAsyncThunk<Seat[], number>(
  "seats/fetchSeatsByRoom",
  async (roomId) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<Seat[]>>(`${API_URL}/rooms/${roomId}`, { headers });
    return Array.isArray(res.data.data) ? res.data.data : [];
  }
);

// Fetch a single seat by room and seat id - GET /api/v1/seats/{seatId}/rooms/{roomId}
export const fetchSeatById = createAsyncThunk<Seat, { roomId: number; seatId: number }>(
  "seats/fetchSeatById",
  async ({ roomId, seatId }) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<Seat>>(`${API_URL}/${seatId}/rooms/${roomId}`, { headers });
    return res.data.data;
  }
);

// Update a seat - PUT /api/v1/seats/{seatId}
// Only sends id, seatType, and empty as per UpdateSeatRequestDTO
export const updateSeat = createAsyncThunk<Seat, { id: number; seatType: 'STANDARD' | 'PREMIUM'; empty: boolean }>(
  "seats/updateSeat",
  async (updateData) => {
    const headers = getAuthHeaders();
    const payload = {
      id: updateData.id,
      seatType: updateData.seatType,
      empty: updateData.empty,
    };
    const res = await put<ApiResponse<Seat>>(`${API_URL}/${updateData.id}`, payload, { headers });
    return res.data.data;
  }
);

interface SeatsState {
  seatsByRoom: { [roomId: number]: Seat[] };
  loading: boolean;
  error: string | null;
}

const initialState: SeatsState = {
  seatsByRoom: {},
  loading: false,
  error: null,
};

const seatsSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSeatsByRoom.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeatsByRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.seatsByRoom[action.meta.arg] = action.payload;
      })
      .addCase(fetchSeatsByRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch seats";
      })
      .addCase(fetchSeatById.pending, state => {
        state.error = null;
      })
      .addCase(fetchSeatById.fulfilled, (state, action) => {
        const seat = action.payload;
        const { roomId } = action.meta.arg;
        const roomSeats = state.seatsByRoom[roomId] || [];
        const idx = roomSeats.findIndex(s => s.id === seat.id);
        if (idx !== -1) {
          roomSeats[idx] = seat;
        } else {
          roomSeats.push(seat);
        }
        state.seatsByRoom[roomId] = roomSeats;
      })
      .addCase(fetchSeatById.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch seat";
      })
      .addCase(updateSeat.pending, state => {
        state.error = null;
      })
      .addCase(updateSeat.fulfilled, (state, action) => {
        const seat = action.payload;
        // Update seat in all rooms (it might be in any room)
        Object.keys(state.seatsByRoom).forEach(roomId => {
          const roomSeats = state.seatsByRoom[parseInt(roomId)];
          const idx = roomSeats.findIndex(s => s.id === seat.id);
          if (idx !== -1) roomSeats[idx] = seat;
        });
      })
      .addCase(updateSeat.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update seat";
      });
  }
});

export default seatsSlice.reducer;