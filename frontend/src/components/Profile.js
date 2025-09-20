import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { User, GraduationCap, Palette, Briefcase, Users, Edit, Calendar, Smile, Frown, Meh, AlertCircle, Heart, Zap, Flame, Trophy } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to render icons safely
const renderIcon = (IconComponent, className) => {
  if (typeof IconComponent === 'string') {
    return IconComponent;
  }
  return React.createElement(IconComponent, { className });
};

const Profile = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [profile, setProfile] = useState({
    name: '',
    identity: '',
    currentMood: '',
    moodFrequency: '',
    joinedDate: '',
    preferences: null
  });
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    streakDays: 0,
    favoriteFeature: '',
    lastActive: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    goals: ''
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = () => {
    // Load from localStorage
    const savedPrefs = localStorage.getItem('serenity_user_preferences');
    const savedProfile = localStorage.getItem('serenity_profile');
    
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setProfile(prev => ({
        ...prev,
        identity: prefs.identity || '',
        currentMood: prefs.current_mood || '',
        moodFrequency: prefs.mood_frequency || '',
        joinedDate: prefs.created_at || new Date().toISOString(),
        preferences: prefs
      }));
    }

    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(prev => ({
        ...prev,
        name: profileData.name || '',
      }));
      setEditForm({
        name: profileData.name || '',
        bio: profileData.bio || '',
        goals: profileData.goals || ''
      });
    }
  };

  const loadStats = () => {
    // Calculate stats from stored data
    const cbtSessions = JSON.parse(localStorage.getItem('serenity_cbt_sessions') || '[]');
    const zenSessions = JSON.parse(localStorage.getItem('serenity_zen_sessions') || '[]');
    const musicSessions = JSON.parse(localStorage.getItem('serenity_music_sessions') || '[]');

    const totalSessions = cbtSessions.length + zenSessions.length + musicSessions.length;
    
    // Calculate total minutes (rough estimation)
    let totalMinutes = 0;
    totalMinutes += cbtSessions.length * 15; // Avg 15 min per CBT session
    totalMinutes += zenSessions.length * 10; // Avg 10 min per Zen session
    totalMinutes += musicSessions.length * 20; // Avg 20 min per music session

    // Simple streak calculation (days with any activity)
    const allSessions = [...cbtSessions, ...zenSessions, ...musicSessions];
    const uniqueDates = new Set(
      allSessions.map(session => 
        new Date(session.created_at || Date.now()).toDateString()
      )
    );
    
    // Find most used feature
    const featureCounts = {
      'CBT Reframing': cbtSessions.length,
      'Zen Breathing': zenSessions.length, 
      'Relaxing Music': musicSessions.length
    };
    const favoriteFeature = Object.keys(featureCounts).reduce((a, b) => 
      featureCounts[a] > featureCounts[b] ? a : b
    ) || 'None yet';

    setStats({
      totalSessions,
      totalMinutes,
      streakDays: uniqueDates.size,
      favoriteFeature,
      lastActive: allSessions.length > 0 ? 
        new Date(Math.max(...allSessions.map(s => new Date(s.created_at || Date.now())))).toLocaleDateString() :
        'Never'
    });
  };

  const saveProfile = () => {
    const profileData = {
      name: editForm.name,
      bio: editForm.bio,
      goals: editForm.goals,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('serenity_profile', JSON.stringify(profileData));
    setProfile(prev => ({ ...prev, name: editForm.name }));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditForm({
      name: profile.name,
      bio: JSON.parse(localStorage.getItem('serenity_profile') || '{}').bio || '',
      goals: JSON.parse(localStorage.getItem('serenity_profile') || '{}').goals || ''
    });
    setIsEditing(false);
  };

  const getMoodIcon = (mood) => {
    const moodIcons = {
      'Anxious': AlertCircle,
      'Unfocused': Meh,
      'Sad': Frown,
      'Stressed': AlertCircle,
      'Calm': Smile,
      'Happy': Heart,
      'Excited': Zap
    };
    const IconComponent = moodIcons[mood] || Meh;
    return <IconComponent className="w-5 h-5" />;
  };

  const getIdentityIcon = (identity) => {
    const identityIcons = {
      'Student': GraduationCap,
      'Creative': Palette,
      'Professional': Briefcase,
      'Parent': Users,
      'Other': User
    };
    const IconComponent = identityIcons[identity] || User;
    return <IconComponent className="w-5 h-5" />;
  };

  const achievements = [
    { 
      id: 'first_session', 
      title: 'First Steps', 
      description: 'Completed your first wellness session',
      icon: '🌱',
      unlocked: stats.totalSessions >= 1
    },
    { 
      id: 'week_streak', 
      title: 'Week Warrior', 
      description: 'Active for 7 different days',
      icon: Flame,
      unlocked: stats.streakDays >= 7
    },
    { 
      id: 'mindful_minutes', 
      title: 'Mindful Master', 
      description: 'Spent 100+ minutes in practice',
      icon: '🧘',
      unlocked: stats.totalMinutes >= 100
    },
    { 
      id: 'cbt_expert', 
      title: 'Thought Transformer', 
      description: 'Completed 10 CBT sessions',
      icon: '💭',
      unlocked: stats.favoriteFeature === 'CBT Reframing' && stats.totalSessions >= 10
    }
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
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              <User className="w-6 h-6 mr-2" />
              Profile
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your wellness journey and personal insights
            </p>
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-200">Personal Info</h2>
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditing ? 'Cancel' : (
                  <>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </>
                )}
              </motion.button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg w-full p-3 text-gray-200 focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg w-full p-3 text-gray-200 h-20 resize-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Wellness Goals</label>
                  <textarea
                    value={editForm.goals}
                    onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg w-full p-3 text-gray-200 h-20 resize-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                    placeholder="What are your wellness aspirations?"
                  />
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={saveProfile}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-green-300 hover:text-green-200 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Changes
                  </motion.button>
                  <motion.button
                    onClick={cancelEdit}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 font-medium text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200">
                    {profile.name || 'Anonymous User'}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                    <span className="text-xl">{getIdentityIcon(profile.identity)}</span>
                    <div>
                      <div className="text-gray-400 text-sm">Identity</div>
                      <div className="text-gray-200">{profile.identity || 'Not set'}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                    <span className="text-xl">{getMoodIcon(profile.currentMood)}</span>
                    <div>
                      <div className="text-gray-400 text-sm">Current Mood</div>
                      <div className="text-gray-200">{profile.currentMood || 'Not set'}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-gray-400 text-sm">Member Since</div>
                      <div className="text-gray-200">
                        {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'Today'}
                      </div>
                    </div>
                  </div>
                </div>

                {JSON.parse(localStorage.getItem('serenity_profile') || '{}').bio && (
                  <div className="mt-4 p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Bio</div>
                    <div className="text-gray-200">{JSON.parse(localStorage.getItem('serenity_profile') || '{}').bio}</div>
                  </div>
                )}

                {JSON.parse(localStorage.getItem('serenity_profile') || '{}').goals && (
                  <div className="mt-4 p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Wellness Goals</div>
                    <div className="text-gray-200">{JSON.parse(localStorage.getItem('serenity_profile') || '{}').goals}</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-200 mb-6">Wellness Stats</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
                <div className="text-blue-100 text-sm">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.totalMinutes}</div>
                <div className="text-green-100 text-sm">Minutes Practiced</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <div className="text-2xl font-bold text-white">{stats.streakDays}</div>
                <div className="text-purple-100 text-sm">Active Days</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Trophy className="w-6 h-6 text-white mx-auto" />
                <div className="text-orange-100 text-sm">Achievements</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                <span className="text-gray-300">Favorite Feature</span>
                <span className="text-gray-200 font-medium">{stats.favoriteFeature}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                <span className="text-gray-300">Last Active</span>
                <span className="text-gray-200 font-medium">{stats.lastActive}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          className="glass-card mt-6"
          style={{
            borderRadius: '20px',
            padding: '2rem'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-200 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400'
                    : 'bg-gray-800 bg-opacity-30 border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {renderIcon(achievement.icon, "w-6 h-6")}
                  </span>
                  <div>
                    <h3 className={`font-semibold ${
                      achievement.unlocked ? 'text-yellow-900' : 'text-gray-300'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-yellow-800' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <div className="ml-auto">
                      <span className="text-yellow-900 font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="glass-button"
            style={{
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#A0AEC0'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;