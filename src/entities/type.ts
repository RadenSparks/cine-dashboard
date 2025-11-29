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
  id: number;                 // Backend: roomId
  roomName: string;
  roomRow: string;
  roomColumn: number;
  roomLayout?: string;
  premiumSeats?: string;
  emptySeats?: string[];
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
  id: number;                 // Backend: seatId
  roomId: number;
  seatCode: string;
  seatRow: string;
  seatColumn: number;         // <-- should be number, not string
  premium: boolean;           // <-- required, not optional
  empty: boolean;             // <-- required, not optional
  seatType?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
};