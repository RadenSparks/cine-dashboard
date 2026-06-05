import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '@/features/dashboard/Dashboard'
import MoviesPage from '@/features/movies/MoviesPage'
import BookingPage from '@/features/bookings/BookingPage'
import UserPage from '@/features/users/UserPage'
import TransactionPage from '@/features/transactions/TransactionPage'
import PromotionPage from '@/features/promotions/PromotionPage'
import Setting from '@/features/settings/SettingsPage'
import LoginPage from '@/features/authentication/LoginPage'
import ProtectedRoute from '@/shared/components/routing/ProtectedRoute'
import GenresPage from '@/features/genres/GenresPage'
import Layout from '@/shared/components/layout/AppLayout'
import RoomManagementPage from '@/features/rooms/RoomManagementPage'
import SessionPage from '@/features/sessions/SessionPage'
import PublicRoute from '@/shared/components/routing/PublicRoute'
import ImagesManager from '@/features/media/ImagesManager'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/bookings" element={<BookingPage />} />
                  <Route path="/sessions" element={<SessionPage />} />
                  <Route path="/users" element={<UserPage />} />
                  <Route path="/transactions" element={<TransactionPage />} />
                  <Route path="/promotions" element={<PromotionPage />} />
                  <Route path="/settings" element={<Setting />} />
                  <Route path="/genres" element={<GenresPage />} />
                  <Route path="/rooms" element={<RoomManagementPage />} />
                  <Route path="/images" element={<ImagesManager />} />
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
