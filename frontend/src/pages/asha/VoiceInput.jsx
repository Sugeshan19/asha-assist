import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Button, Alert,
  TextField, Grid, Chip, Stack
} from '@mui/material'
import {
  Mic, MicOff, PlayArrow, Stop, Translate,
  ArrowBack, CheckCircle, Warning
} from '@mui/icons-material'

const parseSymptoms = (text) => {
  const commonSymptoms = [
    'fever', 'headache', 'chills', 'cough', 'fatigue', 'body ache', 'joint pain',
    'nausea', 'vomiting', 'rash', 'sore throat', 'breathlessness', 'chest pain',
    'weakness', 'dizziness', 'abdominal pain', 'diarrhea'
  ]

  const normalized = text.toLowerCase()
  const found = commonSymptoms.filter(s => normalized.includes(s))

  if (found.length === 0) {
    return text.split(/[,.;]/).map(s => s.trim()).filter(Boolean).slice(0, 8)
  }
  return found
}

export default function VoiceInput() {
  const navigate = useNavigate()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [symptoms, setSymptoms] = useState([])

  const recognitionRef = useRef(null)

  const startRecording = () => {
    setError('')

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Voice recognition not supported in this browser. Please use Chrome on mobile for best results.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onstart = () => setIsRecording(true)

    recognition.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript
      }
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      setError(`Voice recognition error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => setIsRecording(false)

    recognition.start()
    recognitionRef.current = recognition
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const analyzeTranscript = () => {
    if (!transcript.trim()) {
      setError('Please record or enter symptom text first.')
      return
    }
    const parsed = parseSymptoms(transcript)
    setSymptoms(parsed)
  }

  const useForScreening = () => {
    if (symptoms.length === 0) {
      setError('Please analyze symptoms first.')
      return
    }

    // Store in session and redirect to patient form
    sessionStorage.setItem('voiceSymptoms', JSON.stringify(symptoms))
    sessionStorage.setItem('voiceTranscript', transcript)
    navigate('/asha/new-patient')
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 760, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/asha')}>Dashboard</Button>
        <Typography variant="h5" fontWeight={700}>Voice Symptom Input</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Record Symptoms by Voice</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Speak symptoms in English. Example: "Patient has fever, headache and body pain for two days"
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>


            {!isRecording ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<Mic />}
                onClick={startRecording}
                size="large"
              >
                Start Recording
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Stop />}
                onClick={stopRecording}
                size="large"
              >
                Stop Recording
              </Button>
            )}

            <Chip
              icon={isRecording ? <Mic /> : <MicOff />}
              label={isRecording ? 'Recording...' : 'Not Recording'}
              color={isRecording ? 'error' : 'default'}
            />
          </Stack>

          <TextField
            label="Transcript"
            multiline
            minRows={5}
            fullWidth
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Voice transcript will appear here..."
          />

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={analyzeTranscript} startIcon={<Translate />}>
              Extract Symptoms
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => { setTranscript(''); setSymptoms([]); setError('') }}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {symptoms.length > 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Extracted Symptoms</Typography>
            <Grid container spacing={1} sx={{ mb: 3 }}>
              {symptoms.map((s, i) => (
                <Grid item key={`${s}-${i}`}>
                  <Chip label={s} color="primary" variant="outlined" icon={<CheckCircle />} />
                </Grid>
              ))}
            </Grid>

            <Alert severity="info" sx={{ mb: 2 }}>
              {symptoms.length} symptoms extracted. Continue to patient form for vitals and AI screening.
            </Alert>

            <Button
              variant="contained"
              size="large"
              onClick={useForScreening}
              startIcon={<PlayArrow />}
            >
              Use These Symptoms in New Screening
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
