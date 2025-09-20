import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flower2, Moon, Scale, Wind, Heart, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Helper function to render icons safely
const renderIcon = (IconComponent, className) => {
  if (typeof IconComponent === 'string') {
    return IconComponent;
  }
  return React.createElement(IconComponent, { className });
};
const API = `${BACKEND_URL}/api`;

const ZenMode = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const breathingModes = [
    {
      id: 'box',
      title: 'Box Breathing',
      description: '4-4-4-4 pattern for calm focus',
      icon: Wind,
      pattern: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
    },
    {
      id: '478',
      title: '4-7-8 Technique',
      description: 'Relaxing pattern for sleep',
      icon: Moon,
      pattern: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 2 }
    },
    {
      id: 'equal',
      title: 'Equal Breathing',
      description: 'Balanced 5-5 pattern',
      icon: Scale,
      pattern: { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 }
    },
    {
      id: 'calm',
      title: 'Calming Breath',
      description: '4-2-6-2 pattern for relaxation',
      icon: Flower2,
      pattern: { inhale: 4, holdIn: 2, exhale: 6, holdOut: 2 }
    }
  ];

  useEffect(() => {
    let interval;
    if (sessionActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionActive(false);
            setIsBreathing(false);
            // Clean up breathing cycle
            if (window.breathingCleanup) {
              window.breathingCleanup();
              window.breathingCleanup = null;
            }
            saveSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Store interval reference for cleanup
      window.breathingInterval = interval;
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        window.breathingInterval = null;
      }
    };
  }, [sessionActive, timeRemaining]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up everything when component unmounts
      if (window.breathingCleanup) {
        window.breathingCleanup();
        window.breathingCleanup = null;
      }
      if (window.breathingInterval) {
        clearInterval(window.breathingInterval);
        window.breathingInterval = null;
      }
    };
  }, []);

  const startBreathingSession = (mode) => {
    // Clean up any existing cycle first
    if (window.breathingCleanup) {
      window.breathingCleanup();
    }
    
    setActiveMode(mode);
    setTimeRemaining(sessionDuration * 60);
    setSessionActive(true);
    setIsBreathing(true);
    setBreathingPhase('inhale');
    
    // Small delay to ensure state is set
    setTimeout(() => {
      const cleanup = startBreathingCycle(mode.pattern);
      window.breathingCleanup = cleanup;
    }, 100);
  };

  const startBreathingCycle = (pattern) => {
    let currentPhaseIndex = 0;
    let phaseInterval;
    let countdownInterval;
    let isActive = true;
    
    const cycle = [
      { phase: 'inhale', duration: pattern.inhale, instruction: 'Breathe In' },
      ...(pattern.holdIn > 0 ? [{ phase: 'hold', duration: pattern.holdIn, instruction: 'Hold' }] : []),
      { phase: 'exhale', duration: pattern.exhale, instruction: 'Breathe Out' },
      ...(pattern.holdOut > 0 ? [{ phase: 'holdOut', duration: pattern.holdOut, instruction: 'Hold' }] : [])
    ];
    
    const nextPhase = () => {
      if (!isActive) return;
      
      const currentPhase = cycle[currentPhaseIndex];
      setBreathingPhase(currentPhase.phase);
      setPhaseTimeRemaining(currentPhase.duration);
      
      // Update countdown every 100ms for smooth counter
      let timeLeft = currentPhase.duration * 10; // Convert to deciseconds
      const updateCountdown = () => {
        if (!isActive || timeLeft <= 0) return;
        
        setPhaseTimeRemaining(Math.ceil(timeLeft / 10));
        timeLeft--;
        
        if (timeLeft > 0) {
          countdownInterval = setTimeout(updateCountdown, 100);
        }
      };
      
      updateCountdown();
      
      // Move to next phase after duration
      phaseInterval = setTimeout(() => {
        if (!isActive) return; // Check if still active before proceeding
        
        if (countdownInterval) clearTimeout(countdownInterval);
        currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length;
        
        // Increment cycle count when completing a full cycle
        if (currentPhaseIndex === 0) {
          setCycleCount(prev => prev + 1);
        }
        
        nextPhase();
      }, currentPhase.duration * 1000);
    };
    
    // Start the cycle
    nextPhase();
    
    // Return cleanup function
    return () => {
      isActive = false;
      if (phaseInterval) clearTimeout(phaseInterval);
      if (countdownInterval) clearTimeout(countdownInterval);
    };
  };

  const stopSession = () => {
    console.log('Stop session called'); // Debug log
    
    // Clean up breathing cycle first
    if (window.breathingCleanup) {
      console.log('Cleaning up breathing cycle'); // Debug log
      window.breathingCleanup();
      window.breathingCleanup = null;
    }
    
    // Reset all breathing-related states
    setSessionActive(false);
    setIsBreathing(false);
    setActiveMode(null);
    setTimeRemaining(0);
    setBreathingPhase('inhale');
    setPhaseTimeRemaining(0);
    setCycleCount(0);
    
    // Clear any remaining timeouts/intervals
    if (window.breathingInterval) {
      console.log('Clearing breathing interval'); // Debug log
      clearInterval(window.breathingInterval);
      window.breathingInterval = null;
    }
    
    console.log('Session stopped successfully'); // Debug log
  };

  const saveSession = async () => {
    try {
      await fetch(`${API}/zen-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_type: 'breathing',
          duration: sessionDuration,
          completed: timeRemaining === 0
        })
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdOut': return 'Pause';
      default: return 'Ready';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isBreathing && activeMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        {/* Session Info */}
        <motion.div 
          className="absolute top-8 right-8 text-right"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="text-gray-300 text-sm mb-1">{activeMode.title}</div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-gray-400 text-sm">
              Cycle {cycleCount}
            </div>
          </div>
        </motion.div>

        {/* Stop Button */}
        <motion.button
          onClick={stopSession}
          className="absolute top-8 left-8 bg-red-500/20 border border-red-500/50 rounded-2xl px-6 py-3 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Stop Session
        </motion.button>

        {/* Main breathing container */}
        <div className="flex flex-col items-center justify-center min-h-screen relative p-8">
          {/* Outer breathing ring */}
          <motion.div
            key={`outer-ring-${breathingPhase}`}
            className="absolute rounded-full border-2 border-white/20"
            style={{
              width: '500px',
              height: '500px',
            }}
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{
              scale: breathingPhase === 'inhale' ? 1.1 : breathingPhase === 'exhale' ? 0.9 : 1,
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              scale: {
                duration: (breathingPhase === 'hold' || breathingPhase === 'holdOut') ? 0 : (activeMode.pattern[breathingPhase] || 1),
                ease: breathingPhase === 'hold' || breathingPhase === 'holdOut' ? "linear" : "easeInOut",
                repeat: (breathingPhase === 'hold' || breathingPhase === 'holdOut') ? 0 : 1
              },
              opacity: { 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                repeatDelay: 0
              }
            }}
          />
          
          {/* Main breathing circle */}
          <motion.div
            key={`main-circle-${breathingPhase}`}
            className="relative rounded-full flex items-center justify-center shadow-2xl"
            style={{
              width: '350px',
              height: '350px',
              background: breathingPhase === 'inhale' 
                ? 'radial-gradient(circle, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.7), rgba(64, 224, 208, 0.5))'
                : breathingPhase === 'exhale'
                ? 'radial-gradient(circle, rgba(64, 224, 208, 0.9), rgba(118, 75, 162, 0.7), rgba(102, 126, 234, 0.5))'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.7), rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.4))',
              boxShadow: breathingPhase === 'inhale' 
                ? '0 0 80px rgba(102, 126, 234, 0.8)'
                : breathingPhase === 'exhale'
                ? '0 0 60px rgba(64, 224, 208, 0.6)'
                : '0 0 40px rgba(255, 255, 255, 0.4)'
            }}
            initial={{ scale: 1 }}
            animate={{
              scale: breathingPhase === 'inhale' ? 1.3 : breathingPhase === 'exhale' ? 0.7 : 1,
            }}
            transition={{
              duration: (breathingPhase === 'hold' || breathingPhase === 'holdOut') ? 0 : (activeMode.pattern[breathingPhase] || 1),
              ease: breathingPhase === 'hold' || breathingPhase === 'holdOut' ? "linear" : "easeInOut",
              repeat: (breathingPhase === 'hold' || breathingPhase === 'holdOut') ? 0 : 1
            }}
          >
            {/* Central content */}
            <div className="text-center z-10">
              <motion.div 
                className="text-3xl font-bold mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {getBreathingInstruction()}
              </motion.div>
              <motion.div 
                className="text-6xl font-mono font-bold mb-2"
                key={phaseTimeRemaining}
                initial={{ scale: 1.2, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {phaseTimeRemaining}
              </motion.div>
              <div className="text-lg opacity-80">
                {breathingPhase === 'inhale' ? 'Expand' : 
                 breathingPhase === 'exhale' ? 'Release' : 'Pause'}
              </div>
            </div>
          </motion.div>
          
          {/* Breathing particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}-${breathingPhase}`}
              className="absolute w-2 h-2 rounded-full bg-white/80 shadow-lg"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ 
                x: Math.cos((i * Math.PI * 2) / 12) * 180,
                y: Math.sin((i * Math.PI * 2) / 12) * 180,
                opacity: 0.6,
                scale: 1.2
              }}
              animate={{
                x: breathingPhase === 'inhale' 
                  ? Math.cos((i * Math.PI * 2) / 12) * 280
                  : breathingPhase === 'exhale'
                  ? Math.cos((i * Math.PI * 2) / 12) * 80
                  : Math.cos((i * Math.PI * 2) / 12) * 180,
                y: breathingPhase === 'inhale'
                  ? Math.sin((i * Math.PI * 2) / 12) * 280
                  : breathingPhase === 'exhale'
                  ? Math.sin((i * Math.PI * 2) / 12) * 80
                  : Math.sin((i * Math.PI * 2) / 12) * 180,
                opacity: breathingPhase === 'hold' || breathingPhase === 'holdOut' ? 1 : 0.6,
                scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'exhale' ? 0.8 : 1.2
              }}
              transition={{
                duration: (breathingPhase === 'hold' || breathingPhase === 'holdOut') ? 0 : (activeMode.pattern[breathingPhase] || 1),
                ease: breathingPhase === 'hold' || breathingPhase === 'holdOut' ? "linear" : "easeInOut",
                delay: i * 0.05,
                repeat: (breathingPhase === 'hold' || breathingPhase === 'holdOut') ? 0 : 1
              }}
            />
          ))}

          {/* Progress indicator */}
          <motion.div 
            className="absolute bottom-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="text-center">
              <div className="text-gray-300 mb-2">
                Pattern: {activeMode.pattern.inhale}-{activeMode.pattern.holdIn}-{activeMode.pattern.exhale}-{activeMode.pattern.holdOut || 0}
              </div>
              <div className="text-gray-400 text-sm">
                {breathingPhase === 'inhale' ? 'Breathe in slowly and deeply' :
                 breathingPhase === 'exhale' ? 'Exhale completely and gently' :
                 'Hold your breath naturally'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="zen-mode-container"
      style={{
        padding: '3rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: '3rem' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#E2E8F0', 
            marginBottom: '1rem' 
          }}>
            <Wind className="w-6 h-6 mr-2" />
            Zen Breathing
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#A0AEC0',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Choose a breathing technique to center yourself and find inner calm
          </p>
        </motion.div>

        <motion.div
          style={{ marginBottom: '3rem', textAlign: 'center' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label style={{ 
            display: 'block', 
            fontSize: '1.1rem', 
            color: '#E2E8F0', 
            marginBottom: '1rem' 
          }}>
            Session Duration: {sessionDuration} minutes
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={sessionDuration}
            onChange={(e) => setSessionDuration(parseInt(e.target.value))}
            style={{
              width: '200px',
              margin: '0 1rem'
            }}
          />
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {breathingModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startBreathingSession(mode)}
            >
              <div style={{ 
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {renderIcon(mode.icon, "w-12 h-12 text-white")}
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2 group-hover:text-white transition-colors duration-300">
                {mode.title}
              </h3>
              <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300">
                {mode.description}
              </p>
              <motion.button
                className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm px-8 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-white/30 text-white"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold">
                  Start Practice
                </span>
              </motion.button>
            </motion.div>
          ))}
        </div>

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
  );
};

export default ZenMode;