import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type User, type ApiResponse } from "../entities/type";
import { get, post, remove } from "../client/axiosCilent";
import type { UserApiDTO } from "../dto/dto";

// API endpoint config
const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
const API_URL = `${BASE_API.replace(/\/$/, "")}/users`;

// Auth header utility (if needed)
function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  const accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Thunks
export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchUsers",
  async () => {
    const res = await get<ApiResponse<{ content: User[] }>>(API_URL, { headers: getAuthHeaders() });
    return res.data.data?.content ?? [];
  }
);

export const fetchUserById = createAsyncThunk<User, number>(
  "users/fetchUserById",
  async (userId) => {
    const res = await get<ApiResponse<User>>(`${API_URL}/${userId}`, { headers: getAuthHeaders() });
    return res.data.data;
  }
);

export const fetchUserByEmail = createAsyncThunk<User, string>(
  "users/fetchUserByEmail",
  async (email) => {
    const res = await get<ApiResponse<User>>(`${API_URL}/username/${email}`, { headers: getAuthHeaders() });
    return res.data.data;
  }
);

// Soft delete: mark user as inactive
export const deactivateUser = createAsyncThunk<{ id: number }, number>(
  "users/deactivateUser",
  async (userId) => {
    const res = await remove<ApiResponse<{ id: number }>>(`${API_URL}/${userId}`, { headers: getAuthHeaders() });
    if (res.data.status !== "SUCCESS") throw new Error("Failed to deactivate user");
    return res.data.data; // { id }
  }
);

// Restore user thunk
export const restoreUser = createAsyncThunk<{ id: number }, number>(
  "users/restoreUser",
  async (userId) => {
    const res = await post<ApiResponse<{ id: number }>>(
      `${API_URL}/${userId}`,
      {}, // No body needed
      { headers: getAuthHeaders() }
    );
    if (res.data.status !== "SUCCESS") throw new Error("Failed to restore user");
    return res.data.data; // { id }
  }
);

// Add user (new thunk)
export const addUser = createAsyncThunk<User, UserApiDTO>(
  "users/addUser",
  async (user) => {
    const res = await post<ApiResponse<User>>(`${API_URL}`, user, { headers: getAuthHeaders() });
    return res.data.data;
  }
);

export const updateUser = createAsyncThunk<User, UserApiDTO>(
  "users/updateUser",
  async (user) => {
    const res = await post<ApiResponse<User>>(`${API_URL}`, user, { headers: getAuthHeaders() });
    return res.data.data;
  }
);

interface UserState {
  users: User[];
  selectedUserId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUserToState: (state, action: PayloadAction<User>) => { // renamed
      state.users.push(action.payload);
    },
    updateUserInState: (state, action: PayloadAction<User>) => { // renamed
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    selectUser: (state, action: PayloadAction<number | null>) => {
      state.selectedUserId = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch users";
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        else state.users.push(action.payload);
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        else state.users.push(action.payload);
      })
      .addCase(deactivateUser.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx].active = false;
        }
      })
      .addCase(restoreUser.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx].active = true;
        }
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex(u => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      });
  }
});

export const {
  setUsers,
  addUserToState,
  updateUserInState,
  selectUser,
} = userSlice.actions;

export default userSlice.reducer;
