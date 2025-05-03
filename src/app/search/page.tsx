'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Paper,
    InputAdornment,
    Pagination,
    Tabs,
    Tab,
    Avatar,
    Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RecipeDialog from '@/components/RecipeDialog';
import { Recipe, searchRecipes, searchUsers } from '@/services/api';
import { errorHandler } from '@/helper/helper';

// Interface for User search results
interface User {
    id: string;
    username: string;
    displayName: string;
    profileImage?: string;
    bio?: string;
}

// Define the different search types
type SearchType = 'recipes' | 'users';

export default function Search() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Search state
    const [query, setQuery] = useState((searchParams?.get('query')) || '');
    const [searchType, setSearchType] = useState<SearchType>((searchParams?.get('type') as SearchType) || 'recipes');
    const [hasSearched, setHasSearched] = useState(false);

    // Results state
    const [recipeResults, setRecipeResults] = useState<Recipe[]>([]);
    const [userResults, setUserResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isDialogClosing, setIsDialogClosing] = useState(false);

    // Pagination state
    const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1', 10));
    const [totalResults, setTotalResults] = useState(0);

    // Calculate total pages based on total results (assuming 9 items per page)
    const totalPages = Math.max(1, Math.ceil(totalResults / 9));

    // Handle tab change
    const handleTabChange = (_event: React.SyntheticEvent, newValue: SearchType) => {
        // Update search type first
        setSearchType(newValue);

        // Update URL with the new search type
        updateUrl({ type: newValue });

        // Only perform search if user has already searched before
        if (query && hasSearched) {
            // Create a new search function that uses the new tab value directly
            // instead of relying on the state which might not be updated yet
            const performTabSearch = async () => {
                setLoading(true);
                setError('');

                try {
                    if (newValue === 'recipes') {
                        // Search for recipes with current query
                        const response = await searchRecipes({ query });

                        if (response.success) {
                            setRecipeResults(response.recipes || []);
                            setTotalResults(response.count || 0);
                        } else {
                            setError('Failed to search recipes. Please try again.');
                            setRecipeResults([]);
                        }
                    } else {
                        // Search for users with current query
                        const response = await searchUsers({ query });

                        if (response.success) {
                            setUserResults(response.users || []);
                            setTotalResults(response.count || 0);
                        } else {
                            setError('Failed to search users. Please try again.');
                            setUserResults([]);
                        }
                    }
                } catch (err) {
                    errorHandler(err, 'performTabSearch', 'Search');
                    setError(`Failed to search ${newValue}. Please try again.`);
                } finally {
                    setLoading(false);
                }
            };

            // Execute the search with new tab value
            performTabSearch();
        }
    };

    // Update URL when search params change
    const updateUrl = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams?.toString() || '');

        // Update params
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset page when search parameters change (except when page is explicitly set)
        if (!('page' in newParams) && page !== 1) {
            params.set('page', '1');
            setPage(1);
        }

        // Build the URL and navigate
        const newUrl = `/search?${params.toString()}`;
        router.push(newUrl, { scroll: false });
    };

    // Handle pagination change
    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);

        // Update URL
        updateUrl({ page: value.toString() });
    };

    // Perform the search with current parameters
    const performSearch = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // Skip search if query is empty but don't show an error
            if (!query) {
                setLoading(false);
                return;
            }

            if (searchType === 'recipes') {
                // Search for recipes
                const response = await searchRecipes({
                    query: query
                });

                if (response.success) {
                    setRecipeResults(response.recipes || []);
                    setTotalResults(response.count || 0);
                } else {
                    setError('Failed to search recipes. Please try again.');
                    setRecipeResults([]);
                }
            } else {
                // Search for users
                const response = await searchUsers({
                    query: query
                });

                if (response.success) {
                    setUserResults(response.users || []);
                    setTotalResults(response.count || 0);
                } else {
                    setError('Failed to search users. Please try again.');
                    setUserResults([]);
                }
            }

            // Set page to 1 when performing a new search
            if (page !== 1) {
                setPage(1);
            }

            // Mark that user has performed a search
            setHasSearched(true);
        } catch (err) {
            errorHandler(err, 'performSearch', 'Search');
            setError(`Failed to search ${searchType}. Please try again.`);
            if (searchType === 'recipes') {
                setRecipeResults([]);
            } else {
                setUserResults([]);
            }
        } finally {
            setLoading(false);
        }
    }, [query, searchType, page]);

    // Handle search text change
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        // If user clears the search box, hide results
        if (!newQuery) {
            setHasSearched(false);
            setRecipeResults([]);
            setUserResults([]);
        }
    };

    // Form submission handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Update URL with search query
        updateUrl({ query: query || null, page: '1' });

        // Execute search only if there's a query
        if (query) {
            performSearch();
        }
    };

    // Handle dialog close with animation timing
    const handleCloseDialog = () => {
        setIsDialogClosing(true);
        // Wait for dialog close animation to complete before clearing the recipe
        setTimeout(() => {
            setSelectedRecipe(null);
            setIsDialogClosing(false);
        }, 300); // 300ms matches the typical MUI dialog transition
    };

    // Run search only on initial page load if there's a query in the URL
    useEffect(() => {
        // Only run on component mount (not on every query change)
        const initialQuery = searchParams?.get('query');
        if (initialQuery) {
            performSearch();
            setHasSearched(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount, performSearch is covered by ref

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Search
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Search"
                                placeholder={"Search"}
                                value={query}
                                onChange={handleQueryChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading || !query}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Search'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Only show tabs when there's a search query */}
            <Collapse in={!!query && hasSearched}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={searchType}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                        aria-label="search tabs"
                    >
                        <Tab value="recipes" label="Recipes" />
                        <Tab value="users" label="Users" />
                    </Tabs>
                </Box>

                {error && (
                    <Typography color="error" sx={{ my: 2 }}>
                        {error}
                    </Typography>
                )}

                {/* Show recipe results only when on the recipes tab */}
                {!loading && recipeResults?.length > 0 && searchType === 'recipes' && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Found {totalResults} recipes
                        </Typography>

                        <Grid container spacing={3}>
                            {recipeResults?.map((recipe) => (
                                <Grid item key={recipe?.id} xs={12} sm={6} md={4}>
                                    <Paper
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                            },
                                        }}
                                        onClick={() => setSelectedRecipe(recipe)}
                                    >
                                        <Box
                                            sx={{
                                                height: 200,
                                                width: '100%',
                                                bgcolor: recipe.imageUrl ? 'transparent' : 'rgba(0,0,0,0.1)',
                                                backgroundImage: recipe.imageUrl ? `url(${recipe.imageUrl})` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        />
                                        <Box sx={{ p: 2, flexGrow: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {recipe?.title}
                                            </Typography>
                                            {recipe?.cuisine && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                    {recipe.cuisine} Cuisine
                                                </Typography>
                                            )}
                                            <Typography noWrap color="text.secondary">
                                                {recipe?.description || 'No description available'}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {!loading && userResults?.length > 0 && searchType === 'users' && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Found {totalResults} users
                        </Typography>

                        <Grid container spacing={2}>
                            {userResults.map((user) => (
                                <Grid item key={user.id} xs={12} sm={6} md={4}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                            },
                                        }}
                                        onClick={() => router.push(`/profile?userId=${user.id}`)}
                                    >
                                        <Avatar
                                            src={user.profileImage || ''}
                                            alt={user.displayName || user.username}
                                            sx={{ width: 56, height: 56, mr: 2 }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                {user.displayName || user.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                @{user.username}
                                            </Typography>
                                            {user.bio && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mt: 0.5, maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                >
                                                    {user.bio}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {/* Single empty state message for both search types */}
                {!loading && ((searchType === 'recipes' && recipeResults.length === 0) ||
                    (searchType === 'users' && userResults.length === 0)) &&
                    !error && query && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                                border: '1px dashed rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                No {searchType} found matching your search criteria
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your search terms or filters
                            </Typography>
                        </Paper>
                    )}
            </Collapse>

            {/* Message when no search has been performed yet */}
            {!hasSearched && !loading && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        border: '1px dashed rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        Enter a search term and click Search
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Find recipes or users by typing in the search box above
                    </Typography>
                </Paper>
            )}

            <RecipeDialog
                open={!!selectedRecipe && !isDialogClosing}
                onClose={handleCloseDialog}
                recipe={selectedRecipe}
            />
        </Container>
    );
}