import React from 'react'
import { Box, Typography, Button } from '@mui/material'

const PRESETS = {
  patients: {
    emoji: '👥',
    title: 'No patients yet',
    subtitle: 'Register your first patient to get started with health screenings.',
    action: null
  },
  highRisk: {
    emoji: '✅',
    title: 'All clear!',
    subtitle: 'No high-risk patients currently. Keep up the great work!',
    action: null
  },
  search: {
    emoji: '🔍',
    title: 'No results found',
    subtitle: 'Try adjusting your filters or search terms.',
    action: null
  },
  alerts: {
    emoji: '🔔',
    title: 'No alerts',
    subtitle: 'No active outbreak alerts in your area. Stay vigilant!',
    action: null
  },
  generic: {
    emoji: '📭',
    title: 'Nothing here yet',
    subtitle: 'Data will appear here once available.',
    action: null
  }
}

export default function EmptyState({
  type = 'generic',
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
  compact = false
}) {
  const preset = PRESETS[type] || PRESETS.generic
  const displayEmoji = emoji || preset.emoji
  const displayTitle = title || preset.title
  const displaySubtitle = subtitle || preset.subtitle

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      py: compact ? 3 : 6,
      px: 2
    }}>
      <Box sx={{
        fontSize: compact ? 32 : 48, mb: 1.5, lineHeight: 1,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
      }}>
        {displayEmoji}
      </Box>
      <Typography variant={compact ? 'subtitle1' : 'h6'} fontWeight={700} gutterBottom color="text.primary">
        {displayTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
        {displaySubtitle}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" size="small" onClick={onAction} sx={{ mt: 2.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
