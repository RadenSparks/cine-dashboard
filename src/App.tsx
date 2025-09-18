import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import MoviesPage from './pages/movies/MoviesPage'
import BookingPage from './pages/bookings/BookingPage'
import ShowtimePage from './pages/sessions/SessionPage'
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
          path="*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/bookings" element={<BookingPage />} />
                  <Route path="/sessions" element={<ShowtimePage />} />
                  <Route path="/users" element={<UserPage />} />
                  <Route path="/transactions" element={<TransactionPage />} />
                  <Route path="/promotions" element={<PromotionPage />} />
                  <Route path="/settings" element={<Setting />} />
                  <Route path="/genres" element={<GenresPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
