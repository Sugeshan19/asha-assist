import React from 'react'
import { Box, Typography, Alert } from '@mui/material'

// Simple map fallback for hackathon demo when Google Maps key is unavailable.
export default function PatientMap({ patients = [] }) {
  const hasGoogleKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

  if (!hasGoogleKey) {
    return (
      <Alert severity="info">
        Google Maps API key not configured. Set `VITE_GOOGLE_MAPS_API_KEY` to enable live map markers.
      </Alert>
    )
  }

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, minHeight: 320, bgcolor: '#f8fbff' }}>
      <Typography variant="body2" color="text.secondary">
        Google Maps integration placeholder. {patients.length} patient markers would be plotted with clustering and high-risk red markers.
      </Typography>
    </Box>
  )
}
