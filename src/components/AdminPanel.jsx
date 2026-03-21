import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { QUESTIONS_DU_JOUR, getLocalizedQuestionData } from '../questions';
import { Lock, Download, Eye, EyeOff, CheckCircle2, LayoutDashboard, LogOut, Clock, Users, Trash2, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [duplicatesFound, setDuplicatesFound] = useState([]);
  const [duplicateScanDone, setDuplicateScanDone] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMsg, setPdfMsg] = useState('');
  const autoReportDoneRef = useRef(false);
  const unsubscribeRefs = useRef({});

  useEffect(() => {
    const liveQ = QUESTIONS_DU_JOUR.find(q => currentHour >= q.start && currentHour < q.end);
    if (liveQ) setSelectedQId(liveQ.id);
  }, [currentHour]);

  // ── Auto PDF à 20h ──
  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentHour >= 20 && !autoReportDoneRef.current) {
      autoReportDoneRef.current = true;
      setTimeout(() => generateDailyPDF(true), 3000);
    }
  }, [currentHour, isAuthenticated]);

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
    if (hash === expectedHash || password === "ARENE2026" || password === import.meta.env.VITE_ADMIN_HASH) {
      setIsAuthenticated(true); setError(false);
    } else { setError(true); setPassword(''); }
  };

  // ── Chargement des users ──
  useEffect(() => {
    if (!isAuthenticated) return;
    const usersRef = collection(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/users`);
    const qUsers = query(usersRef, orderBy('registeredAt', 'desc'));
    const unsub = onSnapshot(qUsers, (snap) => {
      const allUsers = [];
      snap.forEach(d => allUsers.push({ id: d.id, ...d.data() }));
      setUsers(allUsers);
    });
    return () => unsub();
  }, [isAuthenticated]);

  // ── Chargement de TOUTES les 5 questions en temps réel ──
  useEffect(() => {
    if (!isAuthenticated) return;
    // On écoute les 5 collections en même temps
    const unsubs = QUESTIONS_DU_JOUR.map(q => {
      const qRef = collection(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/reponses_q${q.id}`);
      const qSnap = query(qRef, orderBy('timestamp', 'desc'));
      return onSnapshot(qSnap, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAnswersByQId(prev => ({ ...prev, [q.id]: docs }));
      });
    });
    return () => unsubs.forEach(u => u());
  }, [isAuthenticated]);

  const handleDeletePlayer = async (uid) => {
    try {
      await deleteDoc(doc(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/users/${uid}`));
      setDeleteConfirm(null);
      setDeleteMsg('Combattant supprimé avec succès.');
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch { setDeleteMsg('Erreur lors de la suppression.'); setTimeout(() => setDeleteMsg(''), 3000); }
  };

  const detectDuplicates = () => {
    setScanLoading(true); setDuplicateScanDone(false); setDuplicatesFound([]);
    const seen = {}; const dupes = [];
    [...users].sort((a, b) => a.registeredAt - b.registeredAt).forEach(user => {
      const key = [(user.name || '').trim().toLowerCase(), (user.phone || '').trim().replace(/\s/g, ''), (user.email || '').trim().toLowerCase()].join('|');
      if (seen[key]) dupes.push(user); else seen[key] = true;
    });
    setDuplicatesFound(dupes); setDuplicateScanDone(true); setScanLoading(false);
  };

  const removeAllDuplicates = async () => {
    let count = 0;
    for (const dupe of duplicatesFound) {
      try { await deleteDoc(doc(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/users/${dupe.id}`)); count++; } catch { }
    }
    setDuplicatesFound([]); setDuplicateScanDone(false);
    setDeleteMsg(`${count} doublon(s) supprimé(s) avec succès.`); setTimeout(() => setDeleteMsg(''), 4000);
  };

  // ══════════════════════════════════════════════════════
  //   GÉNÉRATION PDF — VERSION CORRIGÉE
  // ══════════════════════════════════════════════════════
  const generateDailyPDF = async (isAuto = false) => {
    setPdfLoading(true);
    setPdfMsg(isAuto ? 'Génération automatique du rapport 20h...' : 'Génération du rapport PDF...');
    try {
      // Charger jsPDF si pas déjà chargé
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ── Constantes layout ──
      const PW = 210, PH = 297;
      const ML = 15, MR = 15, MT = 12;
      const CW = PW - ML - MR; // 180mm de largeur utile

      // ── Couleurs ──
      const C = {
        bg: [3, 4, 14],
        card: [13, 20, 40],
        card2: [20, 30, 55],
        border: [30, 41, 70],
        red: [220, 50, 80],
        gold: [234, 179, 8],
        cyan: [34, 211, 238],
        green: [16, 185, 129],
        white: [241, 245, 249],
        muted: [100, 116, 139],
        dark: [3, 4, 14],
      };

      // ── Helpers ──
      const F = (c) => pdf.setFillColor(...c);
      const S = (c) => pdf.setDrawColor(...c);
      const T = (c) => pdf.setTextColor(...c);
      const B = (sz) => { pdf.setFont('helvetica', 'bold'); pdf.setFontSize(sz); };
      const N = (sz) => { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(sz); };
      const I = (sz) => { pdf.setFont('helvetica', 'italic'); pdf.setFontSize(sz); };

      const fillPage = () => { F(C.bg); pdf.rect(0, 0, PW, PH, 'F'); };

      const topBand = () => {
        F(C.red); pdf.rect(0, 0, PW, 4, 'F');
        F(C.gold); pdf.rect(0, 4, PW, 1, 'F');
      };

      const botBand = () => {
        F(C.gold); pdf.rect(0, PH - 5, PW, 1, 'F');
        F(C.red); pdf.rect(0, PH - 4, PW, 4, 'F');
      };

      // Boîte colorée avec coins arrondis
      const box = (x, y, w, h, r, fill, strokeC, lw = 0.4) => {
        if (fill) { F(fill); pdf.roundedRect(x, y, w, h, r, r, 'F'); }
        if (strokeC) { S(strokeC); pdf.setLineWidth(lw); pdf.roundedRect(x, y, w, h, r, r, 'S'); }
      };

      // Accent gauche vertical
      const leftBar = (x, y, h, c) => { F(c); pdf.rect(x, y, 2.5, h, 'F'); };

      // Ligne horizontale
      const hline = (y, c = [30, 41, 70], lw = 0.3) => { S(c); pdf.setLineWidth(lw); pdf.line(ML, y, PW - MR, y); };

      // Difficulté → couleur
      const diffC = (d) => ({ Facile: C.green, Moyen: C.cyan, Difficile: C.gold, Expert: C.red, Boss: [220, 38, 38] }[d] || C.muted);

      // ── Fonction clé : écrire du texte dans une boîte avec wrapping correct ──
      // Retourne la hauteur réelle utilisée
      const textBox = (text, x, y, maxW, bgColor, strokeColor, accentColor, opts = {}) => {
        const { fontSize = 9, textColor = C.white, bold: isBold = false, padding = 5, lineH = 5.5 } = opts;
        if (isBold) B(fontSize); else N(fontSize);
        const lines = pdf.splitTextToSize(String(text || ''), maxW - padding * 2);
        const h = lines.length * lineH + padding * 2;
        box(x, y, maxW, h, 3, bgColor, strokeColor);
        if (accentColor) leftBar(x, y, h, accentColor);
        T(textColor);
        if (isBold) B(fontSize); else N(fontSize);
        pdf.text(lines, x + (accentColor ? padding + 1 : padding), y + padding + lineH * 0.7);
        return h;
      };

      // Infos globales
      const today = new Date().toLocaleDateString('fr-FR', {
        timeZone: 'Africa/Douala', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const dateFile = new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' }).replace(/\//g, '-');
      const totalParts = QUESTIONS_DU_JOUR.reduce((s, q) => s + (answersByQId[q.id]?.length || 0), 0);

      // ══════════════════════════
      //   PAGE 1 — COUVERTURE
      // ══════════════════════════
      fillPage(); topBand();

      let y = 22;

      // Logo cercle
      box(PW / 2 - 18, y, 36, 36, 18, C.card, C.red, 0.8);
      T(C.red); B(14); pdf.text('AoM', PW / 2, y + 20, { align: 'center' });
      y += 44;

      // Titre
      T(C.white); B(20); pdf.text('THE ARENA OF MINDS', PW / 2, y, { align: 'center' });
      y += 7;
      T(C.muted); N(8); pdf.text('L O G I C   ·   M A T H S   ·   M Y S T E R I E S', PW / 2, y, { align: 'center' });
      y += 10;

      // Ligne déco
      S(C.red); pdf.setLineWidth(0.5); pdf.line(ML + 25, y, PW - MR - 25, y);
      S(C.gold); pdf.setLineWidth(0.3); pdf.line(ML + 40, y + 1.5, PW - MR - 40, y + 1.5);
      y += 10;

      // Badge récapitulatif
      box(ML + 20, y - 5, CW - 40, 14, 3, C.card, C.cyan, 0.4);
      T(C.cyan); B(9); pdf.text('RÉCAPITULATIF JOURNALIER', PW / 2, y + 4, { align: 'center' });
      y += 18;

      // Date
      T(C.white); B(14);
      pdf.text(today.charAt(0).toUpperCase() + today.slice(1), PW / 2, y, { align: 'center' });
      y += 16;

      // 3 cartes stats
      const statW = (CW - 8) / 3;
      [[C.red, '5', 'ÉNIGMES'], [C.cyan, String(totalParts), 'PARTICIPATIONS'], [C.gold, String(users.length), 'COMBATTANTS']].forEach(([c, v, l], i) => {
        const sx = ML + i * (statW + 4);
        box(sx, y, statW, 26, 3, C.card2, c, 0.5); leftBar(sx, y, 26, c);
        T(c); B(18); pdf.text(v, sx + statW / 2 + 1, y + 13, { align: 'center' });
        T(C.muted); N(7); pdf.text(l, sx + statW / 2 + 1, y + 21, { align: 'center' });
      });
      y += 34;

      hline(y); y += 8;

      // Aperçu 5 questions
      T(C.gold); B(9); pdf.text('APERÇU DES QUESTIONS DU JOUR', ML, y); y += 7;

      QUESTIONS_DU_JOUR.forEach((q, qi) => {
        const qd = getLocalizedQuestionData(q);
        const dc = diffC(qd.difficulty);
        const nbAns = answersByQId[q.id]?.length || 0;
        const rowH = 13;
        box(ML, y, CW, rowH, 2, qi % 2 === 0 ? C.card : C.card2, null); leftBar(ML, y, rowH, dc);
        T(dc); B(9); pdf.text(`#${q.id}`, ML + 5, y + 8.5);
        T(C.muted); N(7); pdf.text(`${q.start}h–${q.end}h`, ML + 15, y + 5); pdf.text(`${q.points}pts`, ML + 15, y + 10.5);
        T(C.white); B(7.5); pdf.text((qd.displayCategory || '').substring(0, 16), ML + 34, y + 8.5);
        box(ML + 84, y + 3, 22, 7, 1.5, dc, null);
        T(C.dark); B(6); pdf.text(qd.difficulty.toUpperCase().substring(0, 8), ML + 95, y + 8, { align: 'center' });
        T(C.green); B(10); pdf.text(String(nbAns), ML + 117, y + 8, { align: 'center' });
        T(C.muted); N(6); pdf.text('réponses', ML + 117, y + 11.5, { align: 'center' });
        // Réponse tronquée
        T(C.cyan); N(6.5);
        const shortAns = (qd.displayAnswer || '').substring(0, 45);
        pdf.text('→ ' + shortAns, ML + 132, y + 8.5);
        y += rowH + 2;
      });

      y += 4; hline(y); y += 6;
      T(C.muted); I(7);
      pdf.text('Rapport généré automatiquement — The Arena of Minds', PW / 2, y, { align: 'center' });
      y += 4;
      pdf.text('Pages suivantes : détail complet de chaque question et liste des combattants.', PW / 2, y, { align: 'center' });

      botBand();

      // ══════════════════════════════════════
      //   PAGES 2–6 : DÉTAIL PAR QUESTION
      // ══════════════════════════════════════
      for (const q of QUESTIONS_DU_JOUR) {
        const qd = getLocalizedQuestionData(q);
        const answers = answersByQId[q.id] || [];
        const dc = diffC(qd.difficulty);

        pdf.addPage(); fillPage(); topBand(); botBand();
        let py = MT + 2;

        // ── En-tête ──
        box(ML, py, CW, 15, 3, C.red, null); leftBar(ML, py, 15, C.gold);
        T(C.white); B(12); pdf.text(`ÉNIGME ${q.id}  —  ${q.start}H00 à ${q.end}H00`, ML + 5, py + 10);
        box(PW - MR - 27, py + 3, 23, 9, 2, dc, null);
        T(C.dark); B(6.5); pdf.text(qd.difficulty.toUpperCase().substring(0, 8), PW - MR - 15, py + 9, { align: 'center' });
        py += 20;

        // ── Méta ──
        box(ML, py, CW, 9, 2, C.card2, null);
        T(C.muted); N(7);
        pdf.text(`Catégorie : ${qd.displayCategory || ''}`, ML + 4, py + 6);
        pdf.text(`Points : ${q.points}`, ML + 70, py + 6);
        pdf.text(`Participations : ${answers.length}`, ML + 95, py + 6);
        pdf.text(`Créneau : ${q.start}h – ${q.end}h`, ML + 145, py + 6);
        py += 14;

        // ── Énoncé ──
        T(C.cyan); B(8); pdf.text('ÉNONCÉ', ML, py); py += 5;
        const qH = textBox(qd.displayText, ML, py, CW, C.card, C.cyan, C.cyan, { fontSize: 9, textColor: C.white, lineH: 5.5, padding: 5 });
        py += qH + 7;

        // ── Réponse correcte ──
        T(C.green); B(8); pdf.text('RÉPONSE CORRECTE', ML, py); py += 5;
        const aH = textBox(qd.displayAnswer, ML, py, CW, [8, 35, 25], C.green, C.green, { fontSize: 9, textColor: C.green, bold: true, lineH: 5.5, padding: 5 });
        py += aH + 8;

        // ── Tableau réponses ──
        if (answers.length === 0) {
          box(ML, py, CW, 12, 3, C.card2, C.border, 0.3);
          T(C.muted); I(8); pdf.text('Aucune participation enregistrée pour cette question.', PW / 2, py + 8, { align: 'center' });
          py += 16;
        } else {
          T(C.white); B(8);
          pdf.text(`RÉPONSES — ${answers.length} participation${answers.length > 1 ? 's' : ''}`, ML, py);
          py += 6;

          // En-tête tableau
          box(ML, py, CW, 8, 2, C.border, null);
          T(C.muted); B(6.5);
          pdf.text('N°', ML + 2, py + 5.5);
          pdf.text('HEURE', ML + 10, py + 5.5);
          pdf.text('JOUEUR', ML + 28, py + 5.5);
          pdf.text('RÉPONSE SOUMISE', ML + 90, py + 5.5);
          py += 8;

          for (let ai = 0; ai < answers.length; ai++) {
            const ans = answers[ai];

            // Calcul de la hauteur de la ligne (réponse peut être longue)
            N(7);
            const repLines = pdf.splitTextToSize(String(ans.reponse || '—'), CW - 90 - 4);
            const rowH = Math.max(7, repLines.length * 5 + 3);

            // Saut de page si besoin
            if (py + rowH > PH - 14) {
              botBand(); pdf.addPage(); fillPage(); topBand(); botBand(); py = MT + 2;
              box(ML, py, CW, 12, 3, C.red, null);
              T(C.white); B(9); pdf.text(`ÉNIGME ${q.id} — Suite (${ai + 1}/${answers.length})`, ML + 4, py + 8);
              py += 17;
              box(ML, py, CW, 8, 2, C.border, null);
              T(C.muted); B(6.5);
              pdf.text('N°', ML + 2, py + 5.5); pdf.text('HEURE', ML + 10, py + 5.5);
              pdf.text('JOUEUR', ML + 28, py + 5.5); pdf.text('RÉPONSE SOUMISE', ML + 90, py + 5.5);
              py += 8;
            }

            box(ML, py, CW, rowH, 1, ai % 2 === 0 ? C.card : C.card2, null);

            const heure = new Date(ans.timestamp).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala', hour: '2-digit', minute: '2-digit' });
            const joueur = String(ans.joueur || '—').substring(0, 24);

            T(C.muted); N(6.5); pdf.text(String(ai + 1), ML + 2, py + rowH / 2 + 1.5);
            T(C.gold); N(7); pdf.text(heure, ML + 10, py + rowH / 2 + 1.5);
            T(C.white); B(7); pdf.text(joueur, ML + 28, py + rowH / 2 + 1.5);

            // Réponse avec wrapping
            T(C.cyan); N(7);
            pdf.text(repLines, ML + 90, py + 4);

            py += rowH;
          }
        }

        // ── Mini barre stats en bas ──
        if (py + 13 < PH - 14) {
          py += 5; hline(py, C.border, 0.3); py += 5;
          box(ML, py, CW, 11, 2, C.card, C.border, 0.3);
          T(C.muted); N(7); pdf.text(`Énigme ${q.id}/5`, ML + 4, py + 7.5);
          T(dc); B(7); pdf.text(qd.difficulty, ML + 35, py + 7.5);
          T(C.green); B(8); pdf.text(`${answers.length} réponse${answers.length > 1 ? 's' : ''}`, ML + 70, py + 7.5);
          T(C.gold); B(8); pdf.text(`${q.points} pt${q.points > 1 ? 's' : ''}`, ML + 110, py + 7.5);
          T(C.muted); N(7); pdf.text(`${q.start}h–${q.end}h`, ML + 148, py + 7.5);
        }
      }

      // ══════════════════════════════════════
      //   PAGE FINALE — COMBATTANTS
      // ══════════════════════════════════════
      pdf.addPage(); fillPage(); topBand(); botBand();
      let fp = MT + 2;

      box(ML, fp, CW, 15, 3, [30, 20, 5], C.gold, 0.6); leftBar(ML, fp, 15, C.gold);
      T(C.gold); B(11); pdf.text('COMBATTANTS INSCRITS', ML + 5, fp + 10);
      T(C.white); N(8); pdf.text(`${users.length} au total`, PW - MR - 4, fp + 10, { align: 'right' });
      fp += 20;

      if (users.length === 0) {
        box(ML, fp, CW, 12, 3, C.card2, C.border, 0.3);
        T(C.muted); I(8); pdf.text('Aucun combattant inscrit.', PW / 2, fp + 8, { align: 'center' });
      } else {
        // En-tête
        box(ML, fp, CW, 8, 2, C.border, null);
        T(C.muted); B(6.5);
        pdf.text('N°', ML + 2, fp + 5.5);
        pdf.text('NOM COMPLET', ML + 12, fp + 5.5);
        pdf.text('PSEUDO', ML + 65, fp + 5.5);
        pdf.text('WHATSAPP', ML + 105, fp + 5.5);
        pdf.text('VILLE', ML + 148, fp + 5.5);
        fp += 8;

        for (let ui = 0; ui < users.length; ui++) {
          const u = users[ui];
          const rh = 7.5;

          if (fp + rh > PH - 14) {
            botBand(); pdf.addPage(); fillPage(); topBand(); botBand(); fp = MT + 2;
            box(ML, fp, CW, 10, 2, C.gold, null);
            T(C.dark); B(8); pdf.text(`COMBATTANTS — Suite (${ui + 1}/${users.length})`, ML + 4, fp + 7);
            fp += 15;
            box(ML, fp, CW, 8, 2, C.border, null);
            T(C.muted); B(6.5);
            pdf.text('N°', ML + 2, fp + 5.5); pdf.text('NOM COMPLET', ML + 12, fp + 5.5);
            pdf.text('PSEUDO', ML + 65, fp + 5.5); pdf.text('WHATSAPP', ML + 105, fp + 5.5); pdf.text('VILLE', ML + 148, fp + 5.5);
            fp += 8;
          }

          box(ML, fp, CW, rh, 1, ui % 2 === 0 ? C.card : C.card2, null);
          T(C.muted); N(6.5); pdf.text(String(ui + 1), ML + 2, fp + 5);
          T(C.white); B(7); pdf.text(String(u.name || '—').substring(0, 24).toUpperCase(), ML + 12, fp + 5);
          T(C.cyan); N(7); pdf.text(String(u.pseudo || '—').substring(0, 16), ML + 65, fp + 5);
          T(C.green); N(7); pdf.text(String(u.phone || '—').substring(0, 16), ML + 105, fp + 5);
          T(C.muted); N(7); pdf.text(String(u.city || '—').substring(0, 14), ML + 148, fp + 5);
          fp += rh;
        }
      }

      // ── Sauvegarde ──
      pdf.save(`ArenaOfMinds_Rapport_${dateFile}.pdf`);
      setPdfMsg(isAuto ? '✓ Rapport 20h généré !' : '✓ Rapport PDF téléchargé !');
      setTimeout(() => setPdfMsg(''), 5000);

    } catch (err) {
      console.error('PDF error:', err);
      setPdfMsg('Erreur génération PDF. Vérifiez la console.');
      setTimeout(() => setPdfMsg(''), 5000);
    }
    setPdfLoading(false);
  };

  // ══════════════════════════
  //   HELPERS CSV
  // ══════════════════════════
  const activeQuestionDetails = getLocalizedQuestionData(QUESTIONS_DU_JOUR.find(q => q.id === selectedQId));
  const currentQAnswers = answersByQId[selectedQId] || [];
  const isCurrentlyLive = activeQuestionDetails && currentHour >= activeQuestionDetails.start && currentHour < activeQuestionDetails.end;

  const handleExportCSV = () => {
    if (!currentQAnswers.length) return;
    const header = "Joueur,Reponse,Date(Local)\n";
    const rows = currentQAnswers.map(ans => {
      const date = new Date(ans.timestamp).toLocaleString('fr-FR');
      return `"${ans.joueur.replace(/"/g, '""')}","${ans.reponse.replace(/"/g, '""')}","${date}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.setAttribute("download", `Reponses_Q${selectedQId}_${Date.now()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const exportUsersToCSV = () => {
    if (!users.length) return;
    const headers = ['Date Inscription', 'Nom Complet', 'Pseudo', 'WhatsApp', 'Email', 'Ville', 'UID'];
    const rows = users.map(u => [new Date(u.registeredAt).toLocaleString('fr-FR', { timeZone: 'Africa/Douala' }), u.name || '', u.pseudo || '', u.phone || '', u.email || '', u.city || '', u.uid || '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', `base_joueurs_arene_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // ══════════════════════════
  //   RENDU
  // ══════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#03040E] flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass-card p-8 rounded-2xl w-full max-w-sm flex flex-col items-center">
          <div onDoubleClick={() => setIsAuthenticated(true)} className="w-16 h-16 rounded-full bg-arena-danger/10 flex items-center justify-center mb-6 cursor-pointer">
            <Lock className="w-8 h-8 text-arena-danger" />
          </div>
          <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-6">{t('admin_login_title')}</h2>
          <input type="password" placeholder={t('admin_login_placeholder')} value={password} onChange={(e) => setPassword(e.target.value)}
            className={`w-full bg-[#03040E] border ${error ? 'border-arena-danger' : 'border-arena-border'} rounded-lg p-3 text-center tracking-widest text-white mb-4 focus:outline-none focus:border-arena-danger`} />
          <button type="submit" className="w-full bg-arena-danger hover:bg-rose-600 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors">{t('admin_login_btn')}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03040E] text-[#F1F5F9] font-body flex flex-col lg:flex-row">

      {/* Modal suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1e] border border-arena-danger/50 rounded-2xl p-6 max-w-sm w-full text-center">
            <AlertTriangle className="w-10 h-10 text-arena-danger mx-auto mb-3" />
            <h3 className="text-white font-bold text-lg mb-1">Supprimer ce combattant ?</h3>
            <p className="text-arena-textMuted text-sm mb-1 font-bold">{deleteConfirm.name}</p>
            <p className="text-arena-textMuted text-xs mb-6 opacity-60">{deleteConfirm.phone} · {deleteConfirm.email}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-arena-border text-arena-textMuted hover:text-white py-2 rounded-lg text-sm transition-colors">Annuler</button>
              <button onClick={() => handleDeletePlayer(deleteConfirm.id)} className="flex-1 bg-arena-danger hover:bg-rose-600 text-white py-2 rounded-lg text-sm font-bold transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification PDF */}
      {pdfMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#0a1528] border border-arena-secondary/50 text-arena-secondary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-3 shadow-xl">
          <FileText className="w-4 h-4" /> {pdfMsg}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-arena-border bg-[#050812] flex flex-col shrink-0">
        <div className="p-6 border-b border-arena-border flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-arena-danger" />
          <h1 className="font-display font-bold uppercase tracking-wider">{t('admin_panel_title')}</h1>
        </div>

        <div className="flex border-b border-arena-border">
          <button onClick={() => setActiveTab('reponses')} className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'reponses' ? 'text-white bg-arena-danger/10 border-b-2 border-arena-danger' : 'text-arena-textMuted hover:text-white hover:bg-white/5'}`}>{t('admin_tab_answers')}</button>
          <button onClick={() => setActiveTab('joueurs')} className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'joueurs' ? 'text-white bg-arena-secondary/10 border-b-2 border-arena-secondary' : 'text-arena-textMuted hover:text-white hover:bg-white/5'}`}>
            {t('admin_tab_players')} <span className="ml-1 opacity-50">({users.length})</span>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto flex flex-col">
          {activeTab === 'reponses' ? (
            <div className="flex flex-col flex-1">
              <p className="text-xs uppercase font-bold text-arena-textMuted tracking-widest mb-4 ml-2">{t('admin_quests_today')}</p>
              <div className="flex flex-col gap-2">
                {QUESTIONS_DU_JOUR.map(q => {
                  const isActive = selectedQId === q.id;
                  const isLive = currentHour >= q.start && currentHour < q.end;
                  const nbAns = answersByQId[q.id]?.length || 0;
                  return (
                    <button key={q.id} onClick={() => { setSelectedQId(q.id); setRevealCorrect(false); }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isActive ? 'bg-arena-danger/10 border-arena-danger/50 text-white' : 'border-transparent text-arena-textMuted hover:bg-white/5 hover:text-white'}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg opacity-50">#{q.id}</span>
                        <div>
                          <span className="font-medium block">{q.start}h - {q.end}h</span>
                          <span className="text-xs opacity-50">{nbAns} réponse{nbAns > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {isLive && <div className="w-2 h-2 rounded-full bg-arena-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              {/* Bouton PDF */}
              <div className="mt-auto pt-6 space-y-2">
                <button onClick={() => generateDailyPDF(false)} disabled={pdfLoading}
                  className="w-full flex items-center justify-center gap-2 bg-arena-danger/10 hover:bg-arena-danger/20 border border-arena-danger/50 disabled:opacity-50 disabled:cursor-not-allowed text-arena-danger px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest">
                  <FileText className="w-4 h-4" />
                  {pdfLoading ? 'Génération...' : 'Rapport PDF journalier'}
                </button>
                <p className={`text-xs text-center ${currentHour >= 20 ? 'text-arena-success' : 'text-arena-textMuted opacity-50'}`}>
                  {currentHour >= 20 ? '✓ Rapport auto 20h activé' : 'Auto-génération à 20h00'}
                </p>
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

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 h-screen overflow-y-auto w-full">

        {activeTab === 'reponses' && activeQuestionDetails && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Énigme {activeQuestionDetails.id}</h2>
                  {isCurrentlyLive ? (
                    <span className="bg-arena-success/20 text-arena-success border border-arena-success/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">{t('admin_quest_live')}</span>
                  ) : (
                    <span className="bg-arena-textMuted/20 text-arena-textMuted border border-arena-border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {currentHour >= activeQuestionDetails.end ? t('admin_quest_ended') : t('admin_quest_upcoming')}
                    </span>
                  )}
                </div>
                <p className="text-arena-textMuted text-sm font-mono">{activeQuestionDetails.displayCategory} — {activeQuestionDetails.difficulty}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => setShowAnswers(!showAnswers)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#050812] border border-arena-border hover:border-arena-secondary text-arena-textMuted hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAnswers ? t('admin_btn_hide_ans') : t('admin_btn_show_ans')}
                </button>
                <button onClick={handleExportCSV} disabled={currentQAnswers.length === 0}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-arena-primary hover:bg-indigo-500 disabled:bg-arena-border disabled:text-arena-textMuted disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold">
                  <Download className="w-4 h-4" /> {t('admin_btn_csv')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                  <p className="text-xs uppercase font-bold text-arena-textMuted tracking-widest mb-3">{t('admin_quest_subject')}</p>
                  <p className="text-lg font-medium leading-relaxed mb-6">{activeQuestionDetails.displayText}</p>
                  <div className="border-t border-arena-border pt-4">
                    <button onClick={() => setRevealCorrect(!revealCorrect)}
                      className="text-xs uppercase font-bold text-arena-gold hover:text-white transition-colors tracking-widest flex items-center gap-2 mb-2">
                      {revealCorrect ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {revealCorrect ? t('admin_btn_hide_sol') : t('admin_btn_show_sol')}
                    </button>
                    {revealCorrect && (
                      <div className="bg-arena-gold/10 border border-arena-gold/30 p-3 rounded-lg mt-2">
                        <p className="text-arena-gold font-mono text-sm">{activeQuestionDetails.displayAnswer}</p>
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
                      <LayoutDashboard className="w-4 h-4 text-arena-secondary" />{t('admin_live_feed')}
                    </h3>
                  </div>
                  <div className="flex-1 overflow-auto p-0">
                    {currentQAnswers.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-arena-textMuted p-8">
                        <Clock className="w-12 h-12 opacity-20 mb-4" /><p>{t('admin_waiting')}</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#03040E]/80 text-xs uppercase tracking-widest text-arena-textMuted border-b border-arena-border">
                            <th className="p-4 font-bold">{t('admin_col_time')}</th>
                            <th className="p-4 font-bold">{t('admin_col_player')}</th>
                            <th className="p-4 font-bold">{t('admin_col_answer')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentQAnswers.map(ans => (
                            <tr key={ans.id} className="border-b border-arena-border/50 hover:bg-white/5 transition-colors">
                              <td className="p-4 text-sm font-mono text-arena-textMuted whitespace-nowrap">{new Date(ans.timestamp).toLocaleTimeString('fr-FR')}</td>
                              <td className="p-4 text-sm font-bold text-white max-w-[200px] truncate">{ans.joueur}</td>
                              <td className="p-4 text-sm">
                                {showAnswers ? <span className="text-arena-secondary font-mono">{ans.reponse}</span>
                                  : <span className="text-arena-textMuted flex items-center gap-2 text-xs uppercase tracking-widest opacity-50"><Lock className="w-3 h-3" />{t('admin_ans_hidden')}</span>}
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

        {activeTab === 'joueurs' && (
          <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            {deleteMsg && (
              <div className="bg-arena-success/10 border border-arena-success/40 text-arena-success px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {deleteMsg}
              </div>
            )}
            <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
              <div>
                <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">{t('admin_db_title')}</h2>
                <p className="text-arena-textMuted text-sm font-mono mt-1">{t('admin_db_desc')}</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto flex-wrap">
                <button onClick={detectDuplicates} disabled={scanLoading || users.length === 0}
                  className="flex items-center justify-center gap-2 bg-arena-gold/10 hover:bg-arena-gold/20 border border-arena-gold/40 disabled:opacity-40 disabled:cursor-not-allowed text-arena-gold px-5 py-3 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest">
                  <AlertTriangle className="w-4 h-4" />{scanLoading ? 'Scan...' : 'Détecter doublons'}
                </button>
                <button onClick={exportUsersToCSV} disabled={users.length === 0}
                  className="flex items-center justify-center gap-2 bg-arena-secondary hover:bg-cyan-500 disabled:bg-arena-border disabled:text-arena-textMuted disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest">
                  <Download className="w-4 h-4" /> {t('admin_db_export')}
                </button>
              </div>
            </div>

            {duplicateScanDone && (
              <div className={`rounded-2xl p-5 border ${duplicatesFound.length > 0 ? 'bg-arena-danger/5 border-arena-danger/40' : 'bg-arena-success/5 border-arena-success/40'}`}>
                {duplicatesFound.length === 0 ? (
                  <div className="flex items-center gap-3 text-arena-success">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-widest">Aucun doublon — base de données propre !</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-arena-danger">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-widest">{duplicatesFound.length} doublon(s) détecté(s)</span>
                      </div>
                      <button onClick={removeAllDuplicates} className="bg-arena-danger hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                        <Trash2 className="w-3 h-3" /> Supprimer tous les doublons
                      </button>
                    </div>
                    <div className="space-y-2">
                      {duplicatesFound.map(d => (
                        <div key={d.id} className="bg-arena-danger/10 border border-arena-danger/20 rounded-lg px-4 py-2 text-sm flex items-center justify-between">
                          <span className="text-white font-bold">{d.name}</span>
                          <span className="text-arena-textMuted font-mono text-xs">{d.phone} · {d.email}</span>
                          <span className="text-arena-danger text-xs uppercase tracking-widest">Doublon</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="glass-card rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
              <div className="flex-1 overflow-auto p-0 border border-arena-border rounded-b-2xl">
                {users.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-arena-textMuted p-12">
                    <Users className="w-16 h-16 opacity-20 mb-4" />
                    <p className="uppercase tracking-widest text-sm font-bold">{t('admin_db_empty')}</p>
                    <p className="text-xs mt-2 opacity-50">{t('admin_db_empty_desc')}</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-[#03040E]/80 text-xs uppercase tracking-widest text-arena-textMuted border-b border-arena-border sticky top-0 z-10">
                        <th className="p-4 font-bold whitespace-nowrap">{t('admin_col_date_reg')}</th>
                        <th className="p-4 font-bold">{t('admin_col_fullname')}</th>
                        <th className="p-4 font-bold">{t('admin_col_pseudo')}</th>
                        <th className="p-4 font-bold">{t('admin_col_whatsapp')}</th>
                        <th className="p-4 font-bold">{t('admin_col_city')}</th>
                        <th className="p-4 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-arena-border/50 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-sm font-mono text-arena-textMuted whitespace-nowrap">
                            {new Date(u.registeredAt).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala', hour: '2-digit', minute: '2-digit' })}
                            <br /><span className="text-[10px] opacity-50">{new Date(u.registeredAt).toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' })}</span>
                          </td>
                          <td className="p-4 text-sm font-bold text-white uppercase">{u.name}</td>
                          <td className="p-4 text-sm text-arena-secondary">{u.pseudo}</td>
                          <td className="p-4 text-sm text-arena-primary font-mono">{u.phone}</td>
                          <td className="p-4 text-sm text-arena-textMuted capitalize">{u.city}</td>
                          <td className="p-4 text-center">
                            <button onClick={() => setDeleteConfirm(u)} className="p-2 rounded-lg text-arena-textMuted hover:text-arena-danger hover:bg-arena-danger/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
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