import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, Button, Avatar, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from 'react';

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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Check if we should show navigation on this page
    if (NON_NAV_PATHS.some(path => pathname?.startsWith(path))) {
        return null;
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <Box
            component="nav"
            sx={{
                width: 240,
                flexShrink: 0,
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                bgcolor: 'white',
                position: 'fixed',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box sx={{ p: 3 }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        fontWeight: 700,
                        color: '#FF6A00',
                        fontSize: '1.5rem',
                        mb: 4
                    }}
                >
                    Recipe Feed
                </Typography>
            </Box>

            <Box sx={{ px: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {NAVIGATION_ITEMS.map((item) => (
                    <Button
                        key={item.path}
                        fullWidth
                        startIcon={<item.icon />}
                        onClick={() => router.push(item.path)}
                        sx={{
                            justifyContent: 'flex-start',
                            color: (pathname === item.path || (item.path === '/home' && pathname === '/')) ? '#FF6A00' : 'text.primary',
                            bgcolor: (pathname === item.path || (item.path === '/home' && pathname === '/')) ? 'rgba(255, 106, 0, 0.08)' : 'transparent',
                            py: 1.5,
                            mb: 1,
                            '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                        }}
                    >
                        {item.label}
                    </Button>
                ))}
                <Button
                    fullWidth
                    startIcon={<AddBoxIcon />}
                    onClick={onCreateRecipe}
                    sx={{
                        justifyContent: 'flex-start',
                        color: 'text.primary',
                        py: 1.5,
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                    }}
                >
                    Create Recipe
                </Button>
            </Box>

            {user && (
                <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <Button
                        fullWidth
                        onClick={handleMenuOpen}
                        sx={{
                            justifyContent: 'flex-start',
                            color: pathname === '/profile' ? '#FF6A00' : 'text.primary',
                            bgcolor: pathname === '/profile' ? 'rgba(255, 106, 0, 0.08)' : 'transparent',
                            py: 1.5,
                            '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                        }}
                    >
                        <Avatar
                            src={user.profileImage}
                            alt={user.displayName}
                            sx={{ width: 32, height: 32, mr: 2 }}
                        >
                            <AccountCircleIcon />
                        </Avatar>
                        <Typography variant="body2">{user.displayName || user.username}</Typography>
                    </Button>
                </Box>
            )}

            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 2,
                    sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: 180,
                    }
                }}
            >
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        router.push('/profile');
                    }}
                    sx={{
                        py: 1.5,
                        gap: 1.5,
                        '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                    }}
                >
                    <AccountCircleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    Profile
                </MenuItem>
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        py: 1.5,
                        gap: 1.5,
                        '&:hover': { bgcolor: 'rgba(255, 106, 0, 0.08)' }
                    }}
                >
                    <ExitToAppIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    Sign Out
                </MenuItem>
            </Menu>
        </Box>
    );
}