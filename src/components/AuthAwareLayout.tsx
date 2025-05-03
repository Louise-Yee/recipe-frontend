'use client';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import Navigation from './Navigation';
import CreateRecipeDialog from './CreateRecipeDialog';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password'];

export default function AuthAwareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname() ?? '/';
    const [shouldRender, setShouldRender] = useState(false);

    // Use theme to detect screen size
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        // Don't redirect while authentication is being checked
        if (isLoading) {
            setShouldRender(false);
            return;
        }

        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

        if (!isAuthenticated && !isPublicRoute) {
            // Store the attempted URL to redirect back after login
            if (typeof window !== 'undefined' && pathname !== '/') {
                sessionStorage.setItem('redirectAfterLogin', pathname);
            }

            // If user is not authenticated and tries to access a protected route,
            // redirect to login
            router.push('/login');
            setShouldRender(false);
        } else if (isAuthenticated && isPublicRoute) {
            // If user is authenticated and tries to access a public route (like login),
            // redirect to home
            router.push('/home');
            setShouldRender(false);
        } else {
            // We can render the page
            setShouldRender(true);
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show nothing while checking authentication
    if (isLoading || !shouldRender) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {isAuthenticated && (
                <Navigation onCreateRecipe={() => setCreateDialogOpen(true)} />
            )}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    // On mobile, don't add left margin since navigation is at bottom
                    ml: isAuthenticated && !isMobile ? { xs: 0, sm: '240px' } : 0,
                    width: isAuthenticated && !isMobile ? { sm: `calc(100% - 240px)` } : '100%',
                    minHeight: '100vh',
                    // Add padding bottom on mobile for bottom navigation bar
                    pb: isAuthenticated && isMobile ? '64px' : 0,
                }}
            >
                {children}
            </Box>
            <CreateRecipeDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={() => {
                    setCreateDialogOpen(false);
                }}
            />
        </Box>
    );
}