import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { type Seat } from "../../../entities/type";
import { get, put } from "../../../client/axiosCilent";
import { API_ENDPOINTS, getAuthHeaders } from '../../utils/apiConfig';

type ApiResponseWrapper<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

export const fetchSeatsByRoom = createAsyncThunk<Seat[], number>(
  "seats/fetchSeatsByRoom",
  async (roomId) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<Seat[]>>(`${API_ENDPOINTS.SEATS}/rooms/${roomId}`, { headers });
    return Array.isArray(res.data.data) ? res.data.data : [];
  }
);

export const fetchSeatById = createAsyncThunk<Seat, { roomId: number; seatId: number }>(
  "seats/fetchSeatById",
  async ({ roomId, seatId }) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<Seat>>(`${API_ENDPOINTS.SEATS}/${seatId}/rooms/${roomId}`, { headers });
    return res.data.data;
  }
);

export const updateSeat = createAsyncThunk<Seat, { id: number; seatType: 'STANDARD' | 'PREMIUM'; empty: boolean }>(
  "seats/updateSeat",
  async (updateData) => {
    const headers = getAuthHeaders();
    const payload = {
      id: updateData.id,
      seatType: updateData.seatType,
      empty: updateData.empty,
    };
    const res = await put<ApiResponseWrapper<Seat>>(`${API_ENDPOINTS.SEATS}/${updateData.id}`, payload, { headers });
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
        const idx = roomSeats.findIndex((s: Seat) => s.id === seat.id);
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
        Object.keys(state.seatsByRoom).forEach((roomId: string) => {
          const roomSeats = state.seatsByRoom[parseInt(roomId)];
          const idx = roomSeats.findIndex((s: Seat) => s.id === seat.id);
          if (idx !== -1) roomSeats[idx] = seat;
        });
      })
      .addCase(updateSeat.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update seat";
      });
  }
});

export default seatsSlice.reducer;
