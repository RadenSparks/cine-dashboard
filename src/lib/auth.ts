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