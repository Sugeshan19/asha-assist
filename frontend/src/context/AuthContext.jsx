import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const setAuth = (tokenVal, userVal) => {
    if (tokenVal) {
      localStorage.setItem('token', tokenVal)
      if (userVal) localStorage.setItem('demo_user', JSON.stringify(userVal))
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenVal}`
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('demo_user')
      delete api.defaults.headers.common['Authorization']
    }
    setToken(tokenVal)
    setUser(userVal)
  }

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return }
    if (token === 'demo_token_xyz') {
      const stored = localStorage.getItem('demo_user')
      if (stored) setUser(JSON.parse(stored))
      setLoading(false)
      return
    }
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      setAuth(null, null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadUser() }, [loadUser])

  // Email/password login
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.token, data.user)
      return data.user
    } catch (err) {
      console.warn("API Login failed. Falling back to Demo Mode.")
      if (email === 'asha@asha.com') {
        const demo = { _id: '1', name: 'Demo ASHA', role: 'asha', village: 'Rampur' }
        setAuth('demo_token_xyz', demo)
        return demo
      }
      if (email === 'doctor@asha.com') {
        const demo = { _id: '2', name: 'Dr. Sharma', role: 'doctor', district: 'Surat' }
        setAuth('demo_token_xyz', demo)
        return demo
      }
      if (email === 'admin@asha.com') {
        const demo = { _id: '3', name: 'Super Admin', role: 'admin' }
        setAuth('demo_token_xyz', demo)
        return demo
      }
      throw err
    }
  }

  // OTP Step 1: request OTP
  const sendOtp = async (phone) => {
    const { data } = await api.post('/auth/send-otp', { phone })
    return data // { message, demo_otp, expiresIn }
  }

  // OTP Step 2: verify OTP and log in
  const verifyOtp = async (phone, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp })
      if (data.isNewUser) return data
      setAuth(data.token, data.user)
      return data
    } catch (err) {
      console.warn("API Login failed. Falling back to Demo Mode.")
      if (phone === '9876543210') {
        const demo = { _id: '1', name: 'Demo ASHA', role: 'asha', village: 'Rampur' }
        setAuth('demo_token_xyz', demo)
        return { user: demo, token: 'demo_token_xyz' }
      }
      if (phone === '9876543211') {
        const demo = { _id: '2', name: 'Dr. Sharma', role: 'doctor', district: 'Surat' }
        setAuth('demo_token_xyz', demo)
        return { user: demo, token: 'demo_token_xyz' }
      }
      if (phone === '9876543212') {
        const demo = { _id: '3', name: 'Super Admin', role: 'admin' }
        setAuth('demo_token_xyz', demo)
        return { user: demo, token: 'demo_token_xyz' }
      }
      throw err
    }
  }

  const registerWithPhone = async (payload) => {
    const { data } = await api.post('/auth/register-with-phone', payload)
    setAuth(data.token, data.user)
    return data.user
  }

  const logout = () => {
    setAuth(null, null)
  }

  const getRoleHomePath = (role) => {
    if (role === 'asha') return '/asha'
    if (role === 'doctor') return '/doctor'
    if (role === 'admin') return '/admin'
    return '/login'
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, sendOtp, verifyOtp, registerWithPhone, logout, getRoleHomePath
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
