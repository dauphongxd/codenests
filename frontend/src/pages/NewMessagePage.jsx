import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { messageService } from '../services/api';
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
    Chip,
    Stack,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    Close as CloseIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';

const NewMessagePage = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get location object
    const theme = useTheme();

    // State for the form fields
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [selectedSnippet, setSelectedSnippet] = useState(null); // State to hold the attached snippet

    // State for UI feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
    };

    useEffect(() => {
        console.log("NewMessagePage location state:", location.state); // Log the received state

        // Reset state initially in case navigating back/forth
        setEmail('');
        setContent('');
        setSelectedSnippet(null);

        // Check for recipient email passed via state
        if (location.state?.recipientEmail) {
            console.log("Setting email from state:", location.state.recipientEmail);
            setEmail(location.state.recipientEmail);
        }

        if (location.state?.snippet) {
            console.log("Setting snippet from state:", location.state.snippet);
            setSelectedSnippet(location.state.snippet);
        }

    }, [location]);

    console.log("NewMessagePage current selectedSnippet state:", selectedSnippet);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Recipient email is required');
            return;
        }
        if (!content.trim() && !selectedSnippet) { // Allow sending just a snippet
            setError('Message content is required (or attach a snippet)');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const messageData = {
                receiverEmail: email.trim(),
                // Send content even if empty, backend might handle it
                content: content.trim(),
                snipUuid: null // Initialize
            };

            // *** Crucial check: use the state variable 'selectedSnippet' ***
            if (selectedSnippet && selectedSnippet.uuid) {
                messageData.snipUuid = selectedSnippet.uuid;
                console.log("Attaching snippet with UUID from state:", selectedSnippet.uuid);
            } else if (selectedSnippet) {
                console.warn("Selected snippet in state exists but has no UUID:", selectedSnippet);
            }

            console.log("Sending message payload:", JSON.stringify(messageData, null, 2)); // Debug log

            const result = await messageService.sendMessage(messageData);

            if (result.success) {
                navigate('/messages'); // Navigate after success
            } else {
                setError(result.message || 'Failed to send message');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const clearSelectedSnippet = () => {
        console.log("Clearing selected snippet");
        setSelectedSnippet(null);
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4, px: { xs: 2, sm: 3 }, zIndex: 5, position: 'relative' }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)} // Simple back navigation
                sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
            >
                Back
            </Button>

            <Paper elevation={0} sx={cardStyle}>
                <Box sx={cardHeaderStyle}>
                    <Typography variant="h6" fontWeight="bold">
                        New Message
                    </Typography>
                </Box>

                <Box p={3}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        {/* Recipient Email */}
                        <TextField
                            label="Recipient Email"
                            fullWidth
                            required
                            variant="outlined"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            placeholder="user@example.com"
                            sx={{ mb: 3 }}
                        />

                        {/* --- Attached Snippet Display (Uses selectedSnippet state) --- */}
                        {selectedSnippet && (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    mb: 3,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.3)' : 'action.hover',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <AttachFileIcon fontSize="small" color="primary"/>
                                    <Typography variant="body2" noWrap>
                                        {selectedSnippet.title || 'Untitled Snippet'}
                                    </Typography>
                                </Stack>
                                <Tooltip title="Remove Snippet">
                                    {/* Ensure button isn't disabled when loading is false */}
                                    <IconButton onClick={clearSelectedSnippet} size="small" disabled={loading}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        )}
                        {/* --- End Attached Snippet Display --- */}

                        {/* Message Content */}
                        <TextField
                            label="Message"
                            // Conditionally required based on snippet presence? Or always allow empty? Let's allow empty for now.
                            // required={!selectedSnippet}
                            fullWidth
                            multiline
                            rows={selectedSnippet ? 4 : 6} // Fewer rows if snippet attached
                            variant="outlined"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={loading}
                            placeholder={selectedSnippet ? "Add an optional message..." : "Write your message here..."}
                            sx={{ mb: 3 }}
                        />

                        {/* Action Buttons */}
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/messages')} // Navigate to inbox
                                disabled={loading}
                                sx={{
                                    color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                // Disable if loading OR if email is empty OR if (content is empty AND no snippet is selected)
                                disabled={loading || !email.trim() || (!content.trim() && !selectedSnippet)}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                sx={{ minWidth: '120px' }}
                            >
                                {loading ? 'Sending...' : 'Send'}
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default NewMessagePage;