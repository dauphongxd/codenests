import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
    // Move the useAuth hook to the component level
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        personal: '',
        github: '',
        linkedin: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Use the authService instead of direct fetch
            const data = await authService.register(formData);

            if (data.success) {
                // Set user data directly from response
                setUser({
                    uuid: data.uuid,
                    name: data.name,
                    email: data.email
                });
                navigate('/');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError(error.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
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
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#9C95AC',
        marginBottom: '0.5rem'
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
                maxWidth: '32rem'
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
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Create Account</h2>
                        <p style={{ color: '#9C95AC', marginTop: '0.5rem' }}>Join CodeNest to start sharing code snippets securely</p>
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
                                <label htmlFor="name" style={labelStyle}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                    placeholder="Your name"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="email" style={labelStyle}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="password" style={labelStyle}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="personal" style={labelStyle}>
                                    Personal Website <span style={{ color: '#9C95AC', opacity: 0.7 }}>(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    id="personal"
                                    name="personal"
                                    value={formData.personal}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="github" style={labelStyle}>
                                    GitHub Profile <span style={{ color: '#9C95AC', opacity: 0.7 }}>(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    id="github"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="https://github.com/username"
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label htmlFor="linkedin" style={labelStyle}>
                                    LinkedIn Profile <span style={{ color: '#9C95AC', opacity: 0.7 }}>(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    id="linkedin"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="https://linkedin.com/in/username"
                                />
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
                                        Creating account...
                                    </span>
                                ) : 'Create account'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', color: '#9C95AC', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                            Already have an account? <Link to="/login" style={{ color: '#673CE3', textDecoration: 'none', fontWeight: '500' }}>Sign in</Link>
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
            `}</style>
        </div>
    );
};

export default RegisterPage;