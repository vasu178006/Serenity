import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ZenModePlaceholder = ({ onBackToDashboard }) => {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState('setup'); // setup, purpose, active, paused, completed
  const [sessionPurpose, setSessionPurpose] = useState('');
  const [duration, setDuration] = useState(25); // Default 25 minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const intervalRef = useRef(null);
  const fullscreenRef = useRef(null);

  // Timer functionality
  useEffect(() => {
    if (sessionState === 'active' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [sessionState, timeRemaining]);

  // Listen for fullscreen changes (ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && (sessionState === 'active' || sessionState === 'paused')) {
        setIsFullscreen(false);
        // Optionally pause session when exiting fullscreen
        if (sessionState === 'active') {
          pauseSession();
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [sessionState]);

  // Fullscreen functionality
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement; // Use document element instead of ref
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      }
      setIsFullscreen(true);
      console.log('Entered fullscreen mode');
    } catch (error) {
      console.log('Fullscreen not supported or denied:', error);
      // Continue with session even if fullscreen fails
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.log('Error exiting fullscreen');
    }
  };

  // Session management
  const startSessionSetup = () => {
    setSessionState('purpose');
  };

  const startSession = async () => {
    if (!sessionPurpose.trim()) {
      alert('Please enter a purpose for your session');
      return;
    }
    
    setTimeRemaining(duration * 60); // Convert minutes to seconds
    setSessionStartTime(new Date());
    setSessionState('active');
    await enterFullscreen();
  };

  const pauseSession = () => {
    setSessionState('paused');
  };

  const resumeSession = () => {
    setSessionState('active');
  };

  const endSession = async () => {
    const endTime = new Date();
    const actualDuration = sessionStartTime ? Math.floor((endTime - sessionStartTime) / 1000) : 0;
    setTotalSessionTime(actualDuration);
    
    // Save session data to localStorage
    saveSessionData(actualDuration);
    
    setSessionState('completed');
    await exitFullscreen();
  };

  const completeSession = async () => {
    const endTime = new Date();
    const actualDuration = sessionStartTime ? Math.floor((endTime - sessionStartTime) / 1000) : duration * 60;
    setTotalSessionTime(actualDuration);
    
    // Save session data to localStorage
    saveSessionData(actualDuration);
    
    setSessionState('completed');
    await exitFullscreen();
  };

  const saveSessionData = (actualDuration) => {
    // Get existing focus sessions
    const existingSessions = JSON.parse(localStorage.getItem('serenity_focus_sessions') || '[]');
    
    const newSession = {
      id: Date.now(),
      type: 'Focus Session',
      purpose: sessionPurpose,
      plannedDuration: duration * 60,
      actualDuration: actualDuration,
      timestamp: new Date().toISOString(),
      completed: actualDuration >= (duration * 60 * 0.8), // Consider completed if 80% done
      date: new Date().toDateString()
    };

    const updatedSessions = [newSession, ...existingSessions];
    localStorage.setItem('serenity_focus_sessions', JSON.stringify(updatedSessions));

    // Update focus statistics
    updateFocusStatistics(newSession);
  };

  const updateFocusStatistics = (session) => {
    const stats = JSON.parse(localStorage.getItem('serenity_focus_stats') || '{}');
    const today = new Date().toDateString();

    if (!stats[today]) {
      stats[today] = {
        totalTime: 0,
        sessionCount: 0,
        longestSession: 0,
        completedSessions: 0
      };
    }

    stats[today].totalTime += session.actualDuration;
    stats[today].sessionCount += 1;
    stats[today].longestSession = Math.max(stats[today].longestSession, session.actualDuration);
    if (session.completed) {
      stats[today].completedSessions += 1;
    }

    localStorage.setItem('serenity_focus_stats', JSON.stringify(stats));
  };

  const resetSession = () => {
    setSessionState('setup');
    setSessionPurpose('');
    setTimeRemaining(0);
    setTotalSessionTime(0);
    setSessionStartTime(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    if (mins > 0) {
      return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
    }
    return `${remainingSecs}s`;
  };

  // Setup Phase
  if (sessionState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <motion.div
          className="text-center max-w-lg mx-auto relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-500/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-5xl filter drop-shadow-lg">🧘</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Zen Focus Mode</h1>
          <p className="text-xl text-gray-300 mb-8">
            Create a distraction-free environment for deep focus
          </p>

          {/* Duration Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Session Duration</h3>
            <div className="grid grid-cols-4 gap-3">
              {[15, 25, 45, 60].map((mins) => (
                <motion.button
                  key={mins}
                  className={`p-4 rounded-2xl border transition-all duration-300 backdrop-blur-sm ${
                    duration === mins
                      ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-white/30 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setDuration(mins)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-semibold">{mins}m</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <motion.button
              className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSessionSetup}
            >
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold">
                Start Focus Session
              </span>
            </motion.button>
            
            <motion.button
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBackToDashboard && onBackToDashboard()}
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Purpose Input Phase
  if (sessionState === 'purpose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <motion.div
          className="text-center max-w-lg mx-auto relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-blue-500/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg shadow-blue-500/30"
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <span className="text-4xl filter drop-shadow-lg">🎯</span>
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">What's your focus today?</h2>
          <p className="text-gray-300 mb-8">
            Setting an intention helps maintain focus during your {duration}-minute session
          </p>

          <div className="mb-8">
            <textarea
              className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
              rows="3"
              placeholder="e.g., Complete project proposal, Study for exam, Write blog post..."
              value={sessionPurpose}
              onChange={(e) => setSessionPurpose(e.target.value)}
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-400 mt-2">
              {sessionPurpose.length}/200
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <motion.button
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-white/20 backdrop-blur-sm px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
            >
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent font-bold">
                Begin Session
              </span>
            </motion.button>
            
            <motion.button
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-sm px-8 py-3 rounded-2xl font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSessionState('setup')}
            >
              Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active/Paused Session Phase (Fullscreen)
  if (sessionState === 'active' || sessionState === 'paused') {
    return (
      <div ref={fullscreenRef} className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Timer Display */}
          <div className="mb-8">
            <motion.div
              className="text-8xl font-mono font-bold mb-4"
              animate={{ scale: sessionState === 'paused' ? 0.95 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatTime(timeRemaining)}
            </motion.div>
            <div className="text-xl text-gray-400">
              {sessionState === 'paused' ? 'Session Paused' : 'Focus Time'}
            </div>
          </div>

          {/* Session Info */}
          <div className="mb-8 p-6 bg-gray-800/30 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Current Focus</h3>
            <p className="text-gray-300">{sessionPurpose}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-800/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${((duration * 60 - timeRemaining) / (duration * 60)) * 100}%` 
                }}
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {Math.round(((duration * 60 - timeRemaining) / (duration * 60)) * 100)}% complete
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-6 justify-center">
            {sessionState === 'active' ? (
              <motion.button
                className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseSession}
              >
                ⏸️ Pause
              </motion.button>
            ) : (
              <motion.button
                className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resumeSession}
              >
                ▶️ Resume
              </motion.button>
            )}
            
            <motion.button
              className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={endSession}
            >
              🛑 End Session
            </motion.button>
          </div>

          {/* Fullscreen Exit Hint */}
          <div className="mt-8 text-sm text-gray-500">
            Press ESC to exit fullscreen
          </div>
        </motion.div>
      </div>
    );
  }

  // Completed Session Phase
  if (sessionState === 'completed') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Session Complete!</h2>
          <p className="text-xl text-gray-300 mb-8">
            Great work on your focus session
          </p>

          {/* Session Summary */}
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Session Summary</h3>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Focus Goal:</span>
                <span className="text-right flex-1 ml-4">{sessionPurpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span>{formatDuration(totalSessionTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completion:</span>
                <span className={totalSessionTime >= (duration * 60 * 0.8) ? 'text-green-400' : 'text-yellow-400'}>
                  {totalSessionTime >= (duration * 60 * 0.8) ? '✅ Completed' : '⏱️ Partial'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <motion.button
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSession}
            >
              Start Another Session
            </motion.button>
            
            <motion.button
              className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBackToDashboard && onBackToDashboard()}
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default ZenModePlaceholder;
