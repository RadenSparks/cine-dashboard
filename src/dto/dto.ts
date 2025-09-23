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