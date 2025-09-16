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
import GenresPage from './pages/genres/GenresPage'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <Layout>
                <MoviesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <BookingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/showtimes"
          element={
            <ProtectedRoute>
              <Layout>
                <ShowtimePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <TransactionPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <ProtectedRoute>
              <Layout>
                <PromotionPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Setting />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/genres"
          element={
            <ProtectedRoute>
              <Layout>
                <GenresPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
