import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Send, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { t } from '../i18n';

const RegistrationScreen = ({ user, onRegistered, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    pseudo: '',
    phone: '',
    email: '',
    city: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Erreur critique : Votre session sécurisée n'a pas pu être établie. \n\nVeuillez : \n1. Enlever la navigation privée\n2. Autoriser les cookies\n3. Rafraîchir la page.");
      return;
    }
    
    if (submitting) return;

    setSubmitting(true);
    try {
      const docRef = doc(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/users`, user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        ...formData,
        registeredAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        onRegistered();
      }, 2000);
    } catch (err) {
      console.error("Error registering user:", err);
      alert("Une erreur est survenue lors de l'enregistrement.");
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full max-w-lg mx-auto p-4 z-10"
    >
      <div className="glass-card rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] mt-12 md:mt-24">
        {/* Decorative elements */}
        {onBack && !success && (
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 z-20 text-arena-textMuted hover:text-white transition-colors"
            title="Retour à l'accueil"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        <div className="absolute top-0 right-0 w-32 h-32 bg-arena-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-arena-secondary/20 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-arena-textMuted mb-2">
            {t('reg_title')}
          </h2>
          <p className="text-xs text-arena-primary font-mono tracking-widest uppercase">
            {t('reg_subtitle')}
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4 py-8 relative z-10"
          >
            <div className="w-16 h-16 rounded-full bg-arena-success/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldAlert className="w-8 h-8 text-arena-success animate-pulse" />
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-widest text-arena-success text-center">
              {t('reg_welcome')}
            </h3>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 block">
                {t('reg_name')} *
              </label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-[#03040E]/80 border border-arena-border rounded-xl px-4 py-3 text-base text-arena-textMain focus:border-arena-primary focus:ring-1 focus:ring-arena-primary outline-none transition-all font-body" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 block">
                {t('reg_pseudo')} *
              </label>
              <input type="text" name="pseudo" required value={formData.pseudo} onChange={handleChange} className="w-full bg-[#03040E]/80 border border-arena-border rounded-xl px-4 py-3 text-base text-arena-textMain focus:border-arena-primary focus:ring-1 focus:ring-arena-primary outline-none transition-all font-body" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 block">
                {t('reg_phone')} *
              </label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-[#03040E]/80 border border-arena-border rounded-xl px-4 py-3 text-base text-arena-textMain focus:border-arena-primary focus:ring-1 focus:ring-arena-primary outline-none transition-all font-body" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 block">
                  {t('reg_email')}
                </label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#03040E]/80 border border-arena-border rounded-xl px-4 py-3 text-base text-arena-textMain focus:border-arena-primary focus:ring-1 focus:ring-arena-primary outline-none transition-all font-body" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-arena-textMuted ml-1 block">
                  {t('reg_city')} *
                </label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full bg-[#03040E]/80 border border-arena-border rounded-xl px-4 py-3 text-base text-arena-textMain focus:border-arena-primary focus:ring-1 focus:ring-arena-primary outline-none transition-all font-body" />
              </div>
            </div>

            <p className="text-[10px] sm:text-xs text-arena-textMuted/60 flex items-center justify-center gap-1.5 pt-2 pb-2">
              <ShieldAlert className="w-3 h-3 text-arena-secondary" /> 
              {t('reg_secure')}
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full group relative overflow-hidden rounded-xl bg-arena-primary px-4 py-4 flex items-center justify-center gap-2 transition-all hover:bg-indigo-500 disabled:opacity-50 mt-4"
            >
              <span className="relative z-10 font-bold uppercase tracking-widest text-white text-sm">
                {submitting ? 'TRAITEMENT...' : t('reg_submit')}
              </span>
              <Send className="relative z-10 w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default RegistrationScreen;
