import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { snippetService } from '../services/api';

const ViewSnippetPage = () => {
    const { uuid } = useParams();
    const location = useLocation();
    const [snippet, setSnippet] = useState(null);
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [remainingTime, setRemainingTime] = useState(null);

    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                // Only skip increment if explicitly passed in URL
                // This will only happen when coming directly from snippet creation
                const searchParams = new URLSearchParams(location.search);
                const skipIncrement = searchParams.get('skipIncrement') === 'true';

                // Clear the skipIncrement parameter from URL after first load
                // so future refreshes will count as views
                if (skipIncrement) {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }

                const data = await snippetService.getById(uuid, skipIncrement);

                if (data.snippet) {
                    setSnippet(data.snippet);
                    setAuthor(data.author);

                    if (data.snippet.isRestrictedByTime && data.snippet.remainingSeconds > 0) {
                        setRemainingTime(data.snippet.remainingSeconds);
                    }
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                setError(err.message || 'Snippet not found or has expired');
            } finally {
                setLoading(false);
            }
        };

        fetchSnippet();
    }, [uuid, location.search]);

    // Set up countdown timer if needed
    useEffect(() => {
        if (remainingTime && remainingTime > 0) {
            const timer = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [remainingTime]);

    // Apply syntax highlighting
    useEffect(() => {
        if (snippet && !loading) {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }, [snippet, loading]);

    const formatTime = (seconds) => {
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
        if (snippet) {
            navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <div style={{ display: 'inline-block', width: '2rem', height: '2rem', borderRadius: '50%', borderTop: '3px solid #673CE3', borderRight: '3px solid transparent', animation: 'spin 1s linear infinite' }}>
                    <style>
                        {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}
                    </style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                            Snippet Not Found
                        </h2>
                        <p style={{ color: '#9C95AC', marginBottom: '1.5rem' }}>
                            {error}
                        </p>
                        <Link to="/" className="btn-primary">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            {snippet && (
                <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                Code Snippet
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem', color: '#9C95AC', fontSize: '0.875rem' }}>
                                <span>Created: {snippet.date}</span>

                                {snippet.isRestrictedByTime && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {remainingTime > 0 ? (
                        <>
                            <span style={{ display: 'inline-block', width: '0.5rem', height: '0.5rem', backgroundColor: '#673CE3', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                            <style>
                                {`
                            @keyframes pulse {
                              0% { opacity: 0.3; }
                              50% { opacity: 1; }
                              100% { opacity: 0.3; }
                            }
                          `}
                            </style>
                            Expires in: {formatTime(remainingTime)}
                        </>
                    ) : (
                        `Expired: ${snippet.expiryDate}`
                    )}
                  </span>
                                )}

                                {snippet.viewLimit > 0 && (
                                    <span>
                    Views: {snippet.viewCount}/{snippet.viewLimit}
                  </span>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
              <pre style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1.5rem', borderRadius: '0.5rem', overflow: 'auto', margin: '0 0 1rem' }}>
                <code>{snippet.code}</code>
              </pre>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    onClick={handleCopyCode}
                                    className="btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {copied ? (
                                            <path d="M20 6L9 17l-5-5" />
                                        ) : (
                                            <>
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                            </>
                                        )}
                                    </svg>
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>

                                <div>
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/code/${snippet.uuid}`}
                                        readOnly
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: '#9C95AC',
                                            padding: '0.5rem 1rem',
                                            fontSize: '0.875rem',
                                            width: '280px'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {author && author.name !== 'Unknown' && (
                        <div className="card">
                            <div className="card-header">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                    About the Author
                                </h3>
                                <span style={{ color: '#673CE3' }}>{author.name}</span>
                            </div>

                            <div className="card-body">
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {author.personal && (
                                        <a
                                            href={author.personal}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                        >
                                            Personal Website
                                        </a>
                                    )}

                                    {author.github && (
                                        <a
                                            href={author.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                        >
                                            GitHub
                                        </a>
                                    )}

                                    {author.linkedin && (
                                        <a
                                            href={author.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary"
                                        >
                                            LinkedIn
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewSnippetPage;