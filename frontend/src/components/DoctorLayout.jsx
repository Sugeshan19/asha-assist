import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Menu, MenuItem, Badge, Tooltip, Chip,
  useMediaQuery, useTheme
} from '@mui/material'
import {
  Dashboard, People, Analytics, Logout, AccountCircle,
  LocalHospital, Menu as MenuIcon, Shield, Settings, ChevronRight
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import NotificationMenu from './NotificationMenu'

const DRAWER_WIDTH = 252

const MENU_ITEMS = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/doctor', exact: true },
  { label: 'Patients', icon: <People />, path: '/doctor/patients', exact: false },
  { label: 'Analytics', icon: <Analytics />, path: '/doctor/analytics', exact: false }
]

export default function DoctorLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path)

  const currentPage = MENU_ITEMS.find(i => isActive(i))?.label || 'Doctor Portal'

  const handleLogout = () => {
    setAnchorEl(null)
    logout()
    navigate('/login')
  }

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo area */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <LocalHospital sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#fff" lineHeight={1.1}>
              ASHA Assist
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
              Doctor Portal
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, pt: 1.5, px: 0.5 }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', px: 1.5, fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
          Navigation
        </Typography>
        <List disablePadding>
          {MENU_ITEMS.map(item => (
            <ListItemButton
              key={item.path}
              selected={isActive(item)}
              onClick={() => { navigate(item.path); setMobileOpen(false) }}
              sx={{ width: 'calc(100% - 16px)', mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {React.cloneElement(item.icon, { fontSize: 'small' })}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive(item) ? 700 : 400 }}
              />
              {isActive(item) && <ChevronRight sx={{ fontSize: 16, opacity: 0.6 }} />}
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />

      {/* User profile at bottom */}
      <Box sx={{ p: 2 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
          borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)',
          cursor: 'pointer', transition: 'all 0.2s',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
        }}
        onClick={() => navigate('/doctor')}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontWeight: 700, fontSize: '0.875rem' }}>
            {user?.name?.[0]?.toUpperCase() || 'D'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} color="#fff" noWrap>{user?.name}</Typography>
            <Chip label="Doctor" size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{ mt: 1, borderRadius: 2, color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,0,0,0.1)' }, width: 'auto' }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}><Logout fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Permanent Drawer (Desktop) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH, flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 'none' }
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Temporary drawer (Mobile) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top AppBar */}
        <AppBar position="sticky" color="inherit" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">{currentPage}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.district || 'Healthcare Command Center'}
              </Typography>
            </Box>

            <NotificationMenu />

            <Tooltip title={user?.name}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontWeight: 700, fontSize: '0.9rem' }}>
                  {user?.name?.[0]?.toUpperCase() || 'D'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 200, mt: 0.5 } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Doctor · {user?.district || 'Main Hospital'}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/doctor/settings') }}>
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

        {/* Page Body */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: 'auto' }} className="fade-in">
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
