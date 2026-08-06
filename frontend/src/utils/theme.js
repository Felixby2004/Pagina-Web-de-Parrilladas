import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#8B0000',
      light: '#a52a2a',
      dark: '#5a0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4a373',
      light: '#e8c99b',
      dark: '#b8834e',
      contrastText: '#3e2c1b',
    },
    background: {
      default: '#faf3eb',
      paper: '#ffffff',
    },
    text: {
      primary: '#3e2c1b',
      secondary: '#6b4f34',
    },
    error: { main: '#d32f2f' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Merriweather", serif', fontWeight: 700 },
    h2: { fontFamily: '"Merriweather", serif', fontWeight: 700 },
    h3: { fontFamily: '"Merriweather", serif', fontWeight: 700 },
    h4: { fontFamily: '"Merriweather", serif', fontWeight: 700 },
    h5: { fontFamily: '"Merriweather", serif', fontWeight: 600 },
    h6: { fontFamily: '"Merriweather", serif', fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
    body1: { fontFamily: '"Inter", "Roboto", sans-serif', fontWeight: 400 },
    body2: { fontFamily: '"Inter", "Roboto", sans-serif', fontWeight: 400 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 0, 0, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8B0000 0%, #a52a2a 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderRadius: 12,
          border: '1px solid rgba(139, 0, 0, 0.05)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #8B0000 0%, #5a0000 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          borderRadius: '0 0 16px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#3e2c1b',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(139, 0, 0, 0.03)',
          },
        },
      },
    },
  },
});