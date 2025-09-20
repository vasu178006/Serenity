import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, MessageSquare, ArrowLeft, Wind, Sprout, Heart, User, Moon, Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JournalArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, favorites
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
    loadFavorites();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API}/articles`);
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLoading(false);
      // Fallback articles
      setArticles([
        {
          id: '1',
          title: 'Understanding Anxiety: A Gentle Guide',
          content: 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can impact our daily lives. Learning to recognize the signs and developing healthy coping strategies can make a significant difference. Remember, seeking help is a sign of strength, not weakness.',
          category: 'Mental Health',
          author: 'Dr. Sarah Chen',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'The Power of Mindful Breathing',
          content: 'Breathing is something we do automatically, but when we bring conscious attention to our breath, it becomes a powerful tool for relaxation and stress relief. Try the 4-7-8 technique: inhale for 4 counts, hold for 7, exhale for 8. This simple practice can help calm your nervous system.',
          category: 'Mindfulness',
          author: 'Marcus Thompson',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const loadFavorites = async () => {
    try {
      // Try to load from backend first
      const response = await fetch(`${API}/favorites`);
      if (response.ok) {
        const backendFavorites = await response.json();
        setFavorites(backendFavorites);
        localStorage.setItem('serenity_favorite_articles', JSON.stringify(backendFavorites));
      } else {
        // Fallback to localStorage
        const savedFavorites = localStorage.getItem('serenity_favorite_articles');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    } catch (error) {
      console.error('Error loading favorites from backend:', error);
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem('serenity_favorite_articles');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  };

  const toggleFavorite = async (articleId) => {
    const isFavorited = favorites.includes(articleId);
    let updatedFavorites;

    if (isFavorited) {
      updatedFavorites = favorites.filter(id => id !== articleId);
      // Try to remove from backend
      try {
        await fetch(`${API}/favorites/${articleId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    } else {
      updatedFavorites = [...favorites, articleId];
      // Try to save to backend
      try {
        await fetch(`${API}/favorites?article_id=${articleId}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error saving favorite:', error);
      }
    }

    setFavorites(updatedFavorites);
    localStorage.setItem('serenity_favorite_articles', JSON.stringify(updatedFavorites));
  };

  const getCategoryIcon = (category, size = 'w-5 h-5') => {
    const icons = {
      'Mental Health': Brain,
      'Mindfulness': Wind,
      'Personal Growth': Sprout,
      'Wellness': Heart,
      'Therapy': MessageSquare,
      'Self-Care': User,
      'Stress Management': Zap,
      'Sleep': Moon
    };
    const IconComponent = icons[category] || BookOpen;
    return <IconComponent className={size} />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Mental Health': 'from-blue-500 to-purple-600',
      'Mindfulness': 'from-green-500 to-teal-600',
      'Personal Growth': 'from-yellow-500 to-orange-600',
      'Wellness': 'from-emerald-500 to-green-600',
      'Therapy': 'from-purple-500 to-indigo-600',
      'Self-Care': 'from-pink-500 to-rose-600',
      'Stress Management': 'from-cyan-500 to-blue-600',
      'Sleep': 'from-indigo-500 to-purple-600'
    };
    return colors[category] || 'from-gray-500 to-slate-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredArticles = activeTab === 'favorites' 
    ? articles.filter(article => favorites.includes(article.id))
    : articles;

  if (selectedArticle) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(45, 55, 72, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '3rem'
            }}
          >
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={() => setSelectedArticle(null)}
                style={{
                  background: 'rgba(107, 114, 128, 0.2)',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  marginBottom: '2rem'
                }}
              >
                ← Back to Articles
              </button>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '2rem' }}>
                  {getCategoryIcon(selectedArticle.category, 'w-10 h-10')}
                </span>
                <div>
                  <span style={{
                    background: `linear-gradient(135deg, ${getCategoryColor(selectedArticle.category).split(' ').slice(-2).join(' ')})`,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {selectedArticle.category}
                  </span>
                </div>
              </div>

              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#E2E8F0',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                {selectedArticle.title}
              </h1>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                color: '#A0AEC0',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <span>By {selectedArticle.author}</span>
                <span>{formatDate(selectedArticle.created_at)}</span>
                <button
                  onClick={() => toggleFavorite(selectedArticle.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: favorites.includes(selectedArticle.id) ? '#F59E0B' : '#6B7280',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {favorites.includes(selectedArticle.id) ? '⭐' : '☆'}
                </button>
              </div>
            </div>

            <div style={{
              color: '#E2E8F0',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              whiteSpace: 'pre-line'
            }}>
              {selectedArticle.content}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <motion.div
        className="relative z-10 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            <BookOpen className="w-6 h-6 mr-2" />
            Wellness Articles
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore curated articles on mental health, mindfulness, and personal growth
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' 
                ? 'linear-gradient(135deg, #667EEA, #764BA2)' 
                : 'rgba(45, 55, 72, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              color: activeTab === 'all' ? 'white' : '#A0AEC0',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            All Articles ({articles.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            style={{
              background: activeTab === 'favorites' 
                ? 'linear-gradient(135deg, #667EEA, #764BA2)' 
                : 'rgba(45, 55, 72, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              color: activeTab === 'favorites' ? 'white' : '#A0AEC0',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            ⭐ Favorites ({favorites.length})
          </button>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
            <p style={{ color: '#A0AEC0' }}>Loading articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {activeTab === 'favorites' ? '⭐' : '📝'}
            </div>
            <p style={{ color: '#A0AEC0', fontSize: '1.1rem' }}>
              {activeTab === 'favorites' 
                ? 'No favorite articles yet. Star some articles to see them here!'
                : 'No articles available at the moment.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                className="relative group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -8
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedArticle(article)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(article.id);
                  }}
                  className={`absolute top-4 right-4 bg-transparent border-none cursor-pointer text-2xl transition-all duration-300 hover:scale-110 ${
                    favorites.includes(article.id) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
                  }`}
                >
                  {favorites.includes(article.id) ? '⭐' : '☆'}
                </button>

                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-t-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category section */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">
                    {getCategoryIcon(article.category, 'w-8 h-8')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getCategoryColor(article.category)} text-white shadow-lg`}>
                    {article.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
                  {article.title}
                </h3>

                {/* Content preview */}
                <p className="text-gray-300 mb-6 leading-relaxed line-clamp-4 group-hover:text-gray-200 transition-colors duration-300 text-base">
                  {article.content}
                </p>

                {/* Footer with author and date */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-gray-400 font-medium">{article.author}</span>
                  <span className="text-gray-500 text-sm">{formatDate(article.created_at)}</span>
                </div>

                {/* Read more indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
                    <span className="text-white text-sm">→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </motion.button>
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JournalArticles;