import axios from "axios";

export const DEFAULT_ERROR_MESSAGES = {
  unknown: "Something went wrong. Please try again.",
  network: "Unable to reach the server. Check your connection and try again.",
  auth: "Authentication failed. Please sign in again.",
  validation: "Please check the form and try again.",
} as const;

type ErrorMessageOptions = {
  fallback?: string;
};

export function getErrorMessage(error: unknown, options: ErrorMessageOptions = {}) {
  const fallback = options.fallback ?? DEFAULT_ERROR_MESSAGES.unknown;

  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.response?.statusText || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error || fallback;
  }

  return fallback;
}

export function toError(error: unknown, fallback?: string) {
  return new Error(getErrorMessage(error, { fallback }));
}
