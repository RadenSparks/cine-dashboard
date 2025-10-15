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
  id?: number;                // Backend: roomId
  roomName: string;
  roomRow: string;            // e.g. "H"
  roomColumn: number;
  roomLayout?: string;
  premiumSeats?: string;      // Comma-separated
  emptySeats?: string[];      // Array of seat codes
  deleted?: boolean;
};

export type SeatApiDTO = {
  id?: number;                // Backend: seatId
  roomId: number;             // Foreign key to Room
  seatCode: string;
  seatRow: string;
  seatColumn: number;         // <-- should be number, not string
  premium: boolean;           // <-- required, not optional
  empty: boolean;             // <-- required, not optional
  seatType?: string;
  status?: string;
  deleted?: boolean;
};

export type MileStoneTierApiDTO = {
  id: number;
  name: string;
  code: string;
  requiredPoints: number;
};

export type UserApiDTO = {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  tierPoint: number;
  tierCode: string;
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE'; // <-- change to status
};