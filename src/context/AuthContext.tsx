// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { errorHandler } from '@/helper/helper';
import { auth, useFirebaseAuth } from '@/config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    UserCredential,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';

// User interface for a recipe sharing platform
interface User {
    uid: string;
    displayName: string;
    email: string;
    username: string;
    profileImage?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    recipesCount?: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signUp: (email: string, password: string, username: string, firstName: string, lastName: string) => Promise<void>;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    checkAuthStatus: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
    const router = useRouter();

    // Helper function to determine if input is an email
    const isEmail = (input: string): boolean => {
        return /\S+@\S+\.\S+/.test(input);
    };

    // API request helper with auth token
    const authFetch = async (endpoint: string, options: RequestInit = {}) => {
        // Ensure we have the latest token for each request
        let headers = { ...options.headers };

        if (auth?.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken(true);
                headers = {
                    ...headers,
                    'Authorization': `Bearer ${token}`
                };
            } catch (error) {
                console.error('Failed to get auth token:', error);
            }
        }

        return fetch(`${apiUrl}${endpoint}`, {
            ...options,
            credentials: 'include', // Send cookies with the request
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });
    };

    // Check if session is valid and get user data
    const fetchUserData = async () => {
        try {
            if (!auth?.currentUser) return null;

            const idToken = await auth.currentUser.getIdToken(true);

            const response = await fetch(`${apiUrl}/auth/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Session invalid or expired');
            }

            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            return null;
        }
    };

    // Sync Firebase auth state with our user state
    useEffect(() => {
        const syncUserState = async () => {
            if (firebaseLoading) return;

            if (firebaseUser) {
                try {
                    const userData = await fetchUserData();

                    if (userData) {
                        setUser(userData);
                    } else {
                        // We have a Firebase user but couldn't get user data
                        // This could mean the session has expired on backend
                        await handleLogout();
                    }
                } catch (error) {
                    errorHandler(error, "syncUserState", "AuthContext");
                    await handleLogout();
                }
            } else {
                setUser(null);
            }

            setIsLoading(false);
        };

        syncUserState();
    }, [firebaseUser, firebaseLoading]);

    // Check authentication status
    const checkAuthStatus = async () => {
        if (!auth) return;

        setIsLoading(true);
        try {
            if (auth.currentUser) {
                const userData = await fetchUserData();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            errorHandler(error, "checkAuthStatus", "AuthContext");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle login with username or email
    const login = async (usernameOrEmail: string, password: string) => {
        if (!auth) {
            throw new Error('Firebase auth not initialized');
        }

        setIsLoading(true);
        try {
            // Set persistence to LOCAL to persist across sessions
            await setPersistence(auth, browserLocalPersistence);

            let userCredential: UserCredential;

            if (isEmail(usernameOrEmail)) {
                userCredential = await signInWithEmailAndPassword(auth, usernameOrEmail, password);
            } else {
                const response = await fetch(`${apiUrl}/users/by-username`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameOrEmail }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Invalid username or password');
                }

                const data = await response.json();
                userCredential = await signInWithEmailAndPassword(auth, data.email, password);
            }

            const idToken = await userCredential.user.getIdToken();

            const sessionResponse = await fetch(`${apiUrl}/auth/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
                credentials: 'include'
            });

            if (!sessionResponse.ok) {
                throw new Error('Failed to establish session');
            }

            const userData = await sessionResponse.json();
            setUser(userData.user);

            // Navigate using router.push with a slight delay to allow state updates
            setTimeout(() => {
                router.push("/home");
            }, 100);
        } catch (error) {
            errorHandler(error, "login", "AuthContext");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user registration
    const signUp = async (
        email: string,
        password: string,
        username: string,
        firstName: string,
        lastName: string
    ) => {
        if (!auth) {
            throw new Error('Firebase auth not initialized');
        }

        setIsLoading(true);
        try {
            // Set persistence to LOCAL
            await setPersistence(auth, browserLocalPersistence);

            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Get ID token
            const idToken = await firebaseUser.getIdToken();

            // Create user profile in your backend
            const displayName = `${firstName} ${lastName}`.trim();

            const response = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    email,
                    username,
                    firstName,
                    lastName,
                    displayName
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                // If backend creation fails, delete the Firebase user
                try {
                    await firebaseUser.delete();
                } catch (deleteError) {
                    console.error('Error deleting Firebase user after failed signup:', deleteError);
                }

                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create user profile');
            }

            const data = await response.json();

            const newUser: User = {
                uid: firebaseUser.uid,
                displayName: displayName,
                email: email,
                username: username,
                profileImage: '',
                bio: '',
                followersCount: 0,
                followingCount: 0,
                recipesCount: 0,
                ...data.user
            };

            setUser(newUser);

            // Navigate with a slight delay
            setTimeout(() => {
                router.push("/home");
            }, 100);
        } catch (error) {
            errorHandler(error, "signUp", "AuthContext");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Update user profile
    const updateProfile = async (profileData: Partial<User>) => {
        setIsLoading(true);
        try {
            const response = await authFetch('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Profile update failed");
            }

            const updatedData = await response.json();

            // Update local user state with new data
            const updatedUser = { ...user, ...updatedData.user };
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            errorHandler(error, "updateProfile", "AuthContext");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Handle logout (internal function)
    const handleLogout = async () => {
        try {
            if (auth) {
                await signOut(auth);
            }

            // Also call the backend logout endpoint
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
            // Still clear the user state even if logout fails
            setUser(null);
        }
    };

    // Public logout function
    const logout = async () => {
        await handleLogout();
        router.push("/login");
    };

    // Keep session alive
    useEffect(() => {
        if (!user) return;

        const refreshTokenInterval = setInterval(async () => {
            try {
                // Refresh token and session
                if (auth?.currentUser) {
                    const token = await auth.currentUser.getIdToken(true);
                    await fetch(`${apiUrl}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken: token }),
                        credentials: 'include'
                    });
                }
            } catch (error) {
                console.error('Failed to refresh token:', error);
            }
        }, 10 * 60 * 1000); // Every 10 minutes

        return () => clearInterval(refreshTokenInterval);
    }, [user]);

    // Provide the context value
    const contextValue: AuthContextType = {
        user,
        isLoading: isLoading || firebaseLoading,
        isAuthenticated: !!user,
        signUp,
        login,
        logout,
        updateProfile,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};