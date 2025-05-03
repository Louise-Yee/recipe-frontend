'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Box, Skeleton, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface RecipeImageProps {
    src: string | undefined;
    alt: string;
    height?: number | string;
    width?: number | string;
    priority?: boolean;
    objectFit?: 'cover' | 'contain' | 'fill';
}

export default function RecipeImage({
    src,
    alt,
    height = 200,
    width = '100%',
    priority = false,
    objectFit = 'cover'
}: RecipeImageProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | undefined>(src);

    // Reset states when src changes
    useEffect(() => {
        setImageSrc(src);
        setError(false);
        setLoading(true);
    }, [src]);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setError(true);
        setLoading(false);
    };

    // Placeholder when no image or error
    const renderPlaceholder = () => (
        <Box
            sx={{
                height: height,
                width: width,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: 1,
            }}
        >
            <RestaurantIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
                {error ? 'Failed to load image' : 'No image available'}
            </Typography>
        </Box>
    );

    // Show skeleton while loading
    if (loading && !error) {
        return (
            <Box position="relative" height={height} width={width}>
                <Skeleton
                    variant="rectangular"
                    height={height}
                    width={width}
                    animation="wave"
                    sx={{ borderRadius: 1 }}
                />

                {/* Hidden image to trigger onLoad/onError */}
                {imageSrc && (
                    <Image
                        src={imageSrc}
                        alt={alt}
                        fill
                        style={{
                            objectFit,
                            visibility: 'hidden'
                        }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        sizes={typeof width === 'number' ? `${width}px` : '100vw'}
                        priority={priority}
                    />
                )}
            </Box>
        );
    }

    // If no image or error loading image
    if (!imageSrc || error) {
        return renderPlaceholder();
    }

    // Show actual image
    return (
        <Box
            position="relative"
            height={height}
            width={width}
            sx={{
                borderRadius: 1,
                overflow: 'hidden'
            }}
        >
            <Image
                src={imageSrc}
                alt={alt}
                fill
                style={{ objectFit }}
                sizes={typeof width === 'number' ? `${width}px` : '100vw'}
                priority={priority}
                onLoad={handleImageLoad}
                onError={handleImageError}
            />
        </Box>
    );
}