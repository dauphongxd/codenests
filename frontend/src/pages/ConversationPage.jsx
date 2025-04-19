import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Avatar,
    useTheme
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon
} from '@mui/icons-material';

// Helper to get initials and avatar color
const getAvatarInfo = (name) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';
    // Simple hash function for deterministic color based on name
    let hash = 0;
    for (let i = 0; i < (name?.length || 0); i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688'
    ];
    const color = colors[Math.abs(hash) % colors.length];
    return { initials, color };
};

// Helper to format message time
const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ConversationPage = () => {
    const { userId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    // Force layout to reapply correctly after component mounts
    useEffect(() => {
        // Force a reflow/repaint on mount
        const timer = setTimeout(() => {
            const element = document.getElementById('conversation-wrapper');
            if (element) {
                // This will force a reflow by accessing a layout property
                const forced = element.offsetHeight;
                console.log("Forced reflow for conversation wrapper");
            }
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    // Fetch conversation when userId changes
    useEffect(() => {
        const fetchConversation = async () => {
            try {
                setLoading(true); setError(null);
                const response = await messageService.getConversation(userId);
                if (response.success) {
                    setOtherUser(response.otherUser);
                    setMessages(response.messages || []);
                } else {
                    throw new Error(response.message || 'Failed to load conversation');
                }
            } catch (err) {
                console.error('Error loading conversation:', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (userId) { fetchConversation(); }
    }, [userId]);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        try {
            setSending(true);

            const result = await messageService.sendMessage({
                receiverId: parseInt(userId),
                content: newMessage.trim()
            });

            if (result.success) {
                setNewMessage('');
                // Refetch the conversation
                const response = await messageService.getConversation(userId);
                if (response.success) {
                    // Directly use the messages from the response
                    setMessages(response.messages || []); // <-- Use response.messages directly
                }
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError(`Failed to send message: ${err.message || 'An error occurred'}`);
        } finally {
            setSending(false);
        }
    };

    // Get avatar info for users
    const otherUserAvatar = otherUser ? getAvatarInfo(otherUser.username) : { initials: '?', color: '#673ab7' };
    const currentUserAvatar = getAvatarInfo(currentUser?.username);

    return (
        <div
            id="conversation-wrapper"
            style={{
                // Increased width for a more substantial appearance
                maxWidth: '1000px',
                width: '90%',
                margin: '0 auto',
                padding: '2rem 1rem',
                position: 'relative',
                zIndex: 5,
                // Set a fixed height to prevent page scrolling
                height: 'calc(100vh - 120px)', // Account for navbar and some padding
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Prevent outer scrolling
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    borderRadius: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    // Use 100% height to fill the parent container
                    height: '100%',
                    position: 'relative',
                    zIndex: 5,
                    overflow: 'hidden' // Prevent Paper from scrolling
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider'
                    }}
                >
                    <IconButton
                        edge="start"
                        onClick={() => navigate('/messages')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    {otherUser ? (
                        <>
                            <Avatar
                                sx={{
                                    bgcolor: otherUserAvatar.color,
                                    mr: 2
                                }}
                            >
                                {otherUserAvatar.initials}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">{otherUser.username}</Typography>
                            </Box>
                        </>
                    ) : (
                        <Typography variant="h6">Conversation</Typography>
                    )}
                </Box>

                {/* Error message */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{ mx: 2, my: 1 }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                {/* Messages container - allow scrolling here */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto', // Allow scrolling within messages
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(13, 13, 17, 0.3)' : 'rgba(0, 0, 0, 0.02)'
                    }}
                >
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress size={40} sx={{ color: '#673CE3' }} />
                        </Box>
                    ) : messages.length === 0 ? (
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                            color="text.secondary"
                        >
                            <Typography variant="body1" gutterBottom>
                                No messages yet
                            </Typography>
                            <Typography variant="body2">
                                Start the conversation by sending a message below
                            </Typography>
                        </Box>
                    ) : (
                        // Message bubbles
                        messages.map((message) => {
                            const isSent = message.direction === 'sent';
                            const avatarInfo = isSent ? currentUserAvatar : otherUserAvatar;

                            return (
                                <Box
                                    key={message.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isSent ? 'flex-end' : 'flex-start',
                                        mb: 1.5
                                    }}
                                >
                                    {!isSent && (
                                        <Avatar
                                            sx={{
                                                bgcolor: avatarInfo.color,
                                                width: 32,
                                                height: 32,
                                                mr: 1,
                                                alignSelf: 'flex-end',
                                                mb: 0.5
                                            }}
                                        >
                                            {avatarInfo.initials}
                                        </Avatar>
                                    )}

                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            backgroundColor: isSent
                                                ? theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main'
                                                : theme.palette.mode === 'dark' ? '#2D2A3D' : 'grey.100',
                                            color: isSent
                                                ? 'white'
                                                : theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1,
                                            position: 'relative'
                                        }}
                                    >
                                        <Typography variant="body1">{message.content}</Typography>
                                        <Typography
                                            variant="caption"
                                            display="block"
                                            color={isSent ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
                                            textAlign="right"
                                            mt={0.5}
                                        >
                                            {formatMessageTime(message.sentAt)}
                                        </Typography>

                                        {/* If there's a snippet attached */}
                                        {message.snipUuid && (
                                            <Box
                                                onClick={() => navigate(`/code/${message.snipUuid}`)}
                                                sx={{
                                                    mt: 1,
                                                    p: 1,
                                                    borderRadius: 1,
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0,0,0,0.2)',
                                                    }
                                                }}
                                            >
                                                <Typography variant="caption" fontWeight="bold">
                                                    Code Snippet
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    Click to view
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {isSent && (
                                        <Avatar
                                            sx={{
                                                bgcolor: avatarInfo.color,
                                                width: 32,
                                                height: 32,
                                                ml: 1,
                                                alignSelf: 'flex-end',
                                                mb: 0.5
                                            }}
                                        >
                                            {avatarInfo.initials}
                                        </Avatar>
                                    )}
                                </Box>
                            );
                        })
                    )}
                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Message input - fixed at bottom */}
                <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.5)' : 'background.paper',
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#673CE3',
                                }
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={sending || !newMessage.trim()}
                        sx={{
                            minWidth: '52px',
                            width: '52px',
                            height: '40px',
                            borderRadius: '20px',
                            bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark',
                            }
                        }}
                    >
                        {sending ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            <SendIcon />
                        )}
                    </Button>
                </Box>
            </Paper>
        </div>
    );
};

export default ConversationPage;