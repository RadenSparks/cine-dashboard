import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type User } from "../entities/type";

const mockUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "",
    phoneNumber: "123-456-7890",
    role: "ADMIN",
    active: true,
    tier: 3,
    points: 520,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    password: "",
    phoneNumber: "555-123-4567",
    role: "USER",
    active: false,
    tier: 1,
    points: 40,
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    password: "",
    phoneNumber: "987-654-3210",
    role: "USER",
    active: true,
    tier: 2,
    points: 120,
  },
  {
    id: 4,
    name: "Diana Prince",
    email: "diana@example.com",
    password: "",
    phoneNumber: "222-333-4444",
    role: "USER",
    active: true,
    tier: 2,
    points: 150,
  },
  {
    id: 5,
    name: "Clark Kent",
    email: "clark@example.com",
    password: "",
    phoneNumber: "333-444-5555",
    role: "ADMIN",
    active: true,
    tier: 4,
    points: 1200,
  },
];

interface UserState {
  users: User[];
  selectedUserId: number | null;
}

const initialState: UserState = {
  users: mockUsers,
  selectedUserId: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    selectUser: (state, action: PayloadAction<number | null>) => {
      state.selectedUserId = action.payload;
    },
    updateUserPoints: (state, action: PayloadAction<{ id: number; points: number }>) => {
      const user = state.users.find(u => u.id === action.payload.id);
      if (user) user.points = action.payload.points;
    },
    updateUserTier: (state, action: PayloadAction<{ id: number; tier: number }>) => {
      const user = state.users.find(u => u.id === action.payload.id);
      if (user) user.tier = action.payload.tier;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  selectUser,
  updateUserPoints,
  updateUserTier,
} = userSlice.actions;

export default userSlice.reducer;
