'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage if available, default to 'light'
    const [mode, setMode] = useState<ThemeMode>('light');

    useEffect(() => {
        // Get saved theme preference from localStorage on initial load
        const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
        if (savedTheme) {
            setMode(savedTheme);
        }
    }, []);

    // Update localStorage whenever theme changes
    useEffect(() => {
        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeMode() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
}