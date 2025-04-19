// src/app/Home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Paper,
} from '@mui/material';
import CreateRecipeDialog from '@/components/CreateRecipeDialog';
import RecipeDialog from '@/components/RecipeDialog';
import { getAllRecipes, type Recipe } from '@/services/api';

export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const fetchRecipes = async () => {
        setIsLoadingRecipes(true);
        try {
            const data = await getAllRecipes();
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setIsLoadingRecipes(false);
        }
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Fetch recipes on mount
    useEffect(() => {
        if (user) {
            fetchRecipes();
        }
    }, [user]);

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            {isLoadingRecipes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                    <CircularProgress sx={{ color: '#FF6A00' }} />
                </Box>
            ) : recipes.length > 0 ? (
                <Grid container spacing={3}>
                    {recipes.map((recipe) => (
                        <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {recipe.imageUrl ? (
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            height: 240,
                                            objectFit: 'cover'
                                        }}
                                        image={recipe.imageUrl}
                                        alt={recipe.title}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            height: 240,
                                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            No Image
                                        </Typography>
                                    </Box>
                                )}
                                <CardContent
                                    sx={{
                                        flexGrow: 1,
                                        p: 2.5,
                                        ':hover': {
                                            transition: '0.3s',
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                            cursor: 'pointer',
                                            boxShadow: 0.2,
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
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        By {recipe?.author?.displayName || 'Unknown'}
                                    </Typography>
                                    {recipe.description && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                mt: 1.5,
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {recipe.description}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ px: 2.5, pb: 2.5 }}>
                                    <Button
                                        variant="contained"
                                        size="medium"
                                        onClick={() => setSelectedRecipe(recipe)}
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
                        ":hover": {
                            transition: '0.3s',
                            border: '1px dashed rgba(2, 2, 2, 0.4)',
                        }
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
                onSuccess={() => {
                    setCreateDialogOpen(false);
                    fetchRecipes();
                }}
            />
            <RecipeDialog
                open={!!selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                recipe={selectedRecipe}
            />
        </Container>
    );
}