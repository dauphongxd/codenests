import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(email, password, remember);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '100%',
            padding: '3rem 1.5rem',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '28rem'
            }}>
                <div className="card" style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden'
                }}>
                    <div className="card-header" style={{
                        textAlign: 'center',
                        padding: '2rem 1.5rem',
                        borderBottom: '1px solid rgba(13, 12, 16, 1)'
                    }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Welcome Back</h2>
                        <p style={{ color: '#9C95AC', marginTop: '0.5rem' }}>Enter your credentials to access your account</p>
                    </div>

                    <div style={{
                        padding: '2rem',
                        borderTop: '1px solid rgba(188, 156, 255, 0.1)'
                    }}>
                        {error && (
                            <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#9C95AC', marginBottom: '0.5rem' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(22, 21, 28, 0.5)',
                                        border: '1px solid rgba(188, 156, 255, 0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box',
                                        boxShadow: 'inset 0px 2px 1px -1px rgba(255, 255, 255, 0.12), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.05)',
                                        transition: 'border-color 0.2s',
                                        margin: '0'
                                    }}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#9C95AC' }}>
                                        Password
                                    </label>
                                    <a href="#" style={{ fontSize: '0.75rem', color: '#673CE3', textDecoration: 'none' }}>Forgot password?</a>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(22, 21, 28, 0.5)',
                                        border: '1px solid rgba(188, 156, 255, 0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        boxSizing: 'border-box',
                                        boxShadow: 'inset 0px 2px 1px -1px rgba(255, 255, 255, 0.12), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.05)',
                                        transition: 'border-color 0.2s',
                                        margin: '0'
                                    }}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        style={{
                                            width: '1rem',
                                            height: '1rem',
                                            borderRadius: '0.25rem',
                                            backgroundColor: remember ? '#673CE3' : 'transparent',
                                            border: remember ? '1px solid #673CE3' : '1px solid rgba(188, 156, 255, 0.2)',
                                            appearance: 'none',
                                            cursor: 'pointer',
                                            marginRight: '0.5rem'
                                        }}
                                    />
                                    <span style={{ fontSize: '0.875rem', color: '#9C95AC' }}>Remember me for 30 days</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#673CE3',
                                    color: 'white',
                                    fontWeight: '600',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: 'background-color 0.2s, transform 0.1s',
                                    boxShadow: 'inset 0px 2px 1px -1px rgba(255, 255, 255, 0.12), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.05)',
                                    transform: 'translateY(0)',
                                    margin: '0',
                                }}
                                onMouseDown={() => !isLoading && { transform: 'translateY(1px)' }}
                            >
                                {isLoading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{
                        display: 'inline-block',
                        width: '1rem',
                        height: '1rem',
                        borderRadius: '50%',
                        borderTop: '2px solid white',
                        borderRight: '2px solid transparent',
                        marginRight: '0.5rem',
                        animation: 'spin 1s linear infinite'
                    }}></span>
                    Logging in...
                  </span>
                                ) : 'Sign in'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', color: '#9C95AC', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                            Don't have an account? <Link to="/register" style={{ color: '#673CE3', textDecoration: 'none', fontWeight: '500' }}>Create account</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #673CE3;
        }
        
        input[type="checkbox"]:checked::after {
          content: "";
          display: block;
          width: 0.375rem;
          height: 0.625rem;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          position: relative;
          top: 0.0625rem;
          left: 0.25rem;
        }
      `}</style>
        </div>
    );
};

export default LoginPage;