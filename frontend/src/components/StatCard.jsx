import React from 'react'
import { Card, CardContent, Typography, Box, Avatar, CardActionArea, Skeleton } from '@mui/material'
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material'

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = '#1565C0',
  onClick,
  trend,       // 'up' | 'down' | 'flat' | null
  trendValue,  // e.g. '+12%' or '3 more'
  loading = false
}) {
  const isInteractive = Boolean(onClick)

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : TrendingFlat
  const trendColor = trend === 'up' ? '#2E7D32' : trend === 'down' ? '#D32F2F' : '#78909C'

  const content = (
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700, display: 'block', mb: 0.5 }}
          >
            {title}
          </Typography>
          {loading ? (
            <>
              <Skeleton variant="text" width={60} height={44} />
              <Skeleton variant="text" width={90} height={16} />
            </>
          ) : (
            <>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}
                className="num"
              >
                {value ?? '--'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                    {subtitle}
                  </Typography>
                )}
                {trend && trendValue && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.5 }}>
                    <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
                    <Typography variant="caption" sx={{ color: trendColor, fontWeight: 700 }}>{trendValue}</Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
        <Avatar sx={{
          bgcolor: `${color}18`,
          color,
          width: 52, height: 52,
          flexShrink: 0,
          '& svg': { fontSize: 24 }
        }}>
          {icon}
        </Avatar>
      </Box>
      {/* Bottom accent line */}
      <Box sx={{
        mt: 1.5, height: 3, borderRadius: 2,
        bgcolor: `${color}20`,
        position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: loading ? '0%' : `${Math.min(100, ((value || 0) / 100) * 100)}%`,
          bgcolor: color, borderRadius: 2,
          transition: 'width 1s ease',
          maxWidth: '100%'
        }} />
      </Box>
    </CardContent>
  )

  return (
    <Card sx={{
      ...(isInteractive && {
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 28px ${color}22` }
      }),
      transition: 'all 0.25s ease',
      borderLeft: `3px solid ${color}`
    }}>
      {isInteractive ? (
        <CardActionArea onClick={onClick} sx={{ borderRadius: 'inherit' }}>
          {content}
        </CardActionArea>
      ) : content}
    </Card>
  )
}
