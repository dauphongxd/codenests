import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CreateSnippetPage from "./pages/CreateSnippetPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ViewSnippetPage from "./pages/ViewSnippetPage";
import LatestSnippetsPage from "./pages/LatestSnippetsPage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="grain" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
                    {/* Purple gradient effects */}
                    <div className="purple-glow"></div>
                    <div className="purple-glow-bottom"></div>

                    <Navbar />
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/code/new" element={<CreateSnippetPage />} />
                            <Route path="/code/latest" element={<LatestSnippetsPage />} />
                            <Route path="/code/:uuid" element={<ViewSnippetPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="*" element={<div style={{ textAlign: 'center', padding: '5rem' }}>Page not found</div>} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;