import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/api';
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    useTheme
} from '@mui/material';
import {
    GroupAdd as GroupAddIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const CreateGroupPage = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    // Consistent card styles
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
    };

    const cardHeaderStyle = {
        p: 2.5,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Group name is required');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const result = await groupService.createGroup({ name: name.trim() });
            if (result.success && result.groupId) {
                navigate(`/groups/${result.groupId}`); // Navigate to the new group's detail page
            } else {
                setError(result.message || 'Failed to create group');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            maxWidth="sm" // Smaller container for a simple form
            sx={{
                py: 4,
                px: { xs: 2, sm: 3 },
                position: 'relative',
                zIndex: 5
            }}
        >
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/groups')}
                sx={{ mb: 2, color: 'text.secondary' }}
            >
                Back to Groups
            </Button>

            <Paper elevation={0} sx={cardStyle}>
                <Box sx={cardHeaderStyle}>
                    <GroupAddIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                        Create New Group
                    </Typography>
                </Box>

                <Box p={3}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Group Name"
                            fullWidth
                            required
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            placeholder="Enter a name for your group"
                            sx={{ mb: 3 }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading || !name.trim()}
                                size="large"
                                sx={{
                                    minWidth: '160px',
                                    py: 1.2,
                                    bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                    '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark' }
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Create Group'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateGroupPage;