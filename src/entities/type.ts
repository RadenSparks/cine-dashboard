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

export type Room = {
  room_id: number;
  room_name: string;
  premium_seats: string;
};

export type User = {
  id: number;
  name: string;
  password: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  tier?: number;
  points?: number;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: 'SUCCESS' | 'ERROR' | 'FAILURE';
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