'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Stack, Chip, List, ListItem, ListItemIcon, ListItemText, IconButton, Snackbar, Alert, Button } from '@mui/material';
import { getRecipeById, type Recipe, type ApiResponse } from '@/services/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter, usePathname } from 'next/navigation';
import RecipeImage from '@/components/RecipeImage';

type RecipeClientProps = {
    recipeId: string;
};

export default function RecipeClient({ recipeId }: RecipeClientProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [notification, setNotification] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    // Fetch recipe data
    const fetchRecipe = useCallback(async () => {
        if (!recipeId) return;

        setLoading(true);
        try {
            const data: ApiResponse<Recipe> = await getRecipeById(recipeId);
            setRecipe(data.recipe || null);
            // In a real app, check if this recipe is in user's favorites
            // setIsFavorite(user?.favorites?.includes(recipeId) || false);
        } catch (error: unknown) {
            console.error('Error fetching recipe:', error);
            setError(error instanceof Error ? error.message : 'Failed to load recipe');
        } finally {
            setLoading(false);
        }
    }, [recipeId]);

    // Check for back navigation history and load recipe data
    useEffect(() => {
        // Store current path in the browser history state to handle back navigation
        if (typeof window !== 'undefined') {
            window.history.replaceState(
                { ...window.history.state, as: pathname, url: pathname },
                '',
                pathname
            );
        }

        fetchRecipe();
    }, [recipeId, pathname, fetchRecipe]);

    // Handle favorites toggle
    const toggleFavorite = () => {
        setIsFavorite(prev => !prev);
        setNotification(`Recipe ${isFavorite ? 'removed from' : 'added to'} favorites`);
        // Here you would call an API to update the user's favorites
    };

    // Handle back button click with proper history state preservation
    const handleBack = () => {
        // Check for referrer to handle navigation properly
        if (typeof window !== 'undefined') {
            const referrer = document.referrer;
            // If coming from the same domain or no referrer
            if (!referrer || referrer.includes(window.location.hostname)) {
                router.back();
                return;
            }
        }
        // Default to home if no history
        router.push('/home');
    };

    // Handle notification close
    const handleCloseNotification = () => {
        setNotification('');
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#FF6A00' }} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error" variant="h6" gutterBottom>
                        Error Loading Recipe
                    </Typography>
                    <Typography>{error}</Typography>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        sx={{ mt: 2 }}
                    >
                        Go Back
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!recipe) {
        return (
            <Container sx={{ py: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">Recipe not found</Typography>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        sx={{ mt: 2 }}
                    >
                        Go Back
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <IconButton
                        onClick={handleBack}
                        sx={{
                            bgcolor: 'white',
                            boxShadow: 1,
                            '&:hover': {
                                bgcolor: '#fff8f3'
                            }
                        }}
                        aria-label="back"
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <IconButton
                        onClick={toggleFavorite}
                        sx={{
                            bgcolor: 'white',
                            boxShadow: 1,
                            '&:hover': {
                                bgcolor: '#fff8f3'
                            }
                        }}
                        aria-label={isFavorite ? 'remove from favorites' : 'add to favorites'}
                    >
                        {isFavorite ? (
                            <FavoriteIcon sx={{ color: '#FF6A00' }} />
                        ) : (
                            <FavoriteBorderIcon />
                        )}
                    </IconButton>
                </Box>

                {recipe.imageUrl && (
                    <Box
                        sx={{
                            width: '100%',
                            height: 400,
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            mb: 3,
                        }}
                    >
                        <RecipeImage
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            height={400}
                            width="100%"
                            objectFit="cover"
                            priority
                        />
                    </Box>
                )}

                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    {recipe.title}
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    {recipe.description}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                    {recipe.cookTime && (
                        <Chip
                            label={`${recipe.cookTime} mins`}
                            color="primary"
                            sx={{ bgcolor: '#FF6A00' }}
                        />
                    )}
                    {recipe.servings && (
                        <Chip
                            label={`${recipe.servings} servings`}
                            color="primary"
                            sx={{ bgcolor: '#FF6A00' }}
                        />
                    )}
                    {recipe.cuisine && (
                        <Chip
                            label={recipe.cuisine}
                            variant="outlined"
                        />
                    )}
                </Stack>

                <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#fff8f3' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Ingredients
                    </Typography>
                    <List disablePadding>
                        {recipe.ingredients.map((ingredient: string, index: number) => (
                            <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircleOutlineIcon sx={{ color: '#FF6A00' }} />
                                </ListItemIcon>
                                <ListItemText primary={ingredient} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff8f3' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Instructions
                    </Typography>
                    <List disablePadding>
                        {recipe.steps.map((step: string, index: number) => (
                            <ListItem key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                <Box
                                    sx={{
                                        minWidth: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        bgcolor: '#FF6A00',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mr: 2,
                                        mt: 0.5
                                    }}
                                >
                                    {index + 1}
                                </Box>
                                <ListItemText primary={step} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {recipe.author && (
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Recipe by
                        </Typography>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                                if (recipe.author?.uid) {
                                    router.push(`/profile?userId=${recipe.author.uid}`);
                                }
                            }}
                            sx={{
                                fontSize: '0.875rem',
                                textTransform: 'none',
                                p: 0,
                                minWidth: 'auto',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'transparent',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {recipe.author.displayName || 'Unknown'}
                        </Button>
                    </Box>
                )}
            </Box>

            <Snackbar
                open={!!notification}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {notification}
                </Alert>
            </Snackbar>
        </Container>
    );
}