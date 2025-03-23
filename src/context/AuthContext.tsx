// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { errorHandler } from '@/helper/helper';

// Expanded user interface for a recipe sharing platform
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
    login: (email: string, password: string) => Promise<void>;
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

            // Validate token with backend (optional but recommended)
            try {
                const response = await authFetch('/auth/me');
                if (!response.ok) {
                    throw new Error('Invalid token');
                }
                // Update user data from backend
                const freshUserData = await response.json();
                setUser(freshUserData);
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(freshUserData));
            } catch (error) {
                errorHandler(error, "checkAuthStatus", "Invalid Token")
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

    // Handle login
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Login failed");
            }

            const data = await response.json();

            const user: User = {
                uid: data.localId,
                displayName: data.displayName || email.split('@')[0],
                email: data.email,
                username: data.username || email.split('@')[0],
                profileImage: data.profileImage,
                bio: data.bio,
                followersCount: data.followersCount || 0,
                followingCount: data.followingCount || 0,
                recipesCount: data.recipesCount || 0
            };

            // Store auth data in localStorage
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.idToken);
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
            const displayName = `${firstName} ${lastName}`;

            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    displayName,
                    firstName,
                    lastName
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Signup failed");
            }

            const data = await response.json();

            const newUser: User = {
                uid: data.localId || data.uid,
                displayName: data.displayName || displayName,
                email: data.email,
                username: data.username || username,
                profileImage: data.profileImage,
                bio: data.bio || '',
                followersCount: 0,
                followingCount: 0,
                recipesCount: 0
            };

            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));

            if (data.idToken) {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.idToken);
            }

            setUser(newUser);
            updateLastActivity();
            router.push("/onboarding");
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