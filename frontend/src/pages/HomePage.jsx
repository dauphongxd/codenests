import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
                <div className="card">
                    <div style={{ padding: '2rem 2rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1.5rem' }}>
                            Share Code Snippets with <span style={{ color: '#673CE3' }}>Smart Expiration</span>
                        </h1>

                        <p style={{ color: '#9C95AC', fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '36rem', margin: '0 auto 2rem' }}>
                            CodeNest lets you share code snippets with time or view limits. Perfect for sharing sensitive information or temporary solutions.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                            <Link
                                to="/code/new"
                                className="btn-primary"
                                style={{ padding: '0.75rem 1.5rem' }}
                            >
                                Create Snippet
                            </Link>

                            {/* "View Latest" button removed for privacy reasons */}
                        </div>
                    </div>
                </div>

                {/* Features section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                    <FeatureCard
                        title="Time-Based Expiry"
                        description="Set your code snippets to automatically vanish after a specific time period, ensuring sensitive data doesn't linger."
                        icon="⏱️"
                    />
                    <FeatureCard
                        title="View Limits"
                        description="Allow your snippet to be viewed only a certain number of times before it permanently vanishes."
                        icon="👁️"
                    />
                    <FeatureCard
                        title="End-to-End Security"
                        description="Your code snippets are encrypted and secure, vanishing completely once they've expired."
                        icon="🔒"
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ title, description, icon }) => {
    return (
        <div className="card" style={{ padding: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>{title}</h3>
            <p style={{ color: '#9C95AC' }}>{description}</p>
        </div>
    );
};

export default HomePage;