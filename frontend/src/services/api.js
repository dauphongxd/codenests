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
    getSnippetUuidById: async (numericId) => {
        try {
            const response = await fetch(`${API_URL}/debug/snippet/${numericId}`, { // Changed endpoint to match backend debug controller if needed, otherwise use your actual endpoint
                credentials: 'include'
            });
            if (!response.ok) return null;
            const data = await response.json();
            // Assuming the debug endpoint returns a map with a 'uuid' key
            return data.uuid;
        } catch (error) {
            console.error('Error fetching snippet UUID:', error);
            return null;
        }
    },
    getUserSnippets: async () => {
        const response = await fetch(`${API_URL}/user/snippets`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },
    getLatest: async () => {
        const response = await fetch(`${API_URL}/code/latest`);
        return handleResponse(response);
    },
    getById: async (uuid, skipIncrement = false) => {
        const url = skipIncrement
            ? `${API_URL}/code/${uuid}?skipIncrement=true`
            : `${API_URL}/code/${uuid}`;
        const response = await fetch(url, { credentials: 'include' });
        return handleResponse(response);
    },
    create: async (snippetData) => {
        const payload = {
            title: snippetData.title || "Untitled Snippet",
            content: snippetData.content || snippetData.code,
            expirationType: snippetData.expirationType,
            expirationValue: snippetData.expirationValue,
            tags: snippetData.tags || []
        };
        const response = await fetch(`${API_URL}/code/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include'
        });
        return handleResponse(response);
    },
    register: async (userData) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        return response.ok;
    },
    updateProfile: async (profileData) => {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData),
            credentials: 'include'
        });
        return handleResponse(response);
    },
    getCurrentUser: async () => {
        const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (!response.ok) return null;
        return response.json();
    }
};

export const groupService = {
    getMyGroups: async () => {
        const response = await fetch(`${API_URL}/groups/my`, { credentials: 'include' });
        return handleResponse(response);
    },
    getGroupDetails: async (groupId) => {
        const response = await fetch(`${API_URL}/groups/${groupId}/members`, { credentials: 'include' });
        return handleResponse(response);
    },
    createGroup: async (groupData) => {
        const response = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData),
            credentials: 'include'
        });
        return handleResponse(response);
    },
    addMember: async (groupId, email) => {
        const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email }),
            credentials: 'include'
        });
        return handleResponse(response);
    },
    removeMember: async (groupId, userId) => {
        const response = await fetch(`${API_URL}/groups/${groupId}/members/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        return handleResponse(response);
    },
    // --- MOVED FUNCTIONS ---
    getGroupSnippets: async (groupId) => {
        const response = await fetch(`${API_URL}/groups/${groupId}/snippets`, {
            credentials: 'include'
        });
        return handleResponse(response);
    },
    shareSnippet: async (groupId, snippetUuid) => {
        const response = await fetch(`${API_URL}/groups/${groupId}/snippets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Change the key in the payload to snippetUuid
            body: JSON.stringify({ snippetUuid: snippetUuid }),
            credentials: 'include'
        });
        return handleResponse(response);
    }
};


// Message operations
export const messageService = {
    getInbox: async () => {
        const response = await fetch(`${API_URL}/messages/inbox`, { credentials: 'include' });
        return handleResponse(response);
    },
    getSent: async () => {
        const response = await fetch(`${API_URL}/messages/sent`, { credentials: 'include' });
        return handleResponse(response);
    },
    getConversation: async (userId) => {
        const response = await fetch(`${API_URL}/messages/conversation/${userId}`, { credentials: 'include' });
        return handleResponse(response);
    },
    sendMessage: async (messageData) => {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData),
            credentials: 'include'
        });
        return handleResponse(response);
    },
    processConversationMessages: async (messages) => {
        const processedMessages = [...messages];
        for (let i = 0; i < processedMessages.length; i++) {
            const message = processedMessages[i];
            if (message.snipId) {
                try {
                    const uuid = await snippetService.getSnippetUuidById(message.snipId);
                    if (uuid) {
                        message.snipUuid = uuid;
                    }
                } catch (err) {
                    console.error(`Failed to get UUID for snippet ID ${message.snipId}:`, err);
                }
            }
        }
        return processedMessages;
    }
};

