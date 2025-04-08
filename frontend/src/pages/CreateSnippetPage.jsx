import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { snippetService } from '../services/api';

const CreateSnippetPage = () => {
    const [code, setCode] = useState('');
    const [timeLimit, setTimeLimit] = useState(0);
    const [viewLimit, setViewLimit] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setIsLoading(true);

        try {
            const response = await snippetService.create({
                code,
                timeLimit: parseInt(timeLimit) || 0,
                viewLimit: parseInt(viewLimit) || 0
            });

            if (response.uuid) {
                navigate(`/code/${response.uuid}?skipIncrement=true`);
            } else {
                throw new Error('Failed to create snippet - no UUID returned');
            }
        } catch (error) {
            console.error('Error creating snippet:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="card">
                    <div className="card-header">
                        <h2 className="font-bold text-xl text-white">Create a Vanishing Code Snippet</h2>
                    </div>

                    <div className="card-body">
                        {/* Added a wrapper div with width: 100% to ensure form stays within card boundaries */}
                        <div style={{ width: '100%', boxSizing: 'border-box' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-400 mb-2">
                                        Code
                                    </label>
                                    <textarea
                                        id="code"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="input-field"
                                        style={{
                                            minHeight: '300px',
                                            fontFamily: 'monospace',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder="Paste your code here..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div style={{ width: '100%' }}>
                                        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-400 mb-2">
                                            Time Limit (minutes)
                                        </label>
                                        <div className="relative" style={{ width: '100%' }}>
                                            <input
                                                type="number"
                                                id="timeLimit"
                                                value={timeLimit}
                                                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                                                className="input-field pr-16"
                                                style={{ width: '100%', boxSizing: 'border-box' }}
                                                min="0"
                                                placeholder="0 for no limit"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-sm">
                                                minutes
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {timeLimit === 0 ? "No time limit" : `Expires after ${timeLimit} minute${timeLimit === 1 ? '' : 's'}`}
                                        </p>
                                    </div>

                                    <div style={{ width: '100%' }}>
                                        <label htmlFor="viewLimit" className="block text-sm font-medium text-gray-400 mb-2">
                                            View Limit
                                        </label>
                                        <div className="relative" style={{ width: '100%' }}>
                                            <input
                                                type="number"
                                                id="viewLimit"
                                                value={viewLimit}
                                                onChange={(e) => setViewLimit(parseInt(e.target.value) || 0)}
                                                className="input-field pr-12"
                                                style={{ width: '100%', boxSizing: 'border-box' }}
                                                min="0"
                                                placeholder="0 for no limit"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-sm">
                                                views
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {viewLimit === 0 ? "No view limit" : `Vanishes after ${viewLimit} view${viewLimit === 1 ? '' : 's'}`}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !code.trim()}
                                    className="btn-primary w-full py-3"
                                    style={{
                                        opacity: (isLoading || !code.trim()) ? 0.7 : 1,
                                        cursor: (isLoading || !code.trim()) ? 'not-allowed' : 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    {isLoading ? 'Creating...' : 'Generate Vanishing Snippet'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSnippetPage;