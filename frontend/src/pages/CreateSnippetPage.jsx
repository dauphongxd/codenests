import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { snippetService } from '../services/api'; // Ensure this path is correct
import {
    Container,
    Paper,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Grid,
    InputAdornment,
    useTheme
} from '@mui/material';
import {
    Code as CodeIcon,
    Timer as TimerIcon,
    Visibility as VisibilityIcon,
    Label as LabelIcon,
    Title as TitleIcon
} from '@mui/icons-material'; // Import icons

const CreateSnippetPage = () => {
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [limitType, setLimitType] = useState('none'); // 'none', 'time', 'views'
    const [timeLimit, setTimeLimit] = useState(10); // Default to 10 mins
    const [viewLimit, setViewLimit] = useState(10); // Default to 10 views
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme(); // Access theme for consistent styling

    // Define consistent card styles (similar to DashboardPage)
    const cardStyle = {
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? '#16151C' : 'background.paper',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(188, 156, 255, 0.1)' : 'divider',
        overflow: 'hidden',
    };

    const cardHeaderStyle = {
        p: 2.5, // Slightly more padding for header
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(13, 12, 16, 1)' : 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleLimitTypeChange = (e) => {
        const newType = e.target.value;
        setLimitType(newType);
        if (newType === 'time') {
            setViewLimit(10);
            if (timeLimit <= 0) setTimeLimit(10);
        } else if (newType === 'views') {
            setTimeLimit(10);
            if (viewLimit <= 0) setViewLimit(10);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!code.trim()) {
            setError('Code content cannot be empty.');
            return;
        }
        if (limitType === 'time' && (!timeLimit || timeLimit <= 0)) {
            setError('Please enter a valid time limit greater than 0.');
            return;
        }
        if (limitType === 'views' && (!viewLimit || viewLimit <= 0)) {
            setError('Please enter a valid view limit greater than 0.');
            return;
        }

        setIsLoading(true);

        let expirationType = null;
        let expirationValue = 0;

        if (limitType === 'time') {
            expirationType = 'TIME';
            expirationValue = timeLimit * 60; // Convert minutes to seconds
        } else if (limitType === 'views') {
            expirationType = 'VIEWS';
            expirationValue = viewLimit;
        }

        const payload = {
            title: title.trim() || "Untitled Snippet",
            content: code,
            expirationType,
            expirationValue,
            tags: tags
        };

        try {
            const response = await snippetService.create(payload);
            if (response && response.uuid) {
                // Navigate but skip the immediate view count increment
                navigate(`/code/${response.uuid}?skipIncrement=true`);
            } else {
                const message = response?.message || 'Failed to create snippet - invalid response from server.';
                throw new Error(message);
            }
        } catch (err) {
            console.error('Error creating snippet:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const isSubmitDisabled = isLoading || !code.trim() ||
        (limitType === 'time' && (!timeLimit || timeLimit <= 0)) ||
        (limitType === 'views' && (!viewLimit || viewLimit <= 0));

    return (
        <Container
            maxWidth="md" // Consistent container size
            sx={{
                py: 4,
                px: { xs: 2, sm: 3 },
                position: 'relative', // Ensure container is above background effects
                zIndex: 5
            }}
        >
            <Paper elevation={0} sx={cardStyle}>
                <Box sx={cardHeaderStyle}>
                    <CodeIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                        Create New Snippet
                    </Typography>
                </Box>

                <Box p={3}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        {/* Title Field */}
                        <TextField
                            label="Title (Optional)"
                            fullWidth
                            variant="outlined"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TitleIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Code Field */}
                        <TextField
                            label="Code"
                            required
                            fullWidth
                            multiline
                            rows={12} // Adjust rows as needed
                            variant="outlined"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={isLoading}
                            placeholder="Paste your code here..."
                            sx={{
                                mb: 3,
                                '& .MuiInputBase-input': { // Style textarea
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5,
                                },
                                '& .MuiOutlinedInput-root': { // Maintain dark background
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(13, 13, 17, 0.3)' : 'rgba(0, 0, 0, 0.02)',
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ mt: -12 }}> {/* Adjust vertical position */}
                                        <CodeIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Expiration Limit */}
                        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium', fontSize: '0.95rem' }}>
                                Expiration Limit
                            </FormLabel>
                            <RadioGroup
                                row
                                aria-label="expiration limit"
                                name="limitType"
                                value={limitType}
                                onChange={handleLimitTypeChange}
                            >
                                <FormControlLabel value="none" control={<Radio />} label="None" disabled={isLoading} />
                                <FormControlLabel value="time" control={<Radio />} label="By Time" disabled={isLoading} />
                                <FormControlLabel value="views" control={<Radio />} label="By Views" disabled={isLoading} />
                            </RadioGroup>
                        </FormControl>

                        {/* Conditional Limit Inputs */}
                        <Grid container spacing={2} sx={{ mb: 3, minHeight: '80px' }}> {/* Grid for layout */}
                            <Grid item xs={12} sm={6} sx={{ display: limitType === 'time' ? 'block' : 'none' }}>
                                <TextField
                                    label="Time Limit"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={isLoading || limitType !== 'time'}
                                    required={limitType === 'time'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TimerIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                                        inputProps: { min: 1 }
                                    }}
                                    helperText={limitType === 'time' && timeLimit > 0 ? `Expires after ${timeLimit} minute${timeLimit === 1 ? '' : 's'}` : ' '}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: limitType === 'views' ? 'block' : 'none' }}>
                                <TextField
                                    label="View Limit"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={viewLimit}
                                    onChange={(e) => setViewLimit(Math.max(1, parseInt(e.target.value) || 1))}
                                    disabled={isLoading || limitType !== 'views'}
                                    required={limitType === 'views'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <VisibilityIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: <InputAdornment position="end">views</InputAdornment>,
                                        inputProps: { min: 1 }
                                    }}
                                    helperText={limitType === 'views' && viewLimit > 0 ? `Vanishes after ${viewLimit} view${viewLimit === 1 ? '' : 's'}` : ' '}
                                />
                            </Grid>
                        </Grid>

                        {/* Tags */}
                        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium', fontSize: '0.95rem' }}>
                                Tags (Optional)
                            </FormLabel>
                            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                                {tags.map(tag => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onDelete={() => removeTag(tag)}
                                        size="small"
                                        sx={{
                                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(22, 21, 28, 0.7)' : 'rgba(0, 0, 0, 0.08)',
                                            color: theme.palette.mode === 'dark' ? '#9C95AC' : 'text.secondary',
                                            mb: 0.5 // Margin bottom for wrap spacing
                                        }}
                                    />
                                ))}
                            </Stack>
                            <TextField
                                label="Add a Tag"
                                fullWidth
                                variant="outlined"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                disabled={isLoading}
                                placeholder="Type tag and press Enter"
                                size="small" // Make tag input smaller
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LabelIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </FormControl>

                        {/* Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitDisabled}
                                size="large"
                                sx={{
                                    minWidth: '180px',
                                    py: 1.2,
                                    bgcolor: theme.palette.mode === 'dark' ? '#673CE3' : 'primary.main',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? '#774BF3' : 'primary.dark',
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Create Snippet'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateSnippetPage;