import { configureStore } from '@reduxjs/toolkit';
import {
  moviesReducer,
  genresReducer,
  imagesReducer,
  roomsReducer,
  seatsReducer,
  sessionsReducer,
  userReducer,
  milestoneTierReducer,
} from './slices';

/**
 * Root Redux store configuration
 * 
 * Features are organized by domain:
 * - Content: Movies, Genres, Images
 * - Venue: Rooms, Seats, Sessions
 * - Users: User management, Milestone Tiers
 */
export const store = configureStore({
  reducer: {
    // Content management
    movies: moviesReducer,
    genres: genresReducer,
    images: imagesReducer,

    // Venue management
    rooms: roomsReducer,
    seats: seatsReducer,
    sessions: sessionsReducer,

    // User management
    users: userReducer,
    milestoneTiers: milestoneTierReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Import and re-export typed hooks
export { useAppDispatch, useAppSelector } from './hooks';