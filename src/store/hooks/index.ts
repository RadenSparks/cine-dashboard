/**
 * Typed Redux hooks
 * Pre-configured hooks for type-safe dispatch and selector usage throughout the app
 *
 * Usage:
 * import { useAppDispatch, useAppSelector } from '@/store/hooks'
 *
 * In components:
 * const dispatch = useAppDispatch();
 * const movies = useAppSelector(state => state.movies);
 */

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';

/**
 * Typed dispatch hook - provides autocomplete for async thunks and actions
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook - provides type-safe access to state with intellisense
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
