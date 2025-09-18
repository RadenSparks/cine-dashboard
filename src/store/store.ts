import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './moviesSlice';
import genresReducer from './genresSlice';
import roomsReducer from './roomsSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    genres: genresReducer,
    rooms: roomsReducer, // Add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;