import React from 'react'
import { Card, CardContent, Typography, Box, Chip, Alert, Divider } from '@mui/material'
import { ReportProblem, LocationOn, TrendingUp, Warning } from '@mui/icons-material'

export default function OutbreakAlertPanel({ outbreaks = [], loading = false }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            bgcolor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ReportProblem sx={{ color: '#D32F2F', fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>Outbreak Alerts</Typography>
            <Typography variant="caption" color="text.secondary">Disease surveillance signals</Typography>
          </Box>
          {outbreaks.length > 0 && (
            <Chip
              label={outbreaks.length}
              color="error"
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
        </Box>

        {outbreaks.length === 0 ? (
          <Alert severity="success" icon="✅" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={600}>All Clear</Typography>
            <Typography variant="caption" color="text.secondary">No active outbreak signals detected.</Typography>
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {outbreaks.map((o, idx) => (
              <React.Fragment key={idx}>
                <Box sx={{
                  p: 1.5, borderRadius: 2,
                  bgcolor: o.severity === 'high' ? '#FFEBEE' : o.severity === 'medium' ? '#FFF3E0' : '#FFF8E1',
                  border: `1px solid ${o.severity === 'high' ? '#FFCDD2' : o.severity === 'medium' ? '#FFE0B2' : '#FFE082'}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Warning sx={{
                        fontSize: 14,
                        color: o.severity === 'high' ? '#D32F2F' : o.severity === 'medium' ? '#E65100' : '#F9A825'
                      }} />
                      <Typography variant="body2" fontWeight={700} sx={{
                        color: o.severity === 'high' ? '#D32F2F' : o.severity === 'medium' ? '#E65100' : '#F57F17'
                      }}>
                        {o.disease || o.condition || 'Unknown Disease'}
                      </Typography>
                    </Box>
                    <Chip
                      label={o.severity || 'Alert'}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.65rem', fontWeight: 700, textTransform: 'capitalize',
                        bgcolor: o.severity === 'high' ? '#D32F2F' : o.severity === 'medium' ? '#E65100' : '#F57F17',
                        color: '#fff'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {o.village || o.location || 'Unknown area'} · {o.caseCount || o.count || 0} cases
                    </Typography>
                    {o.trend === 'rising' && <TrendingUp sx={{ fontSize: 12, color: '#D32F2F', ml: 0.5 }} />}
                  </Box>
                </Box>
                {idx < outbreaks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
