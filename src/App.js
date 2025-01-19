import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, MessageCircle, Share2, Music2, Zap, Trash2, TrendingUp } from 'lucide-react';
import './styles/globals.css'

// Separate data for different tabs
const defaultPosts = {
    foryou: [
        {
            id: 1,
            author: "yuhh.aesthetic",
            content: "no bc this fit is giving everything rn fr fr 💅✨",
            vibe: "aesthetic",
            timestamp: "rn",
            mood: "🦋",
            aiScore: 0.8
        },
        {
            id: 2,
            author: "main.character.energy",
            content: "bestie vibes only! living my y2k dreams aesthetic core",
            vibe: "core",
            timestamp: "10 mins ago",
            mood: "🌈",
            aiScore: 0.9
        }
    ],
    trending: [
        {
            id: 3,
            author: "viral.moment",
            content: "THIS TREND IS TAKING OVER 🔥 #trendwatch",
            vibe: "viral",
            timestamp: "trending now",
            mood: "🚀",
            aiScore: 0.95
        },
        {
            id: 4,
            author: "trend.setter",
            content: "everyone needs to try this aesthetic rn no fr",
            vibe: "trending",
            timestamp: "2hrs ago",
            mood: "💫",
            aiScore: 0.85
        }
    ]
};

// Mock database with tab support
const Database = {
    getPosts: (tab) => {
        const stored = localStorage.getItem(`posts_${tab}`);
        return stored ? JSON.parse(stored) : defaultPosts[tab];
    },
    savePosts: (tab, posts) => {
        localStorage.setItem(`posts_${tab}`, JSON.stringify(posts));
    },
    addPost: (tab, post) => {
        const posts = Database.getPosts(tab);
        const newPost = {
            ...post,
            id: Date.now(),
            timestamp: 'rn',
            likes: 0,
            aiScore: Math.random()
        };
        posts.unshift(newPost);
        Database.savePosts(tab, posts);
        return newPost;
    },
    deletePost: (tab, postId) => {
        const posts = Database.getPosts(tab).filter(post => post.id !== postId);
        Database.savePosts(tab, posts);
    }
};

const AIRecommender = {
    processText: (text) => {
        const trendyWords = ['slay', 'bestie', 'vibes', 'aesthetic', 'core', 'literally', 'fr'];
        return trendyWords.reduce((score, word) => {
            return score + (text.toLowerCase().includes(word) ? 1 : 0);
        }, 0);
    },

    rankPosts: (posts) => {
        return posts.map(post => ({
            ...post,
            aiScore: AIRecommender.processText(post.content) + (post.likes * 0.5)
        }))
            .sort((a, b) => b.aiScore - a.aiScore);
    }
};

const App = () => {
    const [activeTab, setActiveTab] = useState('foryou');
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [likes, setLikes] = useState({});
    const [isTabChanging, setIsTabChanging] = useState(false);

    // Load posts based on active tab
    useEffect(() => {
        setIsTabChanging(true);
        const loadedPosts = Database.getPosts(activeTab);
        const rankedPosts = AIRecommender.rankPosts(loadedPosts);

        // Add slight delay for tab transition
        setTimeout(() => {
            setPosts(rankedPosts);
            setIsTabChanging(false);
        }, 300);
    }, [activeTab]);

    const handleAddPost = () => {
        if (!newPost.trim()) return;

        setIsPosting(true);
        const post = Database.addPost(activeTab, {
            author: "user." + Math.random().toString(36).slice(2, 7),
            content: newPost,
            vibe: activeTab === 'trending' ? 'trending' : 'fresh',
            mood: "✨"
        });

        setTimeout(() => {
            setPosts(prev => AIRecommender.rankPosts([post, ...prev]));
            setNewPost('');
            setIsPosting(false);
        }, 300);
    };

    const handleLike = (postId) => {
        setLikes(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));

        setPosts(prev => {
            const updated = prev.map(post =>
                post.id === postId
                    ? { ...post, likes: (post.likes || 0) + (likes[postId] ? -1 : 1) }
                    : post
            );
            Database.savePosts(activeTab, updated);
            return AIRecommender.rankPosts(updated);
        });
    };

    const handleDelete = (postId) => {
        Database.deletePost(activeTab, postId);
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    const handleTabChange = (tab) => {
        setIsTabChanging(true);
        setActiveTab(tab);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
            {/* Header */}
            <div className="sticky top-0 backdrop-blur-lg bg-white bg-opacity-20 p-4">
                <div className="max-w-lg mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        aesthetic vibes
                    </h1>
                    <Music2 className="w-6 h-6 text-white animate-pulse" />
                </div>
            </div>

            {/* New Post Input */}
            <div className="max-w-lg mx-auto mt-6 px-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-4 mb-6">
          <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="spill the tea bestie..."
              className="w-full bg-transparent text-white placeholder-white placeholder-opacity-60 border-none focus:ring-0 resize-none"
              rows="2"
          />
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddPost}
                            disabled={isPosting}
                            className={`px-4 py-2 rounded-full bg-white text-purple-600 font-medium transition-all hover:scale-105 ${
                                isPosting ? 'opacity-50' : ''
                            }`}
                        >
                            {isPosting ? 'posting...' : 'post it bestie'}
                        </button>
                    </div>
                </div>

                {/* Tab Navigation with sliding indicator */}
                <div className="flex gap-4 mb-6 relative">
                    <div
                        className="absolute h-full bg-white rounded-full transition-all duration-300"
                        style={{
                            width: '130px',
                            left: activeTab === 'foryou' ? '0' : '134px',
                            opacity: '0.2'
                        }}
                    />
                    <button
                        onClick={() => handleTabChange('foryou')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative z-10 ${
                            activeTab === 'foryou'
                                ? 'text-white scale-105'
                                : 'text-white hover:bg-white hover:bg-opacity-20'
                        }`}
                    >
                        <Zap className="w-4 h-4" />
                        for u bestie
                    </button>
                    <button
                        onClick={() => handleTabChange('trending')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 relative z-10 ${
                            activeTab === 'trending'
                                ? 'text-white scale-105'
                                : 'text-white hover:bg-white hover:bg-opacity-20'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        trending rn
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="max-w-lg mx-auto space-y-6 p-4">
                <div className={`transition-opacity duration-300 ${isTabChanging ? 'opacity-0' : 'opacity-100'}`}>
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-102 mb-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs">
                    {post.mood}
                  </span>
                                    <div>
                                        <h2 className="font-bold text-white">{post.author}</h2>
                                        <p className="text-sm text-white opacity-75">{post.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white bg-opacity-20 text-white text-xs">
                    {post.vibe}
                  </span>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="text-white opacity-50 hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-white mb-4 text-lg">{post.content}</p>

                            <div className="flex gap-6">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 transition-all ${
                                        likes[post.id]
                                            ? 'text-red-400 scale-105'
                                            : 'text-white hover:text-red-400 hover:scale-105'
                                    }`}
                                >
                                    <Heart
                                        className={`w-5 h-5 ${likes[post.id] ? 'fill-current' : ''}`}
                                    />
                                    slay {post.likes > 0 && `(${post.likes})`}
                                </button>

                                <button className="flex items-center gap-2 text-white hover:text-blue-300 hover:scale-105 transition-all">
                                    <MessageCircle className="w-5 h-5" />
                                    spill
                                </button>

                                <button className="flex items-center gap-2 text-white hover:text-green-300 hover:scale-105 transition-all">
                                    <Share2 className="w-5 h-5" />
                                    share
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;