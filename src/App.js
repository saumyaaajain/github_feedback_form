import React, { useState, useEffect } from 'react';
import { Star, GitFork, AlertCircle, Clock, Code } from 'lucide-react';

const App = () => {
    const [repoData, setRepoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRepoDetails = async () => {
            try {
                const response = await fetch('/.netlify/functions/get-repo-details');
                if (!response.ok) {
                    throw new Error('Failed to fetch repository details');
                }
                const data = await response.json();
                setRepoData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRepoDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading repository details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 bg-red-100 p-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {repoData.name}
                    </h1>

                    {repoData.description && (
                        <p className="text-gray-600 mb-6">
                            {repoData.description}
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Star className="text-yellow-500" size={20} />
                            <span className="text-gray-700">{repoData.stars} stars</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <GitFork className="text-blue-500" size={20} />
                            <span className="text-gray-700">{repoData.forks} forks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-gray-700">{repoData.openIssues} open issues</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Code className="text-green-500" size={20} />
                            <span className="text-gray-700">{repoData.language}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600">
                Created: {formatDate(repoData.createdAt)}
              </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="text-gray-400" size={16} />
                            <span className="text-sm text-gray-600">
                Last updated: {formatDate(repoData.updatedAt)}
              </span>
                        </div>
                    </div>

                    {repoData.homepage && (
                        <div className="mt-6">
                            <a
                                href={repoData.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 underline"
                            >
                                Visit homepage
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;