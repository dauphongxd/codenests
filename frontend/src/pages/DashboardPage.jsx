import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { snippetService, messageService, groupService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Chip,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    CircularProgress,
    IconButton,
    Stack,
    useTheme
} from '@mui/material';
import {
    Code as CodeIcon,
    Group as GroupIcon,
    Email as EmailIcon,
    PersonOutline as PersonIcon,
    Add as AddIcon,
    ChevronRight as ChevronRightIcon,
    Dashboard as DashboardIcon,
    BlockOutlined as BlockIcon
} from '@mui/icons-material';

// Helper to get avatar colors based on string (consistent with other pages)
const getAvatarColor = (str) => {
    if (!str) return '#673CE3';

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
        '#2196f3', '#03a9f4', '#00bcd4', '#009688'
    ];

    return colors[Math.abs(hash) % colors.length];
};

const DashboardPage = () => {
    const [snippets, setSnippets] = useState([]);
    const [messages, setMessages] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                setError(null);

                // Fetch user's snippets
                const snippetsData = await snippetService.getUserSnippets();
                if (snippetsData.success) {
                    setSnippets(snippetsData.snippets || []);
                }

                // Fetch recent messages
                const messagesData = await messageService.getInbox();
                if (messagesData.success) {
                    // Only take the first 5 messages for the dashboard view
                    setMessages(messagesData.messages?.slice(0, 5) || []);
                }

                // Fetch user's groups
                const groupsData = await groupService.getMyGroups();
                if (groupsData.success) {
                    // Display first 5 groups on dashboard
                    setGroups(groupsData.groups?.slice(0, 5) || []);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError(err.message || 'Failed to load some dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="calc(100vh - 80px)"
                sx={{
                    position: 'relative',
                    zIndex: 5
                }}
            >
                <CircularProgress size={40} sx={{ color: '#673CE3' }} />
            </Box>
        );
    }

    // Card style with consistent styling for all cards
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    };

    // Card header style
    const cardHeaderStyle = {
        p: 2,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider'
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 4,
                px: { xs: 2, sm: 3 },
                position: 'relative',
                zIndex: 5
            }}
        >
            <Typography variant="h4" fontWeight="bold" mb={4} color="white">
                Dashboard
            </Typography>

            {/* Bento Box Layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gap: 3 }}>
                {/* Profile Card - 4 columns with centered content */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' }, gridRow: { md: 'span 1' } }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box
                            p={3}
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: getAvatarColor(currentUser?.username),
                                    mb: 2
                                }}
                            >
                                {currentUser?.username?.charAt(0) || 'U'}
                            </Avatar>

                            <Typography variant="h6" fontWeight="bold" align="center">
                                {currentUser?.username}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                                {currentUser?.email}
                            </Typography>

                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{
                                    mt: 1,
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                    color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                    '&:hover': {
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.3)' : 'primary.main',
                                        bgcolor: 'rgba(188, 156, 255, 0.05)'
                                    }
                                }}
                                startIcon={<PersonIcon />}
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* Stats Card - 4 columns with centered content */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' }, gridRow: { md: 'span 1' } }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={cardHeaderStyle}>
                            <Typography variant="h6" fontWeight="bold">
                                Stats
                            </Typography>
                        </Box>

                        <Box
                            p={2}
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Grid container spacing={3} justifyContent="center">
                                <Grid item xs={5}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.5)' : 'background.paper',
                                            border: '1px solid',
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.05)' : 'divider',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" color="#673CE3">
                                            {snippets.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Snippets
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={5}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.5)' : 'background.paper',
                                            border: '1px solid',
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.05)' : 'divider',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Typography variant="h4" fontWeight="bold" color="#673CE3">
                                            {groups.length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Groups
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Box>

                {/* Quick Actions Card - 4 columns */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' }, gridRow: { md: 'span 1' } }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={cardHeaderStyle}>
                            <Typography variant="h6" fontWeight="bold">
                                Quick Actions
                            </Typography>
                        </Box>

                        <Box p={2} display="flex" flexDirection="column" gap={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<CodeIcon />}
                                onClick={() => navigate('/code/new')}
                                sx={{
                                    py: 1,
                                    bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark',
                                    }
                                }}
                            >
                                New Snippet
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<GroupIcon />}
                                onClick={() => navigate('/groups/new')}
                                sx={{
                                    py: 1,
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                    color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                    '&:hover': {
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.3)' : 'primary.main',
                                        bgcolor: 'rgba(188, 156, 255, 0.05)'
                                    }
                                }}
                            >
                                Create Group
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<EmailIcon />}
                                onClick={() => navigate('/messages/new')}
                                sx={{
                                    py: 1,
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                    color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                    '&:hover': {
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.3)' : 'primary.main',
                                        bgcolor: 'rgba(188, 156, 255, 0.05)'
                                    }
                                }}
                            >
                                New Message
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* Recent Snippets - Full width for visibility */}
                <Box sx={{ gridColumn: 'span 12', gridRow: { md: 'span 1' } }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={cardHeaderStyle}>
                            <Typography variant="h6" fontWeight="bold">
                                Recent Snippets
                            </Typography>
                        </Box>

                        {snippets.length === 0 ? (
                            <Box textAlign="center" py={4} px={2}>
                                <Typography color="text.secondary" gutterBottom>
                                    You haven't created any snippets yet.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/code/new')}
                                    sx={{
                                        mt: 2,
                                        bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark',
                                        }
                                    }}
                                >
                                    Create Your First Snippet
                                </Button>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {snippets.map((snippet, index) => {
                                    // Check if snippet is expired/accessible
                                    const isExpired = !snippet.isAccessible;

                                    return (
                                        <React.Fragment key={snippet.uuid}>
                                            {index > 0 && <Divider component="li" sx={{ borderColor: 'rgba(188, 156, 255, 0.1)' }} />}
                                            <ListItem
                                                alignItems="flex-start"
                                                button={!isExpired}
                                                onClick={!isExpired ? () => navigate(`/code/${snippet.uuid}`) : undefined}
                                                sx={{
                                                    p: 2,
                                                    opacity: isExpired ? 0.6 : 1,
                                                    cursor: isExpired ? 'default' : 'pointer',
                                                    '&:hover': {
                                                        bgcolor: !isExpired ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)') : 'transparent',
                                                    }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                                            <Box display="flex" alignItems="center">
                                                                <Typography variant="subtitle1" fontWeight="medium">
                                                                    {snippet.title || 'Untitled Snippet'}
                                                                </Typography>
                                                                {isExpired && (
                                                                    <Chip
                                                                        label="Expired"
                                                                        size="small"
                                                                        icon={<BlockIcon fontSize="small" />}
                                                                        sx={{
                                                                            ml: 2,
                                                                            height: '20px',
                                                                            fontSize: '0.7rem',
                                                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(220, 50, 50, 0.2)' : 'rgba(220, 50, 50, 0.1)',
                                                                            color: theme.palette.mode === 'dark' ? 'rgba(255, 120, 120, 0.9)' : 'rgba(220, 50, 50, 0.9)',
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {snippet.createdAt ? new Date(snippet.createdAt).toLocaleDateString() : ''}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Box
                                                                component="pre"
                                                                sx={{
                                                                    p: 1,
                                                                    mt: 1,
                                                                    mb: 1.5,
                                                                    bgcolor: theme.palette.mode === 'dark' ? '#0D0C10' : 'rgba(0, 0, 0, 0.05)',
                                                                    borderRadius: 1,
                                                                    fontSize: '0.75rem',
                                                                    overflow: 'hidden',
                                                                    whiteSpace: 'nowrap',
                                                                    textOverflow: 'ellipsis',
                                                                    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                                                                }}
                                                            >
                                                                {snippet.content?.substring(0, 150) || ''}
                                                            </Box>

                                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                                                    {snippet.tags?.slice(0, 3).map((tag) => (
                                                                        <Chip
                                                                            key={tag}
                                                                            label={tag}
                                                                            size="small"
                                                                            sx={{
                                                                                height: '20px',
                                                                                fontSize: '0.7rem',
                                                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.7)' : 'rgba(0, 0, 0, 0.05)',
                                                                                color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                                                            }}
                                                                        />
                                                                    ))}
                                                                    {snippet.tags?.length > 3 && (
                                                                        <Typography variant="caption" color="text.secondary">...</Typography>
                                                                    )}
                                                                </Box>

                                                                {!isExpired && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            color: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                                                        }}
                                                                    >
                                                                        View Snippet
                                                                        <ChevronRightIcon fontSize="small" />
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </Paper>
                </Box>

                {/* Recent Messages and Groups in a 2-column split */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, gridRow: { md: 'span 1' } }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box
                            sx={{
                                ...cardHeaderStyle,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                Recent Messages
                            </Typography>

                            <Button
                                color="primary"
                                size="small"
                                onClick={() => navigate('/messages')}
                                sx={{
                                    color: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                }}
                            >
                                View All
                            </Button>
                        </Box>

                        {messages.length === 0 ? (
                            <Box textAlign="center" py={4} px={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    No recent messages.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<EmailIcon />}
                                    onClick={() => navigate('/messages/new')}
                                    sx={{
                                        mt: 2,
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                        color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                        '&:hover': {
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.3)' : 'primary.main',
                                            bgcolor: 'rgba(188, 156, 255, 0.05)'
                                        }
                                    }}
                                >
                                    Start a Conversation
                                </Button>
                            </Box>
                        ) : (
                            <List disablePadding sx={{ flexGrow: 1 }}>
                                {messages.map((message, index) => (
                                    <React.Fragment key={message.id}>
                                        {index > 0 && <Divider component="li" sx={{ borderColor: 'rgba(188, 156, 255, 0.1)' }} />}
                                        <ListItem
                                            alignItems="flex-start"
                                            button
                                            onClick={() => navigate(`/messages/conversation/${message.senderId}`)}
                                            sx={{
                                                p: 2,
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: getAvatarColor(message.senderName),
                                                    }}
                                                >
                                                    {message.senderName?.charAt(0) || '?'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="subtitle1" fontWeight="medium">
                                                            {message.senderName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                display: '-webkit-box'
                                                            }}
                                                        >
                                                            {message.content.substring(0, 100)}{message.content.length > 100 ? '...' : ''}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            component="div"
                                                            sx={{
                                                                mt: 1,
                                                                color: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            View Conversation
                                                            <ChevronRightIcon fontSize="small" />
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Box>

                {/* My Groups section - matching height with Messages */}
                <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, gridRow: { md: 'span 1' } }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box
                            sx={{
                                ...cardHeaderStyle,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                My Groups
                            </Typography>

                            <Button
                                color="primary"
                                size="small"
                                onClick={() => navigate('/groups')}
                                sx={{
                                    color: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                }}
                            >
                                View All
                            </Button>
                        </Box>

                        {groups.length === 0 ? (
                            <Box textAlign="center" py={4} px={2} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography color="text.secondary" gutterBottom>
                                    You haven't joined any groups yet.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<GroupIcon />}
                                    onClick={() => navigate('/groups/new')}
                                    sx={{
                                        mt: 2,
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                        color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                        '&:hover': {
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.3)' : 'primary.main',
                                            bgcolor: 'rgba(188, 156, 255, 0.05)'
                                        }
                                    }}
                                >
                                    Create a Group
                                </Button>
                            </Box>
                        ) : (
                            <List disablePadding sx={{ flexGrow: 1 }}>
                                {groups.map((group, index) => (
                                    <React.Fragment key={group.id}>
                                        {index > 0 && <Divider component="li" sx={{ borderColor: 'rgba(188, 156, 255, 0.1)' }} />}
                                        <ListItem
                                            alignItems="flex-start"
                                            button
                                            onClick={() => navigate(`/groups/${group.id}`)}
                                            sx={{
                                                p: 2,
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: getAvatarColor(group.name),
                                                    }}
                                                >
                                                    {group.name?.charAt(0) || 'G'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="subtitle1" fontWeight="medium">
                                                            {group.name}
                                                        </Typography>
                                                        <Chip
                                                            label={group.role}
                                                            size="small"
                                                            sx={{
                                                                height: '24px',
                                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.7)' : 'rgba(0, 0, 0, 0.05)',
                                                                color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {group.memberCount} members • Created {new Date(group.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            component="div"
                                                            sx={{
                                                                mt: 1,
                                                                color: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            View Group
                                                            <ChevronRightIcon fontSize="small" />
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default DashboardPage;