import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CharacterSheet from './pages/CharacterSheet'
import Wiki from './pages/Wiki'
import Layout from './components/Layout'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="character/:id" element={<CharacterSheet />} />
          <Route path="wiki" element={<Wiki />} />
          <Route path="wiki/:slug" element={<Wiki />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Box>
  )
}

export default App
