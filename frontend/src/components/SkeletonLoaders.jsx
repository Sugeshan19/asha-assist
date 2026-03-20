import React from 'react'
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material'

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent sx={{ minHeight: 112 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={80} height={14} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={60} height={40} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width={100} height={14} />
          </Box>
          <Skeleton variant="circular" width={52} height={52} />
        </Box>
      </CardContent>
    </Card>
  )
}

export function PatientListSkeleton({ count = 5 }) {
  return (
    <Box>
      {Array(count).fill(null).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < count - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="60%" height={14} />
          </Box>
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
      ))}
    </Box>
  )
}

export function DashboardSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Skeleton variant="rounded" height={110} sx={{ mb: 3, borderRadius: 3 }} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array(4).fill(null).map((_, i) => (
          <Grid item xs={6} md={3} key={i}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mb: 2 }} />
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
    </Box>
  )
}

export function ChartSkeleton({ height = 300 }) {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width={160} height={24} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width={100} height={14} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={height} sx={{ borderRadius: 2 }} />
    </Box>
  )
}

export function FormSkeleton({ fields = 4 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array(fields).fill(null).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} />
      ))}
      <Skeleton variant="rounded" height={48} width={160} sx={{ mt: 1 }} />
    </Box>
  )
}

export default DashboardSkeleton
