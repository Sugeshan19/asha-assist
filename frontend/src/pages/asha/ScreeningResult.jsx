import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Grid, Divider, Alert, CircularProgress, List, ListItem,
  ListItemText, Avatar, Paper
} from '@mui/material'
import {
  CheckCircle, Warning, Error as ErrorIcon, ArrowBack,
  LocalHospital, Notifications, Person, Thermostat,
  Favorite, Air, Assignment
} from '@mui/icons-material'
import api from '../../services/api'
import RiskBadge from '../../components/RiskBadge'
import dayjs from 'dayjs'

const RISK_CONFIG = {
  High: { icon: <ErrorIcon />, color: '#c62828', bg: '#ffebee', label: 'HIGH RISK' },
  Medium: { icon: <Warning />, color: '#e65100', bg: '#fff3e0', label: 'MEDIUM RISK' },
  Low: { icon: <CheckCircle />, color: '#2e7d32', bg: '#e8f5e9', label: 'LOW RISK' }
}

const VitalDisplay = ({ label, value, unit, icon, normalRange }) => (
  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
      {icon}
    </Box>
    <Typography variant="h5" fontWeight={700}>{value ?? '—'}{value ? unit : ''}</Typography>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    {normalRange && (
      <Typography variant="caption" display="block" color="text.disabled">Normal: {normalRange}</Typography>
    )}
  </Paper>
)

export default function ScreeningResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [screening, setScreening] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/screenings/${id}`)
      .then(r => setScreening(r.data.screening))
      .catch(() => setError('Failed to load screening result.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
  if (!screening) return null

  const r = screening.aiResult || {}
  const risk = r.riskLevel || 'Low'
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Low
  const patient = screening.patient || {}
  const vitals = screening.vitals || {}

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/asha')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      {/* Risk Banner */}
      <Card sx={{ mb: 3, border: `2px solid ${cfg.color}`, bgcolor: cfg.bg }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: cfg.color, width: 56, height: 56 }}>
            {React.cloneElement(cfg.icon, { sx: { color: 'white', fontSize: 32 } })}
          </Avatar>
          <Box flex={1}>
            <Typography variant="overline" sx={{ color: cfg.color, fontWeight: 700 }}>
              AI Screening Result
            </Typography>
            <Typography variant="h5" fontWeight={700}>{r.diseasePrediction || 'Unknown'}</Typography>
            <Chip
              label={cfg.label}
              sx={{ bgcolor: cfg.color, color: 'white', fontWeight: 700, mt: 0.5 }}
              size="small"
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Confidence</Typography>
            <Typography variant="h6" fontWeight={700} color={cfg.color}>
              {r.confidence ? `${Math.round(r.confidence * 100)}%` : '—'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Alert sent notice */}
      {screening.alertSent && (
        <Alert
          severity="warning"
          icon={<Notifications />}
          sx={{ mb: 3, fontWeight: 600 }}
        >
          Doctor has been alerted via SMS for this high-risk patient.
        </Alert>
      )}

      {/* Recommendation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
            <LocalHospital color="primary" />
            <Typography variant="h6">Recommendation</Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1.1rem', color: cfg.color }}>
            {r.recommendation}
          </Typography>

          {r.differentials?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Other possibilities:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {r.differentials.map(d => (
                  <Chip key={d.disease} label={`${d.disease} (${Math.round(d.probability * 100)}%)`} variant="outlined" size="small" />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Patient Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
            <Person color="primary" />
            <Typography variant="h6">Patient Details</Typography>
          </Box>
          <Grid container spacing={1}>
            {[
              { label: 'Name', val: patient.name },
              { label: 'Age', val: `${patient.age} years` },
              { label: 'Gender', val: patient.gender },
              { label: 'Village', val: patient.village },
              { label: 'Screened', val: dayjs(screening.createdAt).format('D MMM YYYY, h:mm A') },
              { label: 'Patient ID', val: patient.patientId }
            ].map(({ label, val }) => (
              <Grid item xs={6} key={label}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={500}>{val || '—'}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Vitals */}
      {(vitals.temperature || vitals.pulse || vitals.oxygenLevel) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recorded Vitals</Typography>
            <Grid container spacing={2}>
              {vitals.temperature && (
                <Grid item xs={4}>
                  <VitalDisplay label="Temperature" value={vitals.temperature?.toFixed(1)} unit="°C"
                    icon={<Thermostat color="error" />} normalRange="36.5–37.5" />
                </Grid>
              )}
              {vitals.pulse && (
                <Grid item xs={4}>
                  <VitalDisplay label="Pulse" value={vitals.pulse} unit=" bpm"
                    icon={<Favorite color="error" />} normalRange="60–100" />
                </Grid>
              )}
              {vitals.oxygenLevel && (
                <Grid item xs={4}>
                  <VitalDisplay label="SpO₂" value={vitals.oxygenLevel} unit="%"
                    icon={<Air color="primary" />} normalRange="95–100%" />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Symptoms */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
            <Assignment color="primary" />
            <Typography variant="h6">Reported Symptoms</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(screening.symptoms || []).map(s => (
              <Chip key={s} label={s} variant="outlined" color="primary" />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={() => navigate('/asha/new-patient')}
        startIcon={<Person />}
      >
        Screen Another Patient
      </Button>
    </Box>
  )
}
