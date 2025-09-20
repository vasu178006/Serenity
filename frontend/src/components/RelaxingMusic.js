import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Play, Pause, Waves, ArrowLeft, CloudRain, TreePine, Bell, Star, Leaf } from 'lucide-react';

// Helper function to render icons safely
const renderIcon = (IconComponent, className) => {
  if (typeof IconComponent === 'string') {
    return IconComponent;
  }
  return React.createElement(IconComponent, { className });
};

const RelaxingMusic = () => {
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);

  // Create a simple test audio as fallback
  const createTestAudio = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    return { oscillator, gainNode, audioContext };
  };

  // Real audio files - using royalty-free audio URLs
  // In production, you would host these files locally or use CDN
  const soundscapes = [
    {
      id: 'rain',
      title: 'Gentle Rain',
      description: 'Soft rainfall sounds for deep relaxation',
      icon: CloudRain,
      // Using a publicly available rain sound
      url: 'https://www.soundjay.com/misc/sounds-641.mp3',
      color: 'from-blue-500 to-indigo-600',
      fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
    },
    {
      id: 'forest',
      title: 'Forest Ambience',
      description: 'Birds chirping and gentle forest sounds',
      icon: TreePine,
      url: 'https://www.soundjay.com/nature/nature-sounds-1.mp3',
      color: 'from-green-500 to-emerald-600',
      fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3'
    },
    {
      id: 'ocean',
      title: 'Ocean Waves',
      description: 'Peaceful ocean waves for meditation',
      icon: Waves,
      url: 'https://www.soundjay.com/ocean/ocean-waves-1.mp3',
      color: 'from-cyan-500 to-teal-600',
      fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Erase_This-Musicalgenius.mp3'
    },
    {
      id: 'meditation',
      title: 'Meditation Bells',
      description: 'Tibetan singing bowls and gentle bells',
      icon: Bell,
      url: 'https://www.soundjay.com/meditation/meditation-bells-1.mp3',
      color: 'from-purple-500 to-pink-600',
      fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/explosion.mp3'
    },
    {
      id: 'space',
      title: 'Space Ambience',
      description: 'Cosmic sounds for deep contemplation',
      icon: Star,
      url: 'https://www.soundjay.com/space/space-ambient-1.mp3',
      color: 'from-purple-600 to-indigo-700',
      fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg'
    },
    {
      id: 'nature',
      title: 'Nature Sounds',
      description: 'Mixed natural sounds for tranquility',
      icon: Leaf,
      url: 'https://www.soundjay.com/nature/nature-mix-1.mp3',
      color: 'from-green-400 to-blue-500',
      fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp__CIRCULOS.mp3'
    }
  ];

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.volume = volume;
      
      const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      const handleError = () => {
        console.warn(`Failed to load primary audio, trying fallback for ${currentTrack.title}`);
        if (currentTrack.fallbackUrl && audioRef.current.src !== currentTrack.fallbackUrl) {
          audioRef.current.src = currentTrack.fallbackUrl;
          audioRef.current.load();
        }
      };
      
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [currentTrack, volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
          setProgress(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isPlaying]);

  const playTrack = async (track) => {
    console.log('Play track called:', track.title);
    
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
      return;
    }

    try {
      if (currentTrack?.id !== track.id) {
        console.log('Setting new track:', track.title);
        setCurrentTrack(track);
        setProgress(0);
        setAudioError(null);
        
        if (audioRef.current) {
          console.log('Loading audio URL:', track.url);
          audioRef.current.src = track.url;
          audioRef.current.load();
          
          // Wait for the audio to be ready before playing
          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              console.log('Audio can play');
              if (audioRef.current) {
                audioRef.current.removeEventListener('canplay', handleCanPlay);
                audioRef.current.removeEventListener('error', handleError);
              }
              resolve();
            };
            
            const handleError = (e) => {
              console.error('Audio load error:', e);
              if (audioRef.current) {
                audioRef.current.removeEventListener('canplay', handleCanPlay);
                audioRef.current.removeEventListener('error', handleError);
              }
              reject(new Error('Failed to load audio'));
            };
            
            audioRef.current.addEventListener('canplay', handleCanPlay);
            audioRef.current.addEventListener('error', handleError);
          });
        }
      }
      
      if (audioRef.current) {
        console.log('Attempting to play audio');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Audio playing successfully');
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Try fallback URL
      if (track.fallbackUrl) {
        try {
          console.log('Trying fallback URL:', track.fallbackUrl);
          if (audioRef.current) {
            audioRef.current.src = track.fallbackUrl;
            audioRef.current.load();
            
            // Wait for fallback audio to be ready
            await new Promise((resolve, reject) => {
              const handleCanPlay = () => {
                console.log('Fallback audio can play');
                if (audioRef.current) {
                  audioRef.current.removeEventListener('canplay', handleCanPlay);
                  audioRef.current.removeEventListener('error', handleError);
                }
                resolve();
              };
              
              const handleError = (e) => {
                console.error('Fallback audio load error:', e);
                if (audioRef.current) {
                  audioRef.current.removeEventListener('canplay', handleCanPlay);
                  audioRef.current.removeEventListener('error', handleError);
                }
                reject(new Error('Fallback audio failed to load'));
              };
              
              audioRef.current.addEventListener('canplay', handleCanPlay);
              audioRef.current.addEventListener('error', handleError);
            });
            
            await audioRef.current.play();
            console.log('Fallback audio playing successfully');
            setIsPlaying(true);
          }
        } catch (fallbackError) {
          console.error('Fallback audio also failed:', fallbackError);
          // Try to create a simple test audio
          try {
            console.log('Creating test audio as final fallback');
            const testAudio = createTestAudio();
            testAudio.oscillator.start();
            setIsPlaying(true);
            setAudioError('Using test audio - external sources unavailable');
          } catch (testError) {
            console.error('Test audio creation failed:', testError);
            alert('Unable to play audio. Please check your internet connection or try a different track.');
          }
        }
      } else {
        // Try to create a simple test audio
        try {
          console.log('Creating test audio as fallback');
          const testAudio = createTestAudio();
          testAudio.oscillator.start();
          setIsPlaying(true);
          setAudioError('Using test audio - external sources unavailable');
        } catch (testError) {
          console.error('Test audio creation failed:', testError);
          alert('Unable to play audio. Please check your internet connection.');
        }
      }
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handleProgressClick = (e) => {
    if (audioRef.current && duration > 0 && !isNaN(duration)) {
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = clickRatio * duration;
        
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
      } catch (error) {
        console.error('Error handling progress click:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
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
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              <Music className="w-6 h-6 mr-2" />
              Relaxing Music
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Immerse yourself in calming soundscapes designed to enhance focus and relaxation
            </p>
          </motion.div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Current Player */}
        {currentTrack && (
          <motion.div
            className="glass-modal"
            style={{
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '3rem'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Error Message */}
            {audioError && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <p className="text-yellow-200 text-sm">{audioError}</p>
              </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {renderIcon(currentTrack.icon, "w-16 h-16 text-white")}
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#E2E8F0', marginBottom: '0.5rem' }}>
                {currentTrack.title}
              </h3>
              <p style={{ color: '#A0AEC0' }}>
                {currentTrack.description}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div 
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={handleProgressClick}
              >
                <div style={{
                  width: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #667EEA, #764BA2)',
                  transition: 'width 0.3s ease',
                  borderRadius: '3px'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: '#A0AEC0'
              }}>
                <Music className="w-4 h-4 mr-2" />
                <span>Playing</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={() => playTrack(currentTrack)}
                className="glass-button"
                style={{
                  borderRadius: '50px',
                  width: '60px',
                  height: '60px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E2E8F0'
                }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={stopTrack}
                className="glass-button"
                style={{
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  color: '#E2E8F0'
                }}
              >
                ⏹️ Stop
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                style={{ 
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px'
                }}
              />
              <span style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Soundscape Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {soundscapes.map((track, index) => (
            <motion.div
              key={track.id}
              className={`relative group cursor-pointer overflow-hidden ${
                currentTrack?.id === track.id 
                  ? 'bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-indigo-500/20 border-purple-400/30' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
              } backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 text-center`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ 
                scale: 1.03,
                y: -8,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => playTrack(track)}
            >
              {/* Floating gradient orb */}
              <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${track.color} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
              
              {/* Playing indicator */}
              {currentTrack?.id === track.id && isPlaying && (
                <motion.div 
                  className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* Icon with enhanced styling */}
              <motion.div 
                className="text-6xl mb-6 flex justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {renderIcon(track.icon, "w-12 h-12 text-white")}
              </motion.div>
              
              {/* Title with gradient text */}
              <h3 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
                {track.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-300 text-center mb-6 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                {track.description}
              </p>

              {/* Play button with enhanced design */}
              <motion.div 
                className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                  currentTrack?.id === track.id && isPlaying 
                    ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50 text-green-300' 
                    : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-200 hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">
                  {currentTrack?.id === track.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </span>
                <span>
                  {currentTrack?.id === track.id && isPlaying ? 'Playing' : 'Play'}
                </span>
              </motion.div>
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
    </div>
  );
};

export default RelaxingMusic;