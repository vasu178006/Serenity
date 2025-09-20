import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    identity: null,
    currentMood: null,
    moodFrequency: null,
    isOnboarded: false
  });

  useEffect(() => {
    // Load user data from localStorage
    const userPrefs = localStorage.getItem('serenity_user_preferences');
    if (userPrefs) {
      const prefs = JSON.parse(userPrefs);
      setUser({
        identity: prefs.identity,
        currentMood: prefs.current_mood,
        moodFrequency: prefs.mood_frequency,
        isOnboarded: true
      });
    }
  }, []);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    
    // Save to localStorage
    const currentPrefs = JSON.parse(localStorage.getItem('serenity_user_preferences') || '{}');
    const updatedPrefs = { ...currentPrefs, ...userData };
    localStorage.setItem('serenity_user_preferences', JSON.stringify(updatedPrefs));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};