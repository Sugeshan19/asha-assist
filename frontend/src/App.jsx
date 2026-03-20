import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from './context/AuthContext'

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'))

// ASHA
const AshaLayout = lazy(() => import('./components/AshaLayout'))
const AshaDashboard = lazy(() => import('./pages/asha/Dashboard'))
const NewPatient = lazy(() => import('./pages/asha/NewPatient'))
const ScreeningResult = lazy(() => import('./pages/asha/ScreeningResult'))
const VoiceInput = lazy(() => import('./pages/asha/VoiceInput'))

// Doctor
const DoctorLayout = lazy(() => import('./components/DoctorLayout'))
const DoctorDashboard = lazy(() => import('./pages/doctor/Dashboard'))
const PatientList = lazy(() => import('./pages/doctor/PatientList'))
const PatientDetail = lazy(() => import('./pages/doctor/PatientDetail'))
const Analytics = lazy(() => import('./pages/doctor/Analytics'))

// Admin
const AdminLayout = lazy(() => import('./components/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

// ─── Global loader ───────────────────────────────
const Loader = () => (
  <Box sx={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', flexDirection: 'column', gap: 2,
    bgcolor: 'background.default'
  }}>
    <CircularProgress size={48} thickness={4} />
  </Box>
)

// ─── Protected route wrapper ──────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    // Redirect to correct home for their role
    const roleHome = user.role === 'asha' ? '/asha' : user.role === 'admin' ? '/admin' : '/doctor'
    return <Navigate to={roleHome} replace />
  }
  return children
}

// ─── Role-based home redirect ─────────────────────
const RoleRedirect = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'asha') return <Navigate to="/asha" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/doctor" replace />
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <Loader />

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <RoleRedirect user={user} /> : <Login />} />

        {/* ASHA Worker Routes */}
        <Route path="/asha" element={
          <ProtectedRoute roles={['asha', 'admin']}>
            <AshaLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AshaDashboard />} />
          <Route path="new-patient" element={<NewPatient />} />
          <Route path="voice-input" element={<VoiceInput />} />
          <Route path="screening-result/:id" element={<ScreeningResult />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute roles={['doctor', 'admin']}>
            <DoctorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          {/* Admin can also view doctor views */}
          <Route path="users" element={<PatientList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Root/wildcard redirects */}
        <Route path="/" element={<RoleRedirect user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
