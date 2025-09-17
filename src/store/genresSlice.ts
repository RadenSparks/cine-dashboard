import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Genre = {
  genre_id: number;
  genre_name: string;
  icon?: string; // <-- Add icon property
  deleted?: boolean;
};

const initialState: Genre[] = [
  { genre_id: 1, genre_name: "Sci-Fi", icon: "Rocket", deleted: false },
  { genre_id: 2, genre_name: "Crime", icon: "Activity", deleted: false },
  { genre_id: 3, genre_name: "Drama", icon: "VenetianMask", deleted: false },
  { genre_id: 4, genre_name: "Comedy", icon: "Laugh", deleted: false },
  { genre_id: 5, genre_name: "Action", icon: "Sword", deleted: false },
];

const genresSlice = createSlice({
  name: 'genres',
  initialState,
  reducers: {
    addGenre: (state, action: PayloadAction<Genre>) => {
      state.push({ ...action.payload, deleted: false });
    },
    softDeleteGenre: (state, action: PayloadAction<number>) => {
      const genre = state.find(g => g.genre_id === action.payload);
      if (genre) genre.deleted = true;
    },
    restoreGenre: (state, action: PayloadAction<number>) => {
      const genre = state.find(g => g.genre_id === action.payload);
      if (genre) genre.deleted = false;
    },
    updateGenreIcon: (state, action: PayloadAction<{ genre_id: number; icon: string }>) => {
      const genre = state.find(g => g.genre_id === action.payload.genre_id);
      if (genre) genre.icon = action.payload.icon;
    },
  },
});

export const { addGenre, softDeleteGenre, restoreGenre, updateGenreIcon } = genresSlice.actions;
export default genresSlice.reducer;