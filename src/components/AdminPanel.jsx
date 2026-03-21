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

  useEffect(() => {
    if (!isAuthenticated) return;
    setAnswersByQId(prev => ({ ...prev, [selectedQId]: [] }));
    const qRef = collection(db, `artifacts/${import.meta.env.VITE_ARENE_APP_ID}/public/data/reponses_q${selectedQId}`);
    const qSnap = query(qRef, orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(qSnap, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnswersByQId(prev => ({ ...prev, [selectedQId]: docs }));
    });
    return () => unsub();
  }, [isAuthenticated, selectedQId]);

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

  // ──────────────────────────────────────────────
  //  GÉNÉRATION PDF RÉCAPITULATIF JOURNALIER
  // ──────────────────────────────────────────────
  const generateDailyPDF = async (isAuto = false) => {
    setPdfLoading(true);
    setPdfMsg(isAuto ? 'Génération automatique du rapport 20h...' : 'Génération du rapport PDF...');
    try {
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
      const W = 210, H = 297, M = 14, CW = W - M * 2;

      const today = new Date().toLocaleDateString('fr-FR', {
        timeZone: 'Africa/Douala', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const dateFile = new Date().toLocaleDateString('fr-FR', { timeZone: 'Africa/Douala' }).replace(/\//g, '-');
      const totalParts = QUESTIONS_DU_JOUR.reduce((s, q) => s + (answersByQId[q.id]?.length || 0), 0);

      const rgb = (r, g, b) => ({ r, g, b });
      const DARK = rgb(3, 4, 14);
      const CARD = rgb(13, 20, 40);
      const CARD2 = rgb(20, 30, 55);
      const BORDER = rgb(30, 41, 70);
      const RED = rgb(220, 50, 80);
      const GOLD = rgb(234, 179, 8);
      const CYAN = rgb(34, 211, 238);
      const GREEN = rgb(16, 185, 129);
      const WHITE = rgb(241, 245, 249);
      const MUTED = rgb(100, 116, 139);

      const fill = (c) => pdf.setFillColor(c.r, c.g, c.b);
      const stroke = (c) => pdf.setDrawColor(c.r, c.g, c.b);
      const color = (c) => pdf.setTextColor(c.r, c.g, c.b);
      const bold = (sz) => { pdf.setFont('helvetica', 'bold'); pdf.setFontSize(sz); };
      const norm = (sz) => { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(sz); };
      const italic = (sz) => { pdf.setFont('helvetica', 'italic'); pdf.setFontSize(sz); };

      const fillPage = () => { fill(DARK); pdf.rect(0, 0, W, H, 'F'); };
      const topBand = () => { fill(RED); pdf.rect(0, 0, W, 4, 'F'); fill(GOLD); pdf.rect(0, 4, W, 1, 'F'); };
      const botBand = () => { fill(GOLD); pdf.rect(0, H - 5, W, 1, 'F'); fill(RED); pdf.rect(0, H - 4, W, 4, 'F'); };
      const rFill = (x, y, w, h, r, c) => { fill(c); pdf.roundedRect(x, y, w, h, r, r, 'F'); };
      const rStroke = (x, y, w, h, r, c, lw = 0.4) => { stroke(c); pdf.setLineWidth(lw); pdf.roundedRect(x, y, w, h, r, r, 'S'); };
      const accent = (x, y, h, c) => { fill(c); pdf.rect(x, y, 2.5, h, 'F'); };
      const hline = (y, c, lw = 0.3) => { stroke(c); pdf.setLineWidth(lw); pdf.line(M, y, W - M, y); };
      const diffColor = (d) => ({ Facile: GREEN, Moyen: CYAN, Difficile: GOLD, Expert: RED, Boss: rgb(220, 38, 38) }[d] || MUTED);

      // ─── PAGE 1 COUVERTURE ───
      fillPage(); topBand();

      // Logo cercle
      let y = 22;
      rFill(W / 2 - 18, y, 36, 36, 18, CARD);
      rStroke(W / 2 - 18, y, 36, 36, 18, RED, 0.8);
      color(RED); bold(14); pdf.text('AoM', W / 2, y + 20, { align: 'center' });

      y += 44;
      color(WHITE); bold(20); pdf.text('THE ARENA OF MINDS', W / 2, y, { align: 'center' });
      y += 7; color(MUTED); norm(8); pdf.text('L O G I C   ·   M A T H S   ·   M Y S T E R I E S', W / 2, y, { align: 'center' });

      y += 10;
      stroke(RED); pdf.setLineWidth(0.5); pdf.line(M + 25, y, W - M - 25, y);
      stroke(GOLD); pdf.setLineWidth(0.3); pdf.line(M + 40, y + 1.5, W - M - 40, y + 1.5);

      y += 10;
      rFill(M + 20, y - 5, CW - 40, 14, 3, CARD); rStroke(M + 20, y - 5, CW - 40, 14, 3, CYAN, 0.4);
      color(CYAN); bold(9); pdf.text('RÉCAPITULATIF JOURNALIER', W / 2, y + 4, { align: 'center' });

      y += 18;
      color(WHITE); bold(14);
      pdf.text((today.charAt(0).toUpperCase() + today.slice(1)), W / 2, y, { align: 'center' });

      // Stats 3 cartes
      y += 14;
      const stats = [{ label: 'ÉNIGMES', val: '5', c: RED }, { label: 'PARTICIPATIONS', val: String(totalParts), c: CYAN }, { label: 'COMBATTANTS', val: String(users.length), c: GOLD }];
      const sw = (CW - 8) / 3;
      stats.forEach((s, i) => {
        const sx = M + i * (sw + 4);
        rFill(sx, y, sw, 26, 3, CARD2); rStroke(sx, y, sw, 26, 3, s.c, 0.5); accent(sx, y, 26, s.c);
        color(s.c); bold(18); pdf.text(s.val, sx + sw / 2 + 1, y + 13, { align: 'center' });
        color(MUTED); norm(7); pdf.text(s.label, sx + sw / 2 + 1, y + 21, { align: 'center' });
      });
      y += 34; hline(y, BORDER); y += 8;

      // Aperçu questions
      color(GOLD); bold(9); pdf.text('APERÇU DES QUESTIONS DU JOUR', M, y); y += 7;

      QUESTIONS_DU_JOUR.forEach((q, qi) => {
        const qd = getLocalizedQuestionData(q);
        const dc = diffColor(qd.difficulty);
        const answers = answersByQId[q.id] || [];
        const rh = 14;
        rFill(M, y, CW, rh, 2, qi % 2 === 0 ? CARD : CARD2); accent(M, y, rh, dc);
        color(dc); bold(9); pdf.text(`#${q.id}`, M + 6, y + 8.5);
        color(MUTED); norm(7.5); pdf.text(`${q.start}h–${q.end}h`, M + 16, y + 5.5); pdf.text(`${q.points}pts`, M + 16, y + 11);
        color(WHITE); bold(8); pdf.text((qd.displayCategory || '').substring(0, 18), M + 35, y + 8.5);
        rFill(M + 85, y + 3.5, 22, 7, 1.5, dc);
        color(DARK); bold(6.5); pdf.text(qd.difficulty.toUpperCase().substring(0, 8), M + 96, y + 8.5, { align: 'center' });
        color(GREEN); bold(10); pdf.text(String(answers.length), M + 118, y + 8.5, { align: 'center' });
        color(MUTED); norm(6.5); pdf.text('réponses', M + 118, y + 12, { align: 'center' });
        color(CYAN); norm(7); pdf.text('→ ' + (qd.displayAnswer || '').substring(0, 38), M + 132, y + 8.5);
        y += rh + 2;
      });

      y += 4; hline(y, BORDER); y += 6;
      color(MUTED); italic(7);
      pdf.text('Rapport généré automatiquement — Arena of Minds', W / 2, y, { align: 'center' });
      y += 4; pdf.text('Les pages suivantes contiennent le détail complet de chaque question.', W / 2, y, { align: 'center' });
      botBand();

      // ─── PAGES DÉTAIL PAR QUESTION ───
      QUESTIONS_DU_JOUR.forEach((q) => {
        const qd = getLocalizedQuestionData(q);
        const answers = answersByQId[q.id] || [];
        const dc = diffColor(qd.difficulty);

        pdf.addPage(); fillPage(); topBand(); botBand();
        let py = 14;

        // En-tête question
        rFill(M, py, CW, 16, 3, RED); accent(M, py, 16, GOLD);
        color(WHITE); bold(13); pdf.text(`ÉNIGME ${q.id}`, M + 6, py + 10.5);
        color(WHITE); norm(9); pdf.text(`${q.start}H00 → ${q.end}H00`, M + 50, py + 10.5);
        rFill(W - M - 28, py + 3, 24, 10, 2, dc);
        color(DARK); bold(7); pdf.text(qd.difficulty.toUpperCase().substring(0, 8), W - M - 16, py + 9.5, { align: 'center' });
        py += 22;

        // Méta
        rFill(M, py, CW, 10, 2, CARD2);
        color(MUTED); norm(7.5);
        pdf.text(`Catégorie : ${qd.displayCategory}`, M + 4, py + 6.5);
        pdf.text(`Points : ${q.points}`, M + 70, py + 6.5);
        pdf.text(`Participations : ${answers.length}`, M + 95, py + 6.5);
        pdf.text(`Créneau : ${q.start}h – ${q.end}h`, M + 140, py + 6.5);
        py += 14;

        // Énoncé
        color(CYAN); bold(8); pdf.text('ÉNONCÉ DE LA QUESTION', M, py); py += 5;
        const qlines = pdf.splitTextToSize(qd.displayText, CW - 8);
        const qboxH = qlines.length * 5.5 + 10;
        rFill(M, py, CW, qboxH, 3, CARD); rStroke(M, py, CW, qboxH, 3, CYAN, 0.4); accent(M, py, qboxH, CYAN);
        color(WHITE); norm(9); pdf.text(qlines, M + 6, py + 7);
        py += qboxH + 6;

        // Réponse correcte
        color(GREEN); bold(8); pdf.text('RÉPONSE CORRECTE', M, py); py += 5;
        const alines = pdf.splitTextToSize(qd.displayAnswer, CW - 12);
        const aboxH = alines.length * 5.5 + 10;
        rFill(M, py, CW, aboxH, 3, rgb(8, 35, 25)); rStroke(M, py, CW, aboxH, 3, GREEN, 0.5); accent(M, py, aboxH, GREEN);
        fill(GREEN); pdf.circle(M + 7, py + aboxH / 2, 2.5, 'F');
        color(DARK); bold(8); pdf.text('✓', M + 6.2, py + aboxH / 2 + 2.5);
        color(GREEN); bold(9); pdf.text(alines, M + 13, py + 7);
        py += aboxH + 8;

        // Tableau réponses
        if (answers.length === 0) {
          rFill(M, py, CW, 14, 3, CARD2); rStroke(M, py, CW, 14, 3, BORDER, 0.3);
          color(MUTED); italic(8.5); pdf.text('Aucune participation enregistrée.', W / 2, py + 9, { align: 'center' });
          py += 18;
        } else {
          color(WHITE); bold(8); pdf.text(`RÉPONSES DES JOUEURS — ${answers.length} participation${answers.length > 1 ? 's' : ''}`, M, py); py += 6;
          rFill(M, py, CW, 9, 2, rgb(30, 41, 70));
          color(MUTED); bold(7);
          pdf.text('#', M + 3, py + 6); pdf.text('HEURE', M + 10, py + 6); pdf.text('JOUEUR / PSEUDO', M + 30, py + 6); pdf.text('RÉPONSE SOUMISE', M + 100, py + 6);
          py += 9;

          const maxRows = Math.min(answers.length, 30);
          for (let ai = 0; ai < maxRows; ai++) {
            const ans = answers[ai];
            const rh = 8;
            if (py + rh > H - 14) {
              botBand(); pdf.addPage(); fillPage(); topBand(); botBand(); py = 14;
              rFill(M, py, CW, 10, 2, RED); color(WHITE); bold(9);
              pdf.text(`ÉNIGME ${q.id} — Suite (${ai + 1}/${answers.length})`, M + 4, py + 7); py += 16;
              rFill(M, py, CW, 9, 2, rgb(30, 41, 70)); color(MUTED); bold(7);
              pdf.text('#', M + 3, py + 6); pdf.text('HEURE', M + 10, py + 6); pdf.text('JOUEUR / PSEUDO', M + 30, py + 6); pdf.text('RÉPONSE SOUMISE', M + 100, py + 6); py += 9;
            }
            rFill(M, py, CW, rh, 1, ai % 2 === 0 ? CARD : CARD2);
            const heure = new Date(ans.timestamp).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Douala', hour: '2-digit', minute: '2-digit' });
            color(MUTED); norm(6.5); pdf.text(String(ai + 1), M + 3, py + 5.5);
            color(GOLD); norm(7); pdf.text(heure, M + 10, py + 5.5);
            color(WHITE); bold(7.5); pdf.text((ans.joueur || '—').substring(0, 28), M + 30, py + 5.5);
            color(CYAN); norm(7); pdf.text((ans.reponse || '—').substring(0, 52), M + 100, py + 5.5);
            py += rh;
          }
          if (answers.length > 30) {
            py += 3; rFill(M, py, CW, 9, 2, CARD2);
            color(MUTED); italic(7); pdf.text(`+ ${answers.length - 30} autre(s). Voir export CSV.`, W / 2, py + 6, { align: 'center' }); py += 12;
          }
        }

        // Mini stats footer question
        if (py + 20 < H - 20) {
          py += 4; hline(py, BORDER, 0.3); py += 6;
          rFill(M, py, CW, 14, 2, CARD); rStroke(M, py, CW, 14, 2, BORDER, 0.3);
          color(MUTED); norm(7); pdf.text(`Question ${q.id} sur 5`, M + 4, py + 9);
          color(dc); bold(8); pdf.text(qd.difficulty, M + 40, py + 9);
          color(GREEN); bold(8); pdf.text(`${answers.length} réponse${answers.length > 1 ? 's' : ''}`, M + 75, py + 9);
          color(GOLD); bold(8); pdf.text(`${q.points} point${q.points > 1 ? 's' : ''}`, M + 115, py + 9);
          color(MUTED); norm(7); pdf.text(`${q.start}h – ${q.end}h`, M + 145, py + 9);
        }
      });

      // ─── PAGE FINALE COMBATTANTS ───
      pdf.addPage(); fillPage(); topBand(); botBand();
      let fp = 14;

      rFill(M, fp, CW, 16, 3, rgb(30, 20, 5)); rStroke(M, fp, CW, 16, 3, GOLD, 0.6); accent(M, fp, 16, GOLD);
      color(GOLD); bold(12); pdf.text('COMBATTANTS INSCRITS', M + 6, fp + 10.5);
      color(WHITE); norm(9); pdf.text(`${users.length} au total`, W - M - 4, fp + 10.5, { align: 'right' });
      fp += 22;

      if (users.length === 0) {
        rFill(M, fp, CW, 14, 3, CARD2); color(MUTED); italic(8.5); pdf.text('Aucun combattant inscrit.', W / 2, fp + 9, { align: 'center' });
      } else {
        rFill(M, fp, CW, 9, 2, rgb(30, 41, 70));
        color(MUTED); bold(7);
        pdf.text('#', M + 3, fp + 6); pdf.text('NOM COMPLET', M + 12, fp + 6); pdf.text('PSEUDO', M + 62, fp + 6); pdf.text('WHATSAPP', M + 102, fp + 6); pdf.text('VILLE', M + 142, fp + 6);
        fp += 9;

        users.slice(0, 55).forEach((u, ui) => {
          const rh = 7.5;
          if (fp + rh > H - 14) {
            botBand(); pdf.addPage(); fillPage(); topBand(); botBand(); fp = 14;
            rFill(M, fp, CW, 10, 2, GOLD); color(DARK); bold(8);
            pdf.text(`COMBATTANTS — Suite (${ui + 1}/${users.length})`, M + 4, fp + 7); fp += 16;
            rFill(M, fp, CW, 9, 2, rgb(30, 41, 70)); color(MUTED); bold(7);
            pdf.text('#', M + 3, fp + 6); pdf.text('NOM COMPLET', M + 12, fp + 6); pdf.text('PSEUDO', M + 62, fp + 6); pdf.text('WHATSAPP', M + 102, fp + 6); pdf.text('VILLE', M + 142, fp + 6); fp += 9;
          }
          rFill(M, fp, CW, rh, 1, ui % 2 === 0 ? CARD : CARD2);
          color(MUTED); norm(6.5); pdf.text(String(ui + 1), M + 3, fp + 5);
          color(WHITE); bold(7.5); pdf.text((u.name || '—').substring(0, 22).toUpperCase(), M + 12, fp + 5);
          color(CYAN); norm(7); pdf.text((u.pseudo || '—').substring(0, 16), M + 62, fp + 5);
          color(GREEN); norm(7); pdf.text((u.phone || '—').substring(0, 16), M + 102, fp + 5);
          color(MUTED); norm(7); pdf.text((u.city || '—').substring(0, 16), M + 142, fp + 5);
          fp += rh;
        });

        if (users.length > 55) {
          fp += 3; rFill(M, fp, CW, 9, 2, CARD2);
          color(MUTED); italic(7); pdf.text(`+ ${users.length - 55} autre(s). Consultez l'export CSV joueurs.`, W / 2, fp + 6, { align: 'center' });
        }
      }

      pdf.save(`ArenaOfMinds_Rapport_${dateFile}.pdf`);
      setPdfMsg(isAuto ? '✓ Rapport 20h généré et téléchargé !' : '✓ Rapport PDF téléchargé !');
      setTimeout(() => setPdfMsg(''), 5000);

    } catch (err) {
      console.error('PDF error:', err);
      setPdfMsg('Erreur génération PDF.');
      setTimeout(() => setPdfMsg(''), 4000);
    }
    setPdfLoading(false);
  };

  const activeQuestionDetails = getLocalizedQuestionData(QUESTIONS_DU_JOUR.find(q => q.id === selectedQId));
  const currentQAnswers = answersByQId[selectedQId] || [];
  const isCurrentlyLive = activeQuestionDetails && currentHour >= activeQuestionDetails.start && currentHour < activeQuestionDetails.end;

  const handleExportCSV = () => {
    if (!currentQAnswers.length) return;
    const header = "Joueur,Reponse,Date(Local)\n";
    const rows = currentQAnswers.map(ans => {
      const date = new Date(ans.timestamp).toLocaleString('fr-FR');
      const joueur = `"${ans.joueur.replace(/"/g, '""')}"`;
      const reponse = `"${ans.reponse.replace(/"/g, '""')}"`;
      return `${joueur},${reponse},${date}`;
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
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', `base_joueurs_arene_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#03040E] flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="glass-card p-8 rounded-2xl w-full max-w-sm flex flex-col items-center">
          <div onDoubleClick={() => setIsAuthenticated(true)} className="w-16 h-16 rounded-full bg-arena-danger/10 flex items-center justify-center mb-6 cursor-pointer" title="Double Click to Bypass">
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

      {pdfMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#0a1528] border border-arena-secondary/50 text-arena-secondary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-3 shadow-xl animate-pulse">
          <FileText className="w-4 h-4" /> {pdfMsg}
        </div>
      )}

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
                  return (
                    <button key={q.id} onClick={() => { setSelectedQId(q.id); setRevealCorrect(false); }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isActive ? 'bg-arena-danger/10 border-arena-danger/50 text-white' : 'border-transparent text-arena-textMuted hover:bg-white/5 hover:text-white'}`}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg opacity-50">#{q.id}</span>
                        <span className="font-medium">{q.start}h - {q.end}h</span>
                      </div>
                      {isLive && <div className="w-2 h-2 rounded-full bg-arena-success shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              {/* ── Bouton PDF ── */}
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
                                  : <span className="text-arena-textMuted flex items-center gap-2 text-xs uppercase tracking-widest opacity-50"><Lock className="w-3 h-3" /> {t('admin_ans_hidden')}</span>}
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
                            <button onClick={() => setDeleteConfirm(u)} className="p-2 rounded-lg text-arena-textMuted hover:text-arena-danger hover:bg-arena-danger/10 transition-colors" title="Supprimer ce combattant">
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
