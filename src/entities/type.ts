export type Movie = {
  id: number;
  title: string;
  description?: string;
  duration: number;
  premiere_date: string;
  poster?: string;
  genre_ids: number[];
  rating?: number;
  deleted?: boolean;
};

export type Genre = {
  genre_id: number; // Use genre_id to match backend
  genre_name: string;
  icon?: string;
  deleted?: boolean;
};

export type RoomPreset = {
  name: string;
  premium_seats: string; // Comma-separated seat IDs
  empty_seats: string[]; // Array of seat IDs that are empty
  room_layout?: string;
  room_rows: number;
  room_cols: number;
};

export type Room = {
  room_id: number;
  room_name: string;
  room_rows: number;
  room_cols: number;
  room_layout?: string;
  premium_seats: string;
  empty_seats?: string[]; // <-- Add this
  presets?: RoomPreset[];
  created_at?: string;
  updated_at?: string;
  deleted?: boolean;
};

export type User = {
  id: number;
  name: string;
  password: string;
  email: string;
  phoneNumber: string;
  role?: 'ADMIN' | 'USER'; // Optional if not always present
  active?: boolean;        // Optional if not always present
  tier?: number;
  points?: number;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE'; // <-- change to status
};

export type Session = {
  session_id: number;
  movie_id: number;
  room_id: number;
  session_date: string; // "YYYY-MM-DD"
  created_at?: string;
  updated_at?: string;
  deleted?: boolean;
};

export type Seat = {
  seat_id: number;
  room_id: number;
  // seat_code: string;
  seat_row: string;
  seat_column: string;
  seat_type: string; // e.g. "VIP", "Regular"
  // status: string; // e.g. "Available", "Booked"
  created_at?: string;
  updated_at?: string;
  deleted?: boolean;
};