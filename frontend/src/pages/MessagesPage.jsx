import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messageService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    Button,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    IconButton,
    Container,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Inbox as InboxIcon,
    Send as SendIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Helper to get initials and a consistent avatar color
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

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    if (date.getFullYear() === today.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString();
};

const MessagesPage = () => {
    const [activeTab, setActiveTab] = useState('inbox');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                setError(null);
                let data;

                if (activeTab === 'inbox') {
                    data = await messageService.getInbox();
                } else {
                    data = await messageService.getSent();
                }

                if (data.success) {
                    // Group messages by conversation partner
                    const grouped = {};
                    (data.messages || []).forEach(msg => {
                        const partnerId = activeTab === 'inbox' ? msg.senderId : msg.receiverId;
                        const partnerName = activeTab === 'inbox' ? msg.senderName : msg.receiverName;

                        if (!grouped[partnerId]) {
                            grouped[partnerId] = {
                                partnerId: partnerId,
                                partnerName: partnerName,
                                latestMessage: msg.content,
                                sentAt: msg.sentAt,
                                messageId: msg.id,
                                unread: false // Optional: Add unread status logic here
                            };
                        }
                        // Update if this message is newer
                        else if (new Date(msg.sentAt) > new Date(grouped[partnerId].sentAt)) {
                            grouped[partnerId].latestMessage = msg.content;
                            grouped[partnerId].sentAt = msg.sentAt;
                            grouped[partnerId].messageId = msg.id;
                        }
                    });

                    // Sort conversations by latest message date
                    const sortedConversations = Object.values(grouped).sort(
                        (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
                    );

                    setMessages(sortedConversations);
                } else {
                    throw new Error(data.message || 'Failed to load messages');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [activeTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
                }}
            >
                {/* Header */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={3}
                    py={2}
                    borderBottom="1px solid"
                    borderColor={theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider'}
                >
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Messages</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your conversations
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/messages/new')}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark',
                            }
                        }}
                    >
                        New Message
                    </Button>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
                        '& .MuiTab-root': {
                            py: 1.5,
                        }
                    }}
                >
                    <Tab
                        value="inbox"
                        label="Inbox"
                        icon={<InboxIcon fontSize="small" />}
                        iconPosition="start"
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                        }}
                    />
                    <Tab
                        value="sent"
                        label="Sent"
                        icon={<SendIcon fontSize="small" />}
                        iconPosition="start"
                        sx={{
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                        }}
                    />
                </Tabs>

                {/* Message List */}
                <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                            <CircularProgress size={32} sx={{ color: '#673CE3' }} />
                        </Box>
                    ) : messages.length === 0 ? (
                        <Box textAlign="center" py={8} px={3}>
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(103, 60, 227, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2
                                }}
                            >
                                {activeTab === 'inbox' ? (
                                    <InboxIcon sx={{ fontSize: 30, color: 'rgba(103, 60, 227, 0.6)' }} />
                                ) : (
                                    <SendIcon sx={{ fontSize: 30, color: 'rgba(103, 60, 227, 0.6)' }} />
                                )}
                            </Box>
                            <Typography variant="h6" gutterBottom>
                                Your {activeTab} is empty
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                                {activeTab === 'inbox'
                                    ? "You haven't received any messages yet."
                                    : "You haven't sent any messages yet."}
                            </Typography>
                            {activeTab === 'inbox' && (
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/messages/new')}
                                    sx={{
                                        bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark',
                                        }
                                    }}
                                >
                                    Start a Conversation
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <List disablePadding>
                            {messages.map((convo) => {
                                const { initials, color } = getAvatarInfo(convo.partnerName);
                                return (
                                    <React.Fragment key={convo.messageId}>
                                        <ListItem
                                            button
                                            alignItems="flex-start"
                                            component={Link}
                                            to={`/messages/conversation/${convo.partnerId}`}
                                            sx={{
                                                px: 3,
                                                py: 2,
                                                position: 'relative',
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                                                },
                                            }}
                                        >
                                            {/* Unread indicator */}
                                            {convo.unread && activeTab === 'inbox' && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        left: 12,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: '#673CE3',
                                                        zIndex: 1,
                                                    }}
                                                />
                                            )}

                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: color }}>
                                                    {initials}
                                                </Avatar>
                                            </ListItemAvatar>

                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between" alignItems="baseline">
                                                        <Typography variant="body1" fontWeight={500} noWrap sx={{ mr: 2 }}>
                                                            {convo.partnerName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(convo.sentAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            mt: 0.5,
                                                            pr: 2, // Make room for the arrow icon
                                                        }}
                                                    >
                                                        {activeTab === 'sent' && <Box component="span" sx={{ color: 'text.disabled', mr: 0.5 }}>You:</Box>}
                                                        {convo.latestMessage}
                                                    </Typography>
                                                }
                                            />

                                            <IconButton
                                                edge="end"
                                                size="small"
                                                sx={{
                                                    color: 'text.disabled',
                                                    alignSelf: 'center',
                                                    ml: 1,
                                                }}
                                                aria-label="view conversation"
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                        </ListItem>
                                        <Divider component="li" />
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}
                </Box>

                {/* Help text - only show if there are messages */}
                {messages.length > 0 && (
                    <Box textAlign="center" py={1.5} px={2} borderTop="1px solid" borderColor="divider">
                        <Typography variant="caption" color="text.secondary">
                            Click on a conversation to view and send messages
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default MessagesPage;