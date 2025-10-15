import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Room } from "../entities/type";
import type { RoomApiDTO, ApiResponse } from "../dto/dto";
import { getAuthHeaders } from "../lib/auth";
import { remove } from "../client/axiosCilent";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/rooms`;

// Fetch all rooms
export const fetchRooms = createAsyncThunk<Room[]>(
  "rooms/fetchRooms",
  async () => {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data: ApiResponse<Room[]> = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  }
);

// Fetch a single room by id
export const fetchRoomById = createAsyncThunk<Room, number>(
  "rooms/fetchRoomById",
  async (roomId) => {
    const res = await fetch(`${API_URL}/${roomId}`);
    const data: ApiResponse<Room> = await res.json();
    return data.data;
  }
);

// Add a room
export const addRoom = createAsyncThunk<Room, RoomApiDTO>(
  "rooms/addRoom",
  async (room) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    const data: ApiResponse<Room> = await res.json();
    return data.data;
  }
);

// Update a room
export const updateRoom = createAsyncThunk<Room, RoomApiDTO>(
  "rooms/updateRoom",
  async (room) => {
    if (!room.id) throw new Error("Room id is required for update");
    const res = await fetch(`${API_URL}/${room.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    const data: ApiResponse<Room> = await res.json();
    return data.data;
  }
);

// Delete a room
export const deleteRoom = createAsyncThunk<number, number>(
  "rooms/deleteRoom",
  async (id) => {
    // Call DELETE /api/v1/rooms/{roomId}
    const res = await remove<ApiResponse<{ id: number }>>(`${API_URL}/${id}`);
    if (res.data.status !== "SUCCESS") throw new Error("Failed to delete room");
    return res.data.data.id;
  }
);

interface RoomsState {
  rooms: Room[];
  selectedRoomId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  selectedRoomId: null,
  loading: false,
  error: null,
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    selectRoom(state, action) {
      state.selectedRoomId = action.payload;
    },
    // Preset logic can be updated similarly if needed
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRooms.pending, state => { state.loading = true; })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(r => r.id !== action.payload);
      });
  }
});

export const { selectRoom } = roomsSlice.actions;
export default roomsSlice.reducer;