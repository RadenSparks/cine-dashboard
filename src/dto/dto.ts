export type AuthenticationRequestDTO = {
  email: string;
  password: string;
};

export type AuthenticationResponseDTO = {
  email: string;
  role : 'ADMIN' | 'USER';
  accessToken: string;
};

export type MovieApiDTO = {
  id?: number;
  title: string;
  description?: string;
  duration: number;
  premiereDate: string; 
  poster?: string;
  genres: number[];     
  rating?: number;
};

export type GenreApiDTO = {
  id: number;
  name: string;
  icon?: string;
};

export type RoomApiDTO = {
  room_id?: number;
  room_name: string;
  room_capacity: number;
  room_layout?: string;
  premium_seats: string;
  deleted?: boolean;
};

export type SeatApiDTO = {
  seat_id?: number;
  room_id: number;
  seat_code: string;
  seat_row: string;
  seat_column: string;
  seat_type: string;
  status?: string;
  deleted?: boolean;
};