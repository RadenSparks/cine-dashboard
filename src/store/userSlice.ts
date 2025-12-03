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

// Pagination type for API response
type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElement: number;
    totalPages: number;
  };
};

// Thunks
export const fetchUsers = createAsyncThunk<
  { users: User[]; totalPages: number; currentPage: number; totalElements: number },
  { page?: number; size?: number }
>(
  "users/fetchUsers",
  async ({ page = 0, size = 10 }) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponse<Page<User>>>(
      `${API_URL}?page=${page}&size=${size}`,
      { headers }
    );
    return {
      users: res.data.data?.content ?? [],
      totalPages: res.data.data?.page.totalPages ?? 0,
      currentPage: res.data.data?.page.number ?? 0,
      totalElements: res.data.data?.page.totalElement ?? 0,
    };
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
    const res = await post<ApiResponse<User>>(
      `${API_URL}`,
      { ...user, operation: 'CREATE' },  // ✅ Add CREATE operation for backend
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

export const updateUser = createAsyncThunk<User, UserApiDTO>(
  "users/updateUser",
  async (user) => {
    // Build payload with password handling for UPDATE
    const basePayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      active: user.active,
      tierPoint: user.tierPoint,
      tierCode: user.tierCode,
      operation: 'UPDATE' as const,
    };
    // Only include password if provided (non-empty string)
    const payload = user.password && user.password.trim() !== ""
      ? { ...basePayload, password: user.password }
      : basePayload;
    const res = await post<ApiResponse<User>>(
      `${API_URL}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

// Auth verification thunk - POST /api/v1/authenticate/verify
export const verifyToken = createAsyncThunk<{ valid: boolean }, string>(
  "users/verifyToken",
  async (token) => {
    const BASE_AUTH_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
    const AUTH_URL = `${BASE_AUTH_API.replace(/\/$/, "")}/authenticate`;
    const res = await post<ApiResponse<{ valid: boolean }>>(
      `${AUTH_URL}/verify`,
      { token },
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    return res.data.data;
  }
);

// Auth authorization thunk - POST /api/v1/authenticate/authorize
export const authorizeUser = createAsyncThunk<{ authorized: boolean }>(
  "users/authorizeUser",
  async () => {
    const BASE_AUTH_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
    const AUTH_URL = `${BASE_AUTH_API.replace(/\/$/, "")}/authenticate`;
    const res = await post<ApiResponse<{ authorized: boolean }>>(
      `${AUTH_URL}/authorize`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

interface UserState {
  users: User[];
  selectedUserId: number | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

const initialState: UserState = {
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  },
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
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ users: User[]; totalPages: number; currentPage: number; totalElements: number }>) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination.currentPage = action.payload.currentPage;
        state.pagination.totalPages = action.payload.totalPages;
        state.pagination.totalElements = action.payload.totalElements;
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
      })
      .addCase(verifyToken.pending, state => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, state => {
        state.loading = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Token verification failed";
      })
      .addCase(authorizeUser.pending, state => {
        state.loading = true;
      })
      .addCase(authorizeUser.fulfilled, state => {
        state.loading = false;
      })
      .addCase(authorizeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Authorization failed";
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
