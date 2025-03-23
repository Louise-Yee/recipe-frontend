/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import NextLink from 'next/link';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { errorHandler } from '@/helper/helper';

export default function Signup() {
    const { signUp, isLoading } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const { email, password, confirmPassword, username, firstName, lastName } = formData;

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await signUp(email, password, username, firstName, lastName);
        } catch (err: any) {
            errorHandler(err, "handleSubmit", "signup")
            setError(err.message || "Signup failed.");
        }
    };

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f5f5',
            }}
        >
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
                    gap: 3,
                    // Increased background opacity for better contrast
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(7.5px)',
                    WebkitBackdropFilter: 'blur(7.5px)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                }}
                component="form"
                onSubmit={handleSubmit}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    align="center"
                    sx={{
                        fontWeight: 'bold',
                        background: '#000',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}
                >
                    Create Account
                </Typography>

                {error && (
                    <Typography color="error" variant="body2" align="center">
                        {error}
                    </Typography>
                )}

                <TextField
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    required
                />

                <TextField
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    required
                />

                <TextField
                    name="username"
                    label="Username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person />
                            </InputAdornment>
                        ),
                    }}
                    required
                />

                <TextField
                    name="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    type="email"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Email />
                            </InputAdornment>
                        ),
                    }}
                    required
                />

                <TextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    required
                />

                <TextField
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    error={
                        !!formData.confirmPassword &&
                        formData.confirmPassword !== formData.password
                    }
                    helperText={
                        !!formData.confirmPassword &&
                            formData.confirmPassword !== formData.password
                            ? "Passwords do not match"
                            : ''
                    }
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    required
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                        py: 1.5,
                        mt: 1,
                        // mb: 3,
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
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Already have an account?{' '}
                        <Link
                            component={NextLink}
                            href="/login"
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
                            Login
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
