import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

// Import components
import LandingAnimation from './components/LandingAnimation';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import ZenMode from './components/ZenMode';
import VisualEffects from './components/VisualEffects';
import RelaxingMusic from './components/RelaxingMusic';
import CognitiveReframer from './components/CognitiveReframer';
import JournalArticles from './components/JournalArticles';
import Settings from './components/Settings';
import Profile from './components/Profile';

// Theme Context
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';

function App() {
  const [currentStep, setCurrentStep] = useState('landing'); // landing, onboarding, dashboard
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    // Always show landing animation first, then check user state
    const timer = setTimeout(() => {
      const userPrefs = localStorage.getItem('serenity_user_preferences');
      
      if (userPrefs) {
        // Returning user - go to dashboard
        setCurrentStep('dashboard');
        setShowSidebar(true);
      } else {
        // New user - show onboarding
        setCurrentStep('onboarding');
      }
    }, 4000); // Landing animation duration

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = (preferences) => {
    localStorage.setItem('serenity_user_preferences', JSON.stringify(preferences));
    setCurrentStep('dashboard');
    setShowSidebar(true);
  };

  const handleLandingComplete = () => {
    setCurrentStep('onboarding');
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('serenity_user_preferences');
    localStorage.removeItem('serenity_cbt_sessions');
    localStorage.removeItem('serenity_favorite_articles');
    
    // Reset app state
    setCurrentStep('landing');
    setShowSidebar(false);
  };

  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <div className="app-container">
            <AnimatePresence mode="wait">
              {currentStep === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  <LandingAnimation onComplete={handleLandingComplete} />
                </motion.div>
              )}

              {currentStep === 'onboarding' && (
                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                >
                  <OnboardingFlow onComplete={handleOnboardingComplete} />
                </motion.div>
              )}

              {currentStep === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  className="dashboard-container"
                >
                  {showSidebar && <Sidebar onLogout={handleLogout} />}
                  <div className={`main-content ${showSidebar ? 'with-sidebar' : ''}`}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/zen" element={<ZenMode />} />
                      <Route path="/visual" element={<VisualEffects />} />
                      <Route path="/music" element={<RelaxingMusic />} />
                      <Route path="/reframe" element={<CognitiveReframer />} />
                      <Route path="/journal" element={<JournalArticles />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;