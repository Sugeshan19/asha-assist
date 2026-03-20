import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, Chip, Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  FormControl, Select, MenuItem, Alert, IconButton, Tooltip,
  useMediaQuery, useTheme, Grid
} from '@mui/material'
import {
  Search, FilterList, ArrowForward, PersonAdd,
  VisibilityOutlined, Person
} from '@mui/icons-material'
import api from '../../services/api'
import RiskBadge from '../../components/RiskBadge'
import EmptyState from '../../components/EmptyState'
import { PatientListSkeleton } from '../../components/SkeletonLoaders'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const SAMPLE_PATIENTS = [
  { _id: '1', patientId: 'PT-001', name: 'Priya Sharma', age: 28, gender: 'Female', village: 'Rampur', currentRiskLevel: 'High', createdAt: new Date(Date.now() - 86400000) },
  { _id: '2', patientId: 'PT-002', name: 'Ravi Kumar', age: 45, gender: 'Male', village: 'Kheda', currentRiskLevel: 'Medium', createdAt: new Date(Date.now() - 3600000 * 6) },
  { _id: '3', patientId: 'PT-003', name: 'Sunita Devi', age: 34, gender: 'Female', village: 'Deoria', currentRiskLevel: 'Low', createdAt: new Date(Date.now() - 86400000 * 2) },
  { _id: '4', patientId: 'PT-004', name: 'Mohan Lal', age: 62, gender: 'Male', village: 'Rampur', currentRiskLevel: 'High', createdAt: new Date(Date.now() - 86400000 * 3) },
  { _id: '5', patientId: 'PT-005', name: 'Geeta Bai', age: 19, gender: 'Female', village: 'Silbari', currentRiskLevel: 'Low', createdAt: new Date(Date.now() - 86400000 * 4) },
  { _id: '6', patientId: 'PT-006', name: 'Anjali Singh', age: 31, gender: 'Female', village: 'Deoria', currentRiskLevel: 'Medium', createdAt: new Date(Date.now() - 86400000 * 5) },
  { _id: '7', patientId: 'PT-007', name: 'Suresh Yadav', age: 52, gender: 'Male', village: 'Barwa', currentRiskLevel: 'High', createdAt: new Date(Date.now() - 86400000 * 6) },
  { _id: '8', patientId: 'PT-008', name: 'Kamla Verma', age: 41, gender: 'Female', village: 'Kheda', currentRiskLevel: 'Low', createdAt: new Date(Date.now() - 86400000 * 7) },
]

const RISK_COLORS = { High: '#D32F2F', Medium: '#E65100', Low: '#2E7D32', Unknown: '#616161' }

export default function PatientList() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [diseaseFilter, setDiseaseFilter] = useState('All')
  const [villageFilter, setVillageFilter] = useState('All')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get('/patients?limit=100&sortBy=createdAt&order=desc')
        setPatients(data.patients || [])
      } catch {
        setPatients(SAMPLE_PATIENTS)
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const filtered = useMemo(() => {
    return patients.filter(p => {
      const q = search.toLowerCase()
      const matchesSearch = !search ||
        p.name?.toLowerCase().includes(q) ||
        p.patientId?.toLowerCase().includes(q) ||
        p.village?.toLowerCase().includes(q)
      const matchesRisk = riskFilter === 'All' || p.currentRiskLevel === riskFilter
      const matchesGender = genderFilter === 'All' || p.gender === genderFilter
      const matchesDisease = diseaseFilter === 'All' || p.latestDisease === diseaseFilter
      const matchesVillage = villageFilter === 'All' || p.village === villageFilter
      return matchesSearch && matchesRisk && matchesGender && matchesDisease && matchesVillage
    })
  }, [patients, search, riskFilter, genderFilter, diseaseFilter, villageFilter])

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const riskCounts = useMemo(() => ({
    High: patients.filter(p => p.currentRiskLevel === 'High').length,
    Medium: patients.filter(p => p.currentRiskLevel === 'Medium').length,
    Low: patients.filter(p => p.currentRiskLevel === 'Low').length,
  }), [patients])

  if (loading) return <Box sx={{ p: 1 }}><PatientListSkeleton count={8} /></Box>

  return (
    <Box>
      {usingFallback && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => {}}>
          Showing sample patient data — backend not connected.
        </Alert>
      )}

      {/* Risk summary chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>Quick Filter:</Typography>
        {[
          { label: `High Risk (${riskCounts.High})`, value: 'High', color: '#D32F2F', bg: '#FFEBEE' },
          { label: `Medium Risk (${riskCounts.Medium})`, value: 'Medium', color: '#E65100', bg: '#FFF3E0' },
          { label: `Low Risk (${riskCounts.Low})`, value: 'Low', color: '#2E7D32', bg: '#E8F5E9' },
          { label: `All (${patients.length})`, value: 'All', color: '#1565C0', bg: '#E3F2FD' },
        ].map(chip => (
          <Chip
            key={chip.value}
            label={chip.label}
            size="small"
            onClick={() => { setRiskFilter(chip.value); setPage(0) }}
            sx={{
              fontWeight: 700,
              bgcolor: riskFilter === chip.value ? chip.color : chip.bg,
              color: riskFilter === chip.value ? '#fff' : chip.color,
              border: `1px solid ${chip.color}30`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: chip.color, color: '#fff' }
            }}
          />
        ))}
      </Box>

      <Card>
        <CardContent sx={{ p: 2.5 }}>
          {/* Search & Filters Row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, ID, or village…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(0) }} displayEmpty>
                <MenuItem value="All">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={diseaseFilter} onChange={e => { setDiseaseFilter(e.target.value); setPage(0) }} displayEmpty>
                <MenuItem value="All">All Diseases</MenuItem>
                <MenuItem value="Malaria">Malaria</MenuItem>
                <MenuItem value="Dengue">Dengue</MenuItem>
                <MenuItem value="Tuberculosis">Tuberculosis</MenuItem>
                <MenuItem value="Unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={villageFilter} onChange={e => { setVillageFilter(e.target.value); setPage(0) }} displayEmpty>
                <MenuItem value="All">All Villages</MenuItem>
                <MenuItem value="Rampur">Rampur</MenuItem>
                <MenuItem value="Govindpur">Govindpur</MenuItem>
                <MenuItem value="Tikampur">Tikampur</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/asha/new-patient')}
              size="small"
            >
              Add Patient
            </Button>
          </Box>

          {/* Results count */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Showing <strong>{filtered.length}</strong> of <strong>{patients.length}</strong> patients
            </Typography>
            {(search || riskFilter !== 'All' || genderFilter !== 'All') && (
              <Button size="small" onClick={() => { setSearch(''); setRiskFilter('All'); setGenderFilter('All') }}>
                Clear filters
              </Button>
            )}
          </Box>

          {/* Table (Desktop) / Cards (Mobile) */}
          {filtered.length === 0 ? (
            <EmptyState type="search" compact actionLabel="Clear Search" onAction={() => { setSearch(''); setRiskFilter('All') }} />
          ) : isMobile ? (
            // Mobile card layout
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {paginated.map(p => (
                <Box
                  key={p._id}
                  onClick={() => navigate(`/doctor/patients/${p._id}`)}
                  sx={{
                    p: 2, borderRadius: 2, border: '1px solid',
                    borderColor: 'divider', cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 1.5
                  }}
                >
                  <Avatar sx={{ bgcolor: `${RISK_COLORS[p.currentRiskLevel]}18`, color: RISK_COLORS[p.currentRiskLevel], fontWeight: 700, width: 40, height: 40 }}>
                    {p.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.age}y · {p.gender} · {p.village}</Typography>
                  </Box>
                  <RiskBadge level={p.currentRiskLevel} size="small" />
                </Box>
              ))}
            </Box>
          ) : (
            // Desktop table
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid', borderColor: 'divider' } }}>
                    <TableCell>Patient</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Age / Gender</TableCell>
                    <TableCell>Village</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map(p => (
                    <TableRow
                      key={p._id}
                      hover
                      onClick={() => navigate(`/doctor/patients/${p._id}`)}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, transition: 'background 0.15s' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: `${RISK_COLORS[p.currentRiskLevel]}18`, color: RISK_COLORS[p.currentRiskLevel], fontSize: '0.8rem', fontWeight: 700 }}>
                            {p.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 0.75, py: 0.25, borderRadius: 1 }}>
                          {p.patientId || p._id?.slice(-6).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.age}y · {p.gender}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.village}</Typography>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={p.currentRiskLevel} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(p.createdAt).fromNow()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={e => { e.stopPropagation(); navigate(`/doctor/patients/${p._id}`) }}>
                            <VisibilityOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 1, '& .MuiTablePagination-toolbar': { fontSize: '0.8rem' } }}
          />
        </CardContent>
      </Card>
    </Box>
  )
}
