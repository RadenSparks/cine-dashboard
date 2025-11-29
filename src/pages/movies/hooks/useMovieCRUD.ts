import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import {
  addMovieAsync,
  updateMovieAsync,
  deleteMovieAsync,
} from "../../../store/moviesSlice";
import type { Movie } from "../../../entities/type";
import type { MovieApiDTO } from "../../../dto/dto";
import type { ToastNotification } from "../../../components/UI/SatelliteToast";

export interface UseMovieCRUDOptions {
  onMovieAdded?: (movie: Movie) => void;
  onMovieUpdated?: (movie: Movie) => void;
  onMovieDeleted?: (movieId: number) => void;
  toastRef?: React.RefObject<{
    showNotification: (options: Omit<ToastNotification, "id">) => void;
  } | null>;
}

export const useMovieCRUD = (options: UseMovieCRUDOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isProcessingRef = useRef(false);

  const handleAddMovie = useCallback(
    async (movie: MovieApiDTO) => {
      if (isProcessingRef.current) return { success: false, error: "Operation in progress" };
      isProcessingRef.current = true;

      try {
        const result = await dispatch(addMovieAsync(movie)).unwrap();
        options.toastRef?.current?.showNotification({
          title: "Success",
          content: `Movie "${movie.title}" added successfully.`,
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 2500,
        });
        options.onMovieAdded?.(result);
        return { success: true, data: result };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        options.toastRef?.current?.showNotification({
          title: "Error",
          content: msg || "Failed to add movie.",
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 3000,
        });
        return { success: false, error: msg };
      } finally {
        isProcessingRef.current = false;
      }
    },
    [dispatch, options]
  );

  const handleUpdateMovie = useCallback(
    async (movie: MovieApiDTO) => {
      if (isProcessingRef.current) return { success: false, error: "Operation in progress" };
      isProcessingRef.current = true;

      try {
        const result = await dispatch(updateMovieAsync(movie)).unwrap();
        options.toastRef?.current?.showNotification({
          title: "Success",
          content: `Movie "${movie.title}" updated successfully.`,
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 2500,
        });
        options.onMovieUpdated?.(result);
        return { success: true, data: result };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        options.toastRef?.current?.showNotification({
          title: "Error",
          content: msg || "Failed to update movie.",
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 3000,
        });
        return { success: false, error: msg };
      } finally {
        isProcessingRef.current = false;
      }
    },
    [dispatch, options]
  );

  const handleDeleteMovie = useCallback(
    async (movieId: number) => {
      if (isProcessingRef.current) return { success: false, error: "Operation in progress" };
      isProcessingRef.current = true;

      try {
        await dispatch(deleteMovieAsync(movieId)).unwrap();
        options.toastRef?.current?.showNotification({
          title: "Success",
          content: "Movie deleted successfully.",
          accentColor: "#22c55e",
          position: "bottom-right",
          longevity: 2500,
        });
        options.onMovieDeleted?.(movieId);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        options.toastRef?.current?.showNotification({
          title: "Error",
          content: msg || "Failed to delete movie.",
          accentColor: "#ef4444",
          position: "bottom-right",
          longevity: 3000,
        });
        return { success: false, error: msg };
      } finally {
        isProcessingRef.current = false;
      }
    },
    [dispatch, options]
  );

  return {
    addMovie: handleAddMovie,
    updateMovie: handleUpdateMovie,
    deleteMovie: handleDeleteMovie,
    isProcessing: isProcessingRef.current,
  };
};
