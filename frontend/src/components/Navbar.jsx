import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { isAuthenticated, currentUser, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <header style={{ width: '100%', borderBottom: '1px solid rgba(111, 50, 240, 0.05)' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1.5rem' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        CodeNest<span style={{ color: 'rgba(188, 164, 245, 0.3)' }}>.</span><span style={{ color: '#8F69FA' }}>io</span>
                    </h1>
                </Link>

                <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link
                        to="/"
                        style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: isActive('/') ? '#673CE3' : '#9C95AC',
                            textDecoration: 'none',
                            transition: 'color 0.2s'
                        }}
                    >
                        Home
                    </Link>

                    {/* Latest link removed for privacy reasons */}

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/code/new"
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: isActive('/code/new') ? '#673CE3' : '#9C95AC',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }}
                            >
                                New Snippet
                            </Link>

                            {isAuthenticated && (
                                <Link
                                    to="/groups"
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: isActive('/groups') ? '#673CE3' : '#9C95AC',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    Groups
                                </Link>
                            )}
                            {isAuthenticated && (
                                <Link
                                    to="/messages"
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: isActive('/messages') ? '#673CE3' : '#9C95AC',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    Messages
                                </Link>
                            )}

                            {isAuthenticated && (
                                <Link
                                    to="/dashboard"
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: isActive('/dashboard') ? '#673CE3' : '#9C95AC',
                                        textDecoration: 'none',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    Dashboard
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#9C95AC',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: isActive('/register') ? '#673CE3' : '#9C95AC',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }}
                            >
                                Register
                            </Link>
                            <Link
                                to="/login"
                                className="btn-primary"
                            >
                                Login
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;