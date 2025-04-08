import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Existing code for initial auth check
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData); // 👈 This now uses the full user object
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };
        checkLoginStatus();
    }, []);

    // Modified login function
    const loginUser = async (email, password, remember) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                // Fetch complete user data after login
                const userResponse = await fetch('/api/auth/me', {
                    credentials: 'include'
                });
                const userData = await userResponse.json();
                setCurrentUser(userData); // 👈 Set full user object
                return { success: true };
            }
            return { success: false, message: data.message || 'Login failed' };
        } catch (error) {
            return { success: false, message: 'An error occurred' };
        }
    };

    // Add this new function to update user state
    const setUser = (userData) => {
        setCurrentUser({
            uuid: userData.uuid,
            name: userData.name,
            email: userData.email
        });
    };

    const logoutUser = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            setCurrentUser(null);
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login: loginUser, // 👈 Renamed function
        logout: logoutUser,
        setUser // 👈 Expose the setter
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};