// src/app/Home/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Paper,
    Snackbar,
    Alert,
} from '@mui/material';
import CreateRecipeDialog from '@/components/CreateRecipeDialog';
import RecipeDialog from '@/components/RecipeDialog';
import { getAllRecipes, type Recipe } from '@/services/api';
import { handleApiError } from '@/services/apiUtils';
import RecipeImage from '@/components/RecipeImage';

export default function Home() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isDialogClosing, setIsDialogClosing] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [refreshKey, setRefreshKey] = useState(0); // Used to force re-fetch

    // Create a memoized fetch recipes function
    const fetchRecipes = useCallback(async () => {
        setIsLoadingRecipes(true);
        setError('');

        try {
            const data = await getAllRecipes({
                sortBy: 'updatedAt',
                sortOrder: 'desc'
            });
            setRecipes(data.recipes || []);
        } catch (error) {
            const errorMessage = handleApiError(error, 'fetchRecipes');
            setError(errorMessage);
        } finally {
            setIsLoadingRecipes(false);
        }
    }, []);

    // Function to force refresh recipes
    const refreshRecipes = () => {
        setRefreshKey(prevKey => prevKey + 1);
        setNotification('Recipes updated!');
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch recipes when component mounts or refreshKey changes
    useEffect(() => {
        if (user) {
            fetchRecipes();
        }
    }, [user, fetchRecipes, refreshKey]);

    // Handler for recipe creation success
    const handleRecipeCreated = () => {
        refreshRecipes();
    };

    // Function to view a recipe's details
    const viewRecipeDetails = (recipe: Recipe) => {
        if (recipe?.id) {
            router.push(`/recipes/${recipe.id}`);
        }
    };

    // Handle dialog close with animation
    const handleCloseDialog = () => {
        setIsDialogClosing(true);
        // Wait for dialog close animation to complete before clearing the recipe
        setTimeout(() => {
            setSelectedRecipe(null);
            setIsDialogClosing(false);
        }, 300); // 300ms matches the typical MUI dialog transition
    };

    if (authLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Latest Recipes
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => setCreateDialogOpen(true)}
                    sx={{
                        bgcolor: '#FF6A00',
                        '&:hover': { bgcolor: '#e65f00' }
                    }}
                >
                    Create Recipe
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                    <Button
                        size="small"
                        onClick={refreshRecipes}
                        sx={{ ml: 2 }}
                    >
                        Try Again
                    </Button>
                </Alert>
            )}

            {isLoadingRecipes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                    <CircularProgress sx={{ color: '#FF6A00' }} />
                </Box>
            ) : recipes.length > 0 ? (
                <Grid container spacing={3}>
                    {recipes.map((recipe) => (
                        <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                                    }
                                }}
                            >
                                <RecipeImage
                                    src={recipe.imageUrl}
                                    alt={recipe.title}
                                    height={240}
                                />
                                <CardContent
                                    sx={{
                                        flexGrow: 1,
                                        p: 2.5,
                                        ':hover': {
                                            transition: '0.3s',
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            cursor: 'pointer',
                                        }
                                    }}
                                    onClick={() => setSelectedRecipe(recipe)}
                                >
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="h2"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            mb: 1
                                        }}
                                    >
                                        {recipe.title}
                                    </Typography>
                                    {recipe.cuisine && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                                display: 'block',
                                                mb: 1
                                            }}
                                        >
                                            {recipe.cuisine} Cuisine
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mt: 1.5,
                                            lineHeight: 1.6,
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            WebkitLineClamp: 3,
                                        }}
                                    >
                                        {recipe.description || 'No description provided.'}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ px: 2.5, pb: 2.5 }}>
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        onClick={() => viewRecipeDetails(recipe)}
                                        sx={{
                                            bgcolor: '#FF6A00',
                                            '&:hover': {
                                                bgcolor: '#e65f00'
                                            }
                                        }}
                                    >
                                        View Recipe
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        minHeight: '50vh',
                        border: '1px dashed rgba(0, 0, 0, 0.1)',
                        borderRadius: 3,
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            mb: 2
                        }}
                    >
                        No recipes found
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            mt: 2,
                            bgcolor: '#FF6A00',
                            '&:hover': {
                                bgcolor: '#e65f00'
                            }
                        }}
                    >
                        Create Your First Recipe
                    </Button>
                </Paper>
            )}

            <CreateRecipeDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={handleRecipeCreated}
            />

            <RecipeDialog
                open={!!selectedRecipe && !isDialogClosing}
                onClose={handleCloseDialog}
                recipe={selectedRecipe}
            />

            <Snackbar
                open={!!notification}
                autoHideDuration={4000}
                onClose={() => setNotification('')}
                message={notification}
            />
        </Container>
    );
}