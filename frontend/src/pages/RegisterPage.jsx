import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext";
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Stack, // Use Stack for layout
    Link as MuiLink, // For the login link
    useTheme
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'; // Optional icon

const RegisterPage = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [formData, setFormData] = useState({
        username: '', // Changed from 'name' to 'username' to match backend User model
        email: '',
        password: '',
        personal: '',
        github: '',
        linkedin: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Consistent card styles (same as LoginPage)
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
        maxWidth: 500, // Slightly wider for more fields
        mx: 'auto',
    };
    const cardHeaderStyle = {
        p: 3,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        textAlign: 'center',
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // --- Ensure 'username' is sent, not 'name' ---
        const payload = {
            username: formData.username, // Use username
            email: formData.email,
            password: formData.password,
            personal: formData.personal,
            github: formData.github,
            linkedin: formData.linkedin,
        };
        // ---

        try {
            const data = await authService.register(payload); // Send payload with 'username'

            if (data.success) {
                // Set user context after successful registration
                setUser({
                    uuid: data.uuid,
                    username: data.username, // Use username from response
                    email: data.email,
                    // Include other fields if backend sends them back
                });
                navigate('/dashboard'); // Redirect to dashboard
            } else {
                setError(data.message || 'Registration failed. Please check your input.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, zIndex: 5, position: 'relative' }}>
            <Paper elevation={0} sx={cardStyle}>
                <Box sx={cardHeaderStyle}>
                    <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
                        Create Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Join CodeNest to start sharing code securely.
                    </Typography>
                </Box>

                <Box p={3}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={3}> {/* Use Stack for vertical spacing */}
                            <TextField
                                label="Username"
                                name="username" // Ensure name matches state key
                                fullWidth
                                required
                                variant="outlined"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Choose a username"
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                fullWidth
                                required
                                variant="outlined"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="you@example.com"
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                fullWidth
                                required
                                variant="outlined"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Create a secure password"
                            />

                            <TextField
                                label="Personal Website (Optional)"
                                name="personal"
                                type="url"
                                fullWidth
                                variant="outlined"
                                value={formData.personal}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="https://yourwebsite.com"
                            />
                            <TextField
                                label="GitHub Profile (Optional)"
                                name="github"
                                type="url"
                                fullWidth
                                variant="outlined"
                                value={formData.github}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="https://github.com/yourusername"
                            />
                            <TextField
                                label="LinkedIn Profile (Optional)"
                                name="linkedin"
                                type="url"
                                fullWidth
                                variant="outlined"
                                value={formData.linkedin}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="https://linkedin.com/in/yourusername"
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isLoading}
                                size="large"
                                startIcon={isLoading ? null : <PersonAddIcon />}
                                sx={{ py: 1.5 }} // Make button slightly larger
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                Already have an account?{' '}
                                <MuiLink component={Link} to="/login" fontWeight="medium" color="primary.main">
                                    Sign In
                                </MuiLink>
                            </Typography>
                        </Stack>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;