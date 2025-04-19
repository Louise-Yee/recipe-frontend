'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack, Chip } from '@mui/material';
import { type Recipe } from '@/services/api';

interface RecipeDialogProps {
    open: boolean;
    onClose: () => void;
    recipe: Recipe | null;
}

export default function RecipeDialog({ open, onClose, recipe }: RecipeDialogProps) {
    const router = useRouter();

    const handleViewFullRecipe = () => {
        if (recipe) {
            router.push(`/recipes/${recipe.id}`);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            {!recipe ? (
                <DialogContent>
                    <Typography color="error">Failed to load recipe</Typography>
                </DialogContent>
            ) : (
                <>
                    <DialogTitle sx={{
                        pb: 1,
                        '& .MuiTypography-root': { fontWeight: 600 }
                    }}>
                        {recipe.title}
                    </DialogTitle>
                    <DialogContent>
                        {recipe.imageUrl && (
                            <Box
                                component="img"
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                sx={{
                                    width: '100%',
                                    height: 200,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mb: 2
                                }}
                            />
                        )}

                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {recipe.description}
                        </Typography>

                        {(recipe.cookTime || recipe.servings) && (
                            <>
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}>
                                    Quick Info
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    {recipe.cookTime && (
                                        <Chip
                                            label={`${recipe.cookTime} mins`}
                                            size="small"
                                        />
                                    )}
                                    {recipe.servings && (
                                        <Chip
                                            label={`${recipe.servings} servings`}
                                            size="small"
                                        />
                                    )}
                                </Stack>
                            </>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Click &ldquo;View Full Recipe&rdquo; to see all ingredients and steps.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={onClose}>Close</Button>
                        <Button
                            variant="contained"
                            onClick={handleViewFullRecipe}
                            sx={{
                                bgcolor: '#FF6A00',
                                '&:hover': {
                                    bgcolor: '#e65f00'
                                }
                            }}
                        >
                            View Full Recipe
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}