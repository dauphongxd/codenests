import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { groupService } from '../services/api';
import {
    Container,
    Paper,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Group as GroupIcon,
    Add as AddIcon,
    ChevronRight as ChevronRightIcon,
    AdminPanelSettings as AdminPanelSettingsIcon, // For Owner
    Person as PersonIcon // For Member
} from '@mui/icons-material';

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

const GroupsListPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();

    // Consistent card styles (applied to the main Paper container)
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden', // Ensures children adhere to border radius
    };

    const cardHeaderStyle = {
        p: 2.5,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1.5, // Add gap if items wrap
    };


    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await groupService.getMyGroups();
                if (data.success) {
                    setGroups(data.groups || []);
                } else {
                    setError(data.message || 'Failed to load groups');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    return (
        <Container maxWidth="md" sx={{ py: 4, px: { xs: 2, sm: 3 }, zIndex: 5, position: 'relative' }}>
            <Paper elevation={0} sx={cardStyle}>
                {/* Header */}
                <Box sx={cardHeaderStyle}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <GroupIcon sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" fontWeight="bold">My Groups</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/groups/new')}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark' }
                        }}
                    >
                        Create Group
                    </Button>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
                        <CircularProgress size={32} sx={{ color: theme.palette.primary.main }} />
                    </Box>
                )}

                {/* Error State */}
                {!loading && error && (
                    <Box p={3}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                {/* Empty State */}
                {!loading && !error && groups.length === 0 && (
                    <Box textAlign="center" py={8} px={3}>
                        <GroupIcon sx={{ fontSize: 48, mb: 2, color: 'rgba(188, 156, 255, 0.2)' }} />
                        <Typography variant="h6" gutterBottom>No groups found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            You haven't created or joined any groups yet.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/groups/new')}
                        >
                            Create Your First Group
                        </Button>
                    </Box>
                )}

                {/* Groups List */}
                {!loading && !error && groups.length > 0 && (
                    <List disablePadding>
                        {groups.map((group, index) => (
                            <React.Fragment key={group.id}>
                                <ListItem
                                    button // Make list item clickable
                                    component={Link} // Use react-router Link
                                    to={`/groups/${group.id}`} // Link destination
                                    sx={{
                                        px: 2.5,
                                        py: 2, // Increase padding
                                        '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'}
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Typography variant="body1" fontWeight="medium" sx={{ mr: 1 }}>
                                                    {group.name}
                                                </Typography>
                                                <Chip
                                                    icon={group.role === 'creator' ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                                                    label={group.role === 'creator' ? 'Owner' : 'Member'}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 24, fontSize: '0.75rem' }}
                                                    color={group.role === 'creator' ? 'primary' : 'default'}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                {group.memberCount} member{group.memberCount !== 1 ? 's' : ''} • Created {formatDate(group.createdAt)}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="View Group">
                                            <IconButton
                                                edge="end"
                                                component={Link}
                                                to={`/groups/${group.id}`}
                                                size="small"
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < groups.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(188, 156, 255, 0.05)' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
};

export default GroupsListPage;