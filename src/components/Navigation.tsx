import { useRouter, usePathname } from 'next/navigation';
import {
    Box, Typography, Button,
    BottomNavigation, BottomNavigationAction, Paper,
    useMediaQuery, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from 'react';

// Updated navigation items to match requested order
const NAVIGATION_ITEMS = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/search', label: 'Search', icon: SearchIcon },
    { path: '/favorites', label: 'Favorites', icon: FavoriteIcon },
];

const NON_NAV_PATHS = ['/settings', '/login', '/signup'];

export default function Navigation({ onCreateRecipe }: { onCreateRecipe?: () => void }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { mode } = useThemeMode();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    // Use theme to detect screen size
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Check if we should show navigation on this page
    if (NON_NAV_PATHS.some(path => pathname?.startsWith(path))) {
        return null;
    }

    const handleLogoutClick = () => {
        setLogoutDialogOpen(true);
    };

    const handleLogoutConfirm = () => {
        setLogoutDialogOpen(false);
        logout();
    };

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    const isActive = (path: string) => {
        // Normalize paths by removing trailing slashes for comparison
        const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
        const normalizedPathname = pathname?.endsWith('/') ? pathname.slice(0, -1) : pathname;

        // Check for home path (both / and /home)
        if (normalizedPath === '/home') {
            return normalizedPathname === '/home' || normalizedPathname === '';
        }

        return normalizedPathname === normalizedPath;
    };

    // Navigate to profile with user ID as a query param
    const navigateToProfile = () => {
        if (user?.uid) {
            // Navigate to own profile
            router.push('/profile');
        } else {
            router.push('/profile');
        }
    };

    const navigateTo = (path: string) => {
        if (path === 'profile') {
            navigateToProfile();
        } else if (path === 'logout') {
            handleLogoutClick();
        } else {
            router.push(path);
        }
    };

    // Mobile bottom navigation
    if (isMobile) {
        return (
            <>
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1100,
                        borderTop: '1px solid',
                        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                    }}
                    elevation={3}
                >
                    <BottomNavigation
                        showLabels={false}
                        value={pathname === '/' ? '/home' : pathname}
                        sx={{
                            bgcolor: mode === 'light' ? 'background.paper' : 'background.paper',
                            height: 56,
                            '& .MuiBottomNavigationAction-root.Mui-selected': {
                                color: '#FF6A00',
                            },
                            '& .MuiBottomNavigationAction-root': {
                                flex: 1,
                                maxWidth: 'none',
                                position: 'relative',
                                minWidth: 0,
                            },
                            justifyContent: 'center',
                            maxWidth: '500px',
                            mx: 'auto',
                        }}
                    >
                        <BottomNavigationAction
                            icon={
                                <>
                                    <HomeIcon />
                                    {isActive('/home') && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '6px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                bgcolor: '#FF6A00',
                                            }}
                                        />
                                    )}
                                </>
                            }
                            value="/home"
                            onClick={() => navigateTo('/home')}
                        />
                        <BottomNavigationAction
                            icon={
                                <>
                                    <SearchIcon />
                                    {isActive('/search') && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '6px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                bgcolor: '#FF6A00',
                                            }}
                                        />
                                    )}
                                </>
                            }
                            value="/search"
                            onClick={() => navigateTo('/search')}
                        />
                        <BottomNavigationAction
                            icon={
                                <Box
                                    sx={{
                                        bgcolor: '#FF6A00',
                                        borderRadius: '50%',
                                        p: 1,
                                        transform: 'scale(1.2)',
                                        boxShadow: '0 2px 10px rgba(255, 106, 0, 0.4)'
                                    }}
                                >
                                    <AddBoxIcon sx={{ color: 'white' }} />
                                </Box>
                            }
                            onClick={onCreateRecipe}
                        />
                        <BottomNavigationAction
                            icon={
                                <>
                                    <AccountCircleIcon />
                                    {isActive('/profile') && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '6px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                bgcolor: '#FF6A00',
                                            }}
                                        />
                                    )}
                                </>
                            }
                            value="/profile"
                            onClick={() => navigateTo('profile')}
                        />
                        <BottomNavigationAction
                            icon={<ExitToAppIcon />}
                            onClick={() => navigateTo('logout')}
                        />
                    </BottomNavigation>
                </Paper>
                {/* Add padding at the bottom to prevent content from being hidden behind the navigation bar */}
                <Box sx={{ height: '56px' }} />

                {/* Logout confirmation dialog */}
                <Dialog
                    open={logoutDialogOpen}
                    onClose={handleLogoutCancel}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            width: 'calc(100% - 32px)',
                            maxWidth: '320px',
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 600 }}>
                        Confirm Logout
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to log out?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 1 }}>
                        <Button onClick={handleLogoutCancel}>Cancel</Button>
                        <Button
                            onClick={handleLogoutConfirm}
                            variant="contained"
                            color="primary"
                            sx={{
                                bgcolor: '#FF6A00',
                                '&:hover': { bgcolor: '#e65f00' }
                            }}
                        >
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    // Desktop sidebar navigation
    return (
        <>
            <Box
                component="nav"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    borderRight: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                    bgcolor: 'background.paper', // Uses theme background color
                    position: 'fixed',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // Center items horizontally
                }}
            >
                <Box sx={{
                    p: 3,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center' // Center the title
                }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 700,
                            color: '#FF6A00',
                            fontSize: '1.5rem',
                            mb: 4,
                            textAlign: 'center' // Center the text
                        }}
                    >
                        Recipe Feed
                    </Typography>
                </Box>

                <Box sx={{
                    px: 2,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%', // Full width for the buttons
                    maxWidth: '200px', // Limit buttons width
                    justifyContent: 'center' // Center buttons vertically
                }}>
                    {/* Home and Search buttons with simple color highlighting */}
                    {NAVIGATION_ITEMS.slice(0, 2).map((item) => (
                        <Button
                            key={item.path}
                            fullWidth
                            startIcon={<item.icon />}
                            onClick={() => router.push(item.path)}
                            sx={{
                                justifyContent: 'flex-start',
                                color: isActive(item.path) ? '#FF6A00' : 'text.primary',
                                bgcolor: isActive(item.path) ? 'rgba(255, 106, 0, 0.12)' : 'transparent',
                                py: 1.5,
                                mb: 1,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' },
                                // Don't change padding or add transform that might cause offset
                                ...(isActive(item.path) && {
                                    boxShadow: '0 1px 3px rgba(255, 106, 0, 0.2)',
                                    fontWeight: 500,
                                })
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}

                    {/* Create Recipe button */}
                    <Button
                        fullWidth
                        startIcon={<AddBoxIcon />}
                        onClick={onCreateRecipe}
                        sx={{
                            justifyContent: 'flex-start',
                            color: 'text.primary',
                            py: 1.5,
                            mb: 1,
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                        }}
                    >
                        Create Recipe
                    </Button>

                    {/* Profile button with simple color highlighting */}
                    <Button
                        fullWidth
                        startIcon={<AccountCircleIcon />}
                        onClick={() => navigateToProfile()}
                        sx={{
                            justifyContent: 'flex-start',
                            color: isActive('/profile') ? '#FF6A00' : 'text.primary',
                            bgcolor: isActive('/profile') ? 'rgba(255, 106, 0, 0.12)' : 'transparent',
                            py: 1.5,
                            mb: 1,
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' },
                            // Don't change padding or add transform that might cause offset
                            ...(isActive('/profile') && {
                                boxShadow: '0 1px 3px rgba(255, 106, 0, 0.2)',
                                fontWeight: 500,
                            })
                        }}
                    >
                        Profile
                    </Button>

                    {/* Logout button */}
                    <Button
                        fullWidth
                        startIcon={<ExitToAppIcon />}
                        onClick={handleLogoutClick}
                        sx={{
                            justifyContent: 'flex-start',
                            color: 'text.primary',
                            py: 1.5,
                            borderRadius: '8px',
                            '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                        }}
                    >
                        Logout
                    </Button>
                </Box>

                {/* Display user info at bottom */}
                {user && (
                    <Box sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center' // Center the username
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center' }}>
                            {user.displayName || user.username}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Logout confirmation dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxWidth: '320px',
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Logout
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to log out?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1 }}>
                    <Button onClick={handleLogoutCancel}>Cancel</Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="primary"
                        sx={{
                            bgcolor: '#FF6A00',
                            '&:hover': { bgcolor: '#e65f00' }
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}