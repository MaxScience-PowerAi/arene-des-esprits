import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Send, ArrowLeft, LogIn, UserPlus, Search } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { t } from '../i18n';

const LOCAL_KEY = 'arene_player_pseudo';

const RegistrationScreen = ({ user, onRegistered, onBack }) => {
  const [mode, setMode] = useState('choice'); // 'choice' | 'login' | 'register'
  const [success, setSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  // ── CONNEXION ──
  const [loginPseudo, setLoginPseudo] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── INSCRIPTION ──
  const [formData, setFormData] = useState({ name: '', pseudo: '', phone: '', email: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // ────────────────────────────
  //  CONNEXION PAR PSEUDO
  // ────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginPseudo.trim()) { setLoginError('Entre ton pseudo.'); return; }
    setLoginLoading(true);

    try {
      const appId = import.meta.env.VITE_ARENE_APP_ID;
      const pseudoLower = loginPseudo.trim().toLowerCase();

      // Cherche le joueur par pseudo (insensible à la casse)
      const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
      const snap = await getDocs(usersRef);

      let found = null;
      snap.forEach(d => {
        const data = d.data();
        if ((data.pseudo || '').trim().toLowerCase() === pseudoLower) {
          found = data;
        }
      });

      if (!found) {
        setLoginError('Pseudo introuvable. Vérifie l\'orthographe ou inscris-toi.');
        setLoginLoading(false);
        return;
      }

      // Sauvegarde dans localStorage
      localStorage.setItem(LOCAL_KEY, pseudoLower);

      setSuccessName(found.pseudo || found.name || loginPseudo.trim());
      setSuccess(true);
      setTimeout(() => onRegistered(), 2000);

    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Erreur de connexion. Réessaie.');
    }
    setLoginLoading(false);
  };

  // ────────────────────────────
  //  INSCRIPTION
  // ────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!user) {
      alert("Erreur critique : session non établie.\n\n1. Enlever la navigation privée\n2. Autoriser les cookies\n3. Rafraîchir la page.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      const appId = import.meta.env.VITE_ARENE_APP_ID;
      const pseudoLower = formData.pseudo.trim().toLowerCase();

      // Vérifie si le pseudo est déjà pris
      const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
      const snap = await getDocs(usersRef);
      let pseudoTaken = false;
      snap.forEach(d => {
        if ((d.data().pseudo || '').trim().toLowerCase() === pseudoLower) pseudoTaken = true;
      });

      if (pseudoTaken) {
        setRegisterError('Ce pseudo est déjà utilisé. Choisis-en un autre.');
        setSubmitting(false);
        return;
      }

      // Crée le profil
      const docRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        name: formData.name.trim(),
        pseudo: formData.pseudo.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        registeredAt: Date.now(),
      });

      // Sauvegarde pseudo dans localStorage
      localStorage.setItem(LOCAL_KEY, pseudoLower);

      setSuccessName(formData.pseudo.trim());
      setSuccess(true);
      setTimeout(() => onRegistered(), 2000);

    } catch (err) {
      console.error('Register error:', err);
      setRegisterError("Erreur lors de l'enregistrement. Réessaie.");
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setRegisterError('');
  };

  const inputClass = (hasError = false) =>
    `w-full bg-[#03040E]/80 border ${hasError ? 'border-arena-danger' : 'border-arena-border'} rounded-xl px-4 py-3 text-base text-arena-textMain focus:border-arena-primary focus:ring-1 focus:ring-arena-primary outline-none transition-all font-body`;

  const labelClass = "text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 block mb-1";

  // ────────────────────────────
  //  ÉCRAN SUCCÈS
  // ────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto p-4 z-10"
      >
        <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] mt-12 md:mt-24 flex flex-col items-center justify-center py-16 gap-5">
          <div className="w-20 h-20 rounded-full bg-arena-success/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <ShieldAlert className="w-10 h-10 text-arena-success animate-pulse" />
          </div>
          <h3 className="font-display text-2xl font-bold uppercase tracking-widest text-arena-success text-center">
            Bienvenue !
          </h3>
          <p className="text-white text-lg font-bold">
            ⚔ <span className="text-arena-secondary">{successName}</span>
          </p>
          <p className="text-arena-textMuted text-sm text-center">
            Tu entres dans l'Arène...
          </p>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────
  //  ÉCRAN CHOIX
  // ────────────────────────────
  if (mode === 'choice') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg mx-auto p-4 z-10"
      >
        <div className="glass-card rounded-[2rem] p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] mt-12 md:mt-24">

          {onBack && (
            <button onClick={onBack} className="absolute top-6 left-6 z-20 text-arena-textMuted hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="absolute top-0 right-0 w-40 h-40 bg-arena-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-arena-secondary/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="text-center mb-10 relative z-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-arena-textMuted mb-3">
              L'Arène des Esprits
            </h2>
            <p className="text-xs text-arena-primary font-mono tracking-widest uppercase">
              Combattant, identifie-toi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">

            {/* Bouton Connexion */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setMode('login')}
              className="group flex flex-col items-center gap-4 p-7 rounded-2xl border border-arena-secondary/40 bg-arena-secondary/5 hover:bg-arena-secondary/10 hover:border-arena-secondary transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-arena-secondary/20 flex items-center justify-center group-hover:bg-arena-secondary/30 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <LogIn className="w-7 h-7 text-arena-secondary" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold uppercase tracking-widest text-white text-base mb-1">Connexion</p>
                <p className="text-xs text-arena-textMuted leading-relaxed">
                  J'ai déjà un compte,<br />je connais mon pseudo
                </p>
              </div>
            </motion.button>

            {/* Bouton Inscription */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setMode('register')}
              className="group flex flex-col items-center gap-4 p-7 rounded-2xl border border-arena-primary/40 bg-arena-primary/5 hover:bg-arena-primary/10 hover:border-arena-primary transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-arena-primary/20 flex items-center justify-center group-hover:bg-arena-primary/30 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <UserPlus className="w-7 h-7 text-arena-primary" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold uppercase tracking-widest text-white text-base mb-1">Inscription</p>
                <p className="text-xs text-arena-textMuted leading-relaxed">
                  Première fois ici,<br />je crée mon profil
                </p>
              </div>
            </motion.button>

          </div>

          <p className="text-center text-[10px] text-arena-textMuted/40 mt-8 relative z-10">
            LOGIC · MATHS · MYSTERIES
          </p>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────
  //  ÉCRAN CONNEXION
  // ────────────────────────────
  if (mode === 'login') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg mx-auto p-4 z-10"
      >
        <div className="glass-card rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] mt-12 md:mt-24">

          <button onClick={() => { setMode('choice'); setLoginError(''); }} className="absolute top-6 left-6 z-20 text-arena-textMuted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute top-0 right-0 w-40 h-40 bg-arena-secondary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-14 h-14 rounded-full bg-arena-secondary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(34,211,238,0.25)]">
              <LogIn className="w-7 h-7 text-arena-secondary" />
            </div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-white mb-2">
              Connexion
            </h2>
            <p className="text-xs text-arena-secondary font-mono tracking-widest uppercase">
              Entre dans l'Arène
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className={labelClass}>Ton pseudo *</label>
              <div className="relative">
                <input
                  type="text"
                  value={loginPseudo}
                  onChange={(e) => { setLoginPseudo(e.target.value); setLoginError(''); }}
                  placeholder="Ex: ShadowMaster99"
                  autoFocus
                  className={inputClass(!!loginError)}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-textMuted pointer-events-none" />
              </div>
              {loginError && (
                <p className="text-xs text-arena-danger mt-2 ml-1 flex items-center gap-1">
                  <span>⚠</span> {loginError}
                </p>
              )}
            </div>

            <p className="text-xs text-arena-textMuted/60 text-center">
              Le pseudo est celui que tu as utilisé lors de ton inscription.
            </p>

            <button type="submit" disabled={loginLoading}
              className="w-full group rounded-xl bg-arena-secondary/20 border border-arena-secondary/50 hover:bg-arena-secondary/30 hover:border-arena-secondary px-4 py-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              <span className="font-bold uppercase tracking-widest text-arena-secondary text-sm">
                {loginLoading ? 'Recherche...' : 'Entrer dans l\'Arène'}
              </span>
              <LogIn className="w-4 h-4 text-arena-secondary group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-arena-textMuted">
              Pas encore de compte ?{' '}
              <button type="button" onClick={() => { setMode('register'); setLoginError(''); }}
                className="text-arena-primary hover:text-white transition-colors font-bold underline underline-offset-2">
                S'inscrire
              </button>
            </p>
          </form>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────
  //  ÉCRAN INSCRIPTION
  // ────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full max-w-lg mx-auto p-4 z-10"
    >
      <div className="glass-card rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] mt-12 md:mt-24">

        <button onClick={() => { setMode('choice'); setRegisterError(''); }} className="absolute top-6 left-6 z-20 text-arena-textMuted hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute top-0 right-0 w-32 h-32 bg-arena-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-arena-secondary/20 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="text-center mb-7 relative z-10">
          <div className="w-14 h-14 rounded-full bg-arena-primary/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <UserPlus className="w-7 h-7 text-arena-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-white mb-2">
            Inscription
          </h2>
          <p className="text-xs text-arena-primary font-mono tracking-widest uppercase">
            {t('reg_subtitle')}
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">

          <div>
            <label className={labelClass}>{t('reg_name')} *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass()} />
          </div>

          <div>
            <label className={labelClass}>
              {t('reg_pseudo')} * <span className="text-arena-secondary opacity-70 normal-case tracking-normal text-[10px]">(pour te connecter)</span>
            </label>
            <input type="text" name="pseudo" required value={formData.pseudo} onChange={handleChange}
              placeholder="Choisis un pseudo unique"
              className={inputClass(registerError.includes('pseudo'))} />
          </div>

          <div>
            <label className={labelClass}>{t('reg_phone')} *</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClass()} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('reg_email')}</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange} className={inputClass()} />
            </div>
            <div>
              <label className={labelClass}>{t('reg_city')} *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputClass()} />
            </div>
          </div>

          {registerError && (
            <p className="text-xs text-arena-danger text-center flex items-center justify-center gap-1">
              <span>⚠</span> {registerError}
            </p>
          )}

          <p className="text-[10px] sm:text-xs text-arena-textMuted/60 flex items-center justify-center gap-1.5 pt-1">
            <ShieldAlert className="w-3 h-3 text-arena-secondary" />
            {t('reg_secure')}
          </p>

          <button type="submit" disabled={submitting}
            className="w-full group relative overflow-hidden rounded-xl bg-arena-primary px-4 py-4 flex items-center justify-center gap-2 transition-all hover:bg-indigo-500 disabled:opacity-50 mt-2">
            <span className="relative z-10 font-bold uppercase tracking-widest text-white text-sm">
              {submitting ? 'TRAITEMENT...' : t('reg_submit')}
            </span>
            <Send className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-arena-textMuted">
            Déjà inscrit ?{' '}
            <button type="button" onClick={() => { setMode('login'); setRegisterError(''); }}
              className="text-arena-secondary hover:text-white transition-colors font-bold underline underline-offset-2">
              Se connecter
            </button>
          </p>

        </form>
      </div>
    </motion.div>
  );
};

export default RegistrationScreen;
