'use client';

import {
    useState,
    //  useRef
} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
// import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
// import Image from 'next/image';
import { createRecipe, uploadImage } from '@/services/api';

interface CreateRecipeDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const steps = ['Basic Info', 'Ingredients', 'Steps', 'Image & Details'];

export default function CreateRecipeDialog({ open, onClose, onSuccess }: CreateRecipeDialogProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [recipeData, setRecipeData] = useState({
        title: '',
        description: '',
        ingredients: [''],
        steps: [''],
        cookTime: '',
        servings: '',
        imageUrl: '',
    });
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    // const [imagePreview, setImagePreview] = useState<string | null>(null);
    // const fileInputRef = useRef<HTMLInputElement>(null);

    // Step navigation handlers
    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (!file) {
    //         setError('No file selected');
    //         return;
    //     }

    //     // Validate file type
    //     if (!file.type.startsWith('image/')) {
    //         setError('Please select an image file');
    //         return;
    //     }

    //     // Validate file size (e.g., max 5MB)
    //     const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    //     if (file.size > maxSize) {
    //         setError('Image size should be less than 5MB');
    //         return;
    //     }

    //     setSelectedImage(file);
    //     const preview = URL.createObjectURL(file);
    //     setImagePreview(preview);
    //     setError(''); // Clear any previous errors
    // };

    const handleIngredientChange = (index: number, value: string) => {
        const newIngredients = [...recipeData.ingredients];
        newIngredients[index] = value;
        setRecipeData({ ...recipeData, ingredients: newIngredients });
    };

    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...recipeData.steps];
        newSteps[index] = value;
        setRecipeData({ ...recipeData, steps: newSteps });
    };

    const addIngredient = () => {
        setRecipeData({
            ...recipeData,
            ingredients: [...recipeData.ingredients, ''],
        });
    };

    const addStep = () => {
        setRecipeData({
            ...recipeData,
            steps: [...recipeData.steps, ''],
        });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = recipeData.ingredients.filter((_, i) => i !== index);
        setRecipeData({ ...recipeData, ingredients: newIngredients });
    };

    const removeStep = (index: number) => {
        const newSteps = recipeData.steps.filter((_, i) => i !== index);
        setRecipeData({ ...recipeData, steps: newSteps });
    };

    const resetForm = () => {
        setRecipeData({
            title: '',
            description: '',
            ingredients: [''],
            steps: [''],
            cookTime: '',
            servings: '',
            imageUrl: '',
        });
        setSelectedImage(null);
        // setImagePreview(null);
        setActiveStep(0);
        setError('');
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            let imageUrl = recipeData.imageUrl;

            // Upload image first if one is selected but not yet uploaded
            if (selectedImage && !imageUrl) {
                const uploadResult = await uploadImage(selectedImage);
                imageUrl = uploadResult.imageUrl;
            }

            // Filter out empty ingredients and steps
            const cleanedData = {
                ...recipeData,
                imageUrl,
                ingredients: recipeData.ingredients.filter(i => i.trim()),
                steps: recipeData.steps.filter(s => s.trim()),
                cookTime: parseInt(recipeData.cookTime) || 0,
                servings: parseInt(recipeData.servings) || 1,
            };

            await createRecipe(cleanedData);
            onSuccess();
            onClose();
            // Reset form
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create recipe');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
            <DialogTitle>Create New Recipe</DialogTitle>
            <DialogContent>
                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            autoFocus
                            label="Recipe Title"
                            fullWidth
                            value={recipeData.title}
                            onChange={(e) => setRecipeData({ ...recipeData, title: e.target.value })}
                            required
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={recipeData.description}
                            onChange={(e) => setRecipeData({ ...recipeData, description: e.target.value })}
                        />
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Ingredients</Typography>
                        <List>
                            {recipeData.ingredients.map((ingredient, index) => (
                                <ListItem
                                    key={index}
                                    disableGutters
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => removeIngredient(index)}
                                            disabled={recipeData.ingredients.length === 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <TextField
                                        fullWidth
                                        value={ingredient}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        placeholder={`Ingredient ${index + 1}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Button startIcon={<AddIcon />} onClick={addIngredient}>
                            Add Ingredient
                        </Button>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Steps</Typography>
                        <List>
                            {recipeData.steps.map((step, index) => (
                                <ListItem
                                    key={index}
                                    disableGutters
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => removeStep(index)}
                                            disabled={recipeData.steps.length === 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <TextField
                                        fullWidth
                                        value={step}
                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                        placeholder={`Step ${index + 1}`}
                                        multiline
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Button startIcon={<AddIcon />} onClick={addStep}>
                            Add Step
                        </Button>
                    </Box>
                )}

                {activeStep === 3 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                                label="Cook Time (minutes)"
                                type="number"
                                value={recipeData.cookTime}
                                onChange={(e) => setRecipeData({ ...recipeData, cookTime: e.target.value })}
                            />
                            <TextField
                                label="Servings"
                                type="number"
                                value={recipeData.servings}
                                onChange={(e) => setRecipeData({ ...recipeData, servings: e.target.value })}
                            />
                        </Box>

                        {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<AddPhotoAlternate />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Select Image
                            </Button>

                            {imagePreview && (
                                <Box sx={{ width: '100%', maxWidth: 300, mt: 2, position: 'relative', aspectRatio: '16/9' }}>
                                    <Image
                                        src={imagePreview}
                                        alt="Recipe preview"
                                        fill
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: 8
                                        }}
                                    />
                                </Box>
                            )}
                        </Box> */}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleCancel}>Cancel</Button>
                <Box sx={{ flex: '1 1 auto' }} />
                {activeStep > 0 && (
                    <Button onClick={handleBack}>
                        Back
                    </Button>
                )}
                {activeStep < steps.length - 1 ? (
                    <Button variant="contained" onClick={handleNext}>
                        Next
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isLoading || !recipeData.title}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Create Recipe'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}