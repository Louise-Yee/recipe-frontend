// src/components/MuiProvider.tsx (enhanced version)
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode, useState, useEffect } from 'react';

// Create a default theme for SSR
const defaultTheme = createTheme({
    typography: {
        fontFamily: [
            'var(--font-overused-grotesk)',
            'sans-serif',
        ].join(','),
    },
});

export default function MuiProvider({ children }: { children: ReactNode }) {
    const [, setMounted] = useState(false);
    const [theme, setTheme] = useState(defaultTheme);

    useEffect(() => {
        // After mounting on client, we can safely read CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const backgroundColor = computedStyle.getPropertyValue('--background').trim() || '#f5f5f5';
        const foregroundColor = computedStyle.getPropertyValue('--foreground').trim() || '#171717';

        // Create an updated theme with values from CSS variables
        const updatedTheme = createTheme({
            ...defaultTheme,
            palette: {
                background: {
                    default: backgroundColor,
                    paper: backgroundColor,
                },
                text: {
                    primary: foregroundColor,
                },
            },
        });

        setTheme(updatedTheme);
        setMounted(true);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}