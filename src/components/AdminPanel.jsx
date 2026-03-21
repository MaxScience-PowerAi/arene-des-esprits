import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { QUESTIONS_DU_JOUR } from '../questions';
import { Lock, Download, Eye, EyeOff, CheckCircle2, ChevronRight, LayoutDashboard, LogOut, Clock, Users } from 'lucide-react';
import { t } from '../i18n';

const AdminPanel = ({ currentHour }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const [activeTab, setActiveTab] = useState('reponses');
  const [users, setUsers] = useState([]);

  const [selectedQId, setSelectedQId] = useState(1);
  const [answersByQId, setAnswersByQId] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [revealCorrect, setRevealCorrect] = useState(false);

  // Set the "Live" question automatically on load
  useEffect(() => {
    const liveQ = QUESTIONS_DU_JOUR.find(q => currentHour >= q.start && currentHour < q.end);
    if (liveQ) setSelectedQId(liveQ.id);
  }, [currentHour]);

  // Auth logic via SHA-256
  const hashPassword = async (str) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const hash = await hashPassword(password);
    const expectedHash = import.meta.env.VITE_ADMIN_HASH || 'ae6ea89749a6174498af9ae34a7fc1c46a2ac2dad5c05ae1a3d0b24f3c4582a2';
    if (hash === expectedHash) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  // Fetch Users
  useEffect(() => {
    if (!isAuthenticated) return;
    const usersRef = collection(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/users`);
    const qUsers = query(usersRef, orderBy('registeredAt', 'desc'));
    const unsub = onSnapshot(qUsers, (snap) => {
      const allUsers = [];
      snap.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
    });
    return () => unsub();
  }, [isAuthenticated]);

  // Real-time listener for current selected question
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Always clear when switching
    setAnswersByQId(prev => ({ ...prev, [selectedQId]: [] }));

    const qRef = collection(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/reponses_q${selectedQId}`);
    const qSnapshot = query(qRef, orderBy('timestamp', 'desc'));
    
    const unsub = onSnapshot(qSnapshot, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnswersByQId(prev => ({ ...prev, [selectedQId]: docs }));
    });

    return () => unsub();
  }, [isAuthenticated, selectedQId]);

  const activeQuestionDetails = QUESTIONS_DU_JOUR.find(q => q.id === selectedQId);
  const currentQAnswers = answersByQId[selectedQId] || [];
  const isCurrentlyLive = activeQuestionDetails && currentHour >= activeQuestionDetails.start && currentHour < activeQuestionDetails.end;

  const handleExportCSV = () => {
    if (!currentQAnswers.length) return;
    const header = "Joueur,Reponse,Date(Local)\n";
    const rows = currentQAnswers.map(ans => {
      const date = new Date(ans.timestamp).toLocaleString('fr-FR');
      // Escape CSV text
      const joueur = `"${ans.joueur.replace(/"/g, '""')}"`;
      const reponse = `"${ans.reponse.replace(/"/g, '""')}"`;
      return `${joueur},${reponse},${date}`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Reponses_Q${selectedQId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUsersToCSV = () => {
    if (users.length === 0) return;
    const headers = ['Date Inscription', 'Nom Complet', 'Pseudo', 'WhatsApp', 'Email', 'Ville', 'UID'];
    const rows = users.map(u => [
      new Date(u.registeredAt).toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }),
      u.name || '',
      u.pseudo || '',
      u.phone || '',
      u.email || '',
      u.city || '',
      u.uid || ''
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `base_joueurs_arene_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#03040E] flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass-card p-8 rounded-2xl w-full max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-arena-danger/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-arena-danger" />
          </div>
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-6">{t('admin_login_title')}</h2>
          <input 
            type="password" 
            placeholder={t('admin_login_placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-[#03040E] border ${error ? 'border-arena-danger' : 'border-arena-border'} rounded-lg p-3 text-center tracking-widest text-white mb-4 focus:outline-none focus:border-arena-danger`}
          />
          <button type="submit" className="w-full bg-arena-danger hover:bg-rose-600 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors">
            {t('admin_login_btn')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03040E] text-[#F1F5F9] font-body flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-arena-border bg-[#050812] flex flex-col shrink-0">
        <div className="p-6 border-b border-arena-border flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-arena-danger" />
          <h1 className="font-display font-bold uppercase tracking-wider">{t('admin_panel_title')}</h1>
        </div>
        
        <div className="flex border-b border-arena-border">
          <button onClick={() => setActiveTab('reponses')} className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab==='reponses'?'text-white bg-arena-danger/10 border-b-2 border-arena-danger':'text-arena-textMuted hover:text-white hover:bg-white/5'}`}>
            {t('admin_tab_answers')}
          </button>
          <button onClick={() => setActiveTab('joueurs')} className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab==='joueurs'?'text-white bg-arena-secondary/10 border-b-2 border-arena-secondary':'text-arena-textMuted hover:text-white hover:bg-white/5'}`}>
            {t('admin_tab_players')} <span className="ml-1 opacity-50">({users.length})</span>
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === 'reponses' ? (
            <div className="flex flex-col h-full">
              <p className="text-xs uppercase font-bold text-arena-textMuted tracking-widest mb-4 ml-2">{t('admin_quests_today')}</p>
              <div className="flex flex-col gap-2">
                {QUESTIONS_DU_JOUR.map(q => {
                  const isActive = selectedQId === q.id;
                  const isLive = currentHour >= q.start && currentHour < q.end;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setSelectedQId(q.id); setRevealCorrect(false); }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isActive ? 'bg-arena-danger/10 border-arena-danger/50 text-white' : 'border-transparent text-arena-textMuted hover:bg-white/5 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg opacity-50">#{q.id}</span>
                        <span className="font-medium">{q.start}h - {q.end}h</span>
                      </div>
                      {isLive && (
                        <div className="w-2 h-2 rounded-full bg-arena-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-arena-textMuted opacity-50">
              <Users className="w-12 h-12 mb-4" />
              <p className="text-xs uppercase tracking-widest text-center">{t('admin_manage_challengers')}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-arena-border">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-arena-textMuted hover:text-arena-danger transition-colors text-sm w-full p-2">
            <LogOut className="w-4 h-4" /> {t('admin_logout')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 lg:p-8 h-screen overflow-y-auto w-full">
        {activeTab === 'reponses' && activeQuestionDetails && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Status */}
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Énigme {activeQuestionDetails.id}</h2>
                  {isCurrentlyLive ? (
                    <span className="bg-arena-success/20 text-arena-success border border-arena-success/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                      {t('admin_quest_live')}
                    </span>
                  ) : (
                    <span className="bg-arena-textMuted/20 text-arena-textMuted border border-arena-border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {(currentHour >= activeQuestionDetails.end) ? t('admin_quest_ended') : t('admin_quest_upcoming')}
                    </span>
                  )}
                </div>
                <p className="text-arena-textMuted text-sm font-mono">{activeQuestionDetails.category} — {activeQuestionDetails.difficulty}</p>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#050812] border border-arena-border hover:border-arena-secondary text-arena-textMuted hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAnswers ? t('admin_btn_hide_ans') : t('admin_btn_show_ans')}
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={currentQAnswers.length === 0}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-arena-primary hover:bg-indigo-500 disabled:bg-arena-border disabled:text-arena-textMuted disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
                >
                  <Download className="w-4 h-4" /> {t('admin_btn_csv')}
                </button>
              </div>
            </div>

            {/* Content & Answer Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                  <p className="text-xs uppercase font-bold text-arena-textMuted tracking-widest mb-3">{t('admin_quest_subject')}</p>
                  <p className="text-lg font-medium leading-relaxed mb-6">{activeQuestionDetails.text}</p>
                  
                  <div className="border-t border-arena-border pt-4">
                    <button 
                      onClick={() => setRevealCorrect(!revealCorrect)}
                      className="text-xs uppercase font-bold text-arena-gold hover:text-white transition-colors tracking-widest flex items-center gap-2 mb-2"
                    >
                      {revealCorrect ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {revealCorrect ? t('admin_btn_hide_sol') : t('admin_btn_show_sol')}
                    </button>
                    {revealCorrect && (
                      <div className="bg-arena-gold/10 border border-arena-gold/30 p-3 rounded-lg mt-2">
                        <p className="text-arena-gold font-mono text-sm">{activeQuestionDetails.answer}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-bold text-arena-textMuted tracking-widest mb-1">{t('admin_participations')}</p>
                    <p className="text-3xl font-display font-bold text-white">{currentQAnswers.length}</p>
                  </div>
                  <CheckCircle2 className={`w-10 h-10 ${currentQAnswers.length > 0 ? 'text-arena-success opacity-50' : 'text-arena-textMuted opacity-20'}`} />
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="glass-card rounded-2xl overflow-hidden h-full min-h-[400px] flex flex-col">
                  <div className="p-4 border-b border-arena-border bg-[#050812]">
                    <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-arena-secondary" />
                      {t('admin_live_feed')}
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-auto p-0">
                    {currentQAnswers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-arena-textMuted p-8">
                        <Clock className="w-12 h-12 opacity-20 mb-4" />
                        <p>{t('admin_waiting')}</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#03040E]/80 text-xs uppercase tracking-widest text-arena-textMuted border-b border-arena-border">
                            <th className="p-4 font-bold max-w-[150px] truncate">{t('admin_col_time')}</th>
                            <th className="p-4 font-bold max-w-[200px] truncate">{t('admin_col_player')}</th>
                            <th className="p-4 font-bold">{t('admin_col_answer')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentQAnswers.map(ans => (
                            <tr key={ans.id} className="border-b border-arena-border/50 hover:bg-white/5 transition-colors">
                              <td className="p-4 text-sm font-mono text-arena-textMuted whitespace-nowrap">
                                {new Date(ans.timestamp).toLocaleTimeString('fr-FR')}
                              </td>
                              <td className="p-4 text-sm font-bold text-white max-w-[200px] truncate" title={ans.joueur}>
                                {ans.joueur}
                              </td>
                              <td className="p-4 text-sm">
                                {showAnswers ? (
                                  <span className="text-arena-secondary font-mono">{ans.reponse}</span>
                                ) : (
                                  <span className="text-arena-textMuted flex items-center gap-2 text-xs uppercase tracking-widest opacity-50">
                                    <Lock className="w-3 h-3" /> {t('admin_ans_hidden')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Joueurs Tab View */}
        {activeTab === 'joueurs' && (
          <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
              <div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">{t('admin_db_title')}</h2>
                <p className="text-arena-textMuted text-sm font-mono mt-1">{t('admin_db_desc')}</p>
              </div>
              <button
                onClick={exportUsersToCSV}
                disabled={users.length === 0}
                className="flex items-center justify-center gap-2 bg-arena-secondary hover:bg-cyan-500 disabled:bg-arena-border disabled:text-arena-textMuted disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest"
              >
                <Download className="w-4 h-4" /> {t('admin_db_export')}
              </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
              <div className="flex-1 overflow-auto p-0 border border-arena-border rounded-b-2xl">
                {users.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-arena-textMuted p-12">
                     <Users className="w-16 h-16 opacity-20 mb-4" />
                     <p className="uppercase tracking-widest text-sm font-bold">{t('admin_db_empty')}</p>
                     <p className="text-xs mt-2 opacity-50">{t('admin_db_empty_desc')}</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#03040E]/80 text-xs uppercase tracking-widest text-arena-textMuted border-b border-arena-border sticky top-0 z-10">
                        <th className="p-4 font-bold whitespace-nowrap">{t('admin_col_date_reg')}</th>
                        <th className="p-4 font-bold">{t('admin_col_fullname')}</th>
                        <th className="p-4 font-bold">{t('admin_col_pseudo')}</th>
                        <th className="p-4 font-bold">{t('admin_col_whatsapp')}</th>
                        <th className="p-4 font-bold">{t('admin_col_city')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-arena-border/50 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-sm font-mono text-arena-textMuted whitespace-nowrap">
                            {new Date(u.registeredAt).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala', hour:'2-digit', minute:'2-digit' })}
                            <br/><span className="text-[10px] opacity-50">{new Date(u.registeredAt).toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' })}</span>
                          </td>
                          <td className="p-4 text-sm font-bold text-white uppercase">{u.name}</td>
                          <td className="p-4 text-sm text-arena-secondary">{u.pseudo}</td>
                          <td className="p-4 text-sm text-arena-primary font-mono">{u.phone}</td>
                          <td className="p-4 text-sm text-arena-textMuted capitalize">{u.city}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
