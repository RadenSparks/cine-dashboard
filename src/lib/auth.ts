export function isAuthenticated() {
  // Replace with real auth logic (e.g., check token)
  return !!localStorage.getItem('cine-admin-remember');
}