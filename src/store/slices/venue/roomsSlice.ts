import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Room } from "@/shared/types/entities";
import { type RoomApiDTO } from "@/shared/types/dto";
import { get, post, put, remove } from "@/shared/api/apiClient";
import { API_ENDPOINTS, getAuthHeaders } from '@/store/utils/apiConfig';

type ApiResponseWrapper<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

export const fetchRooms = createAsyncThunk<Room[]>(
  "rooms/fetchRooms",
  async () => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<Room[]>>(API_ENDPOINTS.ROOMS, { headers });
    return Array.isArray(res.data.data) ? res.data.data : [];
  }
);

export const fetchRoomById = createAsyncThunk<Room, number>(
  "rooms/fetchRoomById",
  async (roomId) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<Room>>(`${API_ENDPOINTS.ROOMS}/${roomId}`, { headers });
    return res.data.data;
  }
);

export const addRoom = createAsyncThunk<Room, RoomApiDTO>(
  "rooms/addRoom",
  async (room) => {
    const headers = getAuthHeaders();
    const res = await post<ApiResponseWrapper<Room>>(API_ENDPOINTS.ROOMS, room, { headers });
    return res.data.data;
  }
);

export const updateRoom = createAsyncThunk<Room, RoomApiDTO>(
  "rooms/updateRoom",
  async (room) => {
    if (!room.id) throw new Error("Room id is required for update");
    const headers = getAuthHeaders();
    const res = await put<ApiResponseWrapper<Room>>(`${API_ENDPOINTS.ROOMS}/${room.id}`, room, { headers });
    return res.data.data;
  }
);

export const deleteRoom = createAsyncThunk<Room, number>(
  "rooms/deleteRoom",
  async (id, { getState }) => {
    const headers = getAuthHeaders();
    await remove<ApiResponseWrapper<Record<string, never>>>(`${API_ENDPOINTS.ROOMS}/${id}`, { headers });

    const state = getState() as { rooms: { rooms: Room[] } };
    const room = state.rooms.rooms.find(r => r.id === id);

    if (room) {
      return { ...room, deleted: true };
    }

    throw new Error("Room not found in state");
  }
);

export const restoreRoom = createAsyncThunk<Room, number>(
  "rooms/restoreRoom",
  async (id) => {
    const headers = getAuthHeaders();
    const res = await put<ApiResponseWrapper<Room>>(`${API_ENDPOINTS.ROOMS}/${id}/restore`, {}, { headers });
    return res.data.data;
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
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch rooms";
      })
      .addCase(fetchRoomById.pending, state => {
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r: Room) => r.id === action.payload.id);
        if (idx !== -1) {
          state.rooms[idx] = action.payload;
        } else {
          state.rooms.push(action.payload);
        }
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch room";
      })
      .addCase(addRoom.pending, state => {
        state.error = null;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(addRoom.rejected, (state, action) => {
        state.error = action.error.message || "Failed to add room";
      })
      .addCase(updateRoom.pending, state => {
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        const idx = state.rooms.findIndex((r: Room) => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update room";
      })
      .addCase(deleteRoom.pending, state => {
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        const idx = state.rooms.findIndex((r: Room) => r.id === action.payload.id);
        if (idx !== -1) state.rooms[idx] = action.payload;
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete room";
      })
      .addCase(restoreRoom.pending, state => {
        state.error = null;
      })
      .addCase(restoreRoom.fulfilled, (state, action: PayloadAction<Room>) => {
        const idx = state.rooms.findIndex((r: Room) => r.id === action.payload.id);
        if (idx !== -1) {
          state.rooms[idx] = action.payload;
        } else {
          state.rooms.push(action.payload);
        }
      })
      .addCase(restoreRoom.rejected, (state, action) => {
        state.error = action.error.message || "Failed to restore room";
      });
  }
});

export const { selectRoom } = roomsSlice.actions;
export default roomsSlice.reducer;
