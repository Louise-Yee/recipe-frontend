// src/app/login/page.tsx
'use client';
import { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
    Paper, Link
} from '@mui/material';
import NextLink from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { errorHandler } from '@/helper/helper';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import backgroundImage from "../../../public/Image/Frame 41.png"
export default function Login() {

    // const backgroundImage = 
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            errorHandler(err, 'handleLogin', 'Login');
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                minHeight: '100vh',
                display: 'flex',
            }}
        >
            {/* Left side - Black with subtle purple gradient overlay */}
            <Box
                sx={{
                    flex: { xs: 0, md: 1 },
                    display: { xs: 'none', md: 'flex' },
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    overflow: 'hidden',
                    padding: '2rem',
                }}
            >
                {/* Background image with overlay */}
                <Image
                    src={backgroundImage}
                    alt="Login background"
                    fill
                    style={{
                        objectFit: 'cover',
                        zIndex: 0,

                    }}
                    draggable={false}
                />
                <Box
                    sx={{
                        maxWidth: '80%',
                        textAlign: 'left',
                        position: 'relative',
                        zIndex: 1, // Ensures text is above the gradient overlay
                    }}
                >
                    <Typography
                        variant="h1"
                        fontWeight="800"
                        gutterBottom
                        sx={{
                            fontSize: { md: '3.5rem', lg: '4.5rem' },
                            letterSpacing: '-0.02em',
                            lineHeight: '1.1',
                            mb: 4
                        }}
                    >
                        Welcome back!
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: '400',
                            opacity: '0.9',
                            maxWidth: '90%',
                            fontSize: { md: '1.25rem', lg: '1.5rem' },
                            lineHeight: '1.5'
                        }}
                    >
                        Sign in to continue your journey and discover new ideas.
                    </Typography>
                </Box>

                {/* Simple geometric accent */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '12rem',
                        height: '12rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        bottom: '-5rem',
                        right: '-3rem',
                        zIndex: 1,
                    }}
                />
            </Box>

            {/* Right side - Login form with black background */}
            <Box
                sx={{
                    flex: { xs: 1, md: 0.6 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    background: '#fff', // Off-white background
                    position: 'relative',
                }}
            >
                {/* Glassy login form */}
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 450,
                        display: 'flex',
                        flexDirection: 'column',
                        p: '50px',
                        position: 'relative',
                        zIndex: 2,
                        // Increased background opacity for better contrast
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(7.5px)',
                        WebkitBackdropFilter: 'blur(7.5px)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
                        borderRadius: '10px',
                        border: '1px solid rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight="bold"
                        color="#000"
                        sx={{ mb: 2 }}
                    >
                        Sign In
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: '6px',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email Address or Username"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: '#000' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                    color: '#000',
                                    '& fieldset': {
                                        borderColor: '#000',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#000',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#000',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#000',
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: '#000' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            sx={{ color: '#000' }}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '6px',
                                    color: '#000',
                                    '& fieldset': {
                                        borderColor: '#000',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#000',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#000',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#000',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#000',
                                },
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Link
                                component={NextLink}
                                href="/forgot-password"
                                underline="hover"
                                sx={{
                                    color: '#000',
                                    fontSize: '0.875rem',
                                    transition: 'color 0.2s, text-decoration 0.2s',
                                    textDecoration: 'none', // default state
                                    '&:hover': {
                                        color: '#333',
                                        textDecoration: 'underline', // show underline on hover
                                    },
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                py: 1.5,
                                mt: 1,
                                mb: 3,
                                borderRadius: '6px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#000', // Solid black for contrast
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: '#333',
                                    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="rgba(0, 0, 0, 0.7)">
                                Don&apos;t have an account?{' '}
                                <Link
                                    component={NextLink}
                                    href="/signup"
                                    sx={{
                                        color: '#000',
                                        fontWeight: 500,
                                        textDecoration: 'none', // default: no underline
                                        transition: 'color 0.2s, text-decoration 0.2s',
                                        '&:hover': {
                                            color: '#333',
                                            textDecoration: 'underline', // add underline on hover
                                        },
                                    }}
                                >
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </form>
                </Paper>
            </Box>

        </Container>
    );
}