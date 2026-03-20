import React, { useState, useEffect } from 'react'
import {
  IconButton, Badge, Tooltip, Menu, MenuItem, Box, Typography,
  Divider, Button, Avatar
} from '@mui/material'
import { Notifications, CheckCircleOutline, HealthAndSafety, Warning } from '@mui/icons-material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import api from '../services/api'
dayjs.extend(relativeTime)

export default function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications || [])
    } catch (e) { console.error('Failed to fetch notifications', e) }
    finally { setLoading(false) }
  }

  const handleMarkRead = async (id, e) => {
    e.stopPropagation()
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton size="small" sx={{ mr: 1 }} onClick={e => setAnchorEl(e.currentTarget)}>
          <Badge badgeContent={unreadCount} color="error" variant={unreadCount > 0 ? "standard" : "dot"}>
            <Notifications fontSize="small" sx={{ color: unreadCount > 0 ? 'primary.main' : 'text.secondary' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ elevation: 4, sx: { width: 340, maxHeight: 400, borderRadius: 3, mt: 1.5 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem' }}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        
        {loading && notifications.length === 0 ? (
          <MenuItem disabled><Typography variant="body2">Loading...</Typography></MenuItem>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutline sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">All caught up!</Typography>
          </Box>
        ) : (
          notifications.map(noti => (
            <MenuItem 
              key={noti._id} 
              sx={{ 
                px: 2, py: 1.5, 
                bgcolor: noti.read ? 'transparent' : 'rgba(21, 101, 192, 0.04)',
                borderLeft: noti.read ? '3px solid transparent' : '3px solid #1565C0',
                whiteSpace: 'normal',
                display: 'flex', gap: 1.5, alignItems: 'flex-start'
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: noti.type === 'alert' ? '#FFEBEE' : '#E3F2FD', color: noti.type === 'alert' ? '#D32F2F' : '#1565C0' }}>
                {noti.type === 'alert' ? <Warning fontSize="small" /> : <HealthAndSafety fontSize="small" />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={noti.read ? 400 : 600} gutterBottom>
                  {noti.message}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'space-between' }}>
                  {dayjs(noti.createdAt).fromNow()}
                  {!noti.read && (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      color="primary" 
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={(e) => handleMarkRead(noti._id, e)}
                    >
                      Mark read
                    </Typography>
                  )}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  )
}
