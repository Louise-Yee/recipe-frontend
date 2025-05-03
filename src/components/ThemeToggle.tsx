'use client';

import { Box, IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '@/context/ThemeContext';

export default function ThemeToggle() {
    const { mode, toggleTheme } = useThemeMode();

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16, // Changed from left to right
                zIndex: 1300,
            }}
        >
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                    onClick={toggleTheme}
                    aria-label="toggle theme"
                    sx={{
                        bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                        color: mode === 'light' ? '#000' : '#fff',
                        backdropFilter: 'blur(8px)',
                        '&:hover': {
                            bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
                        },
                        transition: 'background-color 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        borderRadius: '50%',
                        width: 48,
                        height: 48,
                    }}
                >
                    {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
            </Tooltip>
        </Box>
    );
}