import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CognitiveReframer = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('home'); // home, session, journal
  const [currentStep, setCurrentStep] = useState(0);
  const [negativeThought, setNegativeThought] = useState('');
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    // Only load sessions on initial load
    loadSessions();
  }, []);

  const fetchQuestions = async (negativeThought = null) => {
    try {
      let response;
      if (negativeThought) {
        console.log('Fetching AI questions for:', negativeThought);
        // Use AI-powered dynamic questions
        response = await fetch(`${API}/cbt-questions/dynamic`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            negative_thought: negativeThought,
            user_context: "User seeking help with cognitive reframing through CBT techniques"
          })
        });
      } else {
        console.log('Fetching static questions');
        // Use static fallback questions
        response = await fetch(`${API}/cbt-questions`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received questions:', data);
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Show error message instead of fallback
      alert('Unable to generate personalized questions. Please check your connection and try again.');
      setQuestions([]);
    }
  };

  const loadSessions = async () => {
    try {
      // First try to load from backend
      const response = await fetch(`${API}/cbt-sessions`);
      if (response.ok) {
        const backendSessions = await response.json();
        setSessions(backendSessions);
        
        // Also save to localStorage as backup
        localStorage.setItem('serenity_cbt_sessions', JSON.stringify(backendSessions));
      } else {
        // Fallback to localStorage if backend fails
        const savedSessions = localStorage.getItem('serenity_cbt_sessions');
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }
      }
    } catch (error) {
      console.error('Error loading sessions from backend:', error);
      // Fallback to localStorage
      const savedSessions = localStorage.getItem('serenity_cbt_sessions');
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
    }
  };

  const saveSessions = async (newSessions) => {
    localStorage.setItem('serenity_cbt_sessions', JSON.stringify(newSessions));
    setSessions(newSessions);
    
    // Also sync with backend
    try {
      await fetch(`${API}/cbt-sessions/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessions: newSessions })
      });
    } catch (error) {
      console.error('Error syncing sessions with backend:', error);
    }
  };

  const startNewSession = async () => {
    if (!negativeThought.trim()) return;

    // Fetch AI-powered questions based on the negative thought
    await fetchQuestions(negativeThought);

    setMode('session');
    setCurrentStep(0);
    setAnswers([]);
    setCurrentAnswer('');
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) return;

    const newAnswer = {
      question: questions[currentStep].question,
      answer: currentAnswer
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setCurrentAnswer('');

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSession(updatedAnswers);
    }
  };

  const completeSession = async (finalAnswers) => {
    // Save to backend first
    try {
      const response = await fetch(`${API}/cbt-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          negative_thought: negativeThought,
          questions_and_answers: finalAnswers
        })
      });

      if (response.ok) {
        const savedSession = await response.json();
        
        // Update local sessions with the backend response
        const updatedSessions = [savedSession, ...sessions];
        setSessions(updatedSessions);
        localStorage.setItem('serenity_cbt_sessions', JSON.stringify(updatedSessions));
      } else {
        throw new Error('Failed to save to backend');
      }
    } catch (error) {
      console.error('Error saving session to backend:', error);
      
      // Fallback: save locally only
      const sessionData = {
        id: Date.now().toString(),
        negative_thought: negativeThought,
        questions_and_answers: finalAnswers,
        created_at: new Date().toISOString(),
        completed: true
      };
      
      const updatedSessions = [sessionData, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('serenity_cbt_sessions', JSON.stringify(updatedSessions));
    }

    // Reset for new session
    setMode('completed');
    setTimeout(() => {
      setMode('home');
      setNegativeThought('');
      setCurrentStep(0);
      setAnswers([]);
    }, 3000);
  };

  const deleteSession = async (sessionId) => {
    try {
      // Delete from backend
      await fetch(`${API}/cbt-sessions/${sessionId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting session from backend:', error);
    }
    
    // Delete from local state regardless
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('serenity_cbt_sessions', JSON.stringify(updatedSessions));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (mode === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white relative overflow-hidden flex items-center justify-center p-8">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        
        <motion.div
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl shadow-green-500/10 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
            Session Complete!
          </h2>
          <p className="text-gray-300 text-lg">
            Your thoughts have been processed and saved privately.
            Take a moment to reflect on your insights.
          </p>
        </motion.div>
      </div>
    );
  }

  if (mode === 'session') {
    const currentQuestion = questions[currentStep];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl shadow-purple-500/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Cognitive Reframing Session
              </h2>
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <p style={{ color: '#A0AEC0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Your thought:
                </p>
                <p style={{ color: '#E2E8F0', fontStyle: 'italic' }}>
                  "{negativeThought}"
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.3rem', color: '#E2E8F0' }}>
                  Step {currentStep + 1} of {questions.length}
                </h3>
                <div style={{
                  background: 'rgba(102, 126, 234, 0.2)',
                  borderRadius: '20px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  color: '#667EEA'
                }}>
                  {Math.round(((currentStep + 1) / questions.length) * 100)}% complete
                </div>
              </div>

              <h4 style={{
                fontSize: '1.2rem',
                color: '#E2E8F0',
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                {currentQuestion?.question}
              </h4>

              {currentQuestion?.type === 'choice' ? (
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setCurrentAnswer(option)}
                      style={{
                        background: currentAnswer === option
                          ? 'rgba(102, 126, 234, 0.3)'
                          : 'rgba(45, 55, 72, 0.4)',
                        backdropFilter: 'blur(15px)',
                        border: currentAnswer === option
                          ? '1px solid rgba(102, 126, 234, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        color: '#E2E8F0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : currentQuestion?.type === 'number' ? (
                <div style={{ marginBottom: '2rem' }}>
                  <input
                    type="range"
                    min={currentQuestion.min || 0}
                    max={currentQuestion.max || 100}
                    value={currentAnswer || 50}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    style={{ width: '100%', marginBottom: '1rem' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#A0AEC0',
                    fontSize: '0.9rem'
                  }}>
                    <span>{currentQuestion.min || 0}%</span>
                    <span style={{ color: '#E2E8F0', fontSize: '1.2rem' }}>
                      {currentAnswer || 50}%
                    </span>
                    <span>{currentQuestion.max || 100}%</span>
                  </div>
                </div>
              ) : (
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Take your time to reflect and write your thoughts..."
                  className="glass-input"
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: '#E2E8F0',
                    fontSize: '1rem',
                    resize: 'vertical',
                    marginBottom: '2rem'
                  }}
                />
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setMode('home');
                    setCurrentStep(0);
                    setAnswers([]);
                    setCurrentAnswer('');
                  }}
                  style={{
                    background: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(107, 114, 128, 0.3)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    color: '#9CA3AF',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!currentAnswer.trim()}
                  style={{
                    background: currentAnswer.trim()
                      ? 'linear-gradient(135deg, #667EEA, #764BA2)'
                      : 'rgba(107, 114, 128, 0.2)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 2rem',
                    color: currentAnswer.trim() ? 'white' : '#6B7280',
                    cursor: currentAnswer.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    flex: 1
                  }}
                >
                  {currentStep < questions.length - 1 ? 'Next Question' : 'Complete Session'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            💭 Cognitive Reframer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform negative thoughts into balanced perspectives using proven CBT techniques
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* New Session Card */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:bg-white/10 group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Start New Session
            </h2>

            <div className="mb-8">
              <label className="block text-gray-300 mb-4 text-lg font-medium">
                What negative thought would you like to work through?
              </label>
              <textarea
                value={negativeThought}
                onChange={(e) => setNegativeThought(e.target.value)}
                placeholder="Example: 'I'm never going to succeed at this...' or 'Everyone thinks I'm not good enough...'"
                className="w-full min-h-[120px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                rows="4"
              />
            </div>

            <motion.button
              onClick={startNewSession}
              disabled={!negativeThought.trim()}
              className={`w-full py-4 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 ${
                negativeThought.trim()
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/20 backdrop-blur-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 text-white'
                  : 'bg-gray-700/20 border border-gray-600/20 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={negativeThought.trim() ? { scale: 1.02, y: -2 } : {}}
              whileTap={negativeThought.trim() ? { scale: 0.98 } : {}}
            >
              <span className={negativeThought.trim() ? "bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent font-bold" : ""}>
                Begin Reframing Session
              </span>
            </motion.button>
          </motion.div>

          {/* My Journal */}
          <motion.div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:bg-white/10 group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              📖 My Journal
            </h2>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-400 text-lg">
                  Your reframing sessions will appear here.<br />
                  Start your first session above to begin your journey.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    style={{
                      background: 'rgba(26, 32, 44, 0.6)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: '#E2E8F0',
                          fontStyle: 'italic',
                          marginBottom: '0.5rem',
                          fontSize: '1rem'
                        }}>
                          "{session.negative_thought}"
                        </p>
                        <p style={{
                          color: '#A0AEC0',
                          fontSize: '0.9rem'
                        }}>
                          {formatDate(session.created_at)} • {session.questions_and_answers?.length || 0} reflections
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSession(session.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '4px'
                        }}
                        title="Delete session"
                      >
                        🗑️
                      </button>
                    </div>

                    {session.questions_and_answers?.length > 0 && (
                      <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem'
                      }}>
                        <p style={{
                          color: '#A0AEC0',
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem'
                        }}>
                          Last reflection:
                        </p>
                        <p style={{
                          color: '#E2E8F0',
                          fontSize: '0.95rem'
                        }}>
                          {session.questions_and_answers[session.questions_and_answers.length - 1]?.answer || 'No reflection available'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {sessions.length > 5 && (
                  <p style={{
                    textAlign: 'center',
                    color: '#A0AEC0',
                    fontSize: '0.9rem',
                    marginTop: '1rem'
                  }}>
                    Showing 5 most recent sessions. Total: {sessions.length} sessions.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(45, 55, 72, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 2rem',
              color: '#A0AEC0',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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

export default CognitiveReframer;