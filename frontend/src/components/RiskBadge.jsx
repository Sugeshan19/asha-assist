import React from 'react'
import { Chip, Box } from '@mui/material'
import { CheckCircle, Warning, ErrorOutline, HelpOutline } from '@mui/icons-material'

const CONFIG = {
  High: {
    color: 'error',
    icon: <ErrorOutline />,
    label: 'High Risk',
    bg: '#FFEBEE',
    text: '#C62828',
    border: '#FFCDD2',
    pulse: true
  },
  Medium: {
    color: 'warning',
    icon: <Warning />,
    label: 'Medium Risk',
    bg: '#FFF3E0',
    text: '#E65100',
    border: '#FFE0B2',
    pulse: false
  },
  Low: {
    color: 'success',
    icon: <CheckCircle />,
    label: 'Low Risk',
    bg: '#E8F5E9',
    text: '#2E7D32',
    border: '#C8E6C9',
    pulse: false
  },
  Unknown: {
    color: 'default',
    icon: <HelpOutline />,
    label: 'Unknown',
    bg: '#F5F5F5',
    text: '#616161',
    border: '#E0E0E0',
    pulse: false
  }
}

export default function RiskBadge({ level = 'Unknown', size = 'medium', showLabel = true, sx = {} }) {
  const c = CONFIG[level] || CONFIG.Unknown

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center' }}
      className={c.pulse ? 'pulse-high' : ''}
    >
      <Chip
        size={size}
        icon={React.cloneElement(c.icon, { style: { color: c.text, fontSize: size === 'small' ? 14 : 16 } })}
        label={showLabel ? c.label : undefined}
        sx={{
          fontWeight: 700,
          bgcolor: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          '& .MuiChip-icon': { color: c.text },
          fontSize: size === 'small' ? '0.7rem' : '0.8rem',
          height: size === 'small' ? 24 : 28,
          ...sx
        }}
      />
    </Box>
  )
}
