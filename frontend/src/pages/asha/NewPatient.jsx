import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, MenuItem, Chip, Autocomplete, Divider, Alert,
  Slider, InputAdornment, CircularProgress, Stepper, Step, StepLabel
} from '@mui/material'
import {
  Person, LocationOn, Thermostat, Favorite, Air,
  ArrowBack, ArrowForward, Send, Add
} from '@mui/icons-material'
import api from '../../services/api'

const SYMPTOM_OPTIONS = [
  'fever', 'high fever', 'chills', 'headache', 'severe headache',
  'body ache', 'joint pain', 'muscle pain', 'nausea', 'vomiting',
  'diarrhea', 'abdominal pain', 'rash', 'fatigue', 'weakness',
  'cough', 'dry cough', 'sore throat', 'runny nose', 'shortness of breath',
  'difficulty breathing', 'chest pain', 'chest tightness', 'wheezing',
  'night sweats', 'weight loss', 'loss of appetite', 'pale skin',
  'dizziness', 'cold hands', 'pain behind eyes', 'bleeding gums',
  'coughing blood', 'swollen lymph nodes', 'jaundice'
]

const VILLAGES = [
  'Rampur', 'Sundarlal Nagar', 'Tikampur', 'Govindpur', 'Krishnanagar', 'Shivpur'
]

const STEPS = ['Patient Info', 'Symptoms', 'Vitals & Submit']

export default function NewPatient() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', age: '', gender: '', phone: '', village: '', district: 'Jabalpur',
    symptoms: [],
    vitals: { temperature: '', pulse: '', oxygenLevel: '', bloodPressureSystolic: '', bloodPressureDiastolic: '' },
    notes: ''
  })

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }))
  const updateVital = (field, val) => setForm(f => ({ ...f, vitals: { ...f.vitals, [field]: val } }))

  useEffect(() => {
    const voiceSymptoms = sessionStorage.getItem('voiceSymptoms')
    const voiceTranscript = sessionStorage.getItem('voiceTranscript')
    if (voiceSymptoms) {
      try {
        const parsed = JSON.parse(voiceSymptoms)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setForm(prev => ({
            ...prev,
            symptoms: parsed,
            notes: voiceTranscript ? `Voice note: ${voiceTranscript}` : prev.notes
          }))
          setStep(1)
        }
      } catch {
        // Ignore invalid session data from manual edits.
      } finally {
        sessionStorage.removeItem('voiceSymptoms')
        sessionStorage.removeItem('voiceTranscript')
      }
    }
  }, [])

  const canProceed = () => {
    if (step === 0) return form.name && form.age && form.gender && form.village
    if (step === 1) return form.symptoms.length > 0
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      // Create patient
      const ptRes = await api.post('/patients', {
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        phone: form.phone,
        village: form.village,
        district: form.district,
        symptoms: form.symptoms
      })
      const patientId = ptRes.data.patient._id

      // Create screening
      const vitals = {}
      Object.entries(form.vitals).forEach(([k, v]) => { if (v !== '') vitals[k] = parseFloat(v) })

      const scrRes = await api.post('/screenings', {
        patientId,
        symptoms: form.symptoms,
        vitals,
        inputMethod: 'form'
      })

      navigate(`/asha/screening-result/${scrRes.data.screening._id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register patient. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/asha')}>
          {step > 0 ? 'Back' : 'Dashboard'}
        </Button>
        <Typography variant="h5" fontWeight={700} flex={1}>Register Patient</Typography>
      </Box>

      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Step 0: Patient Info */}
          {step === 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Person color="primary" />
                <Typography variant="h6">Patient Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Full Name *"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Age *"
                    type="number"
                    value={form.age}
                    onChange={e => update('age', e.target.value)}
                    inputProps={{ min: 0, max: 120 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Gender *"
                    value={form.gender}
                    onChange={e => update('gender', e.target.value)}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Phone Number"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Village *"
                    value={form.village}
                    onChange={e => update('village', e.target.value)}
                  >
                    {VILLAGES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="District"
                    value={form.district}
                    onChange={e => update('district', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 1: Symptoms */}
          {step === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>What symptoms does the patient have?</Typography>
              <Autocomplete
                multiple
                freeSolo
                options={SYMPTOM_OPTIONS}
                value={form.symptoms}
                onChange={(_, val) => update('symptoms', val)}
                renderTags={(value, getTagProps) =>
                  value.map((option, i) => (
                    <Chip variant="outlined" label={option} color="primary" {...getTagProps({ index: i })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select or type symptoms *"
                    placeholder="Type or select..."
                    helperText="Select from list or type and press Enter to add custom symptoms"
                  />
                )}
                sx={{ mb: 2 }}
              />
              {form.symptoms.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {form.symptoms.length} symptom{form.symptoms.length > 1 ? 's' : ''} recorded
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {form.symptoms.map(s => (
                      <Chip key={s} label={s} size="small" color="primary" variant="filled" />
                    ))}
                  </Box>
                </Box>
              )}
              <TextField
                label="Additional Notes"
                multiline
                rows={3}
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                sx={{ mt: 2 }}
                inputProps={{ maxLength: 500 }}
              />
            </Box>
          )}

          {/* Step 2: Vitals */}
          {step === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Record Vitals</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All fields are optional but improve AI accuracy
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Temperature (°C)"
                    type="number"
                    value={form.vitals.temperature}
                    onChange={e => updateVital('temperature', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Thermostat color="error" /></InputAdornment>
                    }}
                    inputProps={{ step: '0.1', min: 35, max: 42 }}
                    helperText="Normal: 36.5–37.5°C"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Pulse Rate (bpm)"
                    type="number"
                    value={form.vitals.pulse}
                    onChange={e => updateVital('pulse', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Favorite color="error" /></InputAdornment>
                    }}
                    inputProps={{ min: 40, max: 200 }}
                    helperText="Normal: 60–100 bpm"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Oxygen Level (%)"
                    type="number"
                    value={form.vitals.oxygenLevel}
                    onChange={e => updateVital('oxygenLevel', e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Air color="primary" /></InputAdornment>
                    }}
                    inputProps={{ min: 70, max: 100 }}
                    helperText="Normal: 95–100%"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="BP Systolic (mmHg)"
                    type="number"
                    value={form.vitals.bloodPressureSystolic}
                    onChange={e => updateVital('bloodPressureSystolic', e.target.value)}
                    inputProps={{ min: 70, max: 200 }}
                    helperText="Normal: 90–120 mmHg"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/asha')}
              startIcon={<ArrowBack />}
            >
              {step > 0 ? 'Previous' : 'Cancel'}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Submit & Get AI Result'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
