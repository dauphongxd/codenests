import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Ensure your preferred theme is imported
import { snippetService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Paper,
    Box,
    Typography,
    Button,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    IconButton,
    TextField,
    InputAdornment,
    Tooltip,
    Divider,
    Avatar,
    Link as MuiLink, // Alias to avoid conflict with react-router Link
    useTheme
} from '@mui/material';
import {
    ContentCopy as ContentCopyIcon,
    Share as ShareIcon,
    AccessTime as AccessTimeIcon,
    Visibility as VisibilityIcon,
    ErrorOutline as ErrorOutlineIcon,
    Tag as TagIcon,
    Link as LinkIcon, // For URL field
    AccountCircle as AccountCircleIcon,
    Home as HomeIcon,
    Language as LanguageIcon, // For personal website
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Message as MessageIcon // For messaging author
} from '@mui/icons-material';

const ViewSnippetPage = () => {
    const { isAuthenticated, currentUser } = useAuth(); // Get currentUser for author check
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const codeRef = useRef(null); // Ref for the code block

    const [snippet, setSnippet] = useState(null);
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);

    // Define consistent card styles
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
        mb: 3, // Add margin between cards
    };

    const cardHeaderStyle = {
        p: 2.5,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5, // Add gap for wrapping
    };

    // --- Fetch Snippet Data ---
    useEffect(() => {
        const fetchSnippet = async () => {
            setLoading(true);
            setError(null);
            setSnippet(null); // Reset snippet state on new fetch
            setAuthor(null);
            setRemainingTime(null);

            try {
                const searchParams = new URLSearchParams(location.search);
                const skipIncrement = searchParams.get('skipIncrement') === 'true';

                if (skipIncrement) {
                    const newUrl = window.location.pathname; // Just the path, no query params
                    window.history.replaceState({}, '', newUrl);
                }

                const data = await snippetService.getById(uuid, skipIncrement);

                if (data.snippet) {
                    setSnippet(data.snippet);
                    setAuthor(data.author);
                    if (data.snippet.expirationType === 'TIME' && data.snippet.remainingSeconds > 0) {
                        setRemainingTime(data.snippet.remainingSeconds);
                    }
                } else {
                    const errorMessage = data.message || (data.expired ? 'The code snippet has expired.' : 'Snippet not found or invalid response.');
                    throw new Error(errorMessage);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSnippet();
    }, [uuid, location.search]); // Rerun when UUID or search params change

    // --- Countdown Timer ---
    useEffect(() => {
        let timer;
        if (remainingTime && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setError("The snippet has expired."); // Update error state when timer finishes
                        setSnippet(null); // Clear snippet data
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [remainingTime]); // Rerun only when remainingTime changes

    // --- Syntax Highlighting ---
    useEffect(() => {
        // Ensure highlighting runs only when snippet content is available and no error
        if (codeRef.current && snippet?.content && !error) {
            hljs.highlightElement(codeRef.current);
        }
    }, [snippet?.content, error]); // Depend on snippet content and error state

    // --- Helper Functions ---
    const formatTime = (seconds) => {
        if (seconds <= 0) return 'Expired';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    };

    const handleCopyCode = () => {
        if (snippet?.content) {
            navigator.clipboard.writeText(snippet.content)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => console.error("Failed to copy code:", err));
        }
    };

    const handleShareViaMessage = () => {
        if (snippet) {
            navigate('/messages/new', {
                state: {
                    snippet: {
                        uuid: snippet.uuid,
                        title: snippet.title || 'Untitled Snippet'
                    }
                }
            });
        }
    };

    // --- Render Logic ---

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
                <Paper sx={{ ...cardStyle, p: 4 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {error.includes("expired") ? "Snippet Expired" : "Snippet Not Available"}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/"
                        startIcon={<HomeIcon />}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark' }
                        }}
                    >
                        Return Home
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!snippet) {
        // Fallback if somehow loading finished but snippet is null without error
        return <Alert severity="warning" sx={{ m: 3 }}>Snippet data could not be loaded.</Alert>;
    }

    // --- Main Snippet View ---
    return (
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 }, zIndex: 5, position: 'relative' }}>
            {/* Snippet Card */}
            <Paper elevation={0} sx={cardStyle}>
                <Box sx={cardHeaderStyle}>
                    {/* Left Side: Title */}
                    <Typography variant="h5" fontWeight="bold" sx={{ mr: 'auto' }}>
                        {snippet.title || 'Untitled Snippet'}
                    </Typography>

                    {/* Right Side: Metadata Chips */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
                        <Chip
                            label={`Created: ${snippet.createdAt || 'N/A'}`}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'text.secondary' }}
                        />
                        {snippet.expirationType === 'VIEWS' && snippet.expirationValue > 0 && (
                            <Chip
                                icon={<VisibilityIcon fontSize="small" />}
                                label={`Views: ${snippet.viewCount} / ${snippet.expirationValue}`}
                                size="small"
                                variant="outlined"
                                color="info" // Use theme colors
                                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        )}
                        {snippet.expirationType === 'TIME' && snippet.expirationValue > 0 && remainingTime != null && (
                            <Chip
                                icon={<AccessTimeIcon fontSize="small" />}
                                label={`Expires in: ${formatTime(remainingTime)}`}
                                size="small"
                                variant="outlined"
                                color="warning" // Use theme colors
                                sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        )}
                    </Stack>
                </Box>

                <Box p={3}>
                    {/* Code Block with Copy Button */}
                    <Box sx={{ position: 'relative', mb: 3 }}>
                        <Paper elevation={0} sx={{ bgcolor: '#282c34', borderRadius: 1.5, overflow: 'hidden' }}>
                            <pre style={{ margin: 0, padding: '1rem', overflowX: 'auto' }}>
                                <code ref={codeRef} className={`language-${hljs.highlightAuto(snippet.content).language || 'plaintext'}`}>
                                    {snippet.content}
                                </code>
                            </pre>
                        </Paper>
                        <Tooltip title={copied ? "Copied!" : "Copy Code"} placement="top">
                            <IconButton
                                onClick={handleCopyCode}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                                }}
                            >
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Tags Display */}
                    {snippet.tags && snippet.tags.length > 0 && (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                            <Chip
                                icon={<TagIcon fontSize='small' />}
                                label="Tags:"
                                size="small"
                                sx={{ bgcolor: 'transparent', color: 'text.secondary', fontWeight: 500 }}
                            />
                            {snippet.tags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.7)' : 'rgba(0, 0, 0, 0.08)',
                                        color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                        cursor: 'pointer', // Optional: Make tags clickable for filtering later
                                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(45, 42, 61, 0.7)' : 'rgba(0, 0, 0, 0.1)' }
                                    }}
                                />
                            ))}
                        </Stack>
                    )}

                    <Divider sx={{ mb: 3, borderColor: 'rgba(188, 156, 255, 0.1)' }} />

                    {/* Action Buttons & URL */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                        {/* Share Button */}
                        {isAuthenticated && (
                            <Button
                                variant="outlined"
                                startIcon={<ShareIcon />}
                                onClick={handleShareViaMessage}
                                sx={{
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                    color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                    '&:hover': {
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.3)' : 'primary.main',
                                        bgcolor: 'rgba(188, 156, 255, 0.05)'
                                    }
                                }}
                            >
                                Share via Message
                            </Button>
                        )}

                        {/* Read-only URL Input */}
                        <TextField
                            value={`${window.location.origin}/code/${snippet.uuid}`}
                            readOnly
                            size="small"
                            fullWidth={!isAuthenticated} // Take more width if share button isn't there
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(13, 13, 17, 0.3)' : 'rgba(0, 0, 0, 0.02)',
                                    color: 'text.secondary',
                                },
                                '& .MuiOutlinedInput-input': {
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                },
                                maxWidth: { sm: isAuthenticated ? '400px' : '100%' } // Limit width on larger screens if needed
                            }}
                            onClick={(e) => e.target.select()}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LinkIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Stack>
                </Box>
            </Paper>

            {/* Author Card */}
            {author && author.username !== 'Unknown' && (
                <Paper elevation={0} sx={cardStyle}>
                    <Box sx={cardHeaderStyle}>
                        <AccountCircleIcon sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" fontWeight="bold">
                            About the Author
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 'auto', color: 'text.secondary' }}>
                            {author.username}
                        </Typography>
                    </Box>
                    <Box p={3}>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                            {author.personal && (
                                <Button size="small" variant="outlined" startIcon={<LanguageIcon />} href={author.personal} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    Website
                                </Button>
                            )}
                            {author.github && (
                                <Button size="small" variant="outlined" startIcon={<GitHubIcon />} href={author.github} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    GitHub
                                </Button>
                            )}
                            {author.linkedin && (
                                <Button size="small" variant="outlined" startIcon={<LinkedInIcon />} href={author.linkedin} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                                    LinkedIn
                                </Button>
                            )}
                            {isAuthenticated && author.uuid !== currentUser?.uuid && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<MessageIcon />}
                                    onClick={() => navigate(`/messages/new`, { state: { recipientEmail: author.email } })}
                                    sx={{ color: 'text.secondary', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                                >
                                    Message {author.username}
                                </Button>
                            )}
                        </Stack>
                    </Box>
                </Paper>
            )}
        </Container>
    );
};

export default ViewSnippetPage;