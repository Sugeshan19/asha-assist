import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  Divider, IconButton, Alert, LinearProgress, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import {
  PersonAdd, Mic, TrendingUp, Warning, CheckCircle,
  Person, ArrowForward, Notifications, FiberManualRecord,
  CalendarToday, Speed, HealthAndSafety
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import RiskBadge from '../../components/RiskBadge'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import { DashboardSkeleton } from '../../components/SkeletonLoaders'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

// Fallback sample data for demo / API failure
const SAMPLE_SUMMARY = { totalPatients: 24, highRiskCount: 3, totalScreenings: 47, pendingAlerts: 2 }
const SAMPLE_PATIENTS = [
  { _id: '1', name: 'Priya Sharma', age: 28, gender: 'Female', village: 'Rampur', createdAt: new Date(Date.now() - 86400000), currentRiskLevel: 'High' },
  { _id: '2', name: 'Ravi Kumar', age: 45, gender: 'Male', village: 'Kheda', createdAt: new Date(Date.now() - 3600000 * 3), currentRiskLevel: 'Medium' },
  { _id: '3', name: 'Sunita Devi', age: 34, gender: 'Female', village: 'Deoria', createdAt: new Date(Date.now() - 3600000 * 6), currentRiskLevel: 'Low' },
  { _id: '4', name: 'Mohan Lal', age: 62, gender: 'Male', village: 'Rampur', createdAt: new Date(Date.now() - 86400000 * 2), currentRiskLevel: 'High' },
  { _id: '5', name: 'Geeta Bai', age: 19, gender: 'Female', village: 'Silbari', createdAt: new Date(Date.now() - 86400000 * 3), currentRiskLevel: 'Low' }
]

export default function AshaDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [recentPatients, setRecentPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, ptnRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/patients?limit=5&sortBy=createdAt&order=desc')
        ])
        setSummary(sumRes.data)
        setRecentPatients(ptnRes.data.patients || [])
      } catch {
        setSummary(SAMPLE_SUMMARY)
        setRecentPatients(SAMPLE_PATIENTS)
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const highRiskPct = summary ? Math.round((summary.highRiskCount / summary.totalPatients) * 100) : 0

  if (loading) return <DashboardSkeleton />

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, animation: 'fadeIn 0.3s ease' }}>
      {/* Demo fallback banner */}
      {usingFallback && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => {}}>
          Showing demo data — backend not connected.
        </Alert>
      )}

      {/* Welcome Hero Card */}
      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #0D2145 0%, #1565C0 55%, #00897B 100%)',
        color: '#fff', overflow: 'hidden', position: 'relative'
      }}>
        {/* Background decoration */}
        {[
          { width: 200, height: 200, top: '-60px', right: '-60px', opacity: 0.06 },
          { width: 120, height: 120, bottom: '-40px', right: '20%', opacity: 0.05 }
        ].map((c, i) => (
          <Box key={i} sx={{
            position: 'absolute', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            width: c.width, height: c.height,
            top: c.top, right: c.right, bottom: c.bottom,
            pointerEvents: 'none', opacity: c.opacity * 10
          }} />
        ))}

        <CardContent sx={{ py: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {greeting}, {user?.name?.split(' ')[0]} 🙏
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                {user?.village && (
                  <Chip label={user.village} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }} />
                )}
                <Chip
                  icon={<CalendarToday sx={{ color: '#fff !important', fontSize: 12 }} />}
                  label={dayjs().format('ddd, D MMM YYYY')}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 340 }}>
                Track patients, screen for conditions, and flag high-risk cases for doctor follow-up.
              </Typography>
            </Box>
            <Avatar sx={{
              width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '1.25rem'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </Box>

          {/* Health score strip */}
          <Box sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                High Risk Rate
              </Typography>
              <Typography variant="caption" sx={{ color: highRiskPct > 20 ? '#FF7043' : '#A5D6A7', fontWeight: 700 }}>
                {highRiskPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={highRiskPct}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.15)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: highRiskPct > 20 ? '#FF7043' : '#66BB6A',
                  borderRadius: 3
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'My Patients', value: summary?.totalPatients, icon: <Person />, color: '#1565C0', subtitle: 'Total registered', trend: 'up', trendValue: '+2 this week' },
          { title: 'High Risk', value: summary?.highRiskCount, icon: <Warning />, color: '#D32F2F', subtitle: 'Need attention', trend: summary?.highRiskCount > 2 ? 'up' : 'flat', trendValue: '' },
          { title: 'Screenings', value: summary?.totalScreenings, icon: <TrendingUp />, color: '#00897B', subtitle: 'Total conducted', trend: 'up', trendValue: '+5 today' },
          { title: 'Pending Alerts', value: summary?.pendingAlerts, icon: <Notifications />, color: '#F57C00', subtitle: 'Doctor notifications', trend: null, trendValue: '' }
        ].map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <StatCard
              {...card}
              onClick={() => {}}
            />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<PersonAdd />}
                onClick={() => navigate('/asha/new-patient')}
                sx={{ py: 2, fontSize: '0.95rem' }}
              >
                Register New Patient
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<Mic />}
                onClick={() => navigate('/asha/voice-input')}
                sx={{ py: 2, fontSize: '0.95rem' }}
                color="secondary"
              >
                Voice Input (AI)
              </Button>
            </Grid>
          </Grid>

          {/* Feature chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {[
              { icon: <Speed sx={{ fontSize: 14 }} />, label: 'Quick Screening' },
              { icon: <HealthAndSafety sx={{ fontSize: 14 }} />, label: 'Risk Detection' },
              { icon: <CheckCircle sx={{ fontSize: 14 }} />, label: 'Auto Alerts' }
            ].map(f => (
              <Chip
                key={f.label}
                icon={f.icon}
                label={f.label}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: '0.72rem' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Patients */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Recent Patients</Typography>
              <Typography variant="caption" color="text.secondary">Last 5 registrations</Typography>
            </Box>
            <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/asha/new-patient')}>
              Add New
            </Button>
          </Box>

          {recentPatients.length === 0 ? (
            <EmptyState
              type="patients"
              compact
              actionLabel="Register First Patient"
              onAction={() => navigate('/asha/new-patient')}
            />
          ) : (
            <List disablePadding>
              {recentPatients.map((p, i) => (
                <React.Fragment key={p._id}>
                  <ListItem
                    sx={{
                      px: 1, borderRadius: 2, cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background 0.2s'
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RiskBadge level={p.currentRiskLevel} size="small" />
                        <IconButton size="small" onClick={() => setSelectedPatient(p)}>
                          <ArrowForward fontSize="small" sx={{ color: 'text.secondary' }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: p.currentRiskLevel === 'High' ? '#FFEBEE' : p.currentRiskLevel === 'Medium' ? '#FFF3E0' : '#E8F5E9',
                        color: p.currentRiskLevel === 'High' ? '#D32F2F' : p.currentRiskLevel === 'Medium' ? '#E65100' : '#2E7D32',
                        width: 40, height: 40, fontWeight: 700, fontSize: '0.9rem'
                      }}>
                        {p.name?.[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {p.age}y · {p.gender} · {p.village} · {dayjs(p.createdAt).fromNow()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {i < recentPatients.length - 1 && <Divider sx={{ ml: 7 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      <Dialog 
        open={Boolean(selectedPatient)} 
        onClose={() => setSelectedPatient(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedPatient && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{selectedPatient.name[0]}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1}>{selectedPatient.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedPatient.patientId} • {selectedPatient.age}y • {selectedPatient.gender}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Village Details</Typography>
                <Typography variant="body1">{selectedPatient.village}</Typography>
              </Box>
              
              {selectedPatient.symptoms?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Reported Symptoms</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedPatient.symptoms.map(s => <Chip key={s} label={s} size="small" />)}
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Current AI Assessment</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">Risk Level:</Typography>
                  <RiskBadge level={selectedPatient.currentRiskLevel} />
                </Box>
              </Box>

              {selectedPatient.doctorReview ? (
                <Alert icon={<HealthAndSafety />} severity={selectedPatient.doctorReview.urgency === 'Immediate' ? 'error' : 'info'} sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Doctor Feedback (Dr. {selectedPatient.doctorReview.doctorName})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{selectedPatient.doctorReview.comments}</Typography>
                  {selectedPatient.doctorReview.followUpActions?.length > 0 && (
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      {selectedPatient.doctorReview.followUpActions.map((action, i) => (
                        <Typography component="li" variant="caption" key={i}>{action}</Typography>
                      ))}
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    Reviewed {dayjs(selectedPatient.doctorReview.reviewedAt).fromNow()}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  Pending Doctor Review
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant="contained" onClick={() => setSelectedPatient(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
