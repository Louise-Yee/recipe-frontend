/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// import Link from 'next/link';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    CircularProgress,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export default function Dashboard() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [recentRecipes, setRecentRecipes] = useState<any>([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Profile menu handlers
    const handleMenuOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // For demo purposes - dummy data
    useEffect(() => {
        // This would normally be an API call to fetch recipes
        setRecentRecipes([
            { id: 1, title: 'Pasta Carbonara', author: 'Chef Jamie', likes: 124 },
            { id: 2, title: 'Avocado Toast', author: 'Breakfast King', likes: 89 },
            { id: 3, title: 'Chocolate Cake', author: 'Dessert Queen', likes: 213 }
        ]);
    }, []);

    // Handle logout
    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    if (isLoading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Recipe Feed
                    </Typography>
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {user.displayName || user.username}
                            </Typography>
                            <IconButton
                                onClick={handleMenuOpen}
                                size="large"
                                edge="end"
                                color="inherit"
                                aria-label="account"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                            >
                                {user.profileImage ? (
                                    <Avatar src={user.profileImage} alt={user.displayName} />
                                ) : (
                                    <AccountCircleIcon />
                                )}
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={() => { handleMenuClose(); router.push('/profile'); }}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
                                    Sign Out
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4, mb: 4 }}>
                {recentRecipes.length > 0 ? (
                    <Grid container spacing={3}>
                        {recentRecipes.map((recipe: any) => (
                            <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardMedia
                                        component="div"
                                        sx={{
                                            height: 0,
                                            paddingTop: '56.25%', // 16:9 aspect ratio
                                            bgcolor: 'grey.200',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h5" component="h2">
                                            {recipe.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            By {recipe.author}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {recipe.likes} likes
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={() => router.push(`/recipes/${recipe.id}`)}
                                        >
                                            View
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            minHeight: '50vh'
                        }}
                    >
                        <Typography variant="h5" color="text.secondary" gutterBottom>
                            No recipes found
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => router.push('/recipes/new')}
                            sx={{ mt: 2 }}
                        >
                            Create Your First Recipe
                        </Button>
                    </Paper>
                )}
            </Container>

            <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={() => router.push('/recipes/new')}
                >
                    <AddIcon />
                </Fab>
            </Box>
        </Box>
    );
}