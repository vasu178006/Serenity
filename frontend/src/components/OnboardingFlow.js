import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    identity: '',
    currentMood: '',
    moodFrequency: ''
  });
  const { updateTheme } = useTheme();

  const steps = [
    {
      question: "First, who are you?",
      subtitle: "Help us personalize your experience",
      options: [
        { value: 'Student', icon: '📚', description: 'Learning and growing' },
        { value: 'Creative', icon: '🎨', description: 'Expressing and creating' },
        { value: 'Professional', icon: '💼', description: 'Working and achieving' },
        { value: 'Other', icon: '⭐', description: 'On your unique journey' }
      ],
      key: 'identity'
    },
    {
      question: "How are you feeling right now?",
      subtitle: "There's no wrong answer",
      options: [
        { value: 'Anxious', icon: '😰', description: 'Worried or nervous', color: '#6B73FF' },
        { value: 'Unfocused', icon: '💭', description: 'Scattered thoughts', color: '#10B981' },
        { value: 'Sad', icon: '😢', description: 'Feeling down', color: '#F59E0B' },
        { value: 'Stressed', icon: '😤', description: 'Overwhelmed', color: '#EF4444' },
        { value: 'Calm', icon: '😌', description: 'Peaceful and centered', color: '#06B6D4' }
      ],
      key: 'currentMood'
    },
    {
      question: "How often have you been feeling this way?",
      subtitle: "This helps us understand your journey",
      options: [
        { value: 'Just today', icon: '☀️', description: 'This feeling is new' },
        { value: 'This week', icon: '📅', description: "It's been a few days" },
        { value: 'For a while', icon: '⏳', description: 'This has been ongoing' }
      ],
      key: 'moodFrequency'
    }
  ];

  const handleOptionSelect = (value) => {
    setAnswers(prev => ({
      ...prev,
      [steps[currentStep].key]: value
    }));
  };

  const handleContinue = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        const response = await fetch(`${API}/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identity: answers.identity,
            current_mood: answers.currentMood,
            mood_frequency: answers.moodFrequency
          })
        });
        
        const data = await response.json();
        
        // Update theme based on mood
        if (data.theme_colors) {
          updateTheme(data.theme_colors);
        }
        
        onComplete(data);
      } catch (error) {
        console.error('Error saving preferences:', error);
        // Continue with local storage fallback
        const preferences = {
          identity: answers.identity,
          current_mood: answers.currentMood,
          mood_frequency: answers.moodFrequency,
          theme_colors: generateThemeColors(answers.currentMood)
        };
        
        updateTheme(preferences.theme_colors);
        onComplete(preferences);
      }
    }
  };

  const generateThemeColors = (mood) => {
    const themes = {
      "Anxious": {
        primary: "#6B73FF",
        secondary: "#9BB5FF", 
        accent: "#C1D3FE",
        background: "#1A1B23",
        surface: "#2A2D37",
        text: "#E2E8F0"
      },
      "Unfocused": {
        primary: "#10B981",
        secondary: "#34D399",
        accent: "#6EE7B7",
        background: "#1A1E1A",
        surface: "#273229",
        text: "#E2E8F0"
      },
      "Sad": {
        primary: "#F59E0B",
        secondary: "#FBBF24",
        accent: "#FCD34D",
        background: "#1E1B17",
        surface: "#322A20",
        text: "#E2E8F0"
      },
      "Stressed": {
        primary: "#EF4444",
        secondary: "#F87171",
        accent: "#FCA5A5",
        background: "#1E1A1A",
        surface: "#332727",
        text: "#E2E8F0"
      },
      "Calm": {
        primary: "#06B6D4",
        secondary: "#22D3EE",
        accent: "#67E8F9",
        background: "#1A1E1E",
        surface: "#273333",
        text: "#E2E8F0"
      }
    };
    
    return themes[mood] || themes["Calm"];
  };

  const currentStepData = steps[currentStep];
  const selectedValue = answers[currentStepData.key];

  return (
    <div className="onboarding-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="onboarding-step"
        >
          <h1 className="onboarding-title">{currentStepData.question}</h1>
          <p className="onboarding-subtitle">{currentStepData.subtitle}</p>
          
          <div className="onboarding-options">
            {currentStepData.options.map((option) => (
              <motion.div
                key={option.value}
                className={`onboarding-option ${selectedValue === option.value ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * currentStepData.options.indexOf(option) }}
              >
                <div className="onboarding-option-icon">{option.icon}</div>
                <div className="onboarding-option-title">{option.value}</div>
                <div className="onboarding-option-subtitle">{option.description}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.button
            className="onboarding-continue"
            onClick={handleContinue}
            disabled={!selectedValue}
            whileHover={{ scale: selectedValue ? 1.02 : 1 }}
            whileTap={{ scale: selectedValue ? 0.98 : 1 }}
          >
            {currentStep < steps.length - 1 ? 'Continue' : 'Enter Serenity Space'}
          </motion.button>
          
          <div className="onboarding-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index <= currentStep ? 'active' : ''}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;