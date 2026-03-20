import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, Divider, Chip, CircularProgress,
  IconButton, Collapse, LinearProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import {
  LocalHospital, Phone, ArrowForward, ArrowBack,
  Refresh, CheckCircle, MedicalServices, Verified
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  { label: 'ASHA Worker', email: 'asha@asha.com', password: 'Asha@1234', color: 'secondary', role: 'asha' },
  { label: 'Doctor', email: 'doctor@asha.com', password: 'Doctor@123', color: 'primary', role: 'doctor' },
  { label: 'Admin', email: 'admin@asha.com', password: 'Admin@123', color: 'default', role: 'admin' }
]

// 6-digit OTP Input Component
function OtpInput({ value, onChange, error, disabled }) {
  const inputs = useRef([])
  const digits = (value || '').split('')

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[idx]) {
        const next = [...digits]
        next[idx] = ''
        onChange(next.join(''))
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus()
        const next = [...digits]
        next[idx - 1] = ''
        onChange(next.join(''))
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputs.current[idx + 1]?.focus()
    }
  }

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...Array(6)].map((_, i) => digits[i] || '')
    next[idx] = val
    onChange(next.join(''))
    if (val && idx < 5) {
      setTimeout(() => inputs.current[idx + 1]?.focus(), 20)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    const lastIdx = Math.min(pasted.length, 5)
    setTimeout(() => inputs.current[lastIdx]?.focus(), 20)
  }

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', my: 3 }}>
      {Array(6).fill(null).map((_, idx) => (
        <input
          key={idx}
          ref={el => inputs.current[idx] = el}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`otp-input${digits[idx] ? ' filled' : ''}${error ? ' error' : ''}`}
          style={{ opacity: disabled ? 0.5 : 1 }}
        />
      ))}
    </Box>
  )
}

// Countdown timer hook
function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds)
  const ref = useRef(null)
  const start = (secs = seconds) => {
    setRemaining(secs)
    if (ref.current) clearInterval(ref.current)
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }
  useEffect(() => () => clearInterval(ref.current), [])
  return { remaining, start, canResend: remaining === 0 }
}

// ═══════════════════════════════════════════════
export default function Login() {
  const navigate = useNavigate()

  // Modes: 'email' | 'otp-phone' | 'otp-verify' | 'register-role'
  const [mode, setMode] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [regName, setRegName] = useState('')
  const [regRole, setRegRole] = useState('asha')
  const [regVillage, setRegVillage] = useState('')

  const [demoOtp, setDemoOtp] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const { remaining, start: startTimer, canResend } = useCountdown(60)

  const { login, sendOtp, verifyOtp, registerWithPhone, getRoleHomePath } = useAuth()

  const handleEmailLogin = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(getRoleHomePath(user.role), { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    try {
      const res = await sendOtp(phone)
      setSuccessMsg(res.message || 'OTP sent!')
      if (res.demo_otp) setDemoOtp(res.demo_otp) // demo only
      setMode('otp-verify')
      setOtp('')
      startTimer(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Enter the complete 6-digit OTP'); return }
    setError('')
    setLoading(true)
    try {
      const resp = await verifyOtp(phone, otp)
      if (resp.isNewUser) {
        setTempToken(resp.tempToken)
        setMode('register-role')
        setSuccessMsg('Phone verified! Please complete your profile.')
      } else {
        navigate(getRoleHomePath(resp.user.role), { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await registerWithPhone({
        tempToken, name: regName, role: regRole, village: regVillage
      })
      navigate(getRoleHomePath(user.role), { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setError('')
    setSuccessMsg('')
    setDemoOtp('')
    await handleSendOtp()
  }

  const fillDemo = (acc) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
    setMode('email')
  }

  const logoGradient = 'linear-gradient(135deg, #0D2145 0%, #1565C0 100%)'

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(155deg, #0D2145 0%, #1565C0 45%, #00897B 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative circles */}
      {[
        { size: 300, opacity: 0.06, top: '-100px', left: '-100px' },
        { size: 200, opacity: 0.05, top: '60%', right: '-60px' },
        { size: 150, opacity: 0.07, bottom: '5%', left: '10%' }
      ].map((c, i) => (
        <Box key={i} sx={{
          position: 'absolute', width: c.size, height: c.size,
          borderRadius: '50%', border: `2px solid rgba(255,255,255,${c.opacity})`,
          top: c.top, left: c.left, right: c.right, bottom: c.bottom,
          pointerEvents: 'none'
        }} />
      ))}

      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        {loading && <LinearProgress sx={{ height: 3 }} />}

        {/* Header banner */}
        <Box sx={{ background: logoGradient, p: 3.5, textAlign: 'center', color: '#fff' }}>
          <Box sx={{
            display: 'inline-flex', p: 1.5, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', mb: 1.5
          }}>
            <LocalHospital sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>ASHA Assist</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            AI Rural Health Intelligence Platform
          </Typography>
        </Box>

        <CardContent sx={{ p: 3.5 }}>
          {/* Login method tabs */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, p: 0.5, bgcolor: 'grey.100', borderRadius: 2 }}>
            {[
              { id: 'email', label: '📧 Email Login' },
              { id: 'otp-phone', label: '📱 Mobile OTP' }
            ].map(tab => (
              <Box
                key={tab.id}
                onClick={() => { setMode(tab.id); setError(''); setSuccessMsg('') }}
                sx={{
                  flex: 1, textAlign: 'center', py: 1, borderRadius: 1.5, cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: (mode === tab.id || (tab.id === 'otp-phone' && mode === 'otp-verify')) ? 'white' : 'transparent',
                  boxShadow: (mode === tab.id || (tab.id === 'otp-phone' && mode === 'otp-verify')) ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: 600, fontSize: '0.82rem', color: 'text.primary',
                  userSelect: 'none'
                }}
              >
                {tab.label}
              </Box>
            ))}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>{successMsg}</Alert>}

          {/* ─── EMAIL LOGIN ─── */}
          {mode === 'email' && (
            <Box component="form" onSubmit={handleEmailLogin} sx={{ animation: 'fadeIn 0.2s ease' }}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                autoComplete="email"
                InputProps={{ startAdornment: <InputAdornment position="start">📧</InputAdornment> }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={loading ? null : <ArrowForward />}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          )}

          {/* ─── OTP: PHONE ENTRY ─── */}
          {mode === 'otp-phone' && (
            <Box component="form" onSubmit={handleSendOtp} sx={{ animation: 'fadeIn 0.2s ease' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                Enter your registered mobile number to receive a one-time password.
              </Typography>
              <TextField
                label="Mobile Number"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Phone sx={{ color: 'text.secondary' }} /><Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontWeight: 600 }}>+91</Box></InputAdornment>
                }}
                inputProps={{ maxLength: 10 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || phone.length !== 10}
                endIcon={loading ? null : <ArrowForward />}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
              </Button>
            </Box>
          )}

          {/* ─── OTP: VERIFICATION ─── */}
          {mode === 'otp-verify' && (
            <Box sx={{ animation: 'fadeIn 0.2s ease', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Verified sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  OTP sent to <strong>+91 ****{phone.slice(-4)}</strong>
                </Typography>
              </Box>

              {demoOtp && (
                <Alert severity="info" sx={{ mb: 1, textAlign: 'left' }} icon="🔑">
                  <strong>Demo OTP:</strong> {demoOtp} <Typography variant="caption">(visible in dev only)</Typography>
                </Alert>
              )}

              <OtpInput value={otp} onChange={setOtp} error={Boolean(error)} disabled={loading} />

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                sx={{ mb: 2 }}
                endIcon={loading ? null : <CheckCircle />}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify & Login'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => { setMode('otp-phone'); setError(''); setSuccessMsg(''); setDemoOtp('') }}
                  sx={{ color: 'text.secondary' }}
                >
                  <ArrowBack fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>Change number</Typography>
                </IconButton>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  color="secondary"
                >
                  {canResend ? 'Resend OTP' : `Resend in ${remaining}s`}
                </Button>
              </Box>
            </Box>
          )}

          {/* ─── NEW USER REGISTRATION ─── */}
          {mode === 'register-role' && (
            <Box component="form" onSubmit={handleRegister} sx={{ animation: 'fadeIn 0.3s ease' }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Complete Registration
              </Typography>
              <TextField
                label="Full Name"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role Selection</InputLabel>
                <Select value={regRole} label="Role Selection" onChange={e => setRegRole(e.target.value)}>
                  <MenuItem value="asha">ASHA Worker</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              {regRole === 'asha' && (
                <TextField
                  label="Village Name"
                  value={regVillage}
                  onChange={e => setRegVillage(e.target.value)}
                  required
                  fullWidth
                  sx={{ mb: 3 }}
                />
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !regName || (regRole === 'asha' && !regVillage)}
                endIcon={loading ? null : <CheckCircle />}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Complete Setup'}
              </Button>
            </Box>
          )}

          {/* Divider + Demo accounts */}
          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              Quick Demo Login
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {DEMO_ACCOUNTS.map(acc => (
              <Chip
                key={acc.email}
                label={acc.label}
                color={acc.color}
                variant="outlined"
                onClick={() => fillDemo(acc)}
                clickable
                size="small"
                icon={<MedicalServices />}
                sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
              />
            ))}
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 2.5, opacity: 0.7 }}>
            ASHA Assist • Hackathon Demo 2026 • Secure Healthcare Platform
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
