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
  teaser?: string;
};

export type GenreApiDTO = {
  id?: number;
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
  operation?: 'CREATE' | 'UPDATE'; // Backend requirement for SaveUserRequestDTO
};

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: 'SUCCESS' | 'ERROR' | 'FAILURE';
};

export type RetrieveImageDTO = {
  id: number;
  name: string;
  contentType: string;
  size: number;
  url: string;
  folderName?: string; // Folder categorization
};

export type UploadImageResponseDTO = {
  id: number;
  name: string;
  eTag: string;
  folder?: string;           // Backend returns 'folder' not 'folderName'
  folderName?: string;       // Keep for compatibility
};

export type RawImageResponseDTO = {
  eTag: string;
  updatedTime?: string;
  contentType: string;
  // when using axios with responseType: 'arraybuffer' this will be ArrayBuffer/Uint8Array
  content: ArrayBuffer | Uint8Array | null;
};

export type ImageFolderDTO = {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MoveImagesRequestDTO = {
  imageIds: number[];
  targetFolderName: string;
};