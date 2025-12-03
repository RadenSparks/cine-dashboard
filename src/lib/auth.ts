export function isAuthenticated() {
  // Replace with real auth logic (e.g., check token)
  return !!localStorage.getItem('cine-user-details');
}

export function getAuthHeaders(): Record<string, string> {
  const userDetails = localStorage.getItem("cine-user-details");
  let accessToken: string | null = null;
  try {
    accessToken = userDetails ? JSON.parse(userDetails).accessToken : null;
  } catch {
    accessToken = null;
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

/**
 * Verify if the current token is valid with the backend
 * @returns true if token is valid, false otherwise
 */
export async function verifyTokenWithBackend(): Promise<boolean> {
  try {
    const userDetails = localStorage.getItem("cine-user-details");
    if (!userDetails) return false;
    
    const token = JSON.parse(userDetails).accessToken;
    if (!token) return false;
    
    // Token verification endpoint - POST /api/v1/authenticate/verify
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1"}/authenticate/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      }
    );
    
    if (!response.ok) return false;
    const data = await response.json();
    return data.data?.valid ?? false;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}

/**
 * Check user authorization status with the backend
 * @returns true if user is authorized, false otherwise
 */
export async function checkAuthorizationWithBackend(): Promise<boolean> {
  try {
    const headers = getAuthHeaders();
    if (!headers["Authorization"]) return false;
    
    // Authorization check endpoint - POST /api/v1/authenticate/authorize
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:17000/api/v1"}/authenticate/authorize`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      }
    );
    
    if (!response.ok) return false;
    const data = await response.json();
    return data.data?.authorized ?? false;
  } catch (error) {
    console.error("Authorization check error:", error);
    return false;
  }
}

/**
 * Check if token is expired (client-side check)
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(): boolean {
  try {
    const userDetails = localStorage.getItem("cine-user-details");
    if (!userDetails) return true;
    
    const token = JSON.parse(userDetails).accessToken;
    if (!token) return true;
    
    // Decode JWT token (simple check - doesn't verify signature)
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    
    if (!exp) return false; // No expiration claim
    
    // exp is in seconds, Date.now() is in milliseconds
    const now = Math.floor(Date.now() / 1000);
    return now > exp;
  } catch (error) {
    console.error("Token expiration check error:", error);
    return true;
  }
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  localStorage.removeItem('cine-user-details');
  localStorage.removeItem('cine-admin-remember');
}