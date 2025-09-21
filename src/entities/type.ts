export type Movie = {
  movie_id: number;
  title: string;
  description?: string;
  duration: number;
  premiere_date: string;
  poster?: string;
  genre_ids: number[];
  rating?: number; // <-- NEW
  deleted?: boolean;
};

export type Genre = {
  genre_id: number;
  genre_name: string;
  icon?: string;
  deleted?: boolean;
};

export type Room = {
  room_id: number;
  room_name: string;
  premium_seats: string; // comma-separated seat IDs, e.g. "A1,A2,B1"
};

export type User = {
  id: number;
  name: string;
  password: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  tier?: number;      // <-- Add this
  points?: number;    // <-- Add this
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: 'SUCCESS' | 'ERROR' | 'FAILURE';
};