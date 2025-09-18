import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Room = {
  room_id: number;
  room_name: string;
  premium_seats: string; // comma-separated seat IDs, e.g. "A1,A2,B1"
};

interface RoomsState {
  rooms: Room[];
  selectedRoomId: number | null;
}

const initialState: RoomsState = {
  rooms: [
    { room_id: 1, room_name: "Room 1", premium_seats: "A1,A2,B1" },
    { room_id: 2, room_name: "Room 2", premium_seats: "E1,E2,E10,E11" },
  ],
  selectedRoomId: 1,
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    addRoom(state, action: PayloadAction<Omit<Room, "room_id">>) {
      const nextId = Math.max(0, ...state.rooms.map(r => r.room_id)) + 1;
      state.rooms.push({ room_id: nextId, ...action.payload });
    },
    updateRoom(state, action: PayloadAction<Room>) {
      const idx = state.rooms.findIndex(r => r.room_id === action.payload.room_id);
      if (idx !== -1) state.rooms[idx] = action.payload;
    },
    selectRoom(state, action: PayloadAction<number>) {
      state.selectedRoomId = action.payload;
    },
  },
});

export const { addRoom, updateRoom, selectRoom } = roomsSlice.actions;
export default roomsSlice.reducer;