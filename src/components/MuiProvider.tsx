'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useMemo } from 'react';
import { useThemeMode } from '@/context/ThemeContext';

export default function MuiProvider({ children }: { children: ReactNode }) {
    const { mode } = useThemeMode();

    // Create a theme instance based on the mode
    const theme = useMemo(() =>
        createTheme({
            typography: {
                fontFamily: [
                    'var(--font-overused-grotesk)',
                    'sans-serif',
                ].join(','),
            },
            palette: {
                mode: mode,
                primary: {
                    main: '#FF6A00',
                    contrastText: '#ffffff',
                },
                background: {
                    // Warmer background colors for light mode
                    default: mode === 'light' ? '#FBF3EA' : '#121212', // Warm beige
                    paper: mode === 'light' ? '#FEF8F0' : '#1e1e1e', // Lighter warm beige
                },
                text: {
                    primary: mode === 'light' ? '#45342E' : '#ffffff', // Warmer dark brown for text
                    secondary: mode === 'light' ? 'rgba(69, 52, 46, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                },
            },
            components: {
                MuiAppBar: {
                    styleOverrides: {
                        root: {
                            backgroundColor: mode === 'light' ? '#F8EFE3' : '#1a1a1a', // Slightly darker beige
                            color: mode === 'light' ? '#45342E' : '#ffffff',
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
                            boxShadow: mode === 'light'
                                ? '0 4px 6px rgba(191, 158, 128, 0.08)' // Warmer shadow color
                                : '0 4px 6px rgba(0, 0, 0, 0.3)',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: mode === 'light'
                                    ? '0 12px 20px rgba(191, 158, 128, 0.12)' // Warmer shadow color
                                    : '0 12px 20px rgba(0, 0, 0, 0.5)',
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
                MuiPaper: {
                    styleOverrides: {
                        root: {
                            backgroundImage: 'none',
                        },
                    },
                },
            },
        }),
        [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}