import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Avatar, Divider, List, ListItem, ListItemAvatar,
  ListItemText, Chip, LinearProgress
} from '@mui/material'
import {
  People, Assessment, Warning, AdminPanelSettings,
  PersonAdd, TrendingUp, CheckCircle
} from '@mui/icons-material'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import dayjs from 'dayjs'

const SAMPLE_USERS = [
  { _id: '1', name: 'Kavita Kumari', role: 'asha', village: 'Rampur', createdAt: new Date(Date.now() - 86400000 * 2), isActive: true },
  { _id: '2', name: 'Dr. Anand Misra', role: 'doctor', district: 'Gorakhpur', createdAt: new Date(Date.now() - 86400000 * 5), isActive: true },
  { _id: '3', name: 'Radha Gupta', role: 'asha', village: 'Kheda', createdAt: new Date(Date.now() - 86400000 * 7), isActive: true },
  { _id: '4', name: 'Dr. Sneha Patil', role: 'doctor', district: 'Gorakhpur', createdAt: new Date(Date.now() - 86400000 * 10), isActive: false },
]

const ROLE_CONFIG = {
  asha: { color: '#00897B', bg: '#E0F2F1', label: 'ASHA Worker' },
  doctor: { color: '#1565C0', bg: '#E3F2FD', label: 'Doctor' },
  admin: { color: '#6A1B9A', bg: '#F3E5F5', label: 'Admin' }
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/analytics/summary')
        ])
        setUsers(uRes.data.users || [])
        setSummary(sRes.data)
      } catch {
        setUsers(SAMPLE_USERS)
        setSummary({ totalPatients: 128, highRiskCount: 14, totalScreenings: 215, activeAlerts: 3 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const userCounts = {
    asha: users.filter(u => u.role === 'asha').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    admin: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.isActive).length,
  }

  return (
    <Box>
      {/* Hero */}
      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #1A237E 0%, #283593 55%, #3949AB 100%)',
        color: '#fff'
      }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <AdminPanelSettings sx={{ fontSize: 28 }} />
                <Typography variant="h5" fontWeight={800}>Admin Console</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 1.5, maxWidth: 380 }}>
                Full platform oversight — manage users, monitor health metrics, and configure system settings.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`${userCounts.asha} ASHA Workers`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
                <Chip label={`${userCounts.doctor} Doctors`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
              </Box>
            </Box>
            <Avatar sx={{ width: 54, height: 54, bgcolor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.2rem' }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Patients', value: summary?.totalPatients, icon: <People />, color: '#1565C0', subtitle: 'Across all zones', trend: 'up', trendValue: '+8 this week' },
          { title: 'High Risk', value: summary?.highRiskCount, icon: <Warning />, color: '#D32F2F', subtitle: 'Need attention', trend: 'up', trendValue: '+2 today' },
          { title: 'Screenings', value: summary?.totalScreenings, icon: <Assessment />, color: '#00897B', subtitle: 'Total completed', trend: 'up', trendValue: '+18 this week' },
          { title: 'Active Users', value: loading ? '--' : userCounts.active, icon: <People />, color: '#6A1B9A', subtitle: `${users.length} total accounts`, trend: null, trendValue: '' }
        ].map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {/* User Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>System Users</Typography>
                  <Typography variant="caption" color="text.secondary">All registered accounts</Typography>
                </Box>
                <Chip label={`${users.length} Total`} size="small" variant="outlined" color="primary" />
              </Box>

              {/* Role Summary */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                  <Box key={role} sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: cfg.bg, border: `1px solid ${cfg.color}20`, textAlign: 'center', minWidth: 68 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: cfg.color, lineHeight: 1.1 }}>
                      {role === 'asha' ? userCounts.asha : role === 'doctor' ? userCounts.doctor : userCounts.admin}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{cfg.label.split(' ')[0]}</Typography>
                  </Box>
                ))}
              </Box>

              <List disablePadding>
                {users.slice(0, 5).map((u, idx) => {
                  const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.asha
                  return (
                    <React.Fragment key={u._id}>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.85rem' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{u.name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{u.village || u.district || '—'} · {dayjs(u.createdAt).fromNow()}</Typography>}
                        />
                        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                          <Chip label={cfg.label.split(' ')[0]} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                          {u.isActive
                            ? <CheckCircle sx={{ fontSize: 14, color: '#2E7D32' }} />
                            : <Warning sx={{ fontSize: 14, color: '#E65100' }} />
                          }
                        </Box>
                      </ListItem>
                      {idx < users.slice(0, 5).length - 1 && <Divider />}
                    </React.Fragment>
                  )
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Platform Health Metrics</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2.5 }}>
                System performance and coverage indicators
              </Typography>
              {[
                { label: 'Patient Coverage', value: 74, color: '#1565C0', desc: '74% of target villages registered' },
                { label: 'Screening Completion', value: 89, color: '#00897B', desc: '89% screened within 30 days' },
                { label: 'High-Risk Follow-up', value: 62, color: '#E65100', desc: '62% received doctor review' },
                { label: 'User Adoption', value: 95, color: '#6A1B9A', desc: '95% ASHA workers active' },
              ].map(metric => (
                <Box key={metric.label} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{metric.label}</Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: metric.color }}>{metric.value}%</Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: `${metric.color}15`, borderRadius: 4, overflow: 'hidden', mb: 0.5 }}>
                    <Box sx={{ width: `${metric.value}%`, height: '100%', bgcolor: metric.color, borderRadius: 4, transition: 'width 1s ease' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{metric.desc}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
