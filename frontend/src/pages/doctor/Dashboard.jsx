import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Alert, List, ListItem, ListItemText, ListItemButton,
  Divider, Chip, Avatar, LinearProgress, Tooltip, IconButton
} from '@mui/material'
import {
  Warning, People, Assessment, Notifications,
  ArrowForward, TrendingUp, LocalHospital,
  VisibilityOutlined, FiberManualRecord, Refresh
} from '@mui/icons-material'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import RiskBadge from '../../components/RiskBadge'
import OutbreakAlertPanel from '../../components/OutbreakAlertPanel'
import EmptyState from '../../components/EmptyState'
import { DashboardSkeleton } from '../../components/SkeletonLoaders'
import { useAuth } from '../../context/AuthContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid } from 'recharts'
dayjs.extend(relativeTime)

// Demo fallback data
const SAMPLE_SUMMARY = { totalPatients: 128, highRiskCount: 14, totalScreenings: 215, activeAlerts: 3 }
const SAMPLE_HIGH_RISK = [
  { _id: '1', name: 'Priya Sharma', patientId: 'PT-001', village: 'Rampur', age: 28, currentRiskLevel: 'High', lastScreening: new Date(Date.now() - 86400000) },
  { _id: '2', name: 'Mohan Lal', patientId: 'PT-004', village: 'Rampur', age: 62, currentRiskLevel: 'High', lastScreening: new Date(Date.now() - 86400000 * 2) },
  { _id: '3', name: 'Ravi Kumar', patientId: 'PT-009', village: 'Kheda', age: 45, currentRiskLevel: 'High', lastScreening: new Date(Date.now() - 3600000 * 5) },
  { _id: '4', name: 'Anjali Singh', patientId: 'PT-012', village: 'Deoria', age: 34, currentRiskLevel: 'High', lastScreening: new Date(Date.now() - 86400000 * 3) },
]
const SAMPLE_OUTBREAKS = [
  { disease: 'Malaria', severity: 'high', village: 'Rampur', caseCount: 7, trend: 'rising' },
  { disease: 'Diarrhoea', severity: 'medium', village: 'Kheda', caseCount: 4, trend: 'stable' }
]
const SAMPLE_TREND_DATA = [
  { day: 'Mon', screenings: 8, highRisk: 2 },
  { day: 'Tue', screenings: 12, highRisk: 3 },
  { day: 'Wed', screenings: 6, highRisk: 1 },
  { day: 'Thu', screenings: 15, highRisk: 4 },
  { day: 'Fri', screenings: 10, highRisk: 2 },
  { day: 'Sat', screenings: 18, highRisk: 5 },
  { day: 'Sun', screenings: 9, highRisk: 2 }
]

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [summary, setSummary] = useState(null)
  const [highRisk, setHighRisk] = useState([])
  const [outbreaks, setOutbreaks] = useState([])
  const [trendData] = useState(SAMPLE_TREND_DATA)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, h, o] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/patients/high-risk'),
          api.get('/analytics/outbreak-detection')
        ])
        setSummary(s.data)
        setHighRisk(h.data.patients || [])
        setOutbreaks(o.data.outbreaks || [])
      } catch {
        setSummary(SAMPLE_SUMMARY)
        setHighRisk(SAMPLE_HIGH_RISK)
        setOutbreaks(SAMPLE_OUTBREAKS)
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <Box>
      {usingFallback && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }} onClose={() => {}}>
          Showing demo data — connect the backend to see live data.
        </Alert>
      )}

      {/* Hero Header */}
      <Card sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #0D2145 0%, #1565C0 60%, #0D47A1 100%)',
        color: '#fff', overflow: 'hidden', position: 'relative'
      }}>
        <Box sx={{
          position: 'absolute', width: 250, height: 250, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)', top: '-80px', right: '-60px'
        }} />
        <CardContent sx={{ py: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <LocalHospital sx={{ fontSize: 28 }} />
                <Typography variant="h5" fontWeight={800}>
                  {greeting}, Dr. {user?.name?.split(' ')[0] || 'Doctor'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 2, maxWidth: 400 }}>
                Monitor patients, triage alerts, and manage health trends across your care zones.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`${summary?.highRiskCount || 0} High Risk`}
                  size="small"
                  sx={{ bgcolor: summary?.highRiskCount > 0 ? '#C62828' : 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }}
                />
                <Chip
                  label={`${summary?.activeAlerts || 0} Active Alerts`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600 }}
                />
              </Box>
            </Box>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.15)', fontWeight: 800, fontSize: '1.25rem', border: '2px solid rgba(255,255,255,0.3)' }}>
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Patients', value: summary?.totalPatients, icon: <People />, color: '#1565C0', subtitle: 'Under monitoring', trend: 'up', trendValue: '+8 this week', onClick: () => navigate('/doctor/patients') },
          { title: 'High Risk', value: summary?.highRiskCount, icon: <Warning />, color: '#D32F2F', subtitle: 'Need urgent care', trend: 'up', trendValue: '+2 today', onClick: () => navigate('/doctor/patients') },
          { title: 'Screenings', value: summary?.totalScreenings, icon: <Assessment />, color: '#00897B', subtitle: 'Total recorded', trend: 'up', trendValue: '+18 this week', onClick: () => navigate('/doctor/analytics') },
          { title: 'Active Alerts', value: summary?.activeAlerts, icon: <Notifications />, color: '#E65100', subtitle: 'Outbreak signals', trend: 'flat', trendValue: '', onClick: () => navigate('/doctor/analytics') }
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Screening Trend Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>Weekly Screening Trend</Typography>
              <Typography variant="caption" color="text.secondary">Screenings vs High Risk Detections</Typography>
            </Box>
            <Chip label="This Week" size="small" variant="outlined" color="primary" />
          </Box>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
              <defs>
                <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78909C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78909C' }} axisLine={false} tickLine={false} />
              <ReTooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="screenings" stroke="#1565C0" strokeWidth={2.5} fill="url(#screenGrad)" name="Screenings" dot={{ r: 4, fill: '#1565C0' }} />
              <Area type="monotone" dataKey="highRisk" stroke="#D32F2F" strokeWidth={2.5} fill="url(#riskGrad)" name="High Risk" dot={{ r: 4, fill: '#D32F2F' }} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* High Risk + Outbreak */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>High Risk Patients</Typography>
                  <Typography variant="caption" color="text.secondary">Require immediate attention</Typography>
                </Box>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/doctor/patients')}>
                  View All
                </Button>
              </Box>

              {highRisk.length === 0 ? (
                <EmptyState type="highRisk" compact />
              ) : (
                <List disablePadding>
                  {highRisk.slice(0, 6).map((p, idx) => (
                    <React.Fragment key={p._id}>
                      <ListItem
                        disablePadding
                        sx={{ borderRadius: 2, overflow: 'hidden' }}
                        secondaryAction={
                          <Tooltip title="View patient">
                            <IconButton size="small" onClick={() => navigate(`/doctor/patients/${p._id}`)}>
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <ListItemButton
                          onClick={() => navigate(`/doctor/patients/${p._id}`)}
                          sx={{ py: 1.5, borderRadius: 2 }}
                        >
                          <Avatar sx={{
                            mr: 1.5, width: 38, height: 38, fontSize: '0.85rem', fontWeight: 700,
                            bgcolor: '#FFEBEE', color: '#D32F2F'
                          }}>
                            {p.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                                <Typography variant="caption" color="text.secondary">({p.patientId})</Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {p.village} · Age {p.age} · {p.lastScreening ? dayjs(p.lastScreening).fromNow() : 'No screening'}
                              </Typography>
                            }
                          />
                          <RiskBadge level={p.currentRiskLevel} size="small" />
                        </ListItemButton>
                      </ListItem>
                      {idx < highRisk.slice(0, 6).length - 1 && <Divider sx={{ ml: 7 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <OutbreakAlertPanel outbreaks={outbreaks} />
        </Grid>
      </Grid>
    </Box>
  )
}
