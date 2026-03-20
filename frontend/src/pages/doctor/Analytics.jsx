import React, { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  FormControl, Select, MenuItem, InputLabel, Alert, Divider
} from '@mui/material'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import { ChartSkeleton } from '../../components/SkeletonLoaders'
import {
  Assessment, People, Warning, LocalHospital
} from '@mui/icons-material'

// Rich sample analytics data
const SAMPLE_DISEASE_TREND = [
  { month: 'Oct', malaria: 12, tb: 4, dengue: 3, anaemia: 18 },
  { month: 'Nov', malaria: 9, tb: 6, dengue: 7, anaemia: 21 },
  { month: 'Dec', malaria: 6, tb: 5, dengue: 2, anaemia: 15 },
  { month: 'Jan', malaria: 14, tb: 8, dengue: 1, anaemia: 22 },
  { month: 'Feb', malaria: 18, tb: 7, dengue: 4, anaemia: 19 },
  { month: 'Mar', malaria: 22, tb: 9, dengue: 8, anaemia: 25 }
]

const SAMPLE_RISK_DIST = [
  { name: 'Low Risk', value: 78, color: '#2E7D32' },
  { name: 'Medium Risk', value: 36, color: '#E65100' },
  { name: 'High Risk', value: 14, color: '#D32F2F' }
]

const SAMPLE_VILLAGE_DATA = [
  { village: 'Rampur', patients: 42, highRisk: 8 },
  { village: 'Kheda', patients: 28, highRisk: 3 },
  { village: 'Deoria', patients: 19, highRisk: 2 },
  { village: 'Silbari', patients: 22, highRisk: 1 },
  { village: 'Barwa', patients: 17, highRisk: 0 }
]

const SAMPLE_SCREENING_FUNNEL = [
  { stage: 'Registered', count: 128 },
  { stage: 'Screened', count: 101 },
  { stage: 'Followed Up', count: 67 },
  { stage: 'Treated', count: 48 }
]

const COLORS_DISEASE = ['#1565C0', '#00897B', '#E65100', '#D32F2F']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{
      bgcolor: 'white', p: 1.5, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      border: '1px solid rgba(21, 101, 192, 0.1)', minWidth: 140
    }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" gutterBottom>{label}</Typography>
      {payload.map((entry) => (
        <Box key={entry.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
          <Typography variant="caption" fontWeight={600}>{entry.name}: <strong>{entry.value}</strong></Typography>
        </Box>
      ))}
    </Box>
  )
}

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [diseaseTrend, setDiseaseTrend] = useState([])
  const [riskDist, setRiskDist] = useState([])
  const [villageData, setVillageData] = useState([])
  const [screeningFunnel, setScreeningFunnel] = useState([])
  const [summary, setSummary] = useState(null)
  const [timeRange, setTimeRange] = useState('month')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, d] = await Promise.all([
          api.get('/analytics/summary'),
          api.get(`/analytics/disease-trends?timeframe=${timeRange}`)
        ])
        setSummary(s.data)
        setDiseaseTrend(d.data.trends || SAMPLE_DISEASE_TREND)
      } catch {
        setSummary({ totalPatients: 128, highRiskCount: 14, totalScreenings: 215, activeAlerts: 3 })
        setDiseaseTrend(SAMPLE_DISEASE_TREND)
        setUsingFallback(true)
      } finally {
        setRiskDist(SAMPLE_RISK_DIST)
        setVillageData(SAMPLE_VILLAGE_DATA)
        setScreeningFunnel(SAMPLE_SCREENING_FUNNEL)
        setLoading(false)
      }
    }
    load()
  }, [timeRange])

  if (loading) return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map(i => <Grid item xs={6} md={3} key={i}><ChartSkeleton height={100} /></Grid>)}
      </Grid>
      <Grid container spacing={2}>
        {[1, 2].map(i => <Grid item xs={12} md={6} key={i}><ChartSkeleton height={280} /></Grid>)}
      </Grid>
    </Box>
  )

  return (
    <Box>
      {usingFallback && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => {}}>
          Showing sample analytics data. Connect backend for live metrics.
        </Alert>
      )}

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Total Patients', value: summary?.totalPatients, icon: <People />, color: '#1565C0', subtitle: 'In care zone' },
          { title: 'High Risk', value: summary?.highRiskCount, icon: <Warning />, color: '#D32F2F', subtitle: `${summary ? Math.round(summary.highRiskCount / summary.totalPatients * 100) : 0}% of total` },
          { title: 'Screenings', value: summary?.totalScreenings, icon: <Assessment />, color: '#00897B', subtitle: 'Total conducted' },
          { title: 'Active Alerts', value: summary?.activeAlerts, icon: <LocalHospital />, color: '#E65100', subtitle: 'Outbreak signals' }
        ].map((card, i) => (
          <Grid item xs={6} md={3} key={i}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Disease Trend Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>Disease Trend Analysis</Typography>
                  <Typography variant="caption" color="text.secondary">Monthly case counts by disease category</Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select value={timeRange} onChange={e => setTimeRange(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="week">Weekly</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                    <MenuItem value="year">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={diseaseTrend} margin={{ top: 5, right: 15, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78909C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#78909C' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
                  <Line type="monotone" dataKey="malaria" stroke="#1565C0" strokeWidth={2.5} dot={{ r: 4 }} name="Malaria" />
                  <Line type="monotone" dataKey="tb" stroke="#00897B" strokeWidth={2.5} dot={{ r: 4 }} name="Tuberculosis" />
                  <Line type="monotone" dataKey="dengue" stroke="#E65100" strokeWidth={2.5} dot={{ r: 4 }} name="Dengue" />
                  <Line type="monotone" dataKey="anaemia" stroke="#D32F2F" strokeWidth={2.5} dot={{ r: 4 }} name="Anaemia" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Distribution Pie */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Risk Distribution</Typography>
              <Typography variant="caption" color="text.secondary">Patient risk level breakdown</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={riskDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDist.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} patients`, n]} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {riskDist.map(item => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Village Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Village-wise Patient Load</Typography>
              <Typography variant="caption" color="text.secondary">Total patients vs high-risk by village</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={villageData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="village" tick={{ fontSize: 11, fill: '#78909C' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#78909C' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
                  <Bar dataKey="patients" fill="#1565C0" name="Total Patients" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="highRisk" fill="#D32F2F" name="High Risk" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Screening Funnel */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Screening Funnel</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>Patient journey through care stages</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {screeningFunnel.map((stage, i) => {
                  const pct = Math.round((stage.count / screeningFunnel[0].count) * 100)
                  const color = ['#1565C0', '#00897B', '#E65100', '#2E7D32'][i]
                  return (
                    <Box key={stage.stage}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>{stage.stage}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={800} color={color}>{stage.count}</Typography>
                          <Chip label={`${pct}%`} size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: `${color}15`, color, fontWeight: 700 }} />
                        </Box>
                      </Box>
                      <Box sx={{ height: 8, bgcolor: `${color}15`, borderRadius: 4, overflow: 'hidden' }}>
                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 4, transition: 'width 1s ease' }} />
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
