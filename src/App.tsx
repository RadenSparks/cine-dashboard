import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import MoviesPage from './pages/movies/MoviesPage'
import BookingPage from './pages/bookings/BookingPage'
import ShowtimePage from './pages/showtimes/ShowtimePage'
import UserPage from './pages/users/UserPage'
import TransactionPage from './pages/transactions/TransactionPage'
import PromotionPage from './pages/promotions/PromotionPage'
import Setting from './pages/Setting'
import LoginPage from './pages/authentication/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/showtimes"
          element={
            <ProtectedRoute>
              <ShowtimePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedRoute>
              <PromotionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
