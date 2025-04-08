// Base API handling
const API_URL = '/api';

// Helper for handling API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');

        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || 'API request failed');
        } catch (e) {
            throw new Error(errorText || 'API request failed');
        }
    }

    return response.json();
};

// Snippet operations
export const snippetService = {
    getLatest: async () => {
        const response = await fetch(`${API_URL}/code/latest`);
        return handleResponse(response);
    },

    getById: async (uuid, skipIncrement = false) => {
        // Add a query parameter to skip incrementing the view count if needed
        const url = skipIncrement
            ? `${API_URL}/code/${uuid}?skipIncrement=true`
            : `${API_URL}/code/${uuid}`;

        const response = await fetch(url, {
            credentials: 'include'
        });

        return handleResponse(response);
    },

    create: async (snippetData) => {
        // Get the current user from auth context
        const userResponse = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });

        let authorName = null;
        if (userResponse.ok) {
            const userData = await userResponse.json();
            authorName = userData.name;
        }

        const response = await fetch(`${API_URL}/code/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: snippetData.code,
                time_restriction: (Number(snippetData.timeLimit) || 0) * 60, // Convert minutes to seconds
                view_restriction: Number(snippetData.viewLimit) || 0,
                authorName: authorName
            }),
            credentials: 'include'
        });

        return handleResponse(response);
    }
};

// Authentication operations
export const authService = {
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include'
        });

        return handleResponse(response);
    },

    register: async (userData) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include'
        });

        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            return false;
        }

        return true;
    },

    getCurrentUser: async () => {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
    }
};