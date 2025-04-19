'use client';
// src/app/recipes/[recipeId]/client.tsx
import { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Paper, Stack, Chip, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { getRecipeById, type Recipe, type ApiResponse } from '@/services/api';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

type RecipeClientProps = {
    recipeId: string;
};

export default function RecipeClient({ recipeId }: RecipeClientProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (recipeId) {
            setLoading(true);
            getRecipeById(recipeId)
                .then((data: ApiResponse<Recipe>) => {
                    setRecipe(data.recipe || null);
                })
                .catch((error: Error) => {
                    console.error('Error fetching recipe:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [recipeId]);

    const handleBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#FF6A00' }} />
            </Container>
        );
    }

    if (!recipe) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography color="error">Recipe not found</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative' }}>
                <IconButton
                    onClick={handleBack}
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: -8,
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

                {recipe.imageUrl && (
                    <Box
                        component="img"
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        sx={{
                            width: '100%',
                            height: 400,
                            objectFit: 'cover',
                            borderRadius: 2,
                            mb: 3
                        }}
                    />
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
            </Box>
        </Container>
    );
}