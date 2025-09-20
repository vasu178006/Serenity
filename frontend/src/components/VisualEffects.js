import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Waves, Circle, Flower2, ArrowLeft, Sparkle, Orbit, Star, RotateCcw } from 'lucide-react';

// Helper function to render icons safely
const renderIcon = (IconComponent, className) => {
  if (typeof IconComponent === 'string') {
    return IconComponent;
  }
  return React.createElement(IconComponent, { className });
};

const VisualEffects = () => {
  const navigate = useNavigate();
  const [activeEffect, setActiveEffect] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [speed, setSpeed] = useState(3);

  const visualEffects = [
    {
      id: 'flowing-orbs',
      title: 'Floating Lotus',
      description: 'Gentle floating petals of tranquility',
      icon: Flower2,
      component: FlowingOrbs
    },
    {
      id: 'particle-rain', 
      title: 'Stardust Cascade',
      description: 'Peaceful falling stardust particles',
      icon: Sparkles,
      component: ParticleRain
    },
    {
      id: 'breathing-circle',
      title: 'Meditation Pulse',
      description: 'Synchronized breathing visualization',
      icon: Sparkle,
      component: BreathingCircle
    },
    {
      id: 'wave-pattern',
      title: 'Zen Garden Waves',
      description: 'Flowing water ripples for peace',
      icon: Waves,
      component: WavePattern
    },
    {
      id: 'aurora',
      title: 'Aurora Dreams',
      description: 'Soft northern lights display',
      icon: Star,
      component: AuroraEffect
    },
    {
      id: 'mandala',
      title: 'Sacred Mandala',
      description: 'Rotating spiritual geometry',
      icon: RotateCcw,
      component: MandalaEffect
    }
  ];

  if (activeEffect) {
    const EffectComponent = activeEffect.component;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        zIndex: 1000
      }}>
        <EffectComponent intensity={intensity} speed={speed} />
        
        {/* Controls overlay with glassmorphism */}
        <div className="glass-modal" style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#E2E8F0',
          minWidth: '220px'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
            {activeEffect.title}
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A0AEC0' }}>
              Intensity: {intensity}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              style={{ 
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A0AEC0' }}>
              Speed: {speed}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              style={{ 
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px'
              }}
            />
          </div>
          
          <button
            onClick={() => setActiveEffect(null)}
            className="glass-button"
            style={{
              width: '100%',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#F87171'
            }}
          >
            ✕ Exit Visual
          </button>
        </div>

        {/* Breathing instruction overlay for breathing circle */}
        {activeEffect.id === 'breathing-circle' && (
          <div style={{
            position: 'fixed',
            bottom: '3rem',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            color: '#E2E8F0'
          }}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 6 - speed * 0.4, repeat: Infinity }}
              style={{ fontSize: '1.2rem', fontWeight: '500' }}
            >
              Breathe with the circle
            </motion.div>
            <div style={{ fontSize: '0.9rem', color: '#A0AEC0', marginTop: '0.5rem' }}>
              Inhale as it grows • Exhale as it shrinks
            </div>
          </div>
        )}
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
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            <Flower2 className="w-6 h-6 mr-2" />
            Visual Meditation
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Immerse yourself in soothing visual experiences designed to calm your mind and enhance focus
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {visualEffects.map((effect, index) => (
            <motion.div
              key={effect.id}
              className="glass-card"
              style={{
                borderRadius: '20px',
                padding: '2.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                y: -4,
                borderColor: 'rgba(102, 126, 234, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveEffect(effect)}
            >
              <div style={{ 
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {renderIcon(effect.icon, "w-16 h-16 text-white")}
              </div>
              <h3 style={{ 
                fontSize: '1.4rem', 
                fontWeight: '600', 
                color: '#E2E8F0', 
                marginBottom: '0.5rem' 
              }}>
                {effect.title}
              </h3>
              <p style={{ 
                color: '#A0AEC0', 
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {effect.description}
              </p>
              <button 
                className="glass-button"
                style={{
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Begin Experience
              </button>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
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

// Enhanced Visual Effect Components with more calming animations
const FlowingOrbs = ({ intensity, speed }) => {
  const orbCount = Math.max(3, Math.min(8, intensity));
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Main floating orbs */}
      {[...Array(orbCount)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: `${60 + intensity * 20}px`,
            height: `${60 + intensity * 20}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              rgba(${255 - i * 20}, ${182 + i * 15}, ${193 + i * 10}, 0.${Math.max(3, intensity)}), 
              rgba(${221 - i * 15}, ${160 + i * 20}, ${221 - i * 10}, 0.${Math.max(2, intensity - 2)}),
              rgba(${173 + i * 10}, ${216 - i * 10}, ${230 - i * 15}, 0.${Math.max(1, intensity - 4)})
            )`,
            filter: `blur(${5 + intensity * 0.5}px)`,
            left: `${(i * 25) % 80 + 10}%`,
            top: `${(i * 30) % 60 + 20}%`,
            boxShadow: `0 0 ${30 + intensity * 5}px rgba(${255 - i * 20}, ${182 + i * 15}, ${193 + i * 10}, 0.4)`
          }}
          animate={{
            x: [0, 100 - i * 20, -60 + i * 15, 0],
            y: [0, -80 + i * 25, 60 - i * 20, 0],
            scale: [1, 1.2 + i * 0.1, 0.8 + i * 0.1, 1],
            rotate: [0, 120 + i * 60, 360]
          }}
          transition={{
            duration: 25 - speed * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 4
          }}
        />
      ))}
      
      {/* Lotus petals */}
      {[...Array(Math.floor(intensity * 1.5))].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          style={{
            position: 'absolute',
            width: '12px',
            height: '6px',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: `linear-gradient(45deg, rgba(255, 192, 203, 0.${intensity}), rgba(255, 182, 193, 0.${Math.max(2, intensity - 2)}))`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
          animate={{
            y: [0, -40 - Math.random() * 20, 0],
            x: [0, 30 - Math.random() * 60, 0],
            rotate: [0, 180 + Math.random() * 180, 360],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 12 - speed * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 6
          }}
        />
      ))}
      
      {/* Gentle sparkles */}
      {[...Array(intensity * 2)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.8)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)'
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 8
          }}
        />
      ))}
    </div>
  );
};

const ParticleRain = ({ intensity, speed }) => {
  const particleCount = intensity * 12;
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            borderRadius: '50%',
            background: `rgba(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, 255, ${0.4 + (intensity / 25)})`,
            boxShadow: `0 0 ${4 + intensity}px rgba(255, 255, 255, 0.${intensity})`,
            left: `${Math.random() * 100}%`,
            top: '-10px'
          }}
          animate={{
            y: [0, window.innerHeight + 20],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 10 - speed * 0.8,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 6
          }}
        />
      ))}
    </div>
  );
};

const BreathingCircle = ({ intensity, speed }) => {
  const breathingDuration = Math.max(4, 8 - speed * 0.6);
  const [currentPhase, setCurrentPhase] = React.useState('inhale');
  const [phaseTime, setPhaseTime] = React.useState(breathingDuration / 2);
  
  React.useEffect(() => {
    let phaseInterval;
    let countdownInterval;
    let isActive = true;
    
    const cycle = [
      { phase: 'inhale', duration: breathingDuration / 2, instruction: 'Breathe In' },
      { phase: 'exhale', duration: breathingDuration / 2, instruction: 'Breathe Out' }
    ];
    
    let currentPhaseIndex = 0;
    
    const nextPhase = () => {
      if (!isActive) return;
      
      const phase = cycle[currentPhaseIndex];
      setCurrentPhase(phase.phase);
      setPhaseTime(phase.duration);
      
      let timeLeft = phase.duration * 10;
      const updateCountdown = () => {
        if (!isActive || timeLeft <= 0) return;
        setPhaseTime(Math.ceil(timeLeft / 10));
        timeLeft--;
        if (timeLeft > 0) {
          countdownInterval = setTimeout(updateCountdown, 100);
        }
      };
      
      updateCountdown();
      
      phaseInterval = setTimeout(() => {
        if (countdownInterval) clearTimeout(countdownInterval);
        currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length;
        nextPhase();
      }, phase.duration * 1000);
    };
    
    nextPhase();
    
    return () => {
      isActive = false;
      if (phaseInterval) clearTimeout(phaseInterval);
      if (countdownInterval) clearTimeout(countdownInterval);
    };
  }, [breathingDuration]);
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      {/* Outer breathing ring */}
      <motion.div
        key={`visual-outer-ring-${currentPhase}`}
        style={{
          position: 'absolute',
          width: `${300 + intensity * 30}px`,
          height: `${300 + intensity * 30}px`,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
        animate={{
          scale: currentPhase === 'inhale' ? 1.1 : 0.9,
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          scale: { duration: breathingDuration / 2, ease: "easeInOut" },
          opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      {/* Main breathing circle */}
      <motion.div
        key={`visual-main-circle-${currentPhase}`}
        style={{
          position: 'absolute',
          width: `${200 + intensity * 20}px`,
          height: `${200 + intensity * 20}px`,
          borderRadius: '50%',
          background: currentPhase === 'inhale'
            ? 'radial-gradient(circle, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.7), rgba(64, 224, 208, 0.5))'
            : 'radial-gradient(circle, rgba(64, 224, 208, 0.9), rgba(118, 75, 162, 0.7), rgba(102, 126, 234, 0.5))',
          boxShadow: currentPhase === 'inhale'
            ? '0 0 60px rgba(102, 126, 234, 0.8)'
            : '0 0 40px rgba(64, 224, 208, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
        animate={{
          scale: currentPhase === 'inhale' ? 1.4 : 0.8,
        }}
        transition={{
          duration: breathingDuration / 2,
          ease: "easeInOut"
        }}
      >
        {/* Central content with counter */}
        <div style={{ textAlign: 'center', color: 'white' }}>
          <motion.div 
            style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {currentPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
          </motion.div>
          <motion.div 
            style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}
            key={phaseTime}
            initial={{ scale: 1.2, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {Math.ceil(phaseTime)}
          </motion.div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            {currentPhase === 'inhale' ? 'Expand' : 'Release'}
          </div>
        </div>
      </motion.div>
      
      {/* Breathing particles with improved movement */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            left: '50%',
            top: '50%',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
          }}
          animate={{
            x: [
              0, 
              Math.cos((i * Math.PI * 2) / 12) * (120 + intensity * 15),
              0
            ],
            y: [
              0,
              Math.sin((i * Math.PI * 2) / 12) * (120 + intensity * 15),
              0
            ],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: breathingDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * (breathingDuration / 12)
          }}
        />
      ))}
      
      {/* Subtle rotating ring */}
      <motion.div
        style={{
          position: 'absolute',
          width: `${300 + intensity * 30}px`,
          height: `${300 + intensity * 30}px`,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(0.5px)'
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          rotate: { duration: breathingDuration * 4, repeat: Infinity, ease: "linear" },
          scale: { duration: breathingDuration, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: breathingDuration, repeat: Infinity, ease: "easeInOut" }
        }}
      />
    </div>
  );
};

const WavePattern = ({ intensity, speed }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            bottom: `${i * 12}%`,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, 
              transparent, 
              rgba(64, 224, 208, ${0.2 + intensity * 0.06}), 
              rgba(102, 126, 234, ${0.3 + intensity * 0.06}),
              rgba(64, 224, 208, ${0.2 + intensity * 0.06}),
              transparent
            )`,
            borderRadius: '2px',
            transformOrigin: 'left center'
          }}
          animate={{
            scaleX: [0.5, 2.5, 0.5],
            x: [-300, 300, -300],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 10 - speed * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
        />
      ))}
      
      {/* Ripple effects */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ripple-${i}`}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            borderRadius: '50%',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [0, 2, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 6 - speed * 0.3,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 2
          }}
        />
      ))}
    </div>
  );
};

const AuroraEffect = ({ intensity, speed }) => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * 20}%`,
            left: 0,
            right: 0,
            height: `${60 + intensity * 10}px`,
            background: `linear-gradient(90deg, 
              transparent,
              rgba(${100 + i * 30}, 255, ${200 - i * 40}, 0.${intensity}),
              rgba(${200 - i * 30}, ${150 + i * 20}, 255, 0.${Math.max(2, intensity - 1)}),
              transparent
            )`,
            filter: 'blur(8px)',
            borderRadius: '50px'
          }}
          animate={{
            x: [-200, 200, -200],
            scaleY: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 15 - speed * 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2
          }}
        />
      ))}
      
      {/* Twinkling stars */}
      {[...Array(intensity * 3)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'white',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)'
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4
          }}
        />
      ))}
    </div>
  );
};

const MandalaEffect = ({ intensity, speed }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Outer rotating ring */}
      <motion.div
        style={{
          position: 'absolute',
          width: `${200 + intensity * 20}px`,
          height: `${200 + intensity * 20}px`
        }}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 30 - speed * 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '6px',  
              height: '6px',
              borderRadius: '50%',
              background: `rgba(${150 + i * 10}, ${200 - i * 5}, 255, 0.${intensity})`,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${100 + intensity * 10}px)`,
              boxShadow: `0 0 8px rgba(${150 + i * 10}, ${200 - i * 5}, 255, 0.5)`
            }}
          />
        ))}
      </motion.div>
      
      {/* Inner counter-rotating pattern */}
      <motion.div
        style={{
          position: 'absolute',
          width: `${120 + intensity * 15}px`,
          height: `${120 + intensity * 15}px`
        }}
        animate={{
          rotate: [0, -360]
        }}
        transition={{
          duration: 20 - speed * 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '20px',
              background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.${intensity}), transparent)`,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${60 + intensity * 8}px)`,
              borderRadius: '2px'
            }}
          />
        ))}
      </motion.div>
      
      {/* Central pulsing core */}
      <motion.div
        style={{
          width: `${40 + intensity * 5}px`,
          height: `${40 + intensity * 5}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(102, 126, 234, 0.4))',
          filter: 'blur(2px)'
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 4 - speed * 0.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default VisualEffects;