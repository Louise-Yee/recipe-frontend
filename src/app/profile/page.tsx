'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Avatar,
    Paper,
    TextField,
    Button,
    Grid,
    CircularProgress,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const { user, updateProfile, isLoading } = useAuth();
    const router = useRouter();
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        profileImage: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
        if (user) {
            setProfileData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                profileImage: user.profileImage || '',
            });
        }
    }, [user, isLoading, router]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile(profileData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        src={profileData.profileImage}
                        sx={{ width: 120, height: 120, mb: 2 }}
                    />
                    {!isEditing ? (
                        <>
                            <Typography variant="h4" gutterBottom>
                                {profileData.displayName}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {profileData.bio || 'No bio yet'}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => setIsEditing(true)}
                                sx={{ mt: 2 }}
                            >
                                Edit Profile
                            </Button>
                        </>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Display Name"
                                    value={profileData.displayName}
                                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    multiline
                                    rows={4}
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Profile Image URL"
                                    value={profileData.profileImage}
                                    onChange={(e) => setProfileData({ ...profileData, profileImage: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}