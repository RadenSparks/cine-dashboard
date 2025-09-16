import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Genre = {
  genre_id: number;
  genre_name: string;
};

const initialState: Genre[] = [
  { genre_id: 1, genre_name: "Sci-Fi" },
  { genre_id: 2, genre_name: "Crime" },
  { genre_id: 3, genre_name: "Drama" },
  { genre_id: 4, genre_name: "Comedy" },
  { genre_id: 5, genre_name: "Action" },
];

const genresSlice = createSlice({
  name: 'genres',
  initialState,
  reducers: {
    addGenre: (state, action: PayloadAction<Genre>) => {
      state.push(action.payload);
    },
    deleteGenre: (state, action: PayloadAction<number>) => {
      return state.filter(g => g.genre_id !== action.payload);
    },
  },
});

export const { addGenre, deleteGenre } = genresSlice.actions;
export default genresSlice.reducer;