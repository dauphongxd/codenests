import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LatestSnippetsPage = () => {
    const [snippets, setSnippets] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestSnippets = async () => {
            try {
                const data = await snippetService.getLatest();
                setSnippets(data.snippets || []);
                setAuthors(data.authors || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestSnippets();
    }, []);

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
                <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                            Error Loading Snippets
                        </h2>
                        <p style={{ color: '#9C95AC', marginBottom: '1.5rem' }}>
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '2rem' }}>
                    Latest Code Snippets
                </h1>

                {snippets.length === 0 ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: '#9C95AC', marginBottom: '1.5rem' }}>
                            No snippets available yet.
                        </p>
                        <Link to="/code/new" className="btn-primary">
                            Create First Snippet
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {snippets.map((snippet, index) => (
                            <div className="card" key={snippet.uuid}>
                                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                        Snippet #{index + 1}
                                    </h3>
                                    <span style={{ color: '#9C95AC' }}>
                    By: <span style={{ color: '#673CE3' }}>{authors[index]?.name || 'Unknown'}</span>
                  </span>
                                </div>
                                <div className="card-body">
                  <pre style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', margin: '0 0 1rem', maxHeight: '150px' }}>
                    <code>{snippet.code.length > 150 ? `${snippet.code.substring(0, 150)}...` : snippet.code}</code>
                  </pre>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <small style={{ color: '#9C95AC' }}>Created: {snippet.date}</small>
                                        <Link to={`/code/${snippet.uuid}`} className="btn-primary">
                                            View Full Snippet
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LatestSnippetsPage;