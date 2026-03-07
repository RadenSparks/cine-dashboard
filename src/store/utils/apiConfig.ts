/**
 * Centralized API configuration for all Redux slices
 * Eliminates duplication and provides a single source of truth
 */

const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1";
export const BASE_API_URL = BASE_API.replace(/\/$/, "");

export const API_ENDPOINTS = {
  MOVIES: `${BASE_API_URL}/movies`,
  GENRES: `${BASE_API_URL}/genres`,
  ROOMS: `${BASE_API_URL}/rooms`,
  SEATS: `${BASE_API_URL}/seats`,
  SESSIONS: `${BASE_API_URL}/sessions`,
  USERS: `${BASE_API_URL}/users`,
  MILESTONE_TIERS: `${BASE_API_URL}/tiers`,
  IMAGES: `${BASE_API_URL}/images`,
  AUTH: `${BASE_API_URL}/authenticate`,
} as const;

/**
 * Utility to extract access token from localStorage and format auth headers
 * Used by all slices for authenticated API calls
 */
export function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  let accessToken: string | null = null;
  try {
    accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  } catch {
    accessToken = null;
  }
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
