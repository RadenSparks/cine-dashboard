import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './moviesSlice';
import genresReducer from './genresSlice';
import roomsReducer from './roomsSlice';
import userReducer from "./userSlice"; 
import sessionsReducer from './sessionsSlice';
import seatsReducer from './seatsSlice';


export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    genres: genresReducer,
    rooms: roomsReducer,
    users: userReducer,
    sessions: sessionsReducer,
    seats: seatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;