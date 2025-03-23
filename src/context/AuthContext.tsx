// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { errorHandler } from '@/helper/helper';
import { auth }  from '@/config/firebase'; // Import from config file
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    UserCredential
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
    logout: () => void;
    updateProfile: (profileData: Partial<User>) => Promise<void>;
    checkAuthStatus: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (1 hour for longer browsing sessions)
const SESSION_TIMEOUT = 60 * 60 * 1000;

// Local storage keys for better organization
const STORAGE_KEYS = {
    AUTH_TOKEN: 'recipePlatform_authToken',
    USER_DATA: 'recipePlatform_userData',
    LAST_ACTIVITY: 'recipePlatform_lastActivity'
};

interface AuthProviderProps {
    children: ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Session management functions
    const isSessionExpired = (): boolean => {
        const lastActivityTime = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        if (!lastActivityTime) return true;

        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - parseInt(lastActivityTime, 10);

        return timeSinceLastActivity > SESSION_TIMEOUT;
    };

    const updateLastActivity = () => {
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    };

    // Helper function to determine if input is an email
    const isEmail = (input: string): boolean => {
        return /\S+@\S+\.\S+/.test(input);
    };

    // API request helper with auth token
    const authFetch = async (endpoint: string, options: RequestInit = {}) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        return fetch(`${apiUrl}${endpoint}`, {
            ...options,
            headers
        });
    };

    // Check authentication status
    const checkAuthStatus = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

            if (!token || !userData || isSessionExpired()) {
                handleLogout();
                return;
            }

            // Validate token with backend 
            try {
                const response = await authFetch('/me');
                if (!response.ok) {
                    throw new Error('Invalid token');
                }
                // Update user data from backend
                const data = await response.json();

                const freshUserData: User = {
                    uid: data.user.uid,
                    displayName: data.user.displayName,
                    email: data.user.email,
                    username: data.user.username || data.user.email.split('@')[0],
                    profileImage: data.user.profileImage,
                    bio: data.user.bio || '',
                    followersCount: data.user.followersCount || 0,
                    followingCount: data.user.followingCount || 0,
                    recipesCount: data.user.recipesCount || 0
                };

                setUser(freshUserData);
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(freshUserData));
            } catch (error) {
                errorHandler(error, "checkAuthStatus", "Invalid Token");
                // If token validation fails, fallback to stored user data
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            }

            updateLastActivity();
        } catch (error) {
            errorHandler(error, "checkAuthStatus", "AuthContext");
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    // Handle login with username or email
    const login = async (usernameOrEmail: string, password: string) => {
        setIsLoading(true);
        try {
            let userCredential: UserCredential;

            // If this is an email, use Firebase auth directly
            if (isEmail(usernameOrEmail)) {
                userCredential = await signInWithEmailAndPassword(auth, usernameOrEmail, password);
            } else {
                // If it's a username, we need to get the email from the backend
                const response = await fetch(`${apiUrl}/users/by-username`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameOrEmail })
                });

                if (!response.ok) {
                    throw new Error('Invalid username or password');
                }

                const data = await response.json();
                // Now use the email with Firebase Auth
                userCredential = await signInWithEmailAndPassword(auth, data.email, password);
            }

            // Get ID token
            const idToken = await userCredential.user.getIdToken();

            // Store token
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, idToken);

            // Fetch user details from backend
            const response = await fetch(`${apiUrl}/me`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const userData = await response.json();

            const user: User = {
                uid: userData.user.uid,
                displayName: userData.user.displayName || userCredential.user.email?.split('@')[0] || '',
                email: userData.user.email,
                username: userData.user.username || userData.user.email.split('@')[0],
                profileImage: userData.user.profileImage,
                bio: userData.user.bio || '',
                followersCount: userData.user.followersCount || 0,
                followingCount: userData.user.followingCount || 0,
                recipesCount: userData.user.recipesCount || 0
            };

            // Store user data
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
            updateLastActivity();

            setUser(user);
            router.push("/dashboard");
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
        setIsLoading(true);
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Get ID token
            const idToken = await firebaseUser.getIdToken();

            // Store token temporarily
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, idToken);

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
                })
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

            // const data = await response.json();

            const newUser: User = {
                uid: firebaseUser.uid,
                displayName: displayName,
                email: email,
                username: username,
                profileImage: '',
                bio: '',
                followersCount: 0,
                followingCount: 0,
                recipesCount: 0
            };

            // Store user data
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
            updateLastActivity();

            setUser(newUser);
            router.push("/dashboard"); // or "/onboarding" if you have that route
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
            const updatedUser = { ...user, ...updatedData };
            setUser(updatedUser);

            // Update localStorage
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
            updateLastActivity();

            return updatedUser;
        } catch (error) {
            errorHandler(error, "updateProfile", "AuthContext");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        // Sign out from Firebase
        signOut(auth).catch(error => {
            console.error('Error signing out from Firebase:', error);
        });

        // Clear local storage
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);

        setUser(null);
    };

    const logout = () => {
        handleLogout();
        router.push('/login');
    };

    // Initialize auth status check
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Set up activity tracking to update last activity time
    useEffect(() => {
        if (!user) return;

        const handleActivity = () => updateLastActivity();

        // Add event listeners for user activity
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('touchstart', handleActivity);
        window.addEventListener('scroll', handleActivity);

        // Session expiration check
        const intervalId = setInterval(() => {
            if (user && isSessionExpired()) {
                console.log('Session expired, logging out');
                logout();
            }
        }, 60000); // Check every minute

        return () => {
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            clearInterval(intervalId);
        };
    }, [user]);

    // Provide the context value
    const contextValue: AuthContextType = {
        user,
        isLoading,
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