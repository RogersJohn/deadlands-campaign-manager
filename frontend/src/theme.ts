import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B4513', // Saddle Brown - Western theme
      light: '#A0522D',
      dark: '#654321',
    },
    secondary: {
      main: '#DAA520', // Goldenrod
      light: '#F0E68C',
      dark: '#B8860B',
    },
    background: {
      default: '#1a1410',
      paper: '#2d2419',
    },
    error: {
      main: '#8B0000', // Dark Red
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
})

export default theme
