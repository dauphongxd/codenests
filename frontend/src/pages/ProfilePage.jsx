import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

const ProfilePage = () => {
    const { currentUser, setUser } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        personal: '',
        github: '',
        linkedin: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            setFormData({
                username: currentUser.username || '',
                email: currentUser.email || '',
                personal: currentUser.personal || '',
                github: currentUser.github || '',
                linkedin: currentUser.linkedin || ''
            });
        }
    }, [currentUser]); // Re-run when currentUser changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Call the actual updateProfile service
            const result = await authService.updateProfile(formData);

            if (result.success) {
                setSuccess(result.message || 'Profile updated successfully!');
                // Update the user context if backend sends back updated user data
                if (result.user) {
                    // Map backend UserResponse fields to AuthContext fields if necessary
                    // Assuming AuthContext expects { uuid, username, email, personal, github, linkedin }
                    // And UserResponse has these fields.
                    setUser(result.user);
                }
                // Optionally clear success message after a delay
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.message || 'Failed to update profile');
            }

        } catch (error) {
            console.error("Profile update error:", error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // If currentUser is null while AuthContext is loading, show loading or placeholder
    if (!currentUser && useAuth().loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }
    if (!currentUser) {
        return <div className="text-center p-10 text-red-500">Could not load user data. Please log in again.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto">
                {/* ... Back button and Title ... */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-primary hover:text-white mr-4"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                </div>


                <div className="card">
                    <div className="card-body">
                        {/* ... Error and Success Messages ... */}
                        {error && (
                            <div className="bg-red-900/20 border border-red-700/50 text-red-200 rounded-lg p-4 mb-6 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-900/20 border border-green-700/50 text-green-200 rounded-lg p-4 mb-6 text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Form fields using formData state */}
                            <div className="mb-6">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text" id="username" name="username"
                                    value={formData.username} onChange={handleChange}
                                    className="input-field" disabled={isLoading} required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email" id="email" name="email"
                                    value={formData.email} onChange={handleChange}
                                    className="input-field" disabled={isLoading} required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="personal" className="block text-sm font-medium text-gray-400 mb-2">
                                    Personal Website
                                </label>
                                <input
                                    type="url" id="personal" name="personal"
                                    value={formData.personal} onChange={handleChange}
                                    className="input-field" placeholder="https://example.com" disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="github" className="block text-sm font-medium text-gray-400 mb-2">
                                    GitHub Profile
                                </label>
                                <input
                                    type="url" id="github" name="github"
                                    value={formData.github} onChange={handleChange}
                                    className="input-field" placeholder="https://github.com/username" disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-400 mb-2">
                                    LinkedIn Profile
                                </label>
                                <input
                                    type="url" id="linkedin" name="linkedin"
                                    value={formData.linkedin} onChange={handleChange}
                                    className="input-field" placeholder="https://linkedin.com/in/username" disabled={isLoading}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" disabled={isLoading} className="btn-primary">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;