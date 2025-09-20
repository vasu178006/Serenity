import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Volume2, Leaf, BarChart3, Shield, ArrowLeft, Clock, Target, Brain, Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Helper function to render icons safely
const renderIcon = (IconComponent, className) => {
  if (typeof IconComponent === 'string') {
    return IconComponent;
  }
  return React.createElement(IconComponent, { className });
};
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const navigate = useNavigate();
  const { theme, updateTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('audio');
  const [settings, setSettings] = useState({
    theme: 'dark',
    soundEnabled: true,
    notificationsEnabled: true,
    autoplay: true,
    defaultVolume: 70,
    breathingReminders: false,
    dataExport: false,
    // Quality of life settings
    reducedMotion: false,
    autoSave: true,
    sessionReminders: true,
    darkMode: true,
    fontSize: 'medium',
    breathingGuides: true,
    focusMode: false
  });
  const [usageStats, setUsageStats] = useState({
    feature_stats: [],
    recent_activity: [],
    total_sessions: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadUsageAnalytics();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('serenity_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = (newSettings) => {
    localStorage.setItem('serenity_settings', JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const loadUsageAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load data from localStorage
      const focusSessions = JSON.parse(localStorage.getItem('serenity_focus_sessions') || '[]');
      const cbtSessions = JSON.parse(localStorage.getItem('serenity_cbt_sessions') || '[]');
      const focusStats = JSON.parse(localStorage.getItem('serenity_focus_stats') || '{}');
      
      // Calculate analytics from local data
      const totalSessions = focusSessions.length + cbtSessions.length;
      
      // Calculate feature stats
      const featureStats = [
        {
          _id: 'focus_sessions',
          total_sessions: focusSessions.length,
          total_duration: focusSessions.reduce((total, session) => total + (session.duration || 0), 0)
        },
        {
          _id: 'cognitive_framer',
          total_sessions: cbtSessions.length,
          total_duration: cbtSessions.reduce((total, session) => total + (session.duration || 0), 0)
        }
      ];
      
      // Calculate recent activity
      const recentActivity = [
        ...focusSessions.slice(0, 5).map(session => ({
          feature: 'Focus Session',
          action: `${Math.round(session.duration / 60)} min session`,
          created_at: session.timestamp || session.date
        })),
        ...cbtSessions.slice(0, 5).map(session => ({
          feature: 'Cognitive Framer',
          action: 'Reframing session',
          created_at: session.timestamp || session.date
        }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
      
      setUsageStats({
        total_sessions: totalSessions,
        feature_stats: featureStats,
        recent_activity: recentActivity,
        focus_stats: focusStats
      });
      
    } catch (error) {
      console.error('Error loading usage analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const predefinedThemes = [
    {
      name: 'Calm Ocean',
      colors: {
        primary: '#06B6D4',
        secondary: '#22D3EE', 
        accent: '#67E8F9',
        background: '#1A1E1E',
        surface: '#273333',
        text: '#E2E8F0'
      }
    },
    {
      name: 'Serene Forest',
      colors: {
        primary: '#10B981',
        secondary: '#34D399',
        accent: '#6EE7B7', 
        background: '#1A1E1A',
        surface: '#273229',
        text: '#E2E8F0'
      }
    },
    {
      name: 'Peaceful Sunset',
      colors: {
        primary: '#F59E0B',
        secondary: '#FBBF24',
        accent: '#FCD34D',
        background: '#1E1B17', 
        surface: '#322A20',
        text: '#E2E8F0'
      }
    },
    {
      name: 'Deep Space',
      colors: {
        primary: '#6B73FF',
        secondary: '#9BB5FF',
        accent: '#C1D3FE',
        background: '#1A1B23',
        surface: '#2A2D37', 
        text: '#E2E8F0'
      }
    }
  ];

  const exportData = () => {
    const userData = {
      settings: settings,
      preferences: localStorage.getItem('serenity_user_preferences'),
      cbtSessions: localStorage.getItem('serenity_cbt_sessions'),
      favorites: localStorage.getItem('serenity_favorites'),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `serenity-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      localStorage.removeItem('serenity_user_preferences');
      localStorage.removeItem('serenity_cbt_sessions');
      localStorage.removeItem('serenity_favorites');
      localStorage.removeItem('serenity_settings');
      alert('All data has been cleared.');
      setSettings({
        theme: 'dark',
        soundEnabled: true,
        notificationsEnabled: true,
        autoplay: true,
        defaultVolume: 70,
        breathingReminders: false,
        dataExport: false
      });
    }
  };


  const renderWellnessSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Session Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Session Reminders</label>
              <p className="text-gray-400 text-sm">Get gentle reminders to practice mindfulness</p>
            </div>
            <button
              onClick={() => handleSettingChange('sessionReminders', !settings.sessionReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.sessionReminders ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sessionReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Auto-Save Progress</label>
              <p className="text-gray-400 text-sm">Automatically save your session progress</p>
            </div>
            <button
              onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoSave ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Breathing Guides</label>
              <p className="text-gray-400 text-sm">Show visual breathing instructions</p>
            </div>
            <button
              onClick={() => handleSettingChange('breathingGuides', !settings.breathingGuides)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.breathingGuides ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.breathingGuides ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Focus Mode</label>
              <p className="text-gray-400 text-sm">Minimize distractions during sessions</p>
            </div>
            <button
              onClick={() => handleSettingChange('focusMode', !settings.focusMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.focusMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.focusMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Accessibility</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Reduced Motion</label>
              <p className="text-gray-400 text-sm">Minimize animations for better focus</p>
            </div>
            <button
              onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-gray-300 font-medium block mb-2">Font Size</label>
            <select
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Audio Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-300">Sound Effects</label>
            <button
              onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-300">Autoplay Music</label>
            <button
              onClick={() => handleSettingChange('autoplay', !settings.autoplay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoplay ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoplay ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-gray-300 block mb-2">Default Volume: {settings.defaultVolume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.defaultVolume}
              onChange={(e) => handleSettingChange('defaultVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your usage statistics...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-200">Total Sessions</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{usageStats.total_sessions}</div>
                <div className="text-gray-400">All Time</div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-200">Focus Sessions</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {usageStats.feature_stats.find(f => f._id === 'focus_sessions')?.total_sessions || 0}
                </div>
                <div className="text-gray-400">
                  {Math.round((usageStats.feature_stats.find(f => f._id === 'focus_sessions')?.total_duration || 0) / 60)} min total
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-200">Cognitive Framer</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {usageStats.feature_stats.find(f => f._id === 'cognitive_framer')?.total_sessions || 0}
                </div>
                <div className="text-gray-400">
                  {Math.round((usageStats.feature_stats.find(f => f._id === 'cognitive_framer')?.total_duration || 0) / 60)} min total
                </div>
              </div>
            </div>
          </div>

          {/* Focus Statistics */}
          {usageStats.focus_stats && Object.keys(usageStats.focus_stats).length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-indigo-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-200">Focus Statistics</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(usageStats.focus_stats).map(([period, stats]) => (
                  <div key={period} className="text-center p-4 bg-gray-800/30 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-400 mb-1">{stats.sessions || 0}</div>
                    <div className="text-gray-400 text-sm capitalize">{period.replace('_', ' ')}</div>
                    <div className="text-gray-500 text-xs">{Math.round((stats.totalDuration || 0) / 60)} min</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Usage Details */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Feature Usage Details</h3>
            <div className="space-y-4">
              {usageStats.feature_stats.length > 0 ? (
                usageStats.feature_stats.map((stat) => (
                  <div key={stat._id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${stat._id === 'focus_sessions' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                      <div>
                        <span className="text-gray-200 font-medium capitalize">
                          {stat._id === 'focus_sessions' ? 'Focus Sessions' : 'Cognitive Framer'}
                        </span>
                        <div className="text-gray-400 text-sm">
                          {stat._id === 'focus_sessions' ? 'Zen Mode & Breathing' : 'Thought Reframing'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-200 font-bold text-lg">{stat.total_sessions}</div>
                      <div className="text-gray-400 text-sm">sessions</div>
                      {stat.total_duration > 0 && (
                        <div className="text-gray-500 text-xs">{Math.round(stat.total_duration / 60)} min total</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">No usage data yet</div>
                  <p className="text-gray-500">Start using Focus Sessions or Cognitive Framer to see your statistics!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Activity</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {usageStats.recent_activity.length > 0 ? (
                usageStats.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${activity.feature === 'Focus Session' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                      <span className="text-gray-300">{activity.feature}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-gray-400">{activity.action}</span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400">No recent activity to display.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-gray-300 font-medium mb-2">Export Your Data</h4>
            <p className="text-gray-400 text-sm mb-3">Download all your app data including preferences, sessions, and settings.</p>
            <button
              onClick={exportData}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-all duration-300"
            >
              📁 Export Data
            </button>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-gray-300 font-medium mb-2">Clear All Data</h4>
            <p className="text-gray-400 text-sm mb-3">Remove all stored data from this device. This action cannot be undone.</p>
            <button
              onClick={clearAllData}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 transition-all duration-300"
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Privacy Notice</h3>
        <div className="text-gray-400 text-sm space-y-2">
          <p>• All your personal data is stored locally on your device</p>
          <p>• We do not collect or share any personal information</p>
          <p>• Your CBT sessions and preferences remain completely private</p>
          <p>• You have full control over your data export and deletion</p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'wellness', label: 'Wellness', icon: Leaf },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

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
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              ⚙️ Settings
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Customize your wellness experience and manage your data privacy
            </p>
          </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-white/30 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {renderIcon(tab.icon, "w-5 h-5")}
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'audio' && renderAudioSettings()}
          {activeTab === 'wellness' && renderWellnessSettings()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'privacy' && renderPrivacySettings()}
        </motion.div>

        <div className="text-center mt-12">
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

export default Settings;