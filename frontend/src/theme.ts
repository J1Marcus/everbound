import { createTheme } from '@mui/material/styles'

// Create a custom theme matching the original design system
export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // primary-600
      light: '#3b82f6', // primary-500
      dark: '#1d4ed8', // primary-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#78716c', // warm-500
      light: '#a8a29e', // warm-400
      dark: '#57534e', // warm-600
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafaf9', // warm-50
      paper: '#ffffff',
    },
    text: {
      primary: '#1c1917', // warm-900
      secondary: '#78716c', // warm-500
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Baskerville, "Libre Baskerville", Georgia, serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: 'Baskerville, "Libre Baskerville", Georgia, serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Baskerville, "Libre Baskerville", Georgia, serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Baskerville, "Libre Baskerville", Georgia, serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Baskerville, "Libre Baskerville", Georgia, serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'Baskerville, "Libre Baskerville", Georgia, serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
})
