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
  id?: number;
  roomName: string;
  rowSize: number;
  columnSize: number;
};

export type SeatApiDTO = {
  id?: number;
  roomId: number;
  seatCode: string;
  seatRow: string;
  seatNumber: number;
  seatType: 'STANDARD' | 'PREMIUM';
  empty: boolean;
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

// Session DTOs - aligned with backend API structure
export type CreateSessionRequestDTO = {
  movieId: number;
  roomId: number;
  startTime: string;  // ISO 8601 datetime string (backend: LocalDateTime)
  endTime: string;    // ISO 8601 datetime string (backend: LocalDateTime)
  basePrice: number;  // Frontend number (backend: BigDecimal)
};

export type UpdateSessionRequestDTO = {
  id: number;
  movieId?: number;
  roomId?: number;
  startTime?: string;  // ISO 8601 datetime string (backend: LocalDateTime)
  endTime?: string;    // ISO 8601 datetime string (backend: LocalDateTime)
  basePrice?: number;  // Frontend number (backend: BigDecimal)
};

export type SessionApiDTO = {
  id: number;
  movieId: number;
  movieTitle?: string;
  movieDuration?: number;
  roomId: number;
  roomName?: string;
  startTime: string;   // ISO 8601 datetime string (backend: LocalDateTime)
  endTime: string;     // ISO 8601 datetime string (backend: LocalDateTime)
  basePrice: number;   // Frontend number (backend: BigDecimal)
  createdAt?: string;  // ISO 8601 datetime string
  updatedAt?: string;  // ISO 8601 datetime string
  deleted?: boolean;
};

export type DeleteSessionRequestDTO = {
  id: number;
};

export type GetSessionsFilterDTO = {
  roomId?: number;
  movieId?: number;
  fromDate?: string;        // ISO 8601 "2025-09-22"
  toDate?: string;          // ISO 8601 "2025-09-30"
};