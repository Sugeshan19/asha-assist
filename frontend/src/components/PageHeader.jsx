import React from 'react'
import { Box, Typography, Breadcrumbs, Link, Chip, Divider } from '@mui/material'
import { NavigateNext } from '@mui/icons-material'

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
  action,
  sx = {}
}) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((crumb, i) =>
            i < breadcrumbs.length - 1 ? (
              <Link key={crumb.label} underline="hover" color="text.secondary" href={crumb.href} sx={{ fontSize: '0.8rem' }}>
                {crumb.label}
              </Link>
            ) : (
              <Typography key={crumb.label} color="text.primary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              {title}
            </Typography>
            {badge && (
              <Chip
                label={badge.label}
                color={badge.color || 'primary'}
                size="small"
                sx={{ height: 22, fontSize: '0.72rem' }}
              />
            )}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  )
}
