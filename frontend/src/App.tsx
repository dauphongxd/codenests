import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CreateSnippetPage from "./pages/CreateSnippetPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ViewSnippetPage from "./pages/ViewSnippetPage";
import LatestSnippetsPage from "./pages/LatestSnippetsPage";
import GroupsListPage from "./pages/GroupsListPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import MessagesPage from "./pages/MessagesPage"; // Renamed to avoid conflicts
import ConversationPage from "./pages/ConversationPage"; // Renamed to avoid conflicts
import NewMessagePage from "./pages/NewMessagePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import React, { ReactNode } from 'react'; // Import ReactNode type

// Create a dark theme that matches the existing website colors
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#673CE3', // Purple from your existing theme
        },
        secondary: {
            main: '#BCA4F5', // Light purple from your theme
        },
        background: {
            default: '#0D0D11', // Dark background from your theme
            paper: '#16151C',   // Dark card background from your theme
        },
        text: {
            primary: '#ffffff',
            secondary: '#9C95AC', // Gray text color from your theme
        },
        divider: 'rgba(188, 156, 255, 0.1)', // Border color from your theme
    },
    typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                contained: {
                    boxShadow: 'inset 0px 2px 1px -1px rgba(255, 255, 255, 0.12), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
    },
});

// Define props interface for Layout component
interface LayoutProps {
    children: ReactNode;
}

// Create a Layout component that will be used across all routes
const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="grain" style={{
            minHeight: '100vh',
            position: 'relative',
            // Remove overflow: hidden
        }}>
            {/*
                Positioned container for glow effects -
                This container uses absolute positioning but has a fixed height/width
                to prevent it from affecting the document flow
            */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0
            }}>
                {/* Purple gradient effects with proper z-index */}
                <div className="purple-glow" style={{
                    position: 'absolute',
                    width: '40rem',
                    height: '10rem',
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    backgroundColor: 'rgba(111, 50, 240, 0.25)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '-48px',
                    zIndex: -5,
                    pointerEvents: 'none'
                }}></div>

                <div className="purple-glow-bottom" style={{
                    position: 'absolute',
                    width: '40rem',
                    height: '10rem',
                    borderRadius: '50%',
                    filter: 'blur(200px)',
                    backgroundColor: 'rgba(111, 50, 240, 1)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '-24rem',
                    zIndex: -5,
                    pointerEvents: 'none'
                }}></div>
            </div>

            <Navbar />
            {/* Main content with proper z-index */}
            <main style={{ position: 'relative', zIndex: 5 }}>
                {children}
            </main>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/messages/conversation/:userId" element={<ConversationPage />} />
                            <Route path="/code/new" element={<CreateSnippetPage />} />
                            <Route path="/code/latest" element={<LatestSnippetsPage />} />
                            <Route path="/code/:uuid" element={<ViewSnippetPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/groups" element={<GroupsListPage />} />
                            <Route path="/groups/new" element={<CreateGroupPage />} />
                            <Route path="/groups/:id" element={<GroupDetailPage />} />
                            {/* Use the new MUI pages here */}
                            <Route path="/messages" element={<MessagesPage />} />
                            <Route path="/messages/new" element={<NewMessagePage />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="*" element={<div style={{ textAlign: 'center', padding: '5rem' }}>Page not found</div>} />
                        </Routes>
                    </Layout>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;