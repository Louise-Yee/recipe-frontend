'use client';

import { Box } from '@mui/material';
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

    useEffect(() => {
        // Don't redirect while authentication is being checked
        if (isLoading) return;

        const isPublicRoute = publicRoutes.includes(pathname);

        if (!isAuthenticated && !isPublicRoute) {
            // If user is not authenticated and tries to access a protected route,
            // redirect to login
            router.replace('/login');
        } else if (isAuthenticated && isPublicRoute) {
            // If user is authenticated and tries to access a public route (like login),
            // redirect to home
            router.replace('/home');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show nothing while checking authentication
    if (isLoading) {
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
                    ml: isAuthenticated ? { xs: 0, sm: '240px' } : 0,
                    width: isAuthenticated ? { sm: `calc(100% - 240px)` } : '100%',
                    minHeight: '100vh',
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