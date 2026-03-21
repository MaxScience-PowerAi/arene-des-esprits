import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

import { auth, signInPlayer, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { QUESTIONS_DU_JOUR, getCurrentHour } from './questions';
import { t, LANG } from './i18n';

import BackgroundFX from './components/BackgroundFX';
import LandingScreen from './components/LandingScreen';
import RegistrationScreen from './components/RegistrationScreen';
import LoadingScreen from './components/LoadingScreen';
import ClosedScreen from './components/ClosedScreen';
import QuestionCard from './components/QuestionCard';
import SuccessScreen from './components/SuccessScreen';
import AdminPanel from './components/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  
  const [currentHour, setCurrentHour] = useState(getCurrentHour());
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  const activeQuestion = QUESTIONS_DU_JOUR.find(q => currentHour >= q.start && currentHour < q.end);
  const nextQuestion = QUESTIONS_DU_JOUR.find(q => q.start > currentHour);

  // Set Interval to check hour changes
  useEffect(() => {
    const int = setInterval(() => {
      const h = getCurrentHour();
      if (h !== currentHour) {
        setCurrentHour(h);
      }
    }, 60000); // Check every minute
    return () => clearInterval(int);
  }, [currentHour]);

  // Auth flow
  useEffect(() => {
    let unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        try {
          const newUser = await signInPlayer();
          setUser(newUser);
        } catch (e) {
          console.error("Impossible de s'authentifier", e);
          setLoading(false);
        }
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, []);

  // Check if player has answered the active question AND is registered
  useEffect(() => {
    let cancelled = false;

    const checkParticipation = async () => {
      if (!user) {
        if (loading) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Check registration
        const regRef = doc(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/users`, user.uid);
        const regSnap = await getDoc(regRef);
        if (!cancelled) setHasRegistered(regSnap.exists());

        // Check active question
        if (activeQuestion) {
          const ansRef = doc(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/reponses_q${activeQuestion.id}`, user.uid);
          const ansSnap = await getDoc(ansRef);
          if (!cancelled) setHasAnsweredCurrent(ansSnap.exists());
        } else {
          if (!cancelled) setHasAnsweredCurrent(false);
        }
      } catch (e) {
        console.error("Firebase read error", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkParticipation();
    return () => { cancelled = true; };
  }, [user, activeQuestion, currentHour]);

  // Secret Admin Trigger Logic (Triple Click tight window)
  const handleSecretAdminClick = () => {
    setAdminClicks(prev => prev + 1);
  };

  useEffect(() => {
    if (adminClicks === 3) {
      setIsAdminMode(true);
      setAdminClicks(0);
    }
    const timer = setTimeout(() => setAdminClicks(0), 1000);
    return () => clearTimeout(timer);
  }, [adminClicks]);

  // View state derivation
  let DisplayComponent = null;

  if (isAdminMode) {
    return <AdminPanel currentHour={currentHour} />;
  }

  // Si on n'est pas encore entré dans l'arène, on montre le Landing
  if (!hasEntered) {
    return (
      <AnimatePresence>
        <LandingScreen 
          onEnter={() => setHasEntered(true)} 
          onSecretClick={handleSecretAdminClick} 
        />
      </AnimatePresence>
    );
  }

  if (loading) {
    DisplayComponent = <LoadingScreen />;
  } else if (!hasRegistered) {
    DisplayComponent = <RegistrationScreen user={user} onRegistered={() => setHasRegistered(true)} onBack={() => setHasEntered(false)} />;
  } else if (!activeQuestion) {
    DisplayComponent = <ClosedScreen currentHour={currentHour} nextQuestion={nextQuestion} />;
  } else if (hasAnsweredCurrent) {
    DisplayComponent = <SuccessScreen nextQuestion={nextQuestion} />;
  } else {
    DisplayComponent = (
      <QuestionCard 
        user={user} 
        question={activeQuestion} 
        onSubmited={() => setHasAnsweredCurrent(true)}
      />
    );
  }

  return (
    <>
      <BackgroundFX />
      
      {/* Header - Not rendered in Loading Screen */}
      {!loading && (
        <header className="w-full flex justify-between items-center p-4 md:p-6 sticky top-0 z-10 bg-gradient-to-b from-[#03040E] to-transparent">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-arena-primary/30 blur-[10px] rounded-full group-hover:bg-arena-secondary/50 transition-colors" />
              <button 
                onClick={handleSecretAdminClick}
                className="p-0 rounded-full relative z-10 transition-transform group-hover:scale-110 focus:outline-none flex items-center justify-center overflow-hidden w-12 h-12 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                title="Triple click for admin"
              >
                <img 
                  src="/logo.png" 
                  alt="AE" 
                  className="w-full h-full object-cover rounded-full object-[center_38%] scale-[1.35]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <Brain className="w-5 h-5 text-arena-textMain hidden" />
              </button>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg md:text-xl uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-arena-textMuted">
                {t('app_title')}
              </h1>
              <p className="text-[10px] md:text-xs font-mono text-arena-primary tracking-widest uppercase">
                {t('app_subtitle')}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeQuestion ? 'bg-arena-success animate-pulse' : 'bg-arena-textMuted'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${activeQuestion ? 'text-arena-success' : 'text-arena-textMuted'}`}>
              {activeQuestion ? t('status_open') : t('status_closed')}
            </span>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center min-h-[calc(100vh-100px)] relative z-10">
        <AnimatePresence mode="wait">
          {DisplayComponent}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!loading && (
        <footer className="w-full p-6 flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity mt-auto">
          <p className="font-display text-[10px] font-bold tracking-[0.3em] uppercase">
            {t('merci_title')}
          </p>
        </footer>
      )}
    </>
  );
}

export default App;
