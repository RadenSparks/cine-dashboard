import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Room } from "../entities/type";

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/rooms`;

export const fetchRooms = createAsyncThunk<Room[]>(
  "rooms/fetchRooms",
  async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  }
);

export const updateRoom = createAsyncThunk<Room, Room>(
  "rooms/updateRoom",
  async (room) => {
    const res = await fetch(`${API_URL}/${room.room_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    });
    const data = await res.json();
    return data.data;
  }
);

export const addRoom = createAsyncThunk<Room, Omit<Room, "room_id">>(
  "rooms/addRoom",
  async (room) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    });
    const data = await res.json();
    return data.data;
  }
);

export const deleteRoom = createAsyncThunk<number, number>(
  "rooms/deleteRoom",
  async (room_id) => {
    await fetch(`${API_URL}/${room_id}`, { method: "DELETE" });
    return room_id;
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
    savePreset(state, action) {
      const { room_id, preset } = action.payload;
      const room = state.rooms.find(r => r.room_id === room_id);
      if (room) {
        room.presets = room.presets || [];
        room.presets.push(preset);
      }
    },
    selectPreset(state, action) {
      const { room_id, presetName } = action.payload;
      const room = state.rooms.find(r => r.room_id === room_id);
      if (room && room.presets) {
        const preset = room.presets.find(p => p.name === presetName);
        if (preset) {
          room.premium_seats = preset.premium_seats;
          room.room_layout = preset.room_layout;
        }
      }
    },
    deletePreset(state, action) {
      const { room_id, presetName } = action.payload;
      const room = state.rooms.find(r => r.room_id === room_id);
      if (room && room.presets) {
        room.presets = room.presets.filter(p => p.name !== presetName);
      }
    }
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
        const idx = state.rooms.findIndex(r => r.room_id === action.payload.room_id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(r => r.room_id !== action.payload);
      });
  }
});

export const { selectRoom, savePreset, selectPreset, deletePreset } = roomsSlice.actions;
export default roomsSlice.reducer;