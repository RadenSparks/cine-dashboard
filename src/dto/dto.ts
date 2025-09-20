export type AuthenticationRequestDTO = {
  email: string;
  password: string;
};

export type AuthenticationResponseDTO = {
  email: string;
  role : 'ADMIN' | 'USER';
  accessToken: string;
};