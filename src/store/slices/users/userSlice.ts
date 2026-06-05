import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type User } from "@/shared/types/entities";
import { get, post, remove } from "@/shared/api/apiClient";
import { type UserApiDTO } from "@/shared/types/dto";
import { API_ENDPOINTS, getAuthHeaders } from '@/store/utils/apiConfig';
import { type Page, type PaginatedThunkResult } from '@/store/utils/sliceHelpers';

type ApiResponseWrapper<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

export const fetchUsers = createAsyncThunk<
  PaginatedThunkResult<User>,
  { page?: number; size?: number }
>(
  "users/fetchUsers",
  async ({ page = 0, size = 10 }) => {
    const headers = getAuthHeaders();
    const res = await get<ApiResponseWrapper<Page<User>>>(
      `${API_ENDPOINTS.USERS}?page=${page}&size=${size}`,
      { headers }
    );
    return {
      items: res.data.data?.content ?? [],
      totalPages: res.data.data?.page.totalPages ?? 0,
      currentPage: res.data.data?.page.number ?? 0,
      totalElements: res.data.data?.page.totalElement ?? 0,
    };
  }
);

export const fetchUserById = createAsyncThunk<User, number>(
  "users/fetchUserById",
  async (userId) => {
    const res = await get<ApiResponseWrapper<User>>(
      `${API_ENDPOINTS.USERS}/${userId}`,
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

export const fetchUserByEmail = createAsyncThunk<User, string>(
  "users/fetchUserByEmail",
  async (email) => {
    const res = await get<ApiResponseWrapper<User>>(
      `${API_ENDPOINTS.USERS}/username/${email}`,
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

export const deactivateUser = createAsyncThunk<{ id: number }, number>(
  "users/deactivateUser",
  async (userId) => {
    const res = await remove<ApiResponseWrapper<{ id: number }>>(
      `${API_ENDPOINTS.USERS}/${userId}`,
      { headers: getAuthHeaders() }
    );
    if (res.data.status !== "SUCCESS") throw new Error("Failed to deactivate user");
    return res.data.data;
  }
);

export const restoreUser = createAsyncThunk<{ id: number }, number>(
  "users/restoreUser",
  async (userId) => {
    const res = await post<ApiResponseWrapper<{ id: number }>>(
      `${API_ENDPOINTS.USERS}/${userId}`,
      {},
      { headers: getAuthHeaders() }
    );
    if (res.data.status !== "SUCCESS") throw new Error("Failed to restore user");
    return res.data.data;
  }
);

export const addUser = createAsyncThunk<User, UserApiDTO>(
  "users/addUser",
  async (user) => {
    const res = await post<ApiResponseWrapper<User>>(
      `${API_ENDPOINTS.USERS}`,
      { ...user, operation: 'CREATE' },
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

export const updateUser = createAsyncThunk<User, UserApiDTO>(
  "users/updateUser",
  async (user) => {
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
    const payload = user.password && user.password.trim() !== ""
      ? { ...basePayload, password: user.password }
      : basePayload;
    const res = await post<ApiResponseWrapper<User>>(
      `${API_ENDPOINTS.USERS}`,
      payload,
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

export const verifyToken = createAsyncThunk<{ valid: boolean }, string>(
  "users/verifyToken",
  async (token) => {
    const res = await post<ApiResponseWrapper<{ valid: boolean }>>(
      `${API_ENDPOINTS.AUTH}/verify`,
      { token },
      { headers: { "Authorization": `Bearer ${token}` } }
    );
    return res.data.data;
  }
);

export const authorizeUser = createAsyncThunk<{ authorized: boolean }>(
  "users/authorizeUser",
  async () => {
    const res = await post<ApiResponseWrapper<{ authorized: boolean }>>(
      `${API_ENDPOINTS.AUTH}/authorize`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data.data;
  }
);

interface UsersState {
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

const initialState: UsersState = {
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
    addUserToState: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUserInState: (state, action: PayloadAction<User>) => {
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
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedThunkResult<User>>) => {
        state.loading = false;
        state.users = action.payload.items;
        state.pagination.currentPage = action.payload.currentPage;
        state.pagination.totalPages = action.payload.totalPages;
        state.pagination.totalElements = action.payload.totalElements;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch users";
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex((u: User) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        else state.users.push(action.payload);
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex((u: User) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
        else state.users.push(action.payload);
      })
      .addCase(deactivateUser.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
        const idx = state.users.findIndex((u: User) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx].active = false;
        }
      })
      .addCase(restoreUser.fulfilled, (state, action: PayloadAction<{ id: number }>) => {
        const idx = state.users.findIndex((u: User) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx].active = true;
        }
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const idx = state.users.findIndex((u: User) => u.id === action.payload.id);
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
