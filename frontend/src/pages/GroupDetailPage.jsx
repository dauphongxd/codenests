import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { groupService, snippetService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
    Container, Paper, Box, Grid, Typography, List, ListItem,
    ListItemAvatar, ListItemText, Avatar, IconButton, TextField,
    Button, CircularProgress, Alert, Divider, Tooltip, Chip,
    Dialog, DialogActions, DialogContent, DialogTitle, RadioGroup,
    FormControlLabel, Radio, ListItemButton, useTheme
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, Group as GroupIcon, PersonAdd as PersonAddIcon,
    Delete as DeleteIcon, AdminPanelSettings as AdminPanelSettingsIcon,
    Person as PersonIcon, Code as CodeIcon, Add as AddIcon, Share as ShareIcon,
    Close as CloseIcon, Link as LinkIcon
} from '@mui/icons-material';

// --- Helper Functions (Keep as before) ---
const getAvatarInfo = (name) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';
    let hash = 0;
    for (let i = 0; i < (name?.length || 0); i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688'];
    const color = colors[Math.abs(hash) % colors.length];
    return { initials, color };
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- Group Detail Page Component ---
const GroupDetailPage = () => {
    const { id: groupId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [sharedSnippets, setSharedSnippets] = useState([]);

    // State for Group Details
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);

    // State for Snippets
    const [groupSnippets, setGroupSnippets] = useState([]); // Holds snippets shared *to* this group for display
    const [userSnippets, setUserSnippets] = useState([]); // Holds the current user's own snippets for selection modal
    const [selectedSnippetId, setSelectedSnippetId] = useState(null); // Will store the selected UUID

    // State for UI Control
    const [loading, setLoading] = useState(true);
    const [addingMember, setAddingMember] = useState(false);
    const [loadingUserSnippets, setLoadingUserSnippets] = useState(false);
    const [sharingSnippet, setSharingSnippet] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // State for Errors
    const [error, setError] = useState(null);
    const [addMemberError, setAddMemberError] = useState('');
    const [shareError, setShareError] = useState('');


    // --- Styles (Keep as before) ---
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
        height: '100%', // Make card fill grid height
        display: 'flex', // Enable flexbox for vertical stretching
        flexDirection: 'column' // Stack header, content, footer vertically
    };
    const cardHeaderStyle = {
        p: 2.5,
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexShrink: 0 // Prevent header from shrinking
    };
    const cardContentStyle = {
        flexGrow: 1, // Allow content area to grow
        overflow: 'auto', // Add scroll if content overflows
        p: 0 // Remove padding for List/Box inside
    };
    const cardFooterStyle = {
        p: 2.5,
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        flexShrink: 0 // Prevent footer from shrinking
    };

    const fetchGroupSnippetsAndUpdateState = async () => {
        try {
            const snippetsData = await groupService.getGroupSnippets(groupId);
            if (snippetsData.success) {
                const fetchedGroupSnippets = snippetsData.snippets || [];
                setGroupSnippets(fetchedGroupSnippets); // Update display list

                // Update tracking state with UUIDs
                const sharedUuids = fetchedGroupSnippets.map(snippet => snippet.uuid);
                setSharedSnippets(sharedUuids); // <-- Store UUIDs
                console.log("Updated sharedSnippets (UUIDs):", sharedUuids); // Debug log
            } else {
                console.warn("Failed to fetch group snippets:", snippetsData.message);
                // Optionally set an error state here if needed
            }
        } catch (err) {
            console.error("Error fetching shared snippets:", err);
            // Optionally set an error state here
        }
    };


    // --- Data Fetching ---
    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch group members
                const memberData = await groupService.getGroupDetails(groupId);
                if (memberData.success) {
                    setGroup({ id: memberData.groupId, name: memberData.groupName });
                    const creator = memberData.members?.find(m => m.isCreator);
                    const isCreator = creator?.uuid === currentUser?.uuid;
                    setIsCurrentUserCreator(isCreator);
                    setMembers(memberData.members || []);
                } else {
                    throw new Error(memberData.message || 'Failed to load group members');
                }

                // Fetch shared snippets and update state (uses the new function)
                await fetchGroupSnippetsAndUpdateState();

                // Fetch user's own snippets for the sharing dialog (keep as before)
                try {
                    const userSnippetsData = await snippetService.getUserSnippets();
                    if (userSnippetsData.success) {
                        const accessibleSnippets = userSnippetsData.snippets?.filter(s => s.isAccessible === true) || [];
                        setUserSnippets(accessibleSnippets);
                    }
                } catch (err) {
                    console.warn("Error fetching user snippets:", err);
                }

            } catch (err) {
                setError(err.message || 'An error occurred loading group data');
                setGroup(null); setMembers([]); setGroupSnippets([]); setSharedSnippets([]);
            } finally {
                setLoading(false);
            }
        };

        if (groupId && currentUser) {
            fetchGroupData();
        }
    }, [groupId, currentUser]);


    // --- Event Handlers ---
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail.trim()) {
            setAddMemberError('Email is required'); return;
        }
        try {
            setAddingMember(true); setAddMemberError('');
            const result = await groupService.addMember(groupId, newMemberEmail.trim());
            if (result.success) {
                await fetchGroupData(); // Refresh members list
                setNewMemberEmail('');
            } else { setAddMemberError(result.message || 'Failed to add member'); }
        } catch (err) { setAddMemberError(err.message || 'An error occurred');
        } finally { setAddingMember(false); }
    };

    const handleRemoveMember = async (userIdToRemove, username) => {
        if (!window.confirm(`Are you sure you want to remove ${username} from the group?`)) return;
        try {
            const result = await groupService.removeMember(groupId, userIdToRemove);
            if (result.success) {
                setMembers(prevMembers => prevMembers.filter(member => member.id !== userIdToRemove));
            } else { setError(result.message || 'Failed to remove member'); } // Show main error
        } catch (err) { setError(err.message || 'An error occurred removing member'); }
    };

    // --- Share Snippet Modal Handlers ---
    const handleOpenShareModal = async () => {
        setIsShareModalOpen(true);
        setShareError('');
        setSelectedSnippetId(null); // Reset selection
        setLoadingUserSnippets(true);

        if (!currentUser) {
            setShareError("You must be logged in to share snippets.");
            setLoadingUserSnippets(false);
            return;
        }

        try {
            const snippetData = await snippetService.getUserSnippets();
            if (snippetData && snippetData.success) {
                const fetchedSnippets = snippetData.snippets || [];
                const accessibleSnippets = fetchedSnippets.filter(s => s.isAccessible === true);
                setUserSnippets(accessibleSnippets);
                if (accessibleSnippets.length === 0) {
                    setShareError("You don't have any accessible snippets to share.");
                }
            } else {
                setShareError(snippetData?.message || "Could not load your snippets.");
            }
        } catch (err) {
            setShareError(err.message || "An error occurred fetching your snippets.");
        } finally {
            setLoadingUserSnippets(false);
        }
    };


    const handleCloseShareModal = () => {
        if (!sharingSnippet) { // Prevent closing while sharing is in progress
            setIsShareModalOpen(false);
        }
    };

    const handleSelectSnippet = (event) => {
        const selectedUuid = event.target.value; // This is the UUID
        console.log("Selected snippet UUID:", selectedUuid);
        setSelectedSnippetId(selectedUuid); // Store the UUID
    };

    const handleConfirmShare = async () => {
        if (!selectedSnippetId) { // selectedSnippetId holds the UUID
            setShareError("Please select a snippet to share.");
            return;
        }

        setSharingSnippet(true);
        setShareError('');

        try {
            console.log(`Sharing snippet with UUID ${selectedSnippetId} to group ${groupId}`);
            const result = await groupService.shareSnippet(groupId, selectedSnippetId); // Pass the UUID

            if (result.success) {
                // --- Strategy Change: Refetch group snippets for consistency ---
                await fetchGroupSnippetsAndUpdateState(); // Call the refetch function
                // --- End Refetch Strategy ---

                handleCloseShareModal(); // Close the modal
            } else {
                setShareError(result.message || "Failed to share snippet");
            }

        } catch (err) {
            console.error("Error sharing snippet:", err);
            setShareError(err.message || "Failed to share snippet");
        } finally {
            setSharingSnippet(false);
        }
    };


    // --- Render Logic ---
    if (loading && !group) { // Show loading only on initial load
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
    }

    if (error && !group) { // Show full page error only if group data failed entirely
        return (
            <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
                <Paper sx={{ ...cardStyle, p: 4, height: 'auto' }}> {/* Override height for error */}
                    <Typography variant="h5" color="error" gutterBottom>Error Loading Group</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
                    <Button variant="contained" onClick={() => navigate('/groups')}>Back to Groups</Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 }, zIndex: 5, position: 'relative' }}>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => navigate('/groups')} sx={{ mr: 1.5 }}><ArrowBackIcon /></IconButton>
                <Typography variant="h4" fontWeight="bold">{group?.name || 'Group Details'}</Typography>
                {error && !loading && ( /* Show non-critical errors */
                    <Alert severity="warning" sx={{ ml: 'auto', py: 0.5, px: 1.5 }} onClose={() => setError(null)}>{error}</Alert>
                )}
            </Box>

            <Grid container spacing={3} sx={{ alignItems: 'stretch' }}> {/* Add alignItems stretch */}
                {/* Members Section */}
                <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={cardHeaderStyle}>
                            <GroupIcon sx={{ color: theme.palette.primary.light }} />
                            <Typography variant="h6" fontWeight="bold">Members ({members.length})</Typography>
                        </Box>
                        {/* Apply cardContentStyle to the container of the List */}
                        <Box sx={cardContentStyle}>
                            <List sx={{ p: 0 }}> {/* Remove List padding */}
                                {members.map((member, index) => {
                                    const { initials, color } = getAvatarInfo(member.username);
                                    return (
                                        <React.Fragment key={member.id || member.uuid}> {/* Use UUID if ID isn't available */}
                                            <ListItem /* No secondaryAction here, handled below */ sx={{ px: 2.5, py: 1.5 }}>
                                                <ListItemAvatar sx={{ minWidth: 48 }}>
                                                    <Avatar sx={{ bgcolor: color, width: 36, height: 36 }}>{initials}</Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="body1" fontWeight="medium" noWrap>{member.username} {member.uuid === currentUser?.uuid && '(You)'}</Typography>
                                                            {member.isCreator && <Chip icon={<AdminPanelSettingsIcon fontSize="small" />} label="Owner" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', ml: 1 }} />}
                                                        </Box>
                                                    }
                                                    secondary={`Joined: ${formatDate(member.joinedAt)}`}
                                                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                />
                                                {isCurrentUserCreator && !member.isCreator && (
                                                    <Tooltip title="Remove Member">
                                                        <IconButton edge="end" onClick={() => handleRemoveMember(member.id, member.username)} size="small">
                                                            <DeleteIcon fontSize="small" color="error" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </ListItem>
                                            {index < members.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(188, 156, 255, 0.05)', mx: 2.5 }} />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Box>
                        {/* Add Member Form */}
                        {isCurrentUserCreator && (
                            <Box sx={cardFooterStyle}> {/* Use cardFooterStyle */}
                                <Typography variant="subtitle1" fontWeight="medium" mb={1.5}>Add Member</Typography>
                                {addMemberError && <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.8rem', py: 0.2 }} onClose={() => setAddMemberError('')}>{addMemberError}</Alert>}
                                <Box component="form" onSubmit={handleAddMember} display="flex" gap={1.5}>
                                    <TextField label="Email" variant="outlined" size="small" fullWidth type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="user@example.com" disabled={addingMember} />
                                    <Button type="submit" variant="contained" size="medium" disabled={addingMember || !newMemberEmail.trim()} sx={{ minWidth: 50, px: 1.5 }}>
                                        {addingMember ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon fontSize="small" />}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Shared Snippets Section */}
                <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
                    <Paper elevation={0} sx={cardStyle}>
                        <Box sx={cardHeaderStyle} justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <CodeIcon sx={{ color: theme.palette.primary.light }} />
                                <Typography variant="h6" fontWeight="bold">Shared Snippets ({groupSnippets.length})</Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ShareIcon />}
                                onClick={handleOpenShareModal} // Open the modal
                                disabled={loading} // Disable if main page is loading
                                sx={{
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.2)' : 'divider',
                                    color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                    '&:hover': { bgcolor: 'rgba(188, 156, 255, 0.05)' }
                                }}
                            >
                                Share Snippet
                            </Button>
                        </Box>
                        {/* Apply cardContentStyle here */}
                        <Box sx={cardContentStyle}>
                            {groupSnippets.length === 0 ? (
                                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" textAlign="center" p={3} height="100%" sx={{ color: 'text.secondary' }}>
                                    <CodeIcon sx={{ fontSize: 48, mb: 2, color: 'rgba(188, 156, 255, 0.2)' }} />
                                    <Typography variant="subtitle1" gutterBottom>No snippets shared yet.</Typography>
                                    <Typography variant="body2">Click "Share Snippet" to add one.</Typography>
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {groupSnippets.map((snippet, index) => (
                                        <React.Fragment key={snippet.uuid}>
                                            <ListItem
                                                secondaryAction={
                                                    <Tooltip title="View Snippet">
                                                        <IconButton edge="end" component={RouterLink} to={`/code/${snippet.uuid}`} size="small">
                                                            <LinkIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                }
                                                sx={{ px: 2.5, py: 1.5 }}
                                            >
                                                {/* You might want an icon or avatar here too */}
                                                <ListItemText
                                                    primary={snippet.title || 'Untitled Snippet'}
                                                    secondary={`Shared: ${formatDate(snippet.sharedAt)} ${snippet.sharedBy?.username ? `by ${snippet.sharedBy.username}` : ''}`} // Adjust secondary text
                                                    primaryTypographyProps={{ fontWeight: 'medium', noWrap: true }}
                                                    secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                />
                                            </ListItem>
                                            {index < groupSnippets.length - 1 && <Divider component="li" sx={{ borderColor: 'rgba(188, 156, 255, 0.05)', mx: 2.5 }} />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Share Snippet Dialog (Modal) */}
            <Dialog open={isShareModalOpen} onClose={handleCloseShareModal} fullWidth maxWidth="sm">
                <DialogTitle sx={{ pb: 1 }}>
                    Share a Snippet with {group?.name}
                    <IconButton onClick={handleCloseShareModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {shareError && <Alert severity="error" sx={{ m: 2 }}>{shareError}</Alert>}

                    {loadingUserSnippets ? (
                        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                    ) : userSnippets.length === 0 ? (
                        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                            {shareError ? shareError : "You don't have any accessible snippets to share."}
                            {!shareError && <><br /><RouterLink to="/code/new">Create one first?</RouterLink></>}
                        </Typography>
                    ) : (
                        <RadioGroup
                            value={selectedSnippetId || ""}
                            onChange={handleSelectSnippet}
                            name="snippet-selection"
                        >
                            <List disablePadding>
                                {userSnippets.map((snippet) => {
                                    // Create a string ID for consistent comparison
                                    const isSelected = selectedSnippetId === snippet.uuid;
                                    const isAlreadyShared = sharedSnippets.includes(snippet.uuid);

                                    return (
                                        <ListItem
                                            key={snippet.uuid}
                                            dense
                                            sx={{
                                                px: 3,
                                                py: 1,
                                                '&:hover': { bgcolor: 'action.hover' },
                                                bgcolor: isSelected ? 'rgba(103, 60, 227, 0.08)' : 'transparent'
                                            }}
                                        >
                                            <FormControlLabel
                                                value={snippet.uuid}
                                                control={
                                                    <Radio size="small" disabled={isAlreadyShared} />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {snippet.title || 'Untitled Snippet'}
                                                            {isAlreadyShared && (
                                                                <Chip
                                                                    size="small"
                                                                    label="Already Shared"
                                                                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                                                />
                                                            )}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Created: {formatDate(snippet.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{ flexGrow: 1, mr: 0 }}
                                                disabled={isAlreadyShared}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </RadioGroup>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseShareModal} disabled={sharingSnippet}>Cancel</Button>
                    <Button
                        onClick={handleConfirmShare}
                        variant="contained"
                        disabled={!selectedSnippetId || loadingUserSnippets || sharingSnippet}
                        sx={{ minWidth: 100 }}
                    >
                        {sharingSnippet ? <CircularProgress size={24} color="inherit" /> : 'Share'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default GroupDetailPage;