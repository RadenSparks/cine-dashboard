import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  addMovieAsync,
  updateMovieAsync,
  deleteMovieAsync,
  restoreMovieAsync,
} from "@/store/slices";
import type { Movie } from "@/shared/types/entities";
import type { MovieApiDTO } from "@/shared/types/dto";
import type { ToastNotification } from "@/shared/components/ui/SatelliteToast";
import { getErrorMessage } from "@/shared/lib/errors";
import { notifyError, notifySuccess } from "@/shared/lib/toast";

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
        notifySuccess(options.toastRef, "Success", `Movie "${movie.title}" added successfully.`);
        options.onMovieAdded?.(result);
        return { success: true, data: result };
      } catch (err: unknown) {
        const msg = getErrorMessage(err, { fallback: "Failed to add movie." });
        notifyError(options.toastRef, "Error", msg);
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
        notifySuccess(options.toastRef, "Success", `Movie "${movie.title}" updated successfully.`);
        options.onMovieUpdated?.(result);
        return { success: true, data: result };
      } catch (err: unknown) {
        const msg = getErrorMessage(err, { fallback: "Failed to update movie." });
        notifyError(options.toastRef, "Error", msg);
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
        notifySuccess(options.toastRef, "Success", "Movie deleted successfully.");
        options.onMovieDeleted?.(movieId);
        return { success: true };
      } catch (err: unknown) {
        const msg = getErrorMessage(err, { fallback: "Failed to delete movie." });
        notifyError(options.toastRef, "Error", msg);
        return { success: false, error: msg };
      } finally {
        isProcessingRef.current = false;
      }
    },
    [dispatch, options]
  );

  const handleRestoreMovie = useCallback(
    async (movieId: number) => {
      if (isProcessingRef.current) return { success: false, error: "Operation in progress" };
      isProcessingRef.current = true;

      try {
        await dispatch(restoreMovieAsync(movieId)).unwrap();
        notifySuccess(options.toastRef, "Success", "Movie restored successfully.");
        return { success: true };
      } catch (err: unknown) {
        const msg = getErrorMessage(err, { fallback: "Failed to restore movie." });
        notifyError(options.toastRef, "Error", msg);
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
    restoreMovie: handleRestoreMovie,
    isProcessing: isProcessingRef.current,
  };
};
