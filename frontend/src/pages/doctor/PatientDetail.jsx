import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  CircularProgress, Alert, Button, Divider, TextField
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import api from '../../services/api'
import RiskBadge from '../../components/RiskBadge'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [patient, setPatient] = useState(null)
  const [screenings, setScreenings] = useState([])
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/patients/${id}`)
        setPatient(data.patient)
        setScreenings(data.screenings || [])
      } catch {
        setError('Failed to load patient details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const submitReview = async (screeningId) => {
    try {
      await api.put(`/screenings/${screeningId}/review`, {
        reviewNotes,
        finalDiagnosis: screenings[0]?.aiResult?.diseasePrediction,
        treatmentPlan: reviewNotes
      })
      setReviewNotes('')
      alert('Doctor review saved.')
    } catch {
      setError('Failed to save doctor review')
    }
  }

  if (loading) return <Box sx={{ textAlign: 'center', mt: 8 }}><CircularProgress /></Box>
  if (!patient) return <Alert severity="error">Patient not found</Alert>

  const latest = screenings[0]

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/doctor/patients')} sx={{ mb: 2 }}>
        Back to Patients
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{patient.name}</Typography>
              <Typography color="text.secondary" gutterBottom>{patient.patientId}</Typography>
              <RiskBadge level={patient.currentRiskLevel} />

              <Divider sx={{ my: 2 }} />

              <Typography><strong>Age:</strong> {patient.age}</Typography>
              <Typography><strong>Gender:</strong> {patient.gender}</Typography>
              <Typography><strong>Village:</strong> {patient.village}</Typography>
              <Typography><strong>District:</strong> {patient.district}</Typography>
              <Typography><strong>Phone:</strong> {patient.phone || 'N/A'}</Typography>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Symptoms</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(patient.symptoms || []).map(s => <Chip key={s} label={s} size="small" />)}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Latest Screening</Typography>
              {!latest ? <Typography>No screenings available.</Typography> : (
                <>
                  <Typography><strong>Disease:</strong> {latest.aiResult?.diseasePrediction}</Typography>
                  <Typography><strong>Risk:</strong> {latest.aiResult?.riskLevel}</Typography>
                  <Typography><strong>Recommendation:</strong> {latest.aiResult?.recommendation}</Typography>
                  <Typography><strong>Confidence:</strong> {Math.round((latest.aiResult?.confidence || 0) * 100)}%</Typography>
                </>
              )}
            </CardContent>
          </Card>

          {latest && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Doctor Review</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Review notes and treatment plan"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => submitReview(latest._id)}
                  disabled={!reviewNotes.trim()}
                >
                  Save Review
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
