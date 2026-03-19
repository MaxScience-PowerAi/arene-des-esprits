import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import BackgroundFX from './components/BackgroundFX.jsx';
import HomePage from './components/HomePage.jsx';
import GamePage from './components/GamePage.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import { getRandomQuestions, RECAP_HOUR, getCurrentHour } from './questions.js';

const isGameActive = () => {
  const h = getCurrentHour();
  return h >= 8 && h < RECAP_HOUR;
};

const ADMIN_PASSWORD = 'admin123';

const QUESTIONS = getRandomQuestions(5);

export default function App() {
  const [gameActive, setGameActive] = useState(isGameActive());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('arene_player_name') || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [responses, setResponses] = useState([]);

  const activeQuestion = QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    const savedResponses = JSON.parse(localStorage.getItem('responses') || '[]');
    setResponses(savedResponses);
    
    const tick = () => {
      setGameActive(isGameActive());
    };
    
    tick();
    const id = setInterval(tick, 30_000);

    return () => clearInterval(id);
  }, []);

  const handleSubmit = useCallback(async (answer, resetAnswer) => {
    if (!activeQuestion || !playerName.trim() || !answer.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const savedResponses = JSON.parse(localStorage.getItem('responses') || '[]');
    
    const existingResponse = savedResponses.find(r => 
      r.questionId === activeQuestion.displayId && r.joueur === playerName.trim()
    );
    
    if (existingResponse) {
      setIsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    const newResponse = {
      id: Date.now().toString(),
      joueur: playerName.trim(),
      reponse: answer.trim(),
      questionId: activeQuestion.displayId,
      timestamp: Date.now(),
    };

    savedResponses.push(newResponse);
    localStorage.setItem('responses', JSON.stringify(savedResponses));
    localStorage.setItem('arene_player_name', playerName.trim());
    localStorage.setItem(`q${activeQuestion.displayId}_submitted`, '1');

    setResponses(savedResponses);
    setIsSubmitted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    resetAnswer?.();
    setIsSubmitting(false);
  }, [activeQuestion, playerName]);

  const handleAdminSubmit = (e) => {
    if (e) e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) { 
      setIsAdmin(true); 
      setAdminPassword(''); 
    } else {
      setAdminPassword('');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsSubmitted(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsSubmitted(false);
    }
  };

  if (isAdmin) {
    return (
      <AdminPanel
        onClose={() => { setIsAdmin(false); setCurrentView('home'); }}
        responses={responses}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <BackgroundFX />
      
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#fbbf24', '#22d3ee', '#a855f7', '#10b981'][i % 4],
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                }}
                transition={{ duration: 2, delay: i * 0.03 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-lg px-4"
          >
            <HomePage
              onPlayNow={handlePlayNow}
              gameActive={gameActive}
              onAdminSubmit={handleAdminSubmit}
              adminPassword={adminPassword}
              onAdminPasswordChange={setAdminPassword}
            />
          </motion.div>
        )}

        {currentView === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="relative z-10 w-full max-w-xl px-4"
          >
            <GamePage
              activeQuestion={activeQuestion}
              currentIndex={currentQuestionIndex}
              totalQuestions={QUESTIONS.length}
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              isCheckingSubmission={false}
              isSubmitted={isSubmitted}
              onBackHome={handleBackHome}
              onNextQuestion={handleNextQuestion}
              onPrevQuestion={handlePrevQuestion}
              adminPassword={adminPassword}
              onAdminPasswordChange={setAdminPassword}
              onAdminSubmit={handleAdminSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  function handlePlayNow() {
    setCurrentView('game');
  }
  
  function handleBackHome() {
    setCurrentView('home');
  }
}
