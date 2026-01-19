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
  images?: Image[]; // <- add this
  teaser?: string;
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
  id: number;
  roomName: string;
  rowSize: number;            // Number of rows in the room layout
  columnSize: number;         // Number of columns in the room layout
  capacity: number;           // Total number of seats
  seats?: Seat[];             // List of seats in the room
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
};

export type Tier = {
  id: number;
  name: string;
  code: string; // Use string to match backend
  requiredPoints: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  tierPoint: number;
  mileStoneTier?: Tier;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

// Image frontend entity moved here (was exported from ./image)
export type Image = {
  id: number;
  name: string;
  size: number;
  contentType?: string;    // MIME type (e.g. "image/png")
  url?: string;            // RetrieveImageDTO.url -> API URL to fetch raw image
  eTag?: string;           // Upload response eTag or RawImageResponseDTO.eTag
  createdAt?: string;
  updatedAt?: string;
  movieId?: number;        // if image is associated with a movie
  folderName?: string;     // Folder categorization from backend
  deleted?: boolean;
  // optional runtime-only field when raw content is loaded
  blob?: Blob;
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
  id: number;
  roomId: number;
  seatCode: string;           // e.g., "A1"
  seatRow: string;            // e.g., "A"
  seatNumber: number;         // Column number (e.g., 1)
  seatType: 'STANDARD' | 'PREMIUM';  // Matches backend SeatType enum
  empty: boolean;             // Whether seat is available
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
};