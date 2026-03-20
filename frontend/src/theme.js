import { createTheme, alpha } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#1E88E5',
      dark: '#0D47A1',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#00897B',
      light: '#26A69A',
      dark: '#00695C',
      contrastText: '#ffffff'
    },
    error: { main: '#D32F2F', light: '#EF5350' },
    warning: { main: '#F57C00', light: '#FFA726' },
    success: { main: '#2E7D32', light: '#43A047' },
    info: { main: '#0288D1', light: '#29B6F6' },
    background: {
      default: '#EEF2F7',
      paper: '#ffffff'
    },
    text: {
      primary: '#1A2A44',
      secondary: '#536070'
    },
    divider: 'rgba(21, 101, 192, 0.08)',
    // Custom semantic colors
    risk: {
      high: '#C62828',
      highBg: '#FFEBEE',
      medium: '#E65100',
      mediumBg: '#FFF3E0',
      low: '#2E7D32',
      lowBg: '#E8F5E9'
    }
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, lineHeight: 1.6 },
    subtitle2: { fontWeight: 600, lineHeight: 1.6 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
    caption: { fontWeight: 500, letterSpacing: '0.04em' },
    overline: { fontWeight: 700, letterSpacing: '0.1em' }
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(21, 101, 192, 0.06), 0 1px 2px rgba(0,0,0,0.04)',
    '0 3px 8px rgba(21, 101, 192, 0.08), 0 2px 4px rgba(0,0,0,0.05)',
    '0 6px 16px rgba(21, 101, 192, 0.10), 0 3px 6px rgba(0,0,0,0.06)',
    '0 8px 24px rgba(21, 101, 192, 0.12), 0 4px 8px rgba(0,0,0,0.06)',
    '0 12px 32px rgba(21, 101, 192, 0.14), 0 6px 12px rgba(0,0,0,0.08)',
    '0 16px 40px rgba(21, 101, 192, 0.16), 0 8px 16px rgba(0,0,0,0.08)',
    '0 20px 48px rgba(21, 101, 192, 0.18), 0 10px 20px rgba(0,0,0,0.1)',
    '0 24px 56px rgba(21, 101, 192, 0.20), 0 12px 24px rgba(0,0,0,0.1)',
    '0 28px 64px rgba(21, 101, 192, 0.22), 0 14px 28px rgba(0,0,0,0.12)',
    '0 32px 72px rgba(21, 101, 192, 0.24), 0 16px 32px rgba(0,0,0,0.12)',
    '0 36px 80px rgba(21, 101, 192, 0.26), 0 18px 36px rgba(0,0,0,0.14)',
    '0 40px 88px rgba(21, 101, 192, 0.28), 0 20px 40px rgba(0,0,0,0.14)',
    '0 44px 96px rgba(21, 101, 192, 0.30), 0 22px 44px rgba(0,0,0,0.16)',
    '0 48px 104px rgba(21, 101, 192, 0.32), 0 24px 48px rgba(0,0,0,0.16)',
    '0 52px 112px rgba(21, 101, 192, 0.34), 0 26px 52px rgba(0,0,0,0.18)',
    '0 56px 120px rgba(21, 101, 192, 0.36), 0 28px 56px rgba(0,0,0,0.18)',
    '0 60px 128px rgba(21, 101, 192, 0.38), 0 30px 60px rgba(0,0,0,0.20)',
    '0 64px 136px rgba(21, 101, 192, 0.40), 0 32px 64px rgba(0,0,0,0.20)',
    '0 68px 144px rgba(21, 101, 192, 0.42), 0 34px 68px rgba(0,0,0,0.22)',
    '0 72px 152px rgba(21, 101, 192, 0.44), 0 36px 72px rgba(0,0,0,0.22)',
    '0 76px 160px rgba(21, 101, 192, 0.46), 0 38px 76px rgba(0,0,0,0.24)',
    '0 80px 168px rgba(21, 101, 192, 0.48), 0 40px 80px rgba(0,0,0,0.24)',
    '0 84px 176px rgba(21, 101, 192, 0.50), 0 42px 84px rgba(0,0,0,0.26)',
    '0 88px 184px rgba(21, 101, 192, 0.52), 0 44px 88px rgba(0,0,0,0.26)'
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#90A4AE #EEF2F7',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': { width: 6, height: 6 },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': { background: '#EEF2F7', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': { borderRadius: 3, background: '#90A4AE' },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': { background: '#78909C' }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '9px 20px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0px)' }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
          boxShadow: '0 4px 14px rgba(21, 101, 192, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
            boxShadow: '0 6px 20px rgba(21, 101, 192, 0.45)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00897B 0%, #26A69A 100%)',
          boxShadow: '0 4px 14px rgba(0, 137, 123, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00695C 0%, #00897B 100%)',
            boxShadow: '0 6px 20px rgba(0, 137, 123, 0.45)'
          }
        },
        sizeLarge: { fontSize: '1rem', padding: '12px 28px' },
        sizeSmall: { fontSize: '0.8125rem', padding: '6px 14px', borderRadius: 8 }
      }
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(21, 101, 192, 0.08)',
          boxShadow: '0 2px 12px rgba(21, 101, 192, 0.06)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease'
        }
      }
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          '&:hover': {
            '& .MuiCardActionArea-focusHighlight': { opacity: 0.04 }
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(21, 101, 192, 0.12)'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.78rem'
        }
      }
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(21, 101, 192, 0.08)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(21, 101, 192, 0.08)',
          background: 'linear-gradient(180deg, #0D2145 0%, #1565C0 100%)',
          color: '#fff'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '10px 12px',
          transition: 'all 0.2s ease',
          color: 'rgba(255,255,255,0.7)',
          '&.Mui-selected': {
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            '& .MuiListItemIcon-root': { color: '#fff' },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#fff',
            '& .MuiListItemIcon-root': { color: '#fff' }
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { color: 'rgba(255,255,255,0.6)', minWidth: 40 }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
        bar: { borderRadius: 4 }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, fontWeight: 500 }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20 }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem'
        }
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' }
      }
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          borderTop: '1px solid rgba(21, 101, 192, 0.08)'
        }
      }
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 60,
          color: '#90A4AE',
          '&.Mui-selected': { color: '#1565C0' }
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700 }
      }
    }
  }
})

export default theme
