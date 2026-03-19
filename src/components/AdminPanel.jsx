import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Lock, Users, Clock, CheckCircle2,
  Calendar, Target, Trophy, Zap, Play, RefreshCw, Star, Medal,
  ChevronDown, ChevronUp, List, BarChart3, Send, CalendarClock, FileText, Download, Sparkles, Crown
} from 'lucide-react';
import { QUESTIONS_DU_JOUR, DIFFICULTY_CONFIG, CATEGORY_CONFIG, RECAP_HOUR } from '../questions.js';

function StarRating({ stars }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < stars ? 'text-arena-gold fill-arena-gold' : 'text-slate-700'}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, accent, icon: Icon, sub }) {
  return (
    <div className="stat-card">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, ${accent}15 0%, transparent 65%)` }} />
      <div className="flex items-center gap-2 mb-2 relative z-10">
        {Icon && <Icon size={14} style={{ color: accent }} />}
        <p className="text-[10px] font-display uppercase tracking-widest text-slate-500">{label}</p>
      </div>
      <p className="font-display text-2xl font-bold relative z-10" style={{ color: accent }}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-1 relative z-10">{sub}</p>}
    </div>
  );
}

function QuestionCard({ question, index }) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY_CONFIG[question.difficulty] || DIFFICULTY_CONFIG.Normal;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div
        className="absolute -inset-1 rounded-xl opacity-25 blur-xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${diff.ring}40 0%, transparent 70%)`,
        }}
      />
      
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15,18,36,0.95) 0%, rgba(10,12,25,0.98) 100%)',
          border: `1px solid ${diff.ring}35`,
          boxShadow: `0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-xl"
              style={{
                background: `linear-gradient(135deg, ${diff.ring}25, ${diff.ring}10)`,
                border: `2px solid ${diff.ring}45`,
                color: diff.ring,
                boxShadow: `0 0 25px ${diff.glow}`,
              }}
            >
              {question.displayId || question.id}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold ${diff.color}`}
                  style={{ background: diff.bg, border: `1px solid ${diff.border}` }}>
                  {question.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-display text-arena-gold"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
                  {question.points} pt{question.points > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px]">
                {question.text.substring(0, 60)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StarRating stars={diff.stars} />
            {expanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
          </div>
        </button>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-slate-800/50 pt-4 space-y-4">
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(30,34,64,0.6)'
                }}>
                  <p className="text-[10px] font-display uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                    <Target size={10} /> Question
                  </p>
                  <p className="text-slate-200 font-body text-sm leading-relaxed">{question.text}</p>
                  {question.options && (
                    <div className="mt-3 space-y-1">
                      {question.options.map((opt, i) => (
                        <p key={i} className="text-slate-300 text-xs font-body">{opt}</p>
                      ))}
                    </div>
                  )}
                </div>
                
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.05))',
                    border: '1px solid rgba(251,191,36,0.3)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={14} className="text-arena-gold" />
                    <p className="text-[10px] font-display uppercase tracking-widest text-arena-gold">Réponse Officielle</p>
                  </div>
                  <p className="font-display font-bold text-xl text-arena-gold mb-2">
                    {question.answer}
                  </p>
                  {question.explanation && (
                    <p className="text-xs text-slate-400 font-body leading-relaxed">
                      {question.explanation}
                    </p>
                  )}
                </div>
                
                {question.funFact && (
                  <div className="flex items-start gap-2 p-3 rounded-lg" style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.2)'
                  }}>
                    <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-violet-300/80 font-body">{question.funFact}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function RankingTable({ responses }) {
  const playerScores = {};
  
  responses.forEach(r => {
    if (!playerScores[r.joueur]) {
      playerScores[r.joueur] = { name: r.joueur, questions: new Set() };
    }
    playerScores[r.joueur].questions.add(r.questionId);
  });
  
  const rankings = Object.values(playerScores).map(p => ({
    name: p.name,
    participationCount: p.questions.size,
    rank: 0
  }));
  
  rankings.sort((a, b) => b.participationCount - a.participationCount);
  rankings.forEach((p, i) => p.rank = i + 1);
  
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <Medal size={40} className="mx-auto mb-4 text-slate-700" />
        <p className="text-slate-500 font-body">Aucun participant pour le moment</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {rankings.slice(0, 10).map((player, i) => (
        <motion.div
          key={player.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
            i < 3 
              ? 'border' 
              : ''
          }`}
          style={i < 3 ? {
            background: i === 0 ? 'linear-gradient(90deg, rgba(251,191,36,0.15), transparent)' : 
                       i === 1 ? 'linear-gradient(90deg, rgba(148,163,184,0.1), transparent)' :
                       'linear-gradient(90deg, rgba(180,83,9,0.1), transparent)',
            borderColor: i === 0 ? 'rgba(251,191,36,0.3)' : i === 1 ? 'rgba(148,163,184,0.3)' : 'rgba(180,83,9,0.3)'
          } : {
            background: 'rgba(30,41,59,0.5)',
            border: '1px solid rgba(30,41,59,0.5)'
          }}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold ${
            i === 0 ? 'bg-arena-gold text-black' :
            i === 1 ? 'bg-slate-400 text-black' :
            i === 2 ? 'bg-amber-700 text-white' :
            'bg-slate-700 text-slate-300'
          }`}>
            {player.rank <= 3 ? <Medal size={16} /> : player.rank}
          </div>
          <div className="flex-1">
            <p className="font-body font-semibold text-slate-200">{player.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-slate-500" />
            <span className="text-sm font-display font-bold" style={{ color: i < 3 ? '#fbbf24' : '#94a3b8' }}>
              {player.participationCount}/5
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ParticipantsJourney({ responses }) {
  const playerJourneys = {};
  
  responses.forEach(r => {
    if (!playerJourneys[r.joueur]) {
      playerJourneys[r.joueur] = { name: r.joueur, answers: {} };
    }
    playerJourneys[r.joueur].answers[r.questionId] = {
      answer: r.reponse,
      time: new Date(r.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  });
  
  if (Object.keys(playerJourneys).length === 0) {
    return (
      <div className="text-center py-12">
        <List size={40} className="mx-auto mb-4 text-slate-700" />
        <p className="text-slate-500 font-body">Aucun participant pour le moment</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {Object.values(playerJourneys).slice(0, 8).map((player, i) => (
        <motion.div
          key={player.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(30,41,59,0.5)',
            border: '1px solid rgba(30,41,59,0.5)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(91,110,245,0.3), rgba(91,110,245,0.1))',
                  color: '#a5b4fc'
                }}>
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-body font-semibold text-slate-200">{player.name}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {Object.keys(player.answers).length}/5
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(qId => (
              <div
                key={qId}
                className={`flex-1 h-8 rounded-lg text-xs font-display flex items-center justify-center font-semibold transition-all ${
                  player.answers[qId]
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
                style={player.answers[qId] ? {
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)'
                } : {
                  background: 'rgba(30,41,59,0.5)',
                  border: '1px solid rgba(30,41,59,0.5)'
                }}
                title={player.answers[qId] ? `${player.answers[qId].answer} (${player.answers[qId].time})` : 'Non répondu'}
              >
                Q{qId}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DeploymentControl({ isAutoDeploy, onToggleAuto, onManualDeploy, onGeneratePDF, isDeploying, deploySuccess, isRecapTime }) {
  return (
    <div 
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(15,18,36,0.95), rgba(20,22,45,0.9))',
        border: '1px solid rgba(251,191,36,0.2)',
        boxShadow: '0 0 40px rgba(251,191,36,0.05)',
      }}
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="p-3 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
          border: '1px solid rgba(251,191,36,0.3)',
          boxShadow: '0 0 30px rgba(251,191,36,0.1)',
        }}>
          <CalendarClock size={22} className="text-arena-gold" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-lg">Déploiement du Récap</h3>
          <p className="text-xs text-slate-500">Génère le récap complet pour le groupe à {RECAP_HOUR}h00</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded-xl border"
          style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(30,34,64,0.6)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-cyan-400" />
              <span className="text-sm font-display font-semibold text-slate-200">Auto-Déploiement</span>
            </div>
            <button
              onClick={onToggleAuto}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                isAutoDeploy ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                isAutoDeploy ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {isAutoDeploy ? '✓ Génère automatiquement à 20h' : 'Déploiement manuel'}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-xl border"
          style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(30,34,64,0.6)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Play size={16} className="text-arena-gold" />
              <span className="text-sm font-display font-semibold text-slate-200">Déployer</span>
            </div>
            <button
              onClick={onManualDeploy}
              disabled={isDeploying}
              className="px-4 py-2 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#000',
                opacity: isDeploying ? 0.5 : 1
              }}
            >
              {isDeploying ? (
                <><RefreshCw size={12} className="animate-spin" /> Déploiement...</>
              ) : (
                <><Send size={12} /> Déployer</>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {isRecapTime ? '⏰ L\'heure est arrivée !' : `Prochain : ${RECAP_HOUR}h00`}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-xl border"
          style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(30,34,64,0.6)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              <span className="text-sm font-display font-semibold text-slate-200">PDF Récap</span>
            </div>
            <button
              onClick={onGeneratePDF}
              className="px-4 py-2 rounded-lg text-xs font-display font-bold transition-all flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff'
              }}
            >
              <Download size={12} />
              Télécharger
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Pour le groupe WhatsApp
          </p>
        </div>
      </div>
      
      <AnimatePresence>
        {deploySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-xl flex items-center gap-2"
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-sm font-display text-emerald-400">Récap déployé avec succès !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResponsesTable({ responses }) {
  const exportCSV = () => {
    const header = 'Joueur,Question,Réponse,Heure\n';
    const rows = responses.map(r =>
      `"${r.joueur}","Q${r.questionId}","${r.reponse}","${new Date(r.timestamp).toLocaleTimeString('fr-FR')}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arene_participations_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,18,36,0.95), rgba(10,12,25,0.98))',
        border: '1px solid rgba(30,34,64,0.6)',
      }}
    >
      <div className="px-5 py-4 border-b border-slate-800/50 flex items-center justify-between gap-3">
        <h2 className="font-display font-semibold text-white flex items-center gap-2">
          <Users size={16} className="text-indigo-400" />
          Toutes les Réponses
          <span className="text-slate-500 text-sm font-normal ml-2">({responses.length})</span>
        </h2>
        
        {responses.length > 0 && (
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold flex items-center gap-1.5 transition-all"
            style={{
              background: 'rgba(34,211,238,0.15)',
              border: '1px solid rgba(34,211,238,0.3)',
              color: '#22d3ee'
            }}
          >
            <Download size={12} />
            CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0" style={{ background: '#0f1224' }}>
            <tr className="text-left border-b border-slate-800/50">
              <th className="px-5 py-3 text-[10px] font-display uppercase tracking-wider text-slate-500 w-12">#</th>
              <th className="px-5 py-3 text-[10px] font-display uppercase tracking-wider text-slate-500">Joueur</th>
              <th className="px-5 py-3 text-[10px] font-display uppercase tracking-wider text-slate-500">Q</th>
              <th className="px-5 py-3 text-[10px] font-display uppercase tracking-wider text-slate-500">Réponse</th>
              <th className="px-5 py-3 text-[10px] font-display uppercase tracking-wider text-slate-500 w-24">Heure</th>
            </tr>
          </thead>
          <tbody>
            {responses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <Clock size={28} className="mx-auto mb-3 text-slate-700" />
                  <span className="text-slate-600 font-body italic">Aucune réponse pour le moment…</span>
                </td>
              </tr>
            ) : (
              responses.map((resp, i) => (
                <motion.tr
                  key={resp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-b border-slate-800/20 hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className="font-body font-semibold text-slate-200 text-sm">{resp.joueur}</span>
                  </td>
                  <td className="px-5 py-3 font-display text-xs text-indigo-400">Q{resp.questionId}</td>
                  <td className="px-5 py-3 font-body text-slate-300 text-sm max-w-[200px] truncate">{resp.reponse}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {new Date(resp.timestamp).toLocaleTimeString('fr-FR')}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function generatePDFContent(questions, responses) {
  const playerScores = {};
  responses.forEach(r => {
    if (!playerScores[r.joueur]) {
      playerScores[r.joueur] = { name: r.joueur, questions: new Set() };
    }
    playerScores[r.joueur].questions.add(r.questionId);
  });
  
  const rankings = Object.values(playerScores).map(p => ({
    name: p.name,
    participationCount: p.questions.size,
    rank: 0
  }));
  rankings.sort((a, b) => b.participationCount - a.participationCount);
  rankings.forEach((p, i) => p.rank = i + 1);
  
  const playerJourneys = {};
  responses.forEach(r => {
    if (!playerJourneys[r.joueur]) {
      playerJourneys[r.joueur] = { name: r.joueur, answers: {} };
    }
    playerJourneys[r.joueur].answers[r.questionId] = r.reponse;
  });

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Récap L'Arène des Esprits</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #1e1b4b, #0a0a18); color: #e2e8f0; padding: 30px; min-height: 100vh; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding: 30px; background: linear-gradient(135deg, #312e81, #1e1b4b); border-radius: 16px; border: 2px solid #fbbf24; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    .logo { width: 100px; height: 100px; margin: 0 auto 15px; }
    .header h1 { font-size: 32px; color: #fbbf24; margin-bottom: 5px; text-shadow: 0 0 20px rgba(251,191,36,0.5); }
    .header h2 { font-size: 20px; color: #a5b4fc; margin-bottom: 10px; }
    .header p { color: #94a3b8; font-size: 14px; }
    .section { background: linear-gradient(135deg, #1e293b, #0f172a); border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #334155; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
    .section h3 { color: #fbbf24; margin-bottom: 15px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
    .question { background: #0f172a; border-radius: 10px; padding: 18px; margin-bottom: 15px; border-left: 4px solid #5b6ef5; }
    .question-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .question-num { background: #5b6ef5; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    .question h4 { color: #e2e8f0; font-size: 14px; flex: 1; line-height: 1.4; }
    .answer { color: #fbbf24; font-weight: bold; margin-top: 8px; font-size: 14px; }
    .ranking-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-radius: 10px; margin-bottom: 10px; }
    .rank-1 { background: linear-gradient(90deg, rgba(251,191,36,0.25), transparent); border: 1px solid #fbbf24; }
    .rank-2 { background: linear-gradient(90deg, rgba(148,163,184,0.2), transparent); border: 1px solid #94a3b8; }
    .rank-3 { background: linear-gradient(90deg, rgba(180,83,9,0.2), transparent); border: 1px solid #b45309; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .stat { background: #0f172a; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #334155; }
    .stat-value { font-size: 32px; font-weight: bold; color: #5b6ef5; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 5px; text-transform: uppercase; }
    .journey { display: flex; gap: 6px; margin-top: 10px; }
    .journey-q { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; }
    .journey-q.done { background: #166534; color: #4ade80; border: 1px solid #22c55e; }
    .journey-q.missed { background: #1e293b; color: #475569; border: 1px solid #334155; }
    .footer { text-align: center; color: #64748b; font-size: 13px; margin-top: 25px; padding: 20px; }
    .footer p { margin: 5px 0; }
    @media print { body { background: white; color: black; } .section { background: #f1f5f9; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="/logo-arene.svg" class="logo" alt="Logo">
      <h1>🏛️ L'ARÈNE DES ESPRITS</h1>
      <h2>🏆 Récapitulatif Final</h2>
      <p>Cameroun Edition • ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="section">
      <h3>📊 Statistiques</h3>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${Object.keys(playerJourneys).length}</div>
          <div class="stat-label">Participants</div>
        </div>
        <div class="stat">
          <div class="stat-value">${responses.length}</div>
          <div class="stat-label">Réponses</div>
        </div>
        <div class="stat">
          <div class="stat-value">${QUESTIONS_DU_JOUR.length}</div>
          <div class="stat-label">Questions</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h3>🏅 Classement</h3>
      ${rankings.length === 0 ? '<p style="color:#64748b;">Aucun participant</p>' : ''}
      ${rankings.slice(0, 5).map(p => `
        <div class="ranking-item rank-${p.rank}">
          <span><strong>#${p.rank}</strong> ${p.name}</span>
          <span>${p.participationCount}/${QUESTIONS_DU_JOUR.length} réponses</span>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h3>📝 Questions & Réponses</h3>
      ${QUESTIONS_DU_JOUR.map(q => `
        <div class="question">
          <div class="question-header">
            <div class="question-num">${q.displayId || q.id}</div>
            <h4><strong>[${q.points} pt${q.points > 1 ? 's' : ''}]</strong> ${q.text.substring(0, 100)}${q.text.length > 100 ? '...' : ''}</h4>
          </div>
          <div class="answer">✓ ${q.answer}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h3>👥 Parcours des Participants</h3>
      ${Object.keys(playerJourneys).length === 0 ? '<p style="color:#64748b;">Aucun participant</p>' : ''}
      ${Object.values(playerJourneys).slice(0, 8).map(p => `
        <div style="margin-bottom:12px;">
          <strong>${p.name}</strong>
          <div class="journey">
            ${[1,2,3,4,5].map(qId => `
              <div class="journey-q ${p.answers[qId] ? 'done' : 'missed'}">Q${qId}</div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="footer">
      <p>🎮 L'Arène des Esprits • Cameroun Edition</p>
      <p style="margin-top:8px; color:#fbbf24;">Félicitations à tous les participants ! 🦁</p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

export default function AdminPanel({ onClose, responses }) {
  const [activeTab, setActiveTab] = useState('questions');
  const [isAutoDeploy, setIsAutoDeploy] = useState(() => {
    const saved = localStorage.getItem('arene_auto_deploy');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  
  const currentHour = parseInt(
    new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Douala' }).format(new Date()),
    10
  );
  const isRecapTime = currentHour >= RECAP_HOUR;
  
  const handleToggleAuto = useCallback(() => {
    setIsAutoDeploy(prev => {
      const newVal = !prev;
      localStorage.setItem('arene_auto_deploy', JSON.stringify(newVal));
      return newVal;
    });
  }, []);
  
  const handleManualDeploy = useCallback(() => {
    setIsDeploying(true);
    localStorage.setItem('arene_deployed', JSON.stringify({ time: Date.now(), auto: false }));
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 1500);
  }, []);

  const handleGeneratePDF = useCallback(() => {
    const html = generatePDFContent(QUESTIONS_DU_JOUR, responses);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arene_Recap_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 3000);
  }, [responses]);

  const uniquePlayers = new Set(responses.map(r => r.joueur)).size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-6"
      style={{ background: 'linear-gradient(180deg, #04050f 0%, #0a0a18 100%)' }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div 
          className="rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(15,18,36,0.95), rgba(20,22,45,0.9))',
            border: '1px solid rgba(251,191,36,0.2)',
            boxShadow: '0 0 40px rgba(251,191,36,0.05)',
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                border: '2px solid #fbbf24',
                boxShadow: '0 0 30px rgba(251,191,36,0.2)',
              }}
            >
              <img src="/logo-arene.svg" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold" style={{ color: '#fbbf24' }}>Mode Présentateur</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs text-slate-500 font-display uppercase tracking-widest">
                  L'Arène des Esprits — Cameroun Edition
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-display font-semibold flex items-center gap-2 transition-all"
            style={{
              background: 'rgba(100,116,139,0.2)',
              border: '1px solid rgba(100,116,139,0.3)',
              color: '#94a3b8'
            }}>
            <Lock size={14} />
            Quitter
          </button>
        </div>
        
        <DeploymentControl
          isAutoDeploy={isAutoDeploy}
          onToggleAuto={handleToggleAuto}
          onManualDeploy={handleManualDeploy}
          onGeneratePDF={handleGeneratePDF}
          isDeploying={isDeploying}
          deploySuccess={deploySuccess}
          isRecapTime={isRecapTime}
        />
        
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Questions" value={QUESTIONS_DU_JOUR.length} accent="#5b6ef5" icon={Target} sub="Affichées" />
          <StatCard label="Participants" value={uniquePlayers} accent="#22d3ee" icon={Users} sub={`${responses.length} réponses`} />
          <StatCard label="Auto-Déploiement" value={isAutoDeploy ? 'ON' : 'OFF'} accent={isAutoDeploy ? '#10b981' : '#64748b'} icon={Zap} sub={isAutoDeploy ? '20h00' : 'Manuel'} />
          <StatCard label="Récap" value={`${RECAP_HOUR}h`} accent="#a855f7" icon={Calendar} sub={isRecapTime ? 'Maintenant !' : 'En attente'} />
        </div>
        
        <div 
          className="rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,18,36,0.95), rgba(10,12,25,0.98))',
            border: '1px solid rgba(30,34,64,0.6)',
          }}
        >
          <div className="flex border-b border-slate-800/50">
            {[
              { id: 'questions', label: 'Questions', icon: Target },
              { id: 'rankings', label: 'Classement', icon: BarChart3 },
              { id: 'journey', label: 'Parcours', icon: List },
              { id: 'responses', label: 'Réponses', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 px-4 py-4 flex items-center justify-center gap-2 text-sm font-display font-semibold transition-all"
                style={{
                  color: activeTab === tab.id ? '#fbbf24' : '#64748b',
                  borderBottom: activeTab === tab.id ? '2px solid #fbbf24' : '2px solid transparent',
                  background: activeTab === tab.id ? 'rgba(251,191,36,0.05)' : 'transparent'
                }}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-5">
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {QUESTIONS_DU_JOUR.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} />
                ))}
              </div>
            )}
            
            {activeTab === 'rankings' && (
              <RankingTable responses={responses} />
            )}
            
            {activeTab === 'journey' && (
              <ParticipantsJourney responses={responses} />
            )}
            
            {activeTab === 'responses' && (
              <ResponsesTable responses={responses} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
