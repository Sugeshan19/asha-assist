import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Menu, MenuItem, Badge, Tooltip, Chip
} from '@mui/material'
import {
  Dashboard, People, Analytics, Logout, LocalHospital,
  Settings, AdminPanelSettings, Notifications, ChevronRight
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const DRAWER_WIDTH = 252

const MENU_ITEMS = [
  { label: 'Overview', icon: <Dashboard />, path: '/admin', exact: true },
  { label: 'Users', icon: <People />, path: '/admin/users', exact: false },
  { label: 'Analytics', icon: <Analytics />, path: '/admin/analytics', exact: false },
  { label: 'Settings', icon: <Settings />, path: '/admin/settings', exact: false }
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path)

  const currentPage = MENU_ITEMS.find(i => isActive(i))?.label || 'Admin Panel'

  const handleLogout = () => {
    setAnchorEl(null)
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 'none',
            background: 'linear-gradient(180deg, #1A237E 0%, #283593 60%, #3949AB 100%)'
          }
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AdminPanelSettings sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#fff" lineHeight={1.1}>ASHA Assist</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>Admin Console</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />

        <Box sx={{ flex: 1, pt: 1.5, px: 0.5 }}>
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', px: 1.5, fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
            Management
          </Typography>
          <List disablePadding>
            {MENU_ITEMS.map(item => (
              <ListItemButton
                key={item.path}
                selected={isActive(item)}
                onClick={() => navigate(item.path)}
                sx={{ width: 'calc(100% - 16px)', mx: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {React.cloneElement(item.icon, { fontSize: 'small' })}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive(item) ? 700 : 400 }}
                />
                {isActive(item) && <ChevronRight sx={{ fontSize: 16, opacity: 0.7 }} />}
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '0.875rem' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color="#fff" noWrap>{user?.name}</Typography>
              <Chip label="Admin" size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
            </Box>
          </Box>
          <ListItemButton onClick={handleLogout} sx={{ mt: 1, borderRadius: 2, color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,0,0,0.1)' }, width: 'auto' }}>
            <ListItemIcon sx={{ minWidth: 32 }}><Logout fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={700}>{currentPage}</Typography>
              <Typography variant="caption" color="text.secondary">Admin · Full Access</Typography>
            </Box>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ mr: 1 }}>
                <Badge badgeContent={5} color="error"><Notifications fontSize="small" /></Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.name}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#3949AB', fontWeight: 700, fontSize: '0.9rem' }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 180, mt: 0.5 } }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">System Administrator</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 1.5, fontSize: 18 }} />
                <Typography variant="body2" fontWeight={600}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: 'auto' }} className="fade-in">
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
