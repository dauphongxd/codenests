import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Alert,
    Stack, // Use Stack for layout
    Link as MuiLink, // For the register link
    useTheme
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material'; // Optional icon

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    // Consistent card styles
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
        maxWidth: 450, // Max width for the form card
        mx: 'auto', // Center the card
    };
    const cardHeaderStyle = {
        p: 3, // Adjust padding
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        textAlign: 'center',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(email, password, remember); // login comes from useAuth

            if (result.success) {
                navigate('/dashboard'); // Redirect to dashboard after login
            } else {
                setError(result.message || 'Login failed. Please check your credentials.');
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
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter your credentials to access your account.
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
                                label="Email"
                                type="email"
                                fullWidth
                                required
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                placeholder="you@example.com"
                            />

                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                required
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                placeholder="••••••••"
                                // Optional: Add forgot password link here if needed
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        disabled={isLoading}
                                        color="primary"
                                    />
                                }
                                label="Remember me for 30 days"
                                sx={{ color: 'text.secondary' }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isLoading}
                                size="large"
                                startIcon={isLoading ? null : <LoginIcon />}
                                sx={{ py: 1.5 }} // Make button slightly larger
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                Don't have an account?{' '}
                                <MuiLink component={Link} to="/register" fontWeight="medium" color="primary.main">
                                    Create account
                                </MuiLink>
                            </Typography>
                        </Stack>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;