'use client';

import { useState, useRef, useEffect } from 'react';
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
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createRecipe, getImageUploadUrl } from '@/services/api';
import RecipeImage from './RecipeImage';

interface CreateRecipeDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialRecipeData = {
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    cookTime: '',
    servings: '',
    imageUrl: '',
    cuisine: '',
    tags: [] as string[],
};

const steps = ['Basic Info', 'Ingredients', 'Steps', 'Image & Details'];

export default function CreateRecipeDialog({ open, onClose, onSuccess }: CreateRecipeDialogProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recipeData, setRecipeData] = useState({ ...initialRecipeData });
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            setError('');
            setNotification('');
            setTouchedFields({});
        } else {
            // Small timeout to allow dialog close animation to complete
            const timer = setTimeout(() => {
                resetForm();
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [open]);

    // Step navigation handlers
    const handleNext = () => {
        // Validate current step before proceeding
        if (activeStep === 0 && !recipeData.title.trim()) {
            setError('Recipe title is required');
            return;
        }

        if (activeStep === 1 && recipeData.ingredients.every(i => !i.trim())) {
            setError('At least one ingredient is required');
            return;
        }

        if (activeStep === 2 && recipeData.steps.every(s => !s.trim())) {
            setError('At least one step is required');
            return;
        }

        setError('');
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setError('');
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setError('No file selected');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setError('Image size should be less than 5MB');
            return;
        }

        setSelectedImage(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setError(''); // Clear any previous errors
    };

    // New function to upload image using the signed URL approach
    const uploadImageWithSignedUrl = async (file: File): Promise<string> => {
        setIsUploading(true);
        try {
            // Step 1: Get a signed upload URL from the backend
            const fileInfo = {
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size
            };

            setNotification('Requesting upload URL...');
            const signedUrlResponse = await getImageUploadUrl(fileInfo);

            if (!signedUrlResponse.success || !signedUrlResponse.uploadInfo) {
                throw new Error(signedUrlResponse.error || 'Failed to get upload URL');
            }

            const { uploadUrl, fileUrl } = signedUrlResponse.uploadInfo;

            // Step 2: Upload the image directly to the signed URL
            setNotification('Uploading image to storage...');
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed with status: ${uploadResponse.status}`);
            }

            setNotification('Image uploaded successfully!');
            return fileUrl;
        } catch (err) {
            setError(`Image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

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
        setRecipeData({ ...recipeData, ingredients: newIngredients.length ? newIngredients : [''] });
    };

    const removeStep = (index: number) => {
        const newSteps = recipeData.steps.filter((_, i) => i !== index);
        setRecipeData({ ...recipeData, steps: newSteps.length ? newSteps : [''] });
    };

    const resetForm = () => {
        setRecipeData({ ...initialRecipeData });
        setSelectedImage(null);
        setImagePreview(null);
        setActiveStep(0);
        setError('');
        setTouchedFields({});
    };

    const handleCancel = () => {
        onClose();
    };

    const handleSubmit = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            let imageUrl = recipeData.imageUrl;

            // Upload image first if one is selected but not yet uploaded
            if (selectedImage && !imageUrl) {
                try {
                    // Use the new two-step upload process
                    imageUrl = await uploadImageWithSignedUrl(selectedImage);
                } catch (err: unknown) {
                    console.error('Image upload error:', err);
                    // Error is already set in the uploadImageWithSignedUrl function
                    setIsSubmitting(false);
                    return;
                }
            }

            // Filter out empty ingredients and steps
            const cleanedData = {
                ...recipeData,
                imageUrl,
                ingredients: recipeData.ingredients.filter(i => i.trim()),
                steps: recipeData.steps.filter(s => s.trim()),
                cookTime: parseInt(recipeData.cookTime) || undefined,
                servings: parseInt(recipeData.servings) || undefined,
            };

            setNotification('Creating recipe...');
            await createRecipe(cleanedData);
            setNotification('Recipe created successfully!');

            // Small delay to show success message before closing
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create recipe');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={isSubmitting || isUploading ? undefined : handleCancel}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)', py: 2 }}>
                    Create New Recipe
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Stepper
                        activeStep={activeStep}
                        sx={{ px: 3, py: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                    >
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Box sx={{ p: 3, pb: 0 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        </Box>
                    )}

                    <Box sx={{ p: 3 }}>
                        {activeStep === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    autoFocus
                                    label="Recipe Title"
                                    fullWidth
                                    value={recipeData.title}
                                    onChange={(e) => {
                                        setRecipeData({ ...recipeData, title: e.target.value });
                                        // Only mark as touched if user has interacted with the field
                                        if (!touchedFields.title) {
                                            setTouchedFields({ ...touchedFields, title: false });
                                        }
                                    }}
                                    onBlur={() => setTouchedFields({ ...touchedFields, title: true })}
                                    required
                                    error={touchedFields.title && !recipeData.title.trim()}
                                    helperText={touchedFields.title && !recipeData.title.trim() ? "Title is required" : ""}
                                />
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={recipeData.description}
                                    onChange={(e) => setRecipeData({ ...recipeData, description: e.target.value })}
                                    placeholder="Describe your recipe in a few sentences"
                                />
                                <TextField
                                    label="Cuisine Type (optional)"
                                    fullWidth
                                    value={recipeData.cuisine}
                                    onChange={(e) => setRecipeData({ ...recipeData, cuisine: e.target.value })}
                                    placeholder="e.g. Italian, Mexican, etc."
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
                                                size="small"
                                                sx={{ mr: 2 }}
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
                                                minRows={2}
                                                sx={{ mr: 2 }}
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
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Cook Time (minutes)"
                                        type="number"
                                        value={recipeData.cookTime}
                                        onChange={(e) => setRecipeData({ ...recipeData, cookTime: e.target.value })}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label="Servings"
                                        type="number"
                                        value={recipeData.servings}
                                        onChange={(e) => setRecipeData({ ...recipeData, servings: e.target.value })}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="subtitle1">Recipe Image (Optional)</Typography>
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
                                        disabled={isSubmitting || isUploading}
                                    >
                                        Select Image
                                    </Button>

                                    {imagePreview && (
                                        <Box sx={{ width: '100%', maxWidth: 300, mt: 2 }}>
                                            <RecipeImage
                                                src={imagePreview}
                                                alt="Recipe preview"
                                                height={200}
                                                width="100%"
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Button
                        onClick={handleCancel}
                        disabled={isSubmitting || isUploading}
                    >
                        Cancel
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    {activeStep > 0 && (
                        <Button
                            onClick={handleBack}
                            disabled={isSubmitting || isUploading}
                        >
                            Back
                        </Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={
                                isSubmitting || isUploading ||
                                (activeStep === 0 && !recipeData.title.trim())
                            }
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={isSubmitting || isUploading || !recipeData.title}
                            startIcon={isSubmitting || isUploading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isSubmitting || isUploading ? (isUploading ? 'Uploading Image...' : 'Creating...') : 'Create Recipe'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Success notification */}
            <Snackbar
                open={!!notification}
                autoHideDuration={6000}
                onClose={() => setNotification('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification('')}
                    severity={notification.includes('failed') ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {notification}
                </Alert>
            </Snackbar>
        </>
    );
}