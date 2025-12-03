import { useState, useEffect } from "react";
import type { AuthenticationResponseDTO } from "../dto/dto";

/**
 * Hook to get the currently logged-in user from localStorage
 * @returns The current user object or null if not authenticated
 */
export function useCurrentUser(): AuthenticationResponseDTO | null {
  const [user, setUser] = useState<AuthenticationResponseDTO | null>(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("cine-user-details");
    if (userDetails) {
      try {
        const parsedUser: AuthenticationResponseDTO = JSON.parse(userDetails);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user details:", error);
        setUser(null);
      }
    }
  }, []);

  return user;
}

/**
 * Get the currently logged-in user synchronously (for non-React contexts)
 * @returns The current user object or null if not authenticated
 */
export function getCurrentUser(): AuthenticationResponseDTO | null {
  const userDetails = localStorage.getItem("cine-user-details");
  if (userDetails) {
    try {
      return JSON.parse(userDetails) as AuthenticationResponseDTO;
    } catch (error) {
      console.error("Failed to parse user details:", error);
      return null;
    }
  }
  return null;
}

/**
 * Get a specific user property with fallback
 * @param property - The property to get (e.g., 'email', 'role')
 * @param defaultValue - Default value if not found
 */
export function getUserProperty<K extends keyof AuthenticationResponseDTO>(
  property: K,
  defaultValue: AuthenticationResponseDTO[K] | string = ""
): AuthenticationResponseDTO[K] | string {
  const user = getCurrentUser();
  return user ? user[property] : defaultValue;
}
