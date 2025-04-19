// src/app/page.tsx (Direct redirection based on auth status)
'use client';

import { useEffect } from 'react';
import { Container, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect after auth check is complete
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Return null as the useEffect will handle redirection
  return null;
}