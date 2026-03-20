import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, IconButton,
  BottomNavigation, BottomNavigationAction, Paper, Avatar,
  Menu, MenuItem, Badge, Tooltip, Divider
} from '@mui/material'
import {
  Dashboard, PersonAdd, Mic, Logout, AccountCircle,
  LocalHospital, Settings
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import NotificationMenu from './NotificationMenu'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/asha', match: (p) => p === '/asha' },
  { label: 'Register', icon: <PersonAdd />, path: '/asha/new-patient', match: (p) => p.includes('/new-patient') },
  { label: 'Voice Input', icon: <Mic />, path: '/asha/voice-input', match: (p) => p.includes('/voice-input') }
]

export default function AshaLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const activeIndex = NAV_ITEMS.findIndex(item => item.match(location.pathname))

  const handleLogout = () => {
    setAnchorEl(null)
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Top AppBar */}
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ minHeight: 56 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1565C0, #00897B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <LocalHospital sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main" lineHeight={1.1}>
                ASHA Assist
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>
                {user?.village || 'Field Portal'}
              </Typography>
            </Box>
          </Box>

          {/* Notifications icon */}
          <NotificationMenu />

          {/* Avatar menu */}
          <Tooltip title={user?.name || 'Profile'}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 34, height: 34, fontSize: '0.875rem',
                  background: 'linear-gradient(135deg, #1565C0, #00897B)',
                  fontWeight: 700
                }}
              >
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: 2, minWidth: 200, mt: 0.5 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">ASHA Worker · {user?.village}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/asha/settings') }}>
              <Settings sx={{ mr: 1.5, fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 1.5, fontSize: 18 }} />
              <Typography variant="body2" fontWeight={600}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Box className="fade-in">
        <Outlet />
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        elevation={8}
      >
        <BottomNavigation
          value={activeIndex >= 0 ? activeIndex : 0}
          onChange={(_, newValue) => navigate(NAV_ITEMS[newValue].path)}
          showLabels
        >
          {NAV_ITEMS.map(item => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
