// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { errorHandler } from '@/helper/helper';
import { auth } from '@/config/firebase'; // Import from config file
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

// Session timeout in milliseconds (1 hour to match backend cookie)
const SESSION_TIMEOUT = 3600000; // 1 hour

// Local storage keys for better organization
const STORAGE_KEYS = {
    AUTH_TOKEN: 'recipePlatform_authToken',
    USER_DATA: 'recipePlatform_userData',
    LAST_ACTIVITY: 'recipePlatform_lastActivity',
    SESSION_EXPIRY: 'recipePlatform_sessionExpiry'
};

interface AuthProviderProps {
    children: ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const updateLastActivity = () => {
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    };

    // Helper function to determine if input is an email
    const isEmail = (input: string): boolean => {
        return /\S+@\S+\.\S+/.test(input);
    };

    // API request helper with auth token
    const authFetch = async (endpoint: string, options: RequestInit = {}) => {
        return fetch(`${apiUrl}${endpoint}`, {
            ...options,
            credentials: 'include', // Send cookies with the request
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    };

    // Check if session is valid
    const checkSession = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return false;

            const idToken = await currentUser.getIdToken();
            const response = await fetch(`${apiUrl}/auth/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Session invalid');
            }

            const data = await response.json();
            setUser(data.user);

            // Update session expiry time
            const expiryTime = Date.now() + SESSION_TIMEOUT;
            localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, expiryTime.toString());

            return true;
        } catch (error) {
            console.error('Session check failed:', error);
            return false;
        }
    };

    // Check authentication status
    const checkAuthStatus = async () => {
        setIsLoading(true);

        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            const sessionValid = await checkSession();
            if (!sessionValid) {
                await handleLogout();
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
        setIsLoading(true);
        try {
            let userCredential: UserCredential;

            if (isEmail(usernameOrEmail)) {
                userCredential = await signInWithEmailAndPassword(auth, usernameOrEmail, password);
            } else {
                const response = await fetch(`${apiUrl}/users/by-username`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameOrEmail })
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
            updateLastActivity();

            router.replace("/home"); // Use replace instead of push
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
                    password,
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
            router.push("/home"); // or "/onboarding" if you have that route
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

    // Handle logout (internal function)
    const handleLogout = async () => {
        try {
            await signOut(auth);
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            localStorage.clear(); // Clear all storage to be safe
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Public logout function
    const logout = () => {
        handleLogout();
        router.replace("/login"); // Use replace instead of push
    };

    // Initialize auth check and keep it updated
    useEffect(() => {
        let authStateUnsubscribe = () => { };

        const setupAuthListener = () => {
            authStateUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
                if (firebaseUser) {
                    await checkAuthStatus();
                } else {
                    setUser(null);
                    setIsLoading(false);
                }
            });
        };

        setupAuthListener();
        return () => authStateUnsubscribe();
    }, []);

    // Set up activity tracking to update last activity time
    useEffect(() => {
        if (!user) return;

        const handleActivity = () => {
            updateLastActivity();
        };

        // Add event listeners for user activity
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('touchstart', handleActivity);
        window.addEventListener('scroll', handleActivity);

        // Check session validity every minute
        const intervalId = setInterval(async () => {
            const sessionExpiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
            const currentTime = Date.now();

            // If session is about to expire in 5 minutes or has expired, check session
            if (sessionExpiry && (currentTime + 300000 > parseInt(sessionExpiry))) {
                const isValid = await checkSession();
                if (!isValid) {
                    console.log('Session expired, logging out');
                    logout();
                }
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