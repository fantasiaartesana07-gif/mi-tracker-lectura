import { useState, useEffect, useRef } from "react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=UnifrakturMaguntia&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Josefin+Sans:wght@300;400;700&display=swap');
`;

const GENRES = ["Fantasía","Romance","Thriller","Ciencia Ficción","Drama","BL/GL","Filosófica","Aventura","Histórica","Terror"];
const STATES = ["Pendiente","En lectura","Terminado","Abandonado"];
const RATINGS = [1,2,3,4,5];
const STATE_COLORS = { "Pendiente":"#7b3fa0","En lectura":"#a00030","Terminado":"#5c1a8e","Abandonado":"#3a1050" };
const STATE_ICONS  = { "Pendiente":"🌙","En lectura":"🩸","Terminado":"⚰️","Abandonado":"🥀" };

function getMoonPhase() {
  const known = new Date('2000-01-06T00:18:00Z').getTime();
  const syn   = 29.53059 * 86400000;
  const frac  = (((Date.now()-known)%syn)+syn)%syn/syn;
  const idx   = Math.floor((frac*8+0.5)%8);
  return { emoji: ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"][idx], brightness: [0,0.25,0.5,0.75,1,0.75,0.5,0.25][idx], idx };
}

function loadBooks()    { try { return JSON.parse(localStorage.getItem("gothic-books")||"[]"); } catch{ return []; } }
function saveBooks(b)   { localStorage.setItem("gothic-books", JSON.stringify(b)); }
function loadSessions() { try { return JSON.parse(localStorage.getItem("gothic-sessions")||"[]"); } catch{ return []; } }
function saveSessions(s){ localStorage.setItem("gothic-sessions", JSON.stringify(s)); }

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :root {
    --crimson:   #8b0000;
    --blood:     #a50020;
    --blood2:    #cc1a3a;
    --violet:    #5c1a8e;
    --lilac:     #9b59b6;
    --amethyst:  #c084fc;
    --silver:    #c8c0d8;
    --moonsilver:#e8e0f0;
    --gold:      #c9a84c;
    --dark:      #06000c;
    --dark2:     #0c0016;
    --dark3:     #100020;
    --card:      rgba(14,3,24,0.86);
    --border:    rgba(139,0,0,0.28);
    --border2:   rgba(92,26,142,0.3);
    --text:      #e2d5ee;
    --muted:     #9080a8;
    --rune:      rgba(200,192,216,0.18);
  }

  body {
    font-family:'Crimson Text',serif;
    background: var(--dark);
    color: var(--text);
    min-height:100vh;
    overflow-x:hidden;
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='3' fill='%238b0000' opacity='0.8'/%3E%3C/svg%3E") 10 10, auto;
  }

  /* Gothic font helpers */
  .font-fraktur  { font-family:'UnifrakturMaguntia',cursive; }
  .font-medieval { font-family:'MedievalSharp',cursive; }
  .font-cormorant{ font-family:'Cormorant Garamond',serif; }

  /* ══ MAGIC BG ══ */
  .gothic-bg {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background:
      radial-gradient(ellipse at 18% 0%,   rgba(139,0,0,0.22) 0%, transparent 52%),
      radial-gradient(ellipse at 82% 4%,   rgba(92,26,142,0.18) 0%, transparent 48%),
      radial-gradient(ellipse at 50% 100%, rgba(92,26,142,0.14) 0%, transparent 48%),
      radial-gradient(ellipse at 5%  55%,  rgba(139,0,0,0.12) 0%, transparent 42%),
      radial-gradient(ellipse at 95% 40%,  rgba(92,26,142,0.1) 0%, transparent 38%),
      linear-gradient(180deg, #06000c 0%, #0c0016 35%, #100020 65%, #08000f 100%);
    transition: opacity 2s ease;
  }

  /* ══ PARTICLE LAYER (runes, roses, stars) ══ */
  .particle-layer {
    position:fixed; inset:0; pointer-events:none; z-index:1; overflow:hidden;
  }
  .particle {
    position:absolute;
    animation: partDrift var(--dur,8s) ease-in-out infinite alternate,
               partPulse var(--pd,3.5s) ease-in-out infinite;
    animation-delay: var(--delay,0s), var(--pdelay,0s);
    font-size: var(--fsz,14px);
    filter: drop-shadow(0 0 var(--glow,4px) var(--col,#8b0000));
    opacity: 0.12;
    user-select:none;
  }
  @keyframes partDrift {
    0%   { transform: translate(0,0) rotate(0deg) scale(1); }
    100% { transform: translate(var(--dx,25px), var(--dy,-35px)) rotate(var(--rot,90deg)) scale(var(--sc,1.1)); }
  }
  @keyframes partPulse {
    0%,100% { opacity: 0.08; filter: drop-shadow(0 0 var(--glow,4px) var(--col,#8b0000)); }
    50%     { opacity: 0.65; filter: drop-shadow(0 0 calc(var(--glow,4px)*3) var(--col,#8b0000)) drop-shadow(0 0 calc(var(--glow,4px)*6) var(--col,#8b0000)); }
  }

  /* ══ MIST LAYER ══ */
  .mist-layer {
    position:fixed; bottom:0; left:0; right:0; height:260px;
    pointer-events:none; z-index:1;
    background: linear-gradient(to top,
      rgba(92,26,142,0.07) 0%,
      rgba(139,0,0,0.05) 30%,
      rgba(92,26,142,0.03) 60%,
      transparent 100%);
    animation: mistSway 10s ease-in-out infinite;
  }
  .mist-layer2 {
    position:fixed; bottom:0; left:-10%; right:-10%; height:140px;
    pointer-events:none; z-index:1;
    background: linear-gradient(to top, rgba(139,0,0,0.05) 0%, transparent 100%);
    animation: mistSway2 14s ease-in-out infinite 3s;
  }
  @keyframes mistSway  { 0%,100%{opacity:0.5;transform:scaleX(1) translateX(0);}    50%{opacity:1; transform:scaleX(1.06) translateX(-1%);} }
  @keyframes mistSway2 { 0%,100%{opacity:0.3;transform:scaleX(1) translateX(0);}    50%{opacity:0.7;transform:scaleX(1.08) translateX(1%);} }

  /* ══ DRIP LAYER ══ */
  .drip-layer { position:fixed; top:0; left:0; right:0; height:130px; pointer-events:none; z-index:2; }
  .drip {
    position:absolute; top:0;
    width: var(--w,3px);
    background: linear-gradient(to bottom, var(--blood) 0%, rgba(170,0,32,0.5) 65%, transparent 100%);
    border-radius: 0 0 50% 50%;
    animation: dripDown var(--dur,5s) ease-in-out infinite var(--delay,0s);
    opacity: var(--op,0.6);
  }
  @keyframes dripDown {
    0%   { height:0;    opacity:0; }
    15%  { opacity:var(--op,0.6); }
    65%  { height:var(--h,95px); }
    85%  { height:var(--h,95px); opacity:var(--op,0.6); }
    100% { height:0; opacity:0; }
  }

  /* ══ CURSOR TRAIL ══ */
  .cursor-rune {
    position:fixed; pointer-events:none; z-index:9999;
    font-size:var(--sz,11px);
    color: var(--col, #8b0000);
    animation: runeFloat var(--d,1.1s) ease-out forwards;
    filter: drop-shadow(0 0 5px var(--col,#8b0000));
    user-select:none;
  }
  @keyframes runeFloat {
    0%   { opacity:1; transform:scale(1.2) translate(0,0) rotate(0deg); }
    100% { opacity:0; transform:scale(0.3) translate(var(--mx,0px), var(--my,-40px)) rotate(var(--mr,180deg)); }
  }

  /* ══ LAYOUT ══ */
  .app { position:relative; z-index:2; min-height:100vh; }

  /* ══ TOPBAR ══ */
  .topbar {
    position:sticky; top:0; z-index:100;
    background:rgba(6,0,12,0.94); backdrop-filter:blur(18px);
    border-bottom:1px solid rgba(92,26,142,0.3);
    padding:0 24px;
    display:flex; align-items:center; justify-content:space-between;
    box-shadow:0 4px 40px rgba(139,0,0,0.12), 0 1px 0 rgba(92,26,142,0.2);
  }

  .topbar-left { display:flex; align-items:center; gap:14px; }

  .topbar-logo {
    font-family:'UnifrakturMaguntia',cursive; font-size:20px;
    letter-spacing:2px; padding:14px 0;
    background:linear-gradient(90deg,#8b0000,#9b59b6,#c9a84c,#c084fc,#8b0000,#9b59b6);
    background-size:400% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:shimmer 10s linear infinite;
    text-shadow: none;
  }
  .topbar-logo span.ms { font-family:'MedievalSharp',cursive; font-size:18px; }
  @keyframes shimmer { to{background-position:400% center;} }

  .moon-display {
    display:flex; align-items:center; gap:8px;
    padding:6px 12px; border-radius:20px;
    background:rgba(92,26,142,0.1);
    border:1px solid rgba(92,26,142,0.2);
  }
  .moon-emoji {
    font-size:20px;
    filter:drop-shadow(0 0 10px rgba(201,168,76,0.9)) drop-shadow(0 0 25px rgba(92,26,142,0.5));
    animation:moonPulse 3.5s ease-in-out infinite alternate;
  }
  .moon-name { font-family:'MedievalSharp',cursive; font-size:9px; color:var(--muted); letter-spacing:1.5px; text-transform:uppercase; }
  @keyframes moonPulse {
    0%   { filter:drop-shadow(0 0 8px rgba(201,168,76,0.6)) drop-shadow(0 0 15px rgba(92,26,142,0.4)); transform:scale(1); }
    100% { filter:drop-shadow(0 0 18px rgba(201,168,76,1)) drop-shadow(0 0 35px rgba(92,26,142,0.8)); transform:scale(1.1); }
  }

  .nav { display:flex; gap:2px; }
  .nav-btn {
    background:none; border:none; cursor:pointer;
    padding:9px 16px; border-radius:3px;
    font-family:'MedievalSharp',cursive; font-size:11px; font-weight:700;
    color:var(--muted); transition:all 0.3s;
    letter-spacing:1.5px;
  }
  .nav-btn:hover { color:var(--amethyst); background:rgba(92,26,142,0.1); }
  .nav-btn.active {
    background:rgba(92,26,142,0.16);
    border:1px solid rgba(92,26,142,0.35);
    color:var(--amethyst);
    box-shadow:0 0 18px rgba(92,26,142,0.25), inset 0 0 12px rgba(92,26,142,0.06);
  }

  /* ══ MAIN ══ */
  .main { padding:32px 24px; max-width:1340px; margin:0 auto; }

  /* ══ PAGE REVEAL ══ */
  .page-enter { opacity:0; transform:translateY(28px); }
  .page-visible { opacity:1; transform:translateY(0); transition:opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1); }

  /* ══ SECTION TITLE ══ */
  .section-title {
    font-family:'MedievalSharp',cursive; font-size:20px;
    letter-spacing:3px;
    background:linear-gradient(90deg,#8b0000,#9b59b6,#c9a84c,#c084fc);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    margin-bottom:26px;
    display:flex; align-items:center; gap:16px;
    animation:fadeUp 0.6s ease both;
  }
  .section-title::before { content:'✦'; -webkit-text-fill-color:rgba(139,0,0,0.8); font-size:12px; filter:drop-shadow(0 0 6px #8b0000); font-family:serif; }
  .section-title::after  { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(92,26,142,0.5),rgba(139,0,0,0.3),transparent); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }

  /* ══ GOTHIC DIVIDER ══ */
  .gothic-divider { display:flex; align-items:center; gap:14px; margin:0 0 26px; }
  .gothic-divider-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(92,26,142,0.5),rgba(139,0,0,0.35),transparent); animation:linePulse 4.5s ease-in-out infinite; }
  @keyframes linePulse { 0%,100%{opacity:0.25;} 50%{opacity:1;} }
  .gothic-divider-icon { font-size:15px; filter:drop-shadow(0 0 7px rgba(139,0,0,0.9)); animation:spinIcon 7s linear infinite; }
  @keyframes spinIcon { 0%,100%{transform:rotate(0deg) scale(1);} 50%{transform:rotate(180deg) scale(1.25);} }

  /* ══ STAT CARDS ══ */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  .stat-card {
    background:var(--card);
    border-radius:6px;
    border:1px solid var(--border2);
    border-top:2px solid rgba(92,26,142,0.55);
    padding:20px 22px;
    backdrop-filter:blur(12px);
    box-shadow:0 4px 24px rgba(0,0,0,0.6), 0 0 40px rgba(92,26,142,0.04);
    transition:all 0.35s ease;
    animation:fadeUp 0.5s ease both;
    position:relative; overflow:hidden;
  }
  .stat-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(92,26,142,0.7),rgba(139,0,0,0.5),transparent);
    animation:scanLine 3.5s ease-in-out infinite;
  }
  @keyframes scanLine { 0%,100%{opacity:0.2;} 50%{opacity:1;} }
  .stat-card::after {
    content:''; position:absolute; bottom:0; right:0; width:60px; height:60px;
    background:radial-gradient(circle,rgba(92,26,142,0.08),transparent);
    border-radius:50%;
  }
  .stat-card:hover {
    border-color:rgba(92,26,142,0.6);
    box-shadow:0 10px 35px rgba(92,26,142,0.2), 0 0 0 1px rgba(92,26,142,0.25);
    transform:translateY(-4px);
  }
  .stat-icon { font-size:22px; margin-bottom:10px; filter:drop-shadow(0 0 8px rgba(92,26,142,0.6)); }
  .stat-label { font-family:'MedievalSharp',cursive; font-size:9px; color:var(--muted); font-weight:700; letter-spacing:1.5px; margin-bottom:7px; }
  .stat-value { font-family:'UnifrakturMaguntia',cursive; font-size:30px; color:var(--amethyst); text-shadow:0 0 25px rgba(192,132,252,0.35); line-height:1; }
  .stat-sub { font-family:'Crimson Text',serif; font-size:12px; color:var(--muted); margin-top:5px; font-style:italic; }

  /* ══ CHARTS ══ */
  .charts-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px; }
  .chart-card {
    background:var(--card); border-radius:6px;
    border:1px solid var(--border2);
    padding:20px 22px; backdrop-filter:blur(12px);
    box-shadow:0 4px 24px rgba(0,0,0,0.55);
    transition:border-color 0.3s;
  }
  .chart-card:hover { border-color:rgba(92,26,142,0.4); }
  .chart-title { font-family:'MedievalSharp',cursive; font-size:10px; font-weight:700; color:var(--muted); letter-spacing:1.5px; margin-bottom:16px; }
  .bar-chart { display:flex; align-items:flex-end; gap:5px; height:88px; }
  .bar-col { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; }
  .bar { width:100%; border-radius:2px 2px 0 0; min-height:3px; transition:all 0.35s; }
  .bar:hover { filter:brightness(1.5); }
  .bar-label { font-size:8px; color:var(--muted); font-family:'Josefin Sans',sans-serif; }
  .donut-wrap { display:flex; align-items:center; gap:16px; }
  .donut-legend { display:flex; flex-direction:column; gap:8px; }
  .legend-item { display:flex; align-items:center; gap:7px; font-size:11px; font-family:'Crimson Text',serif; }
  .legend-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .goals-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .goal-item { display:flex; flex-direction:column; gap:6px; }
  .goal-header { display:flex; justify-content:space-between; font-size:11px; font-family:'Crimson Text',serif; }
  .progress-bar-bg { height:4px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; }
  .progress-bar-fill { height:100%; border-radius:3px; transition:width 0.9s ease; }

  /* ══ BUTTONS ══ */
  .add-btn {
    background:rgba(92,26,142,0.1);
    border:1px solid rgba(92,26,142,0.38); color:var(--amethyst);
    cursor:pointer; padding:10px 24px; border-radius:4px;
    font-family:'MedievalSharp',cursive; font-size:11px; font-weight:700;
    transition:all 0.28s; display:flex; align-items:center; gap:9px;
    margin-bottom:18px; position:relative; overflow:hidden;
    letter-spacing:1.5px;
  }
  .add-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#5c1a8e,#8b0000); opacity:0; transition:opacity 0.28s; }
  .add-btn:hover::before { opacity:1; }
  .add-btn:hover { color:white; box-shadow:0 0 28px rgba(92,26,142,0.5); transform:translateY(-2px); }
  .add-btn span { position:relative; z-index:1; }

  .btn-primary {
    background:linear-gradient(135deg,#5c1a8e,#8b0000); color:white;
    border:none; cursor:pointer; padding:10px 26px; border-radius:4px;
    font-size:11px; font-weight:700; font-family:'MedievalSharp',cursive;
    transition:all 0.28s; box-shadow:0 4px 18px rgba(92,26,142,0.35);
    letter-spacing:1px;
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(92,26,142,0.5); }
  .btn-secondary {
    background:rgba(255,255,255,0.03); border:1px solid var(--border2);
    color:var(--muted); cursor:pointer; padding:10px 26px; border-radius:4px;
    font-size:11px; font-weight:700; font-family:'MedievalSharp',cursive; transition:all 0.25s;
    letter-spacing:1px;
  }
  .btn-secondary:hover { border-color:var(--amethyst); color:var(--amethyst); }
  .btn-danger { background:rgba(139,0,0,0.12); border:1px solid rgba(139,0,0,0.28); color:#e06080; cursor:pointer; padding:8px 18px; border-radius:4px; font-size:11px; font-weight:700; font-family:'MedievalSharp',cursive; transition:all 0.2s; letter-spacing:1px; }
  .btn-edit   { background:rgba(92,26,142,0.12); border:1px solid rgba(92,26,142,0.28); color:var(--amethyst); cursor:pointer; padding:8px 18px; border-radius:4px; font-size:11px; font-weight:700; font-family:'MedievalSharp',cursive; transition:all 0.2s; letter-spacing:1px; }

  /* ══ MODAL ══ */
  .modal-overlay {
    position:fixed; inset:0; z-index:200; padding:20px;
    background:rgba(4,0,10,0.93); backdrop-filter:blur(16px);
    display:flex; align-items:center; justify-content:center;
  }
  .modal {
    background:rgba(10,2,20,0.97); border-radius:6px;
    border:1px solid rgba(92,26,142,0.38);
    border-top:2px solid rgba(92,26,142,0.7);
    width:100%; max-width:580px; max-height:90vh; overflow-y:auto;
    padding:30px; box-shadow:0 22px 65px rgba(0,0,0,0.85), 0 0 70px rgba(92,26,142,0.08);
    animation:popIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
    position:relative;
  }
  .modal::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,rgba(92,26,142,0.8),rgba(192,132,252,0.5),rgba(92,26,142,0.8),transparent);
    animation:scanLine 2.5s ease-in-out infinite;
  }
  @keyframes popIn { 0%{transform:scale(0.87) translateY(22px);opacity:0;} 100%{transform:scale(1) translateY(0);opacity:1;} }
  .modal-title { font-family:'UnifrakturMaguntia',cursive; font-size:22px; margin-bottom:22px; color:var(--amethyst); letter-spacing:3px; text-shadow:0 0 20px rgba(192,132,252,0.3); }
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .form-group { display:flex; flex-direction:column; gap:5px; }
  .form-group.full { grid-column:span 2; }
  .form-label { font-family:'MedievalSharp',cursive; font-size:9px; font-weight:700; color:var(--muted); letter-spacing:1.5px; }
  .form-input {
    padding:9px 13px; border-radius:4px;
    border:1px solid rgba(92,26,142,0.22);
    font-family:'Crimson Text',serif; font-size:14px;
    background:rgba(92,26,142,0.06); color:var(--text);
    outline:none; transition:all 0.22s;
  }
  .form-input:focus { border-color:var(--amethyst); box-shadow:0 0 0 3px rgba(192,132,252,0.1); }
  select.form-input { cursor:pointer; }
  select.form-input option { background:#0a0018; }
  textarea.form-input { resize:vertical; min-height:78px; }
  .star-select { display:flex; gap:7px; }
  .star-btn { background:none; border:none; cursor:pointer; font-size:20px; transition:transform 0.15s; }
  .star-btn:hover { transform:scale(1.35); }
  .modal-actions { display:flex; gap:10px; margin-top:22px; justify-content:flex-end; }

  /* ══ GALLERY ══ */
  .filter-bar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; align-items:center; }
  .filter-chip {
    padding:5px 16px; border-radius:20px;
    border:1px solid rgba(92,26,142,0.18);
    background:rgba(92,26,142,0.05); cursor:pointer;
    font-family:'MedievalSharp',cursive; font-size:10px; font-weight:700;
    color:var(--muted); transition:all 0.22s;
    letter-spacing:1px;
  }
  .filter-chip.active { background:rgba(92,26,142,0.2); border-color:rgba(92,26,142,0.5); color:var(--amethyst); box-shadow:0 0 14px rgba(92,26,142,0.22); }
  .filter-chip:hover:not(.active) { border-color:rgba(92,26,142,0.4); color:var(--amethyst); }

  .search-wrap { position:relative; }
  .search-input {
    padding:9px 16px 9px 42px; border-radius:24px;
    border:1px solid rgba(92,26,142,0.22);
    font-family:'Crimson Text',serif; font-size:14px; color:var(--text);
    background:rgba(92,26,142,0.05); outline:none; min-width:220px; transition:all 0.22s;
  }
  .search-input:focus { border-color:var(--amethyst); box-shadow:0 0 0 3px rgba(192,132,252,0.08); }
  .search-input::placeholder { color:var(--muted); }
  .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:15px; pointer-events:none; }

  .books-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:18px; }
  .book-card {
    background:var(--card); border-
