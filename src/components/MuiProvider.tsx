// src/components/MuiProvider.tsx (enhanced version)
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';

// Create a default theme with modern styling
const defaultTheme = createTheme({
    typography: {
        fontFamily: [
            'var(--font-overused-grotesk)',
            'sans-serif',
        ].join(','),
    },
    palette: {
        primary: {
            main: '#FF6A00',
            contrastText: '#ffffff',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: '#000000',
            secondary: 'rgba(0, 0, 0, 0.7)',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#000000',
                    color: '#ffffff',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.08)',
                    },
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 14px rgba(255, 106, 0, 0.4)',
                },
            },
        },
    },
});

export default function MuiProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}