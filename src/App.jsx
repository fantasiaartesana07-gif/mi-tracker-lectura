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
    background:var(--card); border-radius:6px;
    border:1px solid var(--border2); overflow:hidden; cursor:pointer;
    transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow:0 4px 18px rgba(0,0,0,0.55);
    position:relative;
  }
  .book-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,#8b0000,#5c1a8e,#c084fc,#5c1a8e,#8b0000);
    opacity:0; transition:opacity 0.3s;
  }
  .book-card:hover::before { opacity:1; }
  .book-card:hover {
    transform:translateY(-10px) scale(1.02);
    border-color:rgba(92,26,142,0.5);
    box-shadow:0 18px 45px rgba(92,26,142,0.22), 0 0 0 1px rgba(92,26,142,0.28);
  }
  .book-cover {
    height:180px;
    background:linear-gradient(135deg,rgba(92,26,142,0.14),rgba(139,0,0,0.12));
    display:flex; align-items:center; justify-content:center;
    font-size:46px; position:relative; overflow:hidden;
  }
  .book-cover img { width:100%; height:100%; object-fit:cover; }
  .book-cover::after { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,transparent 50%,rgba(6,0,12,0.75)); }
  .book-state-badge {
    position:absolute; top:8px; right:8px; z-index:1;
    padding:3px 9px; border-radius:12px; font-size:10px; font-weight:700;
    color:white; backdrop-filter:blur(6px);
    background:rgba(92,26,142,0.7); border:1px solid rgba(92,26,142,0.5);
    font-family:'Josefin Sans',sans-serif; letter-spacing:0.5px;
  }
  .book-info { padding:12px 14px; }
  .book-title { font-weight:600; font-size:13px; color:var(--text); margin-bottom:3px; line-height:1.3; font-family:'UnifrakturMaguntia',cursive; }
  .book-author { font-size:11px; color:var(--muted); margin-bottom:7px; font-style:italic; font-family:'Crimson Text',serif; }
  .book-stars { display:flex; gap:2px; font-size:12px; }
  .book-genre { font-family:'MedievalSharp',cursive; font-size:9px; color:var(--amethyst); font-weight:700; letter-spacing:1px; margin-top:4px; }

  /* ══ DETAIL ══ */
  .detail-grid { display:grid; grid-template-columns:155px 1fr; gap:22px; }
  .detail-cover { width:155px; height:220px; border-radius:6px; border:1px solid var(--border2); background:linear-gradient(135deg,rgba(92,26,142,0.15),rgba(139,0,0,0.15)); display:flex; align-items:center; justify-content:center; font-size:58px; overflow:hidden; flex-shrink:0; }
  .detail-cover img { width:100%; height:100%; object-fit:cover; }
  .detail-meta { display:flex; flex-direction:column; gap:9px; }
  .detail-title { font-family:'UnifrakturMaguntia',cursive; font-size:22px; line-height:1.2; color:var(--text); }
  .detail-author { font-size:14px; color:var(--muted); font-style:italic; font-family:'Crimson Text',serif; }
  .detail-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 14px; border-radius:14px; font-family:'MedievalSharp',cursive; font-size:10px; font-weight:700; color:white; align-self:flex-start; background:rgba(92,26,142,0.28); border:1px solid rgba(92,26,142,0.4); letter-spacing:1px; }
  .tags-row { display:flex; gap:6px; flex-wrap:wrap; }
  .tag { padding:3px 11px; border-radius:12px; background:rgba(92,26,142,0.1); border:1px solid rgba(92,26,142,0.22); font-family:'MedievalSharp',cursive; font-size:9px; color:var(--muted); letter-spacing:1px; }
  .detail-section { margin-top:18px; padding-top:15px; border-top:1px solid rgba(92,26,142,0.15); }
  .detail-section-title { font-family:'MedievalSharp',cursive; font-size:10px; font-weight:700; color:var(--muted); letter-spacing:1.5px; margin-bottom:11px; }
  .detail-row { display:flex; gap:18px; flex-wrap:wrap; }
  .detail-item { display:flex; flex-direction:column; gap:2px; }
  .detail-item-label { font-family:'MedievalSharp',cursive; font-size:9px; color:var(--muted); letter-spacing:1px; }
  .detail-item-value { font-size:15px; font-weight:600; color:var(--text); font-family:'Cormorant Garamond',serif; }
  .progress-full { display:flex; flex-direction:column; gap:6px; margin-top:6px; }
  .review-text { font-family:'Cormorant Garamond',serif; font-size:15px; line-height:1.8; color:var(--muted); font-style:italic; padding:13px 15px; background:rgba(92,26,142,0.05); border-radius:4px; border-left:2px solid rgba(92,26,142,0.5); }
  .fav-phrases { display:flex; flex-direction:column; gap:7px; }
  .fav-phrase { font-family:'Cormorant Garamond',serif; font-size:13px; color:var(--gold); font-style:italic; padding:9px 13px; background:rgba(201,168,76,0.05); border-radius:4px; border-left:2px solid rgba(201,168,76,0.4); line-height:1.6; }
  .detail-actions { display:flex; gap:9px; margin-top:18px; flex-wrap:wrap; }

  /* ══ SESSIONS ══ */
  .sessions-layout { display:grid; grid-template-columns:1fr 1.45fr; gap:18px; }
  .session-form-card { background:var(--card); border-radius:6px; border:1px solid var(--border2); border-top:2px solid rgba(92,26,142,0.5); padding:24px; backdrop-filter:blur(12px); align-self:start; }
  .session-form-title { font-family:'UnifrakturMaguntia',cursive; font-size:20px; margin-bottom:18px; color:var(--amethyst); letter-spacing:3px; }
  .session-field { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
  .sessions-list-card { background:var(--card); border-radius:6px; border:1px solid var(--border2); padding:24px; backdrop-filter:blur(12px); }
  .session-row { display:grid; grid-template-columns:90px 1fr 60px 50px 32px; gap:8px; align-items:center; padding:9px 10px; border-radius:4px; border-bottom:1px solid rgba(92,26,142,0.08); font-size:12px; transition:background 0.2s; }
  .session-row:hover { background:rgba(92,26,142,0.06); }
  .session-header { font-family:'MedievalSharp',cursive; font-size:9px; font-weight:700; color:var(--muted); letter-spacing:1.5px; border-bottom:1px solid rgba(92,26,142,0.2) !important; }
  .session-book { color:var(--text); font-family:'Cormorant Garamond',serif; font-size:13px; }
  .session-time { color:var(--amethyst); font-weight:700; font-family:'MedievalSharp',cursive; font-size:10px; }
  .session-pages { color:var(--blood2); font-weight:700; font-family:'MedievalSharp',cursive; font-size:10px; }
  .delete-session { background:none; border:none; color:var(--muted); cursor:pointer; font-size:15px; transition:color 0.2s; padding:0; }
  .delete-session:hover { color:#e06080; }

  /* ══ EMPTY STATE ══ */
  .empty-state { text-align:center; padding:60px 20px; }
  .empty-icon { font-size:52px; margin-bottom:16px; filter:drop-shadow(0 0 14px rgba(92,26,142,0.5)); animation:floatIcon 3s ease-in-out infinite; }
  @keyframes floatIcon { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
  .empty-text { font-family:'Cormorant Garamond',serif; font-size:16px; color:var(--muted); font-style:italic; line-height:1.7; }

  /* ══ TOAST ══ */
  .toast {
    position:fixed; bottom:28px; right:28px; z-index:500;
    background:rgba(10,2,20,0.96); border:1px solid rgba(92,26,142,0.5);
    border-left:3px solid var(--amethyst);
    padding:12px 20px; border-radius:4px;
    font-family:'MedievalSharp',cursive; font-size:13px; color:var(--text);
    box-shadow:0 8px 30px rgba(92,26,142,0.3), 0 0 0 1px rgba(92,26,142,0.15);
    animation:toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    backdrop-filter:blur(12px);
  }
  @keyframes toastIn { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:translateX(0);} }


  /* ══ CANDLES ══ */
  .candle-layer { position:fixed; bottom:0; pointer-events:none; z-index:4; width:100%; }
  .candle-wrap { position:absolute; bottom:0; display:flex; flex-direction:column; align-items:center; }

  /* flame flicker */
  @keyframes flameDance {
    0%,100% { transform:scaleX(1) scaleY(1) rotate(-2deg); opacity:0.9; }
    25%     { transform:scaleX(0.85) scaleY(1.15) rotate(3deg); opacity:1; }
    50%     { transform:scaleX(1.1) scaleY(0.92) rotate(-4deg); opacity:0.85; }
    75%     { transform:scaleX(0.9) scaleY(1.1) rotate(2deg); opacity:0.95; }
  }
  @keyframes flameGlow {
    0%,100% { filter: drop-shadow(0 0 6px rgba(180,0,0,0.9)) drop-shadow(0 0 18px rgba(139,0,0,0.6)); }
    50%     { filter: drop-shadow(0 0 14px rgba(220,0,0,1)) drop-shadow(0 0 35px rgba(139,0,0,0.8)); }
  }
  @keyframes waxDrip {
    0%   { height:0px; opacity:0; }
    20%  { opacity:0.8; }
    80%  { height:var(--drip-h,18px); opacity:0.7; }
    100% { height:0; opacity:0; }
  }
  .candle-flame { animation: flameDance var(--fd,0.9s) ease-in-out infinite, flameGlow var(--fg,1.4s) ease-in-out infinite; transform-origin: bottom center; }
  .candle-glow  {
    position:absolute; border-radius:50%;
    background: radial-gradient(circle, rgba(180,0,0,0.35) 0%, transparent 70%);
    animation: flameGlow var(--fg,1.4s) ease-in-out infinite;
    pointer-events:none;
  }
  .wax-drip {
    position:absolute; width:var(--dw,4px); border-radius:0 0 3px 3px;
    background:rgba(30,5,5,0.85);
    animation:waxDrip var(--dd,5s) ease-in-out infinite;
    animation-delay:var(--ddelay,0s);
  }
  @keyframes candleSmoke {
    0%   { transform:translateY(0) translateX(0) scaleX(1); opacity:0.25; }
    100% { transform:translateY(-30px) translateX(var(--smx,4px)) scaleX(2); opacity:0; }
  }
  .candle-smoke { animation:candleSmoke var(--smd,2s) ease-out infinite; animation-delay:var(--sdelay,0s); }

  /* ══ RESPONSIVE ══ */
  @media(max-width:900px) {
    .stats-grid { grid-template-columns:1fr 1fr; }
    .charts-row { grid-template-columns:1fr; }
    .sessions-layout { grid-template-columns:1fr; }
  }
  @media(max-width:600px) {
    .stats-grid { grid-template-columns:1fr 1fr; }
    .topbar-logo { font-size:16px; }
    .nav-btn { padding:7px 10px; font-size:10px; letter-spacing:1px; }
    .main { padding:20px 14px; }
    .detail-grid { grid-template-columns:1fr; }
    .detail-cover { width:100%; height:200px; }
    .books-grid { grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); }
    .particle-layer { opacity:0.6; }
  }
`;

// ─── GOTHIC BACKGROUND COMPONENTS ────────────────────────────────────────────
function GothicBackground({ moonBrightness }) {
  return (
    <div className="gothic-bg" style={{
      opacity: 1,
      background: moonBrightness > 0.6
        ? `radial-gradient(ellipse at 18% 0%, rgba(139,0,0,0.18) 0%, transparent 52%),
           radial-gradient(ellipse at 82% 4%, rgba(120,60,170,0.2) 0%, transparent 48%),
           radial-gradient(ellipse at 50% 100%, rgba(120,60,170,0.16) 0%, transparent 48%),
           radial-gradient(ellipse at 50% 50%, rgba(60,20,80,0.12) 0%, transparent 55%),
           linear-gradient(180deg, #080010 0%, #100022 35%, #140028 65%, #0a0015 100%)`
        : undefined
    }}/>
  );
}

function ParticleLayer({ moonBrightness }) {
  const particles = useRef([]);
  if (particles.current.length === 0) {
    const runeSymbols = ['ᚱ','ᚢ','ᚾ','ᛖ','ᛗ','ᛚ','ᚦ','ᚨ','ᛒ','ᛏ','ᛉ','ᛋ','✦','✧','⛧','⁂','🥀','🌹','🦇','⚰️','🌙','💀','♱','⚜'];
    const colors = ['#8b0000','#5c1a8e','#c084fc','#c9a84c','#8b0000','#9b59b6','#a50020'];
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
    const count = isMobile ? 14 : 32;
    for (let i = 0; i < count; i++) {
      const sym = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
      const col = colors[Math.floor(Math.random() * colors.length)];
      const sz  = (11 + Math.random() * 16).toFixed(1);
      const glow= (4 + Math.random() * 7).toFixed(0);
      particles.current.push({
        key: i,
        sym,
        style: {
          '--col': col,
          '--dur': `${6 + Math.random() * 12}s`,
          '--pd':  `${2.5 + Math.random() * 3.5}s`,
          '--delay': `-${Math.random() * 14}s`,
          '--pdelay': `-${Math.random() * 4}s`,
          '--dx': `${(Math.random()*50-25).toFixed(0)}px`,
          '--dy': `${(Math.random()*-50-10).toFixed(0)}px`,
          '--rot':`${(Math.random()*360-180).toFixed(0)}deg`,
          '--sc': `${(0.7 + Math.random() * 0.8).toFixed(2)}`,
          '--fsz': `${sz}px`,
          '--glow':`${glow}px`,
          left: `${(Math.random()*96).toFixed(1)}%`,
          top:  `${(Math.random()*95).toFixed(1)}%`,
        }
      });
    }
  }
  const maxOp = 0.1 + moonBrightness * 0.75;
  return (
    <div className="particle-layer" style={{ '--max-op': maxOp }}>
      {particles.current.map(p => (
        <div key={p.key} className="particle" style={p.style}>{p.sym}</div>
      ))}
    </div>
  );
}

function DripLayer() {
  const drips = useRef([]);
  if (drips.current.length === 0) {
    for (let i = 0; i < 18; i++) {
      drips.current.push({
        key: i,
        style: {
          left: `${(Math.random()*96).toFixed(1)}%`,
          '--w': `${(2+Math.random()*3.5).toFixed(1)}px`,
          '--h': `${(55+Math.random()*65).toFixed(0)}px`,
          '--dur': `${(3.5+Math.random()*5).toFixed(1)}s`,
          '--delay': `${(Math.random()*6).toFixed(1)}s`,
          '--op': `${(0.35+Math.random()*0.45).toFixed(2)}`,
        }
      });
    }
  }
  return (
    <div className="drip-layer">
      {drips.current.map(d => <div key={d.key} className="drip" style={d.style}/>)}
    </div>
  );
}

function MistLayer() {
  return <><div className="mist-layer"/><div className="mist-layer2"/></>;
}

// ─── CURSOR RUNE TRAIL ────────────────────────────────────────────────────────
function CursorTrail() {
  const runeSymbols = ['ᚱ','ᚢ','ᛖ','✦','⛧','⁂','♱','✧','ᛋ','ᛉ','🩸'];
  const colors = ['#8b0000','#5c1a8e','#c084fc','#c9a84c','#9b59b6'];
  useEffect(() => {
    let lastTime = 0;
    const handle = (e) => {
      const now = Date.now();
      if (now - lastTime < 80) return;
      lastTime = now;
      const rune = document.createElement('div');
      rune.className = 'cursor-rune';
      const sym = runeSymbols[Math.floor(Math.random()*runeSymbols.length)];
      const col = colors[Math.floor(Math.random()*colors.length)];
      const sz  = 10 + Math.random()*8;
      const dur = (0.8 + Math.random()*0.5).toFixed(2);
      const mx  = (Math.random()*40-20).toFixed(0);
      const mr  = (Math.random()*360-180).toFixed(0);
      rune.textContent = sym;
      rune.style.cssText = `left:${e.clientX-8}px;top:${e.clientY-8}px;--col:${col};--sz:${sz}px;--d:${dur}s;--mx:${mx}px;--my:${-(20+Math.random()*30).toFixed(0)}px;--mr:${mr}deg;`;
      document.body.appendChild(rune);
      setTimeout(()=>rune.remove(), parseFloat(dur)*1000+100);
    };
    window.addEventListener('mousemove', handle);
    return ()=>window.removeEventListener('mousemove', handle);
  }, []);
  return null;
}

// ─── STARS ───────────────────────────────────────────────────────────────────
function Stars({ rating, onSet }) {
  return (
    <div className="book-stars">
      {RATINGS.map(r => (
        <span key={r}
          className="star-btn"
          onClick={onSet?()=>onSet(r):undefined}
          style={{cursor:onSet?"pointer":"default"}}
        >
          {r<=rating?"🩸":"🌑"}
        </span>
      ))}
    </div>
  );
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s,d)=>s+d.value,0);
  if (total===0) return <div style={{color:"var(--muted)",fontSize:12,fontStyle:"italic"}}>Sin datos aún...</div>;
  let acc = 0;
  const r=42, cx=50, cy=50, stroke=14;
  const circ=2*Math.PI*r;
  return (
    <div className="donut-wrap">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(92,26,142,0.1)" strokeWidth={stroke}/>
        {data.map((d,i)=>{
          const dash=(d.value/total)*circ;
          const seg=<circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-acc} strokeLinecap="butt"
            style={{transform:"rotate(-90deg)",transformOrigin:"50px 50px"}}
          />;
          acc+=dash;
          return seg;
        })}
        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
          style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"12px",fill:"var(--text)",fontWeight:700}}>
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((d,i)=>(
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{background:d.color}}/>
            <span style={{color:"var(--muted)"}}>{d.label}</span>
            <span style={{color:d.color,fontWeight:700,marginLeft:"auto"}}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d=>d.value),1);
  const barColors = ['#8b0000','#5c1a8e','#c084fc','#c9a84c','#9b59b6','#a50020','#7b3fa0'];
  return (
    <div className="bar-chart">
      {data.map((d,i)=>(
        <div key={i} className="bar-col">
          <div className="bar" style={{height:`${(d.value/max)*80}px`,background:barColors[i%barColors.length],boxShadow:`0 0 8px ${barColors[i%barColors.length]}55`}}/>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}



// ─── CANDLES ─────────────────────────────────────────────────────────────────
function Candles() {
  // positions: left side, right side, a few scattered
  const candles = [
    { left:"3%",  height:90, width:18, delay:0,    fdur:0.85, fgdur:1.3 },
    { left:"6%",  height:70, width:14, delay:0.2,  fdur:1.1,  fgdur:1.6 },
    { left:"9%",  height:110,width:22, delay:0.1,  fdur:0.95, fgdur:1.2 },
    { left:"91%", height:95, width:18, delay:0.3,  fdur:0.9,  fgdur:1.4 },
    { left:"94%", height:75, width:14, delay:0.15, fdur:1.05, fgdur:1.5 },
    { left:"97%", height:115,width:22, delay:0.05, fdur:0.8,  fgdur:1.1 },
  ];

  return (
    <div className="candle-layer">
      {candles.map((c, i) => {
        const flameW = c.width * 0.75;
        const flameH = c.width * 1.4;
        return (
          <div key={i} className="candle-wrap" style={{ left: c.left }}>
            {/* Glow behind flame */}
            <div className="candle-glow" style={{
              width: c.width * 5, height: c.width * 5,
              top: -c.width * 2.2, left: -c.width * 2,
              '--fg': `${c.fgdur}s`,
            }}/>

            {/* Smoke */}
            <svg width={c.width} height={30} viewBox={`0 0 ${c.width} 30`}
              className="candle-smoke"
              style={{ marginBottom:-2,'--smd':`${1.8+i*0.3}s`,'--sdelay':`${c.delay}s`,'--smx':`${i%2===0?4:-4}px` }}>
              <path d={`M${c.width/2} 28 Q${c.width/2+3} 18 ${c.width/2-2} 8 Q${c.width/2+1} 2 ${c.width/2} 0`}
                stroke="rgba(80,20,20,0.25)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>

            {/* Flame */}
            <svg width={flameW} height={flameH} viewBox="0 0 20 28"
              className="candle-flame"
              style={{'--fd':`${c.fdur}s`,'--fg':`${c.fgdur}s`}}>
              {/* outer flame */}
              <path d="M10 28 Q2 20 4 12 Q6 4 10 0 Q14 4 16 12 Q18 20 10 28Z"
                fill="rgba(180,0,0,0.9)"/>
              {/* mid flame */}
              <path d="M10 25 Q5 18 6 12 Q8 6 10 3 Q12 6 14 12 Q15 18 10 25Z"
                fill="rgba(220,60,0,0.85)"/>
              {/* inner bright */}
              <path d="M10 22 Q7 16 8 11 Q9 7 10 5 Q11 7 12 11 Q13 16 10 22Z"
                fill="rgba(255,180,0,0.7)"/>
              {/* core white */}
              <ellipse cx="10" cy="14" rx="2.5" ry="4" fill="rgba(255,240,200,0.5)"/>
            </svg>

            {/* Candle body */}
            <svg width={c.width} height={c.height} viewBox={`0 0 ${c.width} ${c.height}`}>
              {/* main wax */}
              <rect x="1" y="0" width={c.width-2} height={c.height} rx="3"
                fill="rgba(18,4,22,0.92)" stroke="rgba(139,0,0,0.3)" strokeWidth="1"/>
              {/* wax texture highlight */}
              <rect x="3" y="0" width="3" height={c.height} rx="1.5"
                fill="rgba(80,10,10,0.25)"/>
              {/* blood wax drips */}
              {[0.2, 0.45, 0.7].map((pos, di) => (
                <rect key={di}
                  x={c.width * pos} y={0}
                  width={2 + di} height={12 + di * 6}
                  rx="1" fill="rgba(139,0,0,0.6)"
                  style={{
                    animation:`waxDrip ${4+di*1.5}s ease-in-out infinite`,
                    animationDelay:`${c.delay + di * 0.8}s`,
                    '--drip-h':`${14+di*5}px`,
                    '--dw':`${2+di}px`,
                  }}
                />
              ))}
              {/* wick */}
              <line x1={c.width/2} y1={0} x2={c.width/2} y2={6}
                stroke="rgba(60,20,0,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
              {/* base */}
              <rect x="0" y={c.height-8} width={c.width} height={8} rx="2"
                fill="rgba(8,0,12,0.95)" stroke="rgba(92,26,142,0.25)" strokeWidth="1"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────// ─── CANDLES ─────────────────────────────────────────────────────────────────
function Candles() {
  // positions: left side, right side, a few scattered
  const candles = [
    { left:"3%",  height:90, width:18, delay:0,    fdur:0.85, fgdur:1.3 },
    { left:"6%",  height:70, width:14, delay:0.2,  fdur:1.1,  fgdur:1.6 },
    { left:"9%",  height:110,width:22, delay:0.1,  fdur:0.95, fgdur:1.2 },
    { left:"91%", height:95, width:18, delay:0.3,  fdur:0.9,  fgdur:1.4 },
    { left:"94%", height:75, width:14, delay:0.15, fdur:1.05, fgdur:1.5 },
    { left:"97%", height:115,width:22, delay:0.05, fdur:0.8,  fgdur:1.1 },
  ];

  return (
    <div className="candle-layer">
      {candles.map((c, i) => {
        const flameW = c.width * 0.75;
        const flameH = c.width * 1.4;
        return (
          <div key={i} className="candle-wrap" style={{ left: c.left }}>
            {/* Glow behind flame */}
            <div className="candle-glow" style={{
              width: c.width * 5, height: c.width * 5,
              top: -c.width * 2.2, left: -c.width * 2,
              '--fg': `${c.fgdur}s`,
            }}/>

            {/* Smoke */}
            <svg width={c.width} height={30} viewBox={`0 0 ${c.width} 30`}
              className="candle-smoke"
              style={{ marginBottom:-2,'--smd':`${1.8+i*0.3}s`,'--sdelay':`${c.delay}s`,'--smx':`${i%2===0?4:-4}px` }}>
              <path d={`M${c.width/2} 28 Q${c.width/2+3} 18 ${c.width/2-2} 8 Q${c.width/2+1} 2 ${c.width/2} 0`}
                stroke="rgba(80,20,20,0.25)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>

            {/* Flame */}
            <svg width={flameW} height={flameH} viewBox="0 0 20 28"
              className="candle-flame"
              style={{'--fd':`${c.fdur}s`,'--fg':`${c.fgdur}s`}}>
              {/* outer flame */}
              <path d="M10 28 Q2 20 4 12 Q6 4 10 0 Q14 4 16 12 Q18 20 10 28Z"
                fill="rgba(180,0,0,0.9)"/>
              {/* mid flame */}
              <path d="M10 25 Q5 18 6 12 Q8 6 10 3 Q12 6 14 12 Q15 18 10 25Z"
                fill="rgba(220,60,0,0.85)"/>
              {/* inner bright */}
              <path d="M10 22 Q7 16 8 11 Q9 7 10 5 Q11 7 12 11 Q13 16 10 22Z"
                fill="rgba(255,180,0,0.7)"/>
              {/* core white */}
              <ellipse cx="10" cy="14" rx="2.5" ry="4" fill="rgba(255,240,200,0.5)"/>
            </svg>

            {/* Candle body */}
            <svg width={c.width} height={c.height} viewBox={`0 0 ${c.width} ${c.height}`}>
              {/* main wax */}
              <rect x="1" y="0" width={c.width-2} height={c.height} rx="3"
                fill="rgba(18,4,22,0.92)" stroke="rgba(139,0,0,0.3)" strokeWidth="1"/>
              {/* wax texture highlight */}
              <rect x="3" y="0" width="3" height={c.height} rx="1.5"
                fill="rgba(80,10,10,0.25)"/>
              {/* blood wax drips */}
              {[0.2, 0.45, 0.7].map((pos, di) => (
                <rect key={di}
                  x={c.width * pos} y={0}
                  width={2 + di} height={12 + di * 6}
                  rx="1" fill="rgba(139,0,0,0.6)"
                  style={{
                    animation:`waxDrip ${4+di*1.5}s ease-in-out infinite`,
                    animationDelay:`${c.delay + di * 0.8}s`,
                    '--drip-h':`${14+di*5}px`,
                    '--dw':`${2+di}px`,
                  }}
                />
              ))}
              {/* wick */}
              <line x1={c.width/2} y1={0} x2={c.width/2} y2={6}
                stroke="rgba(60,20,0,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
              {/* base */}
              <rect x="0" y={c.height-8} width={c.width} height={8} rx="2"
                fill="rgba(8,0,12,0.95)" stroke="rgba(92,26,142,0.25)" strokeWidth="1"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}


// ─── TOAST ───────────────────────────────────────────────────────────────────// ─── CANDLES ─────────────────────────────────────────────────────────────────
function Candles() {
  // positions: left side, right side, a few scattered
  const candles = [
    { left:"3%",  height:90, width:18, delay:0,    fdur:0.85, fgdur:1.3 },
    { left:"6%",  height:70, width:14, delay:0.2,  fdur:1.1,  fgdur:1.6 },
    { left:"9%",  height:110,width:22, delay:0.1,  fdur:0.95, fgdur:1.2 },
    { left:"91%", height:95, width:18, delay:0.3,  fdur:0.9,  fgdur:1.4 },
    { left:"94%", height:75, width:14, delay:0.15, fdur:1.05, fgdur:1.5 },
    { left:"97%", height:115,width:22, delay:0.05, fdur:0.8,  fgdur:1.1 },
  ];

  return (
    <div className="candle-layer">
      {candles.map((c, i) => {
        const flameW = c.width * 0.75;
        const flameH = c.width * 1.4;
        return (
          <div key={i} className="candle-wrap" style={{ left: c.left }}>
            {/* Glow behind flame */}
            <div className="candle-glow" style={{
              width: c.width * 5, height: c.width * 5,
              top: -c.width * 2.2, left: -c.width * 2,
              '--fg': `${c.fgdur}s`,
            }}/>

            {/* Smoke */}
            <svg width={c.width} height={30} viewBox={`0 0 ${c.width} 30`}
              className="candle-smoke"
              style={{ marginBottom:-2,'--smd':`${1.8+i*0.3}s`,'--sdelay':`${c.delay}s`,'--smx':`${i%2===0?4:-4}px` }}>
              <path d={`M${c.width/2} 28 Q${c.width/2+3} 18 ${c.width/2-2} 8 Q${c.width/2+1} 2 ${c.width/2} 0`}
                stroke="rgba(80,20,20,0.25)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>

            {/* Flame */}
            <svg width={flameW} height={flameH} viewBox="0 0 20 28"
              className="candle-flame"
              style={{'--fd':`${c.fdur}s`,'--fg':`${c.fgdur}s`}}>
              {/* outer flame */}
              <path d="M10 28 Q2 20 4 12 Q6 4 10 0 Q14 4 16 12 Q18 20 10 28Z"
                fill="rgba(180,0,0,0.9)"/>
              {/* mid flame */}
              <path d="M10 25 Q5 18 6 12 Q8 6 10 3 Q12 6 14 12 Q15 18 10 25Z"
                fill="rgba(220,60,0,0.85)"/>
              {/* inner bright */}
              <path d="M10 22 Q7 16 8 11 Q9 7 10 5 Q11 7 12 11 Q13 16 10 22Z"
                fill="rgba(255,180,0,0.7)"/>
              {/* core white */}
              <ellipse cx="10" cy="14" rx="2.5" ry="4" fill="rgba(255,240,200,0.5)"/>
            </svg>

            {/* Candle body */}
            <svg width={c.width} height={c.height} viewBox={`0 0 ${c.width} ${c.height}`}>
              {/* main wax */}
              <rect x="1" y="0" width={c.width-2} height={c.height} rx="3"
                fill="rgba(18,4,22,0.92)" stroke="rgba(139,0,0,0.3)" strokeWidth="1"/>
              {/* wax texture highlight */}
              <rect x="3" y="0" width="3" height={c.height} rx="1.5"
                fill="rgba(80,10,10,0.25)"/>
              {/* blood wax drips */}
              {[0.2, 0.45, 0.7].map((pos, di) => (
                <rect key={di}
                  x={c.width * pos} y={0}
                  width={2 + di} height={12 + di * 6}
                  rx="1" fill="rgba(139,0,0,0.6)"
                  style={{
                    animation:`waxDrip ${4+di*1.5}s ease-in-out infinite`,
                    animationDelay:`${c.delay + di * 0.8}s`,
                    '--drip-h':`${14+di*5}px`,
                    '--dw':`${2+di}px`,
                  }}
                />
              ))}
              {/* wick */}
              <line x1={c.width/2} y1={0} x2={c.width/2} y2={6}
                stroke="rgba(60,20,0,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
              {/* base */}
              <rect x="0" y={c.height-8} width={c.width} height={8} rx="2"
                fill="rgba(8,0,12,0.95)" stroke="rgba(92,26,142,0.25)" strokeWidth="1"/>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ─── BLOOD EYE ───────────────────────────────────────────────────────────────

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2800); return()=>clearTimeout(t); },[]);
  return <div className="toast">🩸 {msg}</div>;
}

// ─── BOOK FORM ───────────────────────────────────────────────────────────────
function BookForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial||{
    title:"",author:"",genre:"Fantasía",state:"Pendiente",
    rating:0,pages:"",currentPage:"",saga:"",format:"Físico",
    startDate:"",endDate:"",tags:"",review:"",favPhrases:"",coverUrl:""
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const handleSave=()=>{
    if(!form.title.trim()) return alert("El título es obligatorio");
    onSave({...form,id:initial?.id||Date.now().toString()});
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">🩸 {initial?"Editar tomo":"Añadir tomo oscuro"}</div>
        <div className="form-grid">
          <div className="form-group full"><label className="form-label">Título *</label><input className="form-input" value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Título del libro"/></div>
          <div className="form-group"><label className="form-label">Autor</label><input className="form-input" value={form.author} onChange={e=>set("author",e.target.value)} placeholder="Autor"/></div>
          <div className="form-group"><label className="form-label">Género</label><select className="form-input" value={form.genre} onChange={e=>set("genre",e.target.value)}>{GENRES.map(g=><option key={g}>{g}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Estado</label><select className="form-input" value={form.state} onChange={e=>set("state",e.target.value)}>{STATES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Formato</label><select className="form-input" value={form.format} onChange={e=>set("format",e.target.value)}>{["Físico","Digital","Audiolibro"].map(f=><option key={f}>{f}</option>)}</select></div>
          <div className="form-group"><label className="form-label">Total páginas</label><input className="form-input" type="number" value={form.pages} onChange={e=>set("pages",e.target.value)} placeholder="0"/></div>
          <div className="form-group"><label className="form-label">Página actual</label><input className="form-input" type="number" value={form.currentPage} onChange={e=>set("currentPage",e.target.value)} placeholder="0"/></div>
          <div className="form-group"><label className="form-label">Saga</label><input className="form-input" value={form.saga} onChange={e=>set("saga",e.target.value)} placeholder="Nombre de la saga"/></div>
          <div className="form-group"><label className="form-label">Calificación 🩸</label><Stars rating={form.rating} onSet={v=>set("rating",v)}/></div>
          <div className="form-group"><label className="form-label">Fecha inicio</label><input className="form-input" type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Fecha fin</label><input className="form-input" type="date" value={form.endDate} onChange={e=>set("endDate",e.target.value)}/></div>
          <div className="form-group full"><label className="form-label">URL portada</label><input className="form-input" value={form.coverUrl} onChange={e=>set("coverUrl",e.target.value)} placeholder="https://..."/></div>
          <div className="form-group full"><label className="form-label">Tags (separados por coma)</label><input className="form-input" value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="Vampiros, Oscuridad, Magia..."/></div>
          <div className="form-group full"><label className="form-label">Reseña oscura</label><textarea className="form-input" value={form.review} onChange={e=>set("review",e.target.value)} placeholder="Escribe tu reseña..."/></div>
          <div className="form-group full"><label className="form-label">Frases que helaron tu sangre (una por línea)</label><textarea className="form-input" value={form.favPhrases} onChange={e=>set("favPhrases",e.target.value)} placeholder="Las frases que te marcaron..."/></div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Escapar</button>
          <button className="btn-primary" onClick={handleSave}>Sellar con sangre 🩸</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOK DETAIL ─────────────────────────────────────────────────────────────
function BookDetail({ book, onClose, onEdit, onDelete }) {
  const pct   = book.pages>0 ? Math.round((Number(book.currentPage)/Number(book.pages))*100) : 0;
  const phrases = book.favPhrases ? book.favPhrases.split("\n").filter(Boolean) : [];
  const tags    = book.tags ? book.tags.split(",").map(t=>t.trim()).filter(Boolean) : [];
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:680}}>
        <div className="detail-grid">
          <div className="detail-cover">{book.coverUrl?<img src={book.coverUrl} alt={book.title} onError={e=>e.target.style.display="none"}/>:"📖"}</div>
          <div className="detail-meta">
            <div className="detail-title">{book.title}</div>
            <div className="detail-author">{book.author}</div>
            <div className="detail-badge">{STATE_ICONS[book.state]} {book.state}</div>
            <Stars rating={book.rating}/>
            <div style={{fontFamily:"'MedievalSharp',cursive",fontSize:9,color:"var(--muted)",letterSpacing:"1px"}}>{book.genre}{book.saga&&` · ${book.saga}`} · {book.format}</div>
            {tags.length>0&&<div className="tags-row">{tags.map((t,i)=><span key={i} className="tag">{t}</span>)}</div>}
          </div>
        </div>
        {book.pages>0&&(
          <div className="detail-section">
            <div className="detail-section-title">Avance en las tinieblas</div>
            <div className="detail-row" style={{marginBottom:12}}>
              <div className="detail-item"><span className="detail-item-label">Páginas</span><span className="detail-item-value">{book.currentPage||0} / {book.pages}</span></div>
              {book.startDate&&<div className="detail-item"><span className="detail-item-label">Inicio</span><span className="detail-item-value">{book.startDate}</span></div>}
              {book.endDate&&<div className="detail-item"><span className="detail-item-label">Sellado</span><span className="detail-item-value">{book.endDate}</span></div>}
            </div>
            <div className="progress-full">
              <div style={{display:"flex",justifyContent:"space-between",fontFamily:"'MedievalSharp',cursive",fontSize:9,color:"var(--muted)",letterSpacing:"1px"}}>
                <span>{pct}% consumido</span>
                <span style={{color:"var(--amethyst)",fontWeight:700}}>{pct===100?"⚰️ Sellado":"🩸 "+`${Number(book.pages)-Number(book.currentPage||0)} págs. restantes`}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{width:`${pct}%`,background:"linear-gradient(90deg,#8b0000,#5c1a8e,#c084fc)",boxShadow:"0 0 12px rgba(92,26,142,0.5)"}}/>
              </div>
            </div>
          </div>
        )}
        {book.review&&<div className="detail-section"><div className="detail-section-title">Reseña oscura</div><div className="review-text">{book.review}</div></div>}
        {phrases.length>0&&<div className="detail-section"><div className="detail-section-title">Frases que helaron la sangre</div><div className="fav-phrases">{phrases.map((p,i)=><div key={i} className="fav-phrase">"{p}"</div>)}</div></div>}
        <div className="detail-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar cripta</button>
          <button className="btn-edit" onClick={()=>onEdit(book)}>✏️ Editar</button>
          <button className="btn-danger" onClick={()=>{if(confirm("¿Eliminar este tomo para siempre?"))onDelete(book.id);}}>🥀 Destruir</button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ books, sessions, moonPhase }) {
  const finished  = books.filter(b=>b.state==="Terminado").length;
  const reading   = books.filter(b=>b.state==="En lectura").length;
  const pending   = books.filter(b=>b.state==="Pendiente").length;
  const abandoned = books.filter(b=>b.state==="Abandonado").length;
  const totalPg   = sessions.reduce((s,ss)=>s+(Number(ss.pages)||0),0);
  const totalMin  = sessions.reduce((s,ss)=>s+(Number(ss.minutes)||0),0);
  const avgR      = books.filter(b=>b.rating>0).length
    ? (books.filter(b=>b.rating>0).reduce((s,b)=>s+b.rating,0)/books.filter(b=>b.rating>0).length).toFixed(1):"—";
  const months    = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const bpm       = months.map((label,mi)=>({label,value:books.filter(b=>b.endDate&&new Date(b.endDate).getMonth()===mi).length}));
  const genreData = GENRES.map(g=>({label:g.slice(0,4),value:books.filter(b=>b.genre===g).length})).filter(d=>d.value>0);
  const moonNames = ["Luna nueva","Luna creciente","Cuarto creciente","Gibosa creciente","Luna llena","Gibosa menguante","Cuarto menguante","Luna menguante"];

  const statCards = [
    {icon:"⚰️", label:"Tomos sellados",      value:finished,               sub:`de ${books.length} en la cripta`},
    {icon:"📜", label:"Páginas devoradas",    value:totalPg.toLocaleString(),sub:`en ${sessions.length} rituales`},
    {icon:"🕯️", label:"Horas en las sombras",value:`${Math.floor(totalMin/60)}h`,sub:`${totalMin%60} minutos`},
    {icon:"🩸", label:"Calificación media",   value:`${avgR}`,              sub:`sobre ${books.filter(b=>b.rating>0).length} tomos`},
  ];

  return (
    <>
      <div className="gothic-divider">
        <div className="gothic-divider-line"/>
        <div className="gothic-divider-icon">♱</div>
        <div className="gothic-divider-line"/>
      </div>

      {/* Luna fase banner */}
      <div style={{
        background:"rgba(92,26,142,0.07)", border:"1px solid rgba(92,26,142,0.2)",
        borderRadius:6, padding:"14px 20px", marginBottom:20,
        display:"flex", alignItems:"center", gap:14,
        backdropFilter:"blur(10px)", animation:"fadeUp 0.5s ease both"
      }}>
        <span style={{fontSize:28, filter:"drop-shadow(0 0 12px rgba(201,168,76,0.9))"}}>
          {moonPhase.emoji}
        </span>
        <div>
          <div style={{fontFamily:"'UnifrakturMaguntia',cursive",fontSize:17,color:"var(--moonsilver)"}}>
            {moonNames[moonPhase.idx]}
          </div>
          <div style={{fontFamily:"'MedievalSharp',cursive",fontSize:9,color:"var(--muted)",letterSpacing:"1.5px",marginTop:3}}>
            {moonPhase.brightness === 1 ? "⚡ Poder máximo — noche de luna llena" :
             moonPhase.brightness === 0 ? "🌑 Luna nueva — la oscuridad es absoluta" :
             `Brillo lunar ${Math.round(moonPhase.brightness*100)}%`}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((s,i)=>(
          <div key={i} className="stat-card" style={{animationDelay:`${i*0.09}s`}}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">🌙 Estado de los tomos</div>
          <DonutChart data={[
            {label:"Terminados",  value:finished,  color:"#8b0000"},
            {label:"Leyendo",     value:reading,   color:"#5c1a8e"},
            {label:"Pendientes",  value:pending,   color:"#9b59b6"},
            {label:"Abandonados", value:abandoned, color:"#3a1050"},
          ].filter(d=>d.value>0)}/>
        </div>
        <div className="chart-card">
          <div className="chart-title">🦇 Tomos por mes</div>
          <BarChart data={bpm}/>
        </div>
        <div className="chart-card">
          <div className="chart-title">⚰️ Por género</div>
          {genreData.length>0 ? <BarChart data={genreData}/> :
            <div style={{color:"var(--muted)",fontSize:13,fontStyle:"italic",fontFamily:"'Crimson Text',serif"}}>Las sombras aguardan...</div>}
        </div>
      </div>

      <div className="charts-row" style={{gridTemplateColumns:"1fr 1fr"}}>
        <div className="chart-card">
          <div className="chart-title">📖 Formatos</div>
          <DonutChart data={[
            {label:"Físico",  value:books.filter(b=>b.format==="Físico").length,     color:"#8b0000"},
            {label:"Digital", value:books.filter(b=>b.format==="Digital").length,    color:"#5c1a8e"},
            {label:"Audio",   value:books.filter(b=>b.format==="Audiolibro").length, color:"#c9a84c"},
          ].filter(d=>d.value>0)}/>
        </div>
        <div className="chart-card">
          <div className="chart-title">🩸 En progreso</div>
          {books.filter(b=>b.state==="En lectura").length===0
            ? <div style={{color:"var(--muted)",fontSize:13,fontStyle:"italic",fontFamily:"'Crimson Text',serif"}}>Ningún tomo abierto...</div>
            : <div className="goals-grid">
                {books.filter(b=>b.state==="En lectura").map(b=>{
                  const pct=b.pages>0?Math.round((Number(b.currentPage||0)/Number(b.pages))*100):0;
                  return (
                    <div key={b.id} className="goal-item">
                      <div className="goal-header">
                        <span style={{fontFamily:"'UnifrakturMaguntia',cursive",fontSize:13}}>{b.title.slice(0,20)}{b.title.length>20?"…":""}</span>
                        <span style={{color:"var(--muted)"}}>{pct}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{width:`${pct}%`,background:"linear-gradient(90deg,#8b0000,#5c1a8e,#c084fc)",boxShadow:"0 0 8px rgba(92,26,142,0.4)"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>
    </>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
function Gallery({ books, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editBook, setEditBook] = useState(null);
  const filtered = books.filter(b=>{
    const ms = filter==="Todos"||b.state===filter;
    const mq = b.title.toLowerCase().includes(search.toLowerCase())||(b.author||"").toLowerCase().includes(search.toLowerCase());
    return ms&&mq;
  });
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
        <button className="add-btn" onClick={onAdd}><span>🩸 Añadir tomo</span></button>
        <div className="search-wrap">
          <span className="search-icon">🔮</span>
          <input className="search-input" placeholder="Buscar en la cripta..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>
      <div className="filter-bar">
        {["Todos",...STATES].map(f=>(
          <button key={f} className={`filter-chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
            {f==="Todos"?"🌙 Todos":`${STATE_ICONS[f]} ${f}`}
          </button>
        ))}
      </div>
      {filtered.length===0
        ? <div className="empty-state"><div className="empty-icon">🥀</div><div className="empty-text">La cripta está vacía...<br/>Añade tu primer tomo oscuro</div></div>
        : <div className="books-grid">
            {filtered.map(book=>(
              <div key={book.id} className="book-card" onClick={()=>setSelected(book)}>
                <div className="book-cover">
                  {book.coverUrl?<img src={book.coverUrl} alt={book.title} onError={e=>{e.target.style.display="none";}}/>:"📖"}
                  <div className="book-state-badge">{STATE_ICONS[book.state]}</div>
                </div>
                <div className="book-info">
                  <div className="book-title">{book.title}</div>
                  <div className="book-author">{book.author}</div>
                  <Stars rating={book.rating}/>
                  <div className="book-genre">{book.genre}</div>
                </div>
              </div>
            ))}
          </div>
      }
      {selected&&<BookDetail book={selected} onClose={()=>setSelected(null)} onEdit={b=>{setSelected(null);setEditBook(b);}} onDelete={id=>{onDelete(id);setSelected(null);}}/>}
      {editBook&&<BookForm initial={editBook} onSave={b=>{onEdit(b);setEditBook(null);}} onClose={()=>setEditBook(null)}/>}
    </div>
  );
}

// ─── SESSIONS ────────────────────────────────────────────────────────────────
function Sessions({ books, sessions, onAdd, onDelete }) {
  const [form, setForm] = useState({bookId:books[0]?.id||"",date:new Date().toISOString().slice(0,10),startTime:"",endTime:"",startPage:"",endPage:"",notes:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const calcMin=()=>{
    if(!form.startTime||!form.endTime) return 0;
    const[sh,sm]=form.startTime.split(":").map(Number);
    const[eh,em]=form.endTime.split(":").map(Number);
    return Math.max(0,(eh*60+em)-(sh*60+sm));
  };
  const handleAdd=()=>{
    if(!form.bookId||!form.date) return alert("Selecciona un tomo y una fecha");
    const book=books.find(b=>b.id===form.bookId);
    const minutes=calcMin();
    const pages=Math.max(0,Number(form.endPage||0)-Number(form.startPage||0));
    onAdd({id:Date.now().toString(),bookId:form.bookId,bookTitle:book?.title||"Desconocido",date:form.date,startTime:form.startTime,endTime:form.endTime,startPage:form.startPage,endPage:form.endPage,minutes,pages,notes:form.notes,speed:minutes>0&&pages>0?((pages/minutes)*60).toFixed(1):"—"});
    setForm(f=>({...f,startTime:"",endTime:"",startPage:"",endPage:"",notes:""}));
  };
  const sorted=[...sessions].sort((a,b)=>b.date.localeCompare(a.date));
  const min=calcMin(), pg=Math.max(0,Number(form.endPage||0)-Number(form.startPage||0));
  return (
    <div className="sessions-layout">
      <div className="session-form-card">
        <div className="session-form-title">🩸 Nuevo ritual</div>
        <div className="session-field"><label className="form-label">Tomo</label>
          <select className="form-input" value={form.bookId} onChange={e=>set("bookId",e.target.value)}>
            {books.length===0&&<option value="">— Añade un tomo primero —</option>}
            {books.map(b=><option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>
        <div className="session-field"><label className="form-label">Fecha</label><input className="form-input" type="date" value={form.date} onChange={e=>set("date",e.target.value)}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="session-field"><label className="form-label">Hora inicio</label><input className="form-input" type="time" value={form.startTime} onChange={e=>set("startTime",e.target.value)}/></div>
          <div className="session-field"><label className="form-label">Hora fin</label><input className="form-input" type="time" value={form.endTime} onChange={e=>set("endTime",e.target.value)}/></div>
          <div className="session-field"><label className="form-label">Pág. inicio</label><input className="form-input" type="number" value={form.startPage} onChange={e=>set("startPage",e.target.value)} placeholder="0"/></div>
          <div className="session-field"><label className="form-label">Pág. fin</label><input className="form-input" type="number" value={form.endPage} onChange={e=>set("endPage",e.target.value)} placeholder="0"/></div>
        </div>
        {(form.startTime&&form.endTime)&&(
          <div style={{padding:"11px 14px",background:"rgba(92,26,142,0.07)",borderRadius:4,marginBottom:12,fontSize:13,border:"1px solid rgba(92,26,142,0.2)",color:"var(--amethyst)",fontFamily:"'Crimson Text',serif"}}>
            🩸 <strong>{min} min</strong> · 📖 <strong>{pg} páginas</strong>
            {min>0&&pg>0&&<> · ⚡ <strong>{((pg/min)*60).toFixed(1)} pág/h</strong></>}
          </div>
        )}
        <div className="session-field"><label className="form-label">Notas del ritual</label><input className="form-input" value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Comentario opcional..."/></div>
        <button className="btn-primary" onClick={handleAdd} style={{width:"100%"}}>Sellar ritual 🩸</button>
      </div>
      <div className="sessions-list-card">
        <div style={{fontFamily:"'UnifrakturMaguntia',cursive",fontSize:16,color:"var(--amethyst)",marginBottom:18,letterSpacing:3}}>Pergaminos de rituales</div>
        {sorted.length===0
          ? <div className="empty-state" style={{padding:"40px 0"}}><div className="empty-icon">📜</div><div className="empty-text">Sin rituales registrados...</div></div>
          : <>
              <div className="session-row session-header"><span>Fecha</span><span>Tomo</span><span>Tiempo</span><span>Págs.</span><span></span></div>
              {sorted.map(s=>(
                <div key={s.id} className="session-row">
                  <span style={{color:"var(--muted)",fontFamily:"'MedievalSharp',cursive",fontSize:10}}>{s.date}</span>
                  <span className="session-book">{(s.bookTitle||"").slice(0,22)}{(s.bookTitle||"").length>22?"…":""}</span>
                  <span className="session-time">{s.minutes}m</span>
                  <span className="session-pages">{s.pages}p</span>
                  <button className="delete-session" onClick={()=>onDelete(s.id)}>×</button>
                </div>
              ))}
            </>
        }
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,      setTab]      = useState("dashboard");
  const [books,    setBooks]    = useState(()=>loadBooks());
  const [sessions, setSessions] = useState(()=>loadSessions());
  const [showAdd,  setShowAdd]  = useState(false);
  const [toast,    setToast]    = useState("");
  const moonPhase = getMoonPhase();
  const moonNames = ["Luna nueva","Luna creciente","Cuarto creciente","Gibosa creciente","Luna llena","Gibosa menguante","Cuarto menguante","Luna menguante"];

  useEffect(()=>{ saveBooks(books); },    [books]);
  useEffect(()=>{ saveSessions(sessions); },[sessions]);

  const addBook     = b  => { setBooks(p=>[...p,b]); setShowAdd(false); setToast(`"${b.title}" sellado en la cripta`); };
  const editBook    = b  => { setBooks(p=>p.map(x=>x.id===b.id?b:x)); setToast("Tomo actualizado"); };
  const deleteBook  = id => { setBooks(p=>p.filter(b=>b.id!==id)); setToast("Tomo destruido para siempre..."); };
  const addSession  = s  => { setSessions(p=>[...p,s]); setToast(`Ritual sellado — ${s.pages} páginas devoradas`); };
  const delSession  = id => { setSessions(p=>p.filter(s=>s.id!==id)); };

  const TABS = [
    {id:"dashboard",label:"🌙 Cripta"},
    {id:"gallery",  label:"📚 Tomos"},
    {id:"sessions", label:"🩸 Rituales"},
  ];

  return (
    <>
      <style>{styles}</style>
      <GothicBackground moonBrightness={moonPhase.brightness}/>
      <ParticleLayer moonBrightness={moonPhase.brightness}/>
      <DripLayer/>
      <MistLayer/>
      <CursorTrail/>
      <Candles/>
      {toast&&<Toast msg={toast} onDone={()=>setToast("")}/>}
      <div className="app">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">⚰️ Cripta de Lectura</div>
            <div className="moon-display">
              <span className="moon-emoji">{moonPhase.emoji}</span>
              <span className="moon-name">{moonNames[moonPhase.idx]}</span>
            </div>
          </div>
          <nav className="nav">
            {TABS.map(t=>(
              <button key={t.id} className={`nav-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="main">
          {tab==="dashboard"&&<><div className="section-title font-fraktur">𝔓𝔞𝔫𝔢𝔩 𝔡𝔢 𝔩𝔞 𝔈𝔱𝔢𝔯𝔫𝔦𝔡𝔞𝔡</div><Dashboard books={books} sessions={sessions} moonPhase={moonPhase}/></>}
          {tab==="gallery"  &&<><div className="section-title font-fraktur">𝔏𝔞 𝔅𝔦𝔟𝔩𝔦𝔬𝔱𝔢𝔠𝔞 𝔒𝔰𝔠𝔲𝔯𝔞</div><Gallery books={books} onAdd={()=>setShowAdd(true)} onEdit={editBook} onDelete={deleteBook}/></>}
          {tab==="sessions" &&<><div className="section-title font-fraktur">𝔏𝔬𝔰 𝔊𝔯𝔞𝔫𝔡𝔢𝔰 𝔯𝔦𝔱𝔲𝔞𝔩𝔢𝔰</div><Sessions books={books} sessions={sessions} onAdd={addSession} onDelete={delSession}/></>}
        </div>
        {showAdd&&<BookForm onSave={addBook} onClose={()=>setShowAdd(false)}/>}
      </div>
    </>
  );
}

export { App as CriptaDeLectura };
export default App;
