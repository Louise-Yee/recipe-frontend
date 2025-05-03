'use client';

import { useState, useEffect, useRef } from 'react';
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
    IconButton,
    Card,
    CardMedia,
    CardContent,
    CardActionArea,
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch, handleApiError } from '@/services/apiUtils';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Recipe, getPublicUserProfile } from '@/services/api';

// File upload related functions
async function getProfileImageUploadUrl(file: File) {
    try {
        // Request upload URL from backend
        const response = await apiFetch<{
            success: boolean;
            uploadInfo: { uploadUrl: string; fileUrl: string; fileName: string };
            error?: string;
        }>('/users/profile-image-upload-url', {
            method: 'POST',
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size
            })
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to get upload URL');
        }

        return response.uploadInfo;
    } catch (error) {
        throw new Error(handleApiError(error, 'getProfileImageUploadUrl'));
    }
}

async function uploadProfileImage(file: File): Promise<string> {
    try {
        // Get upload URL
        const uploadInfo = await getProfileImageUploadUrl(file);

        // Upload directly to Firebase Storage using the signed URL
        const uploadResponse = await fetch(uploadInfo.uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error(`Error uploading image: ${uploadResponse.statusText}`);
        }

        // Confirm upload completion with backend
        const response = await apiFetch<{
            success: boolean;
            profileImageUrl: string;
            error?: string;
        }>('/users/confirm-profile-image', {
            method: 'POST',
            body: JSON.stringify({
                fileName: uploadInfo.fileName
            })
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to confirm profile image');
        }

        return uploadInfo.fileUrl || response.profileImageUrl; // Return fileUrl if available, otherwise use profileImageUrl
    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
}

// Interface for user profile data
export interface UserProfile {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string;
    profileImage?: string;  // Make profileImage optional
    bio?: string;  // Make bio optional as well for consistency
    followersCount: number;
    followingCount: number;
    recipesCount?: number;
    createdAt: {
        _seconds: number;
        _nanoseconds: number;
    };
}

// Interface for user data response
export interface UserDataResponse {
    success: boolean;
    userData: UserProfile;
    recipes: Recipe[];
    recipesCount: number;
    error?: string;
}

interface ProfileClientProps {
    userId?: string; // Optional userId param - if not provided, shows current user's profile
}

export default function ProfileClient({ userId: paramUserId }: ProfileClientProps) {
    const { user, updateProfile, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        profileImage: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile data - either current user or specified user
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            setError('');

            try {
                // If paramUserId is provided, fetch that user's profile
                if (paramUserId && paramUserId !== user?.uid) {
                    setIsOwnProfile(false);

                    // Use the public profile endpoint for other users
                    const response = await getPublicUserProfile(paramUserId);

                    if (!response.success) {
                        throw new Error('Failed to fetch user profile');
                    }

                    setUserProfile({
                        ...response.userData,
                        email: '',
                        firstName: '',
                        lastName: '',
                        followersCount: 0,
                        followingCount: 0,
                        createdAt: { _seconds: 0, _nanoseconds: 0 }
                    });
                    setUserRecipes(response.recipes || []);
                    setProfileData({
                        displayName: response.userData.displayName || '',
                        bio: response.userData.bio || '',
                        profileImage: response.userData.profileImage || '',
                    });
                } else {
                    // Use current logged-in user data
                    setIsOwnProfile(true);
                    if (user) {
                        setProfileData({
                            displayName: user.displayName || '',
                            bio: user.bio || '',
                            profileImage: user.profileImage || '',
                        });

                        // Fetch current user's recipes
                        const response = await apiFetch<UserDataResponse>(`/users/${user.uid}`);
                        if (response.success) {
                            setUserRecipes(response.recipes || []);
                        }
                    } else if (!authLoading) {
                        router.push('/login');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Failed to load profile data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [user, paramUserId, authLoading, router]);

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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setUploadProgress(true);

        try {
            const imageUrl = await uploadProfileImage(file);
            // Update profile data with new image URL
            setProfileData({ ...profileData, profileImage: imageUrl });

            // If not in edit mode, update the profile immediately
            if (!isEditing) {
                await updateProfile({ profileImage: imageUrl });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploadProgress(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleViewRecipe = (recipeId: string) => {
        router.push(`/recipes/${recipeId}`);
    };

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => router.push('/home')}
                        sx={{ mt: 2 }}
                    >
                        Go to Home
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={profileData.profileImage}
                            sx={{ width: 120, height: 120, mb: 2 }}
                        />
                        {isOwnProfile && (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                />
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 10,
                                        right: -8,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        }
                                    }}
                                    onClick={triggerFileInput}
                                    disabled={uploadProgress}
                                >
                                    {uploadProgress ? <CircularProgress size={24} color="inherit" /> : <PhotoCameraIcon />}
                                </IconButton>
                            </>
                        )}
                    </Box>
                    {!isEditing ? (
                        <>
                            <Typography variant="h4" gutterBottom>
                                {profileData.displayName}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {profileData.bio || 'No bio yet'}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6">{userProfile?.recipesCount || userRecipes.length}</Typography>
                                    <Typography variant="body2" color="text.secondary">Recipes</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6">{userProfile?.followersCount || user?.followersCount || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Followers</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6">{userProfile?.followingCount || user?.followingCount || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Following</Typography>
                                </Box>
                            </Box>

                            {isOwnProfile && (
                                <Button
                                    variant="contained"
                                    onClick={() => setIsEditing(true)}
                                    sx={{ mt: 2 }}
                                >
                                    Edit Profile
                                </Button>
                            )}
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

                <Divider sx={{ my: 3 }} />

                <Box sx={{ width: '100%' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            mb: 3,
                            '& .MuiTab-root': {
                                fontWeight: 600,
                            },
                            '& .Mui-selected': {
                                color: 'primary.main',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main',
                            }
                        }}
                    >
                        <Tab label="Recipes" />
                        {/* Can add more tabs in the future: favorites, etc. */}
                    </Tabs>

                    {/* Recipes Tab */}
                    {activeTab === 0 && (
                        <>
                            {userRecipes.length > 0 ? (
                                <Grid container spacing={3}>
                                    {userRecipes.map((recipe) => (
                                        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                                            <Card sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                }
                                            }}>
                                                <CardActionArea onClick={() => recipe.id && handleViewRecipe(recipe.id)}>
                                                    <CardMedia
                                                        component="img"
                                                        height="140"
                                                        image={recipe.imageUrl || '/placeholder-recipe.jpg'}
                                                        alt={recipe.title}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="h6" noWrap>
                                                            {recipe.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}>
                                                            {recipe.description || 'No description provided.'}
                                                        </Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        No recipes yet
                                    </Typography>
                                    {isOwnProfile && (
                                        <Button
                                            variant="contained"
                                            onClick={() => router.push('/home')}
                                            sx={{ mt: 2 }}
                                        >
                                            Create Your First Recipe
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}