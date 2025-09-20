import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const LandingAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="landing-container">
      <motion.div
        className="landing-orb"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1, 1.1, 1],
          opacity: [0, 0.4, 0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 3,
          times: [0, 0.3, 0.6, 0.8, 1],
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="landing-text"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        Welcome to Serenity Space
      </motion.div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="floating-particle"
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'rgba(102, 126, 234, 0.6)',
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}
    </div>
  );
};

export default LandingAnimation;