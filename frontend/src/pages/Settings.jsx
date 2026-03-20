import React from 'react'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Divider, Switch, FormControlLabel, Avatar, Grid
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, mx: 'auto', animation: 'fadeIn 0.3s ease' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile and platform preferences.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user?.role} Account
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                Change Avatar
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Personal Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" defaultValue={user?.name} variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone Number" defaultValue={user?.phone} disabled variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Village / Location" defaultValue={user?.village || user?.district} variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address" defaultValue={user?.email} disabled variant="outlined" />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained">Save Changes</Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Preferences</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Receive Email Notifications" />
                <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Receive SMS Alerts for High Risk Patients" />
                <FormControlLabel control={<Switch color="primary" />} label="Enable Dark Mode (Beta)" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
