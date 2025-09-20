import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ZenModePlaceholder from './ZenModePlaceholder';
import { Music, Headphones, Brain, BookOpen, Clock, Target, RotateCcw } from 'lucide-react';

const Dashboard = () => {
  // Helper function to render icons safely
  const renderIcon = (IconComponent, className) => {
    if (typeof IconComponent === 'string') {
      return IconComponent;
    }
    return React.createElement(IconComponent, { className });
  };
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('Today');
  const [showZenMode, setShowZenMode] = useState(false);
  const [cognitiveFramerSessions, setCognitiveFramerSessions] = useState([]);

  const [focusSessions, setFocusSessions] = useState([]);
  const [focusStats, setFocusStats] = useState({});

  // Load data from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load cognitive framer sessions
        const savedCBTSessions = localStorage.getItem('serenity_cbt_sessions');
        if (savedCBTSessions) {
          const sessions = JSON.parse(savedCBTSessions);
          setCognitiveFramerSessions(sessions.slice(0, 3)); // Only show last 3
        }

        // Load focus sessions
        const savedFocusSessions = localStorage.getItem('serenity_focus_sessions');
        if (savedFocusSessions) {
          const sessions = JSON.parse(savedFocusSessions);
          setFocusSessions(sessions.slice(0, 5)); // Only show last 5
        }

        // Load focus statistics
        const savedFocusStats = localStorage.getItem('serenity_focus_stats');
        if (savedFocusStats) {
          const stats = JSON.parse(savedFocusStats);
          setFocusStats(stats);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [showZenMode]); // Reload when returning from zen mode

  const quickActions = [
    {
      id: 'soundscapes',
      title: 'Soundscapes',
      icon: Music,
      description: 'Ambient sounds for focus',
      path: '/music'
    },
    {
      id: 'music',
      title: 'Music',
      icon: Headphones,
      description: 'Relaxing soundscapes',
      path: '/music'
    },
    {
      id: 'cognitive-framer',
      title: 'Cognitive Framer',
      icon: Brain,
      description: 'Reframe negative thoughts',
      path: '/reframe'
    },
    {
      id: 'articles',
      title: 'Articles',
      icon: BookOpen,
      description: 'Wellness resources',
      path: '/journal'
    },
    {
      id: 'reset',
      title: 'Reset',
      icon: RotateCcw,
      description: 'Clear onboarding',
      action: 'reset'
    }
  ];

  const handleModuleClick = (modulePath, action) => {
    if (action === 'reset') {
      window.location.reload();
    } else if (modulePath === '/zen') {
      setShowZenMode(true);
    } else {
      navigate(modulePath);
    }
  };

  if (showZenMode) {
    return <ZenModePlaceholder onBackToDashboard={() => setShowZenMode(false)} />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    
    return timeGreeting;
  };

  // Helper functions for statistics
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    if (mins > 0) {
      return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
    }
    return `${remainingSecs}s`;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const sessionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - sessionTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const todayStats = focusStats[today] || { totalTime: 0, sessionCount: 0, longestSession: 0, completedSessions: 0 };
    
    // Calculate stats for different periods
    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let weekStats = { totalTime: 0, sessionCount: 0, longestSession: 0, completedSessions: 0 };
    let monthStats = { totalTime: 0, sessionCount: 0, longestSession: 0, completedSessions: 0 };
    let allTimeStats = { totalTime: 0, sessionCount: 0, longestSession: 0, completedSessions: 0 };
    
    Object.entries(focusStats).forEach(([dateStr, stats]) => {
      const date = new Date(dateStr);
      
      // All time
      allTimeStats.totalTime += stats.totalTime;
      allTimeStats.sessionCount += stats.sessionCount;
      allTimeStats.longestSession = Math.max(allTimeStats.longestSession, stats.longestSession);
      allTimeStats.completedSessions += stats.completedSessions;
      
      // This month
      if (date >= thisMonthStart) {
        monthStats.totalTime += stats.totalTime;
        monthStats.sessionCount += stats.sessionCount;
        monthStats.longestSession = Math.max(monthStats.longestSession, stats.longestSession);
        monthStats.completedSessions += stats.completedSessions;
      }
      
      // This week
      if (date >= thisWeekStart) {
        weekStats.totalTime += stats.totalTime;
        weekStats.sessionCount += stats.sessionCount;
        weekStats.longestSession = Math.max(weekStats.longestSession, stats.longestSession);
        weekStats.completedSessions += stats.completedSessions;
      }
    });

    return {
      'Today': todayStats,
      'This Week': weekStats,
      'This Month': monthStats,
      'All Time': allTimeStats
    };
  };

  const stats = calculateStats();
  const currentStats = stats[activeTab] || { totalTime: 0, sessionCount: 0, longestSession: 0, completedSessions: 0 };
  const avgSession = currentStats.sessionCount > 0 ? Math.floor(currentStats.totalTime / currentStats.sessionCount) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      {/* Main Content Area */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-2">{getGreeting()}</h1>
          <p className="text-xl text-gray-400">Ready to find your focus?</p>
        </motion.div>

        {/* Enter Zen Mode Section */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center mb-8 max-w-4xl mx-auto shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:bg-white/10 group"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          whileHover={{ y: -5 }}
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-purple-500/30"
            whileHover={{ rotate: 5 }}
          >
            <span className="text-5xl filter drop-shadow-lg">🧘</span>
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Enter Zen Mode</h2>
          <p className="text-xl text-gray-300 mb-2">Start a focused session and find your flow</p>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create a distraction-free environment designed to help you achieve deep focus and maximize your productivity
          </p>
          
          <motion.button
            className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm px-12 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 mb-6 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-white/30"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleModuleClick('/zen')}
          >
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold">
              Start Focus Session
            </span>
          </motion.button>
          
          <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Timed Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5" />
              <span>Ambient Sounds</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Progress Tracking</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          className="mb-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Recent Sessions</h3>
          <div className="space-y-3">
            {focusSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⏱️</div>
                <p className="text-gray-400">No focus sessions yet.</p>
                <p className="text-gray-500 text-sm mt-2">Start your first session to see your progress here.</p>
              </div>
            ) : (
              focusSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      session.completed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <span className="text-sm">{session.completed ? '✓' : '⏱'}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{session.type}</div>
                      <div className="text-sm text-gray-400">
                        {getTimeAgo(session.timestamp)} • {session.purpose}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{formatDuration(session.actualDuration)}</div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="grid grid-cols-5 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                onClick={() => handleModuleClick(action.path, action.action)}
              >
                <motion.div 
                  className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                  whileHover={{ rotate: 10 }}
                >
                  {renderIcon(action.icon, "w-6 h-6 text-white filter drop-shadow-sm")}
                </motion.div>
                <h4 className="font-semibold mb-2 text-white group-hover:text-purple-200 transition-colors duration-300">{action.title}</h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cognitive Framer History */}
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Cognitive Framer History</h3>
          <div className="space-y-4">
            {cognitiveFramerSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Brain className="w-12 h-12 mx-auto text-purple-400" />
                </div>
                <p className="text-gray-400">No cognitive reframing sessions yet.</p>
                <p className="text-gray-500 text-sm mt-2">Start your first session to see your progress here.</p>
              </div>
            ) : (
              cognitiveFramerSessions.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                  whileHover={{ x: 5, scale: 1.01 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{entry.mood_emoji || '😔'}</span>
                      <div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          entry.mood === 'Negative' ? 'bg-red-500/20 text-red-400' : 
                          entry.mood === 'Neutral' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {entry.mood || 'Unknown'}
                        </span>
                        <span className="text-gray-400 ml-2">• {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Confidence: {entry.confidence_rating || 0}%</div>
                    </div>
                  </div>
                  
                  {entry.negative_thought && (
                    <>
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Original: "{entry.negative_thought}"</div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {entry.distortions && entry.distortions.map((distortion, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                            {distortion}
                          </span>
                        ))}
                      </div>
                      
                      {entry.reframed_thought && (
                        <div className="text-gray-300">
                          <span className="text-sm text-gray-400">Reframed: </span>
                          {entry.reframed_thought.length > 100 ? entry.reframed_thought.substring(0, 100) + '...' : entry.reframed_thought}
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="mt-4 text-right">
                    <button 
                      className="text-blue-400 hover:text-blue-300 text-sm"
                      onClick={() => navigate('/reframe')}
                    >
                      Click to explore →
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Focus Statistics - Now Horizontal */}
        <motion.div
          className="mt-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:bg-white/10 group">
            <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">Focus Statistics</h3>
            
            {/* Tab Navigation */}
            <div className="flex justify-center space-x-2 mb-8">
              {['Today', 'This Week', 'This Month', 'All Time'].map((tab) => (
                <motion.button
                  key={tab}
                  className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 backdrop-blur-sm border ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-white/30 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:shadow-md hover:shadow-purple-500/10'
                  }`}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Stats Grid */}
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div 
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-blue-500/20 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">{formatDuration(currentStats.totalTime)}</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total Focus Time</div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">{currentStats.sessionCount}</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Sessions</div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-gradient-to-br hover:from-green-500/20 hover:to-emerald-500/20 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">{currentStats.completedSessions}</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Completed</div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-pink-500/20 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent group-hover:from-orange-200 group-hover:to-pink-200 transition-all duration-300">{formatDuration(avgSession)}</div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Avg Session</div>
                  </motion.div>
                </div>
              </div>

              {/* Right Side - Additional Stats */}
              <div className="space-y-6">
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Longest Session</span>
                      <span className="font-semibold text-lg bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{formatDuration(currentStats.longestSession)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Success Rate</span>
                      <span className="font-semibold text-lg bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                        {currentStats.sessionCount > 0 
                          ? Math.round((currentStats.completedSessions / currentStats.sessionCount) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total Sessions</span>
                      <span className="font-semibold text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">{currentStats.sessionCount}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Daily Goal Progress */}
                <motion.div 
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Daily Goal Progress</span>
                    <span className="font-semibold text-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                      {Math.min(Math.round((currentStats.totalTime / 3600) * 100), 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 shadow-lg shadow-purple-500/30" 
                      style={{ width: `${Math.min((currentStats.totalTime / 3600) * 100, 100)}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((currentStats.totalTime / 3600) * 100, 100)}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Goal: 1 hour of focused work</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;