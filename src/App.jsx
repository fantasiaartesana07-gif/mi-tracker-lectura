import { useState, useEffect } from "react";

// Fuentes místicas y estilos góticos embebidos idénticos al video
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');`;

const GENRES = ["Fantasía", "Romance", "Thriller", "Ciencia Ficción", "Drama", "BL/GL", "Filosófica", "Aventura", "Histórica", "Terror"];
const STATES = ["Pendiente", "En lectura", "Terminado", "Abandonado"];
const RATINGS = [1, 2, 3, 4, 5];

const STATE_COLORS = {
  "Pendiente": "#9d4edf",
  "En lectura": "#3b82f6",
  "Terminado": "#a91d22",
  "Abandonado": "#5a5266",
};

const STATE_ICONS = {
  "Pendiente": "⏳",
  "En lectura": "📖",
  "Terminado": "✅",
  "Abandonado": "💔",
};

const PALETTE = {
  bg: "#07040f",
  surface: "#11091f",
  card: "#170d2a",
  accent: "#6320a0",
  accent2: "#a91d22",
  accent3: "#9d4edf",
  text: "#e6def5",
  muted: "#867a99",
  border: "rgba(99, 32, 160, 0.25)",
  gold: "#f59e0b",
};

const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    background: ${PALETTE.bg}; 
    color: ${PALETTE.text};
    background-image: linear-gradient(180deg, rgba(99, 32, 160, 0.12) 0%, rgba(0,0,0,0) 100%);
    background-attachment: fixed;
  }

  .app { min-height: 100vh; padding-bottom: 60px; }

  /* TOP BAR IDENTICA AL VIDEO */
  .topbar {
    background: rgba(17, 9, 31, 0.9);
    border-bottom: 1px solid ${PALETTE.border};
    backdrop-filter: blur(12px);
    padding: 15px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    position: sticky; top: 0; z-index: 100;
  }
  @media(min-width: 480px) {
    .topbar { flex-direction: row; justify-content: space-between; }
  }
  
  .topbar-container {
    display: flex; width: 100%; justify-content: space-between; align-items: center; max-width: 500px;
  }

  .topbar-logo {
    font-family: 'Cinzel', serif;
    font-size: 16px; font-weight: 700;
    color: ${PALETTE.text}; letter-spacing: 1px;
    text-shadow: 0 0 10px ${PALETTE.accent};
    display: flex; flex-direction: column; line-height: 1.2;
  }
  .topbar-logo span { font-size: 11px; color: ${PALETTE.muted}; font-family: 'Plus Jakarta Sans', sans-serif; }
  
  .nav { display: flex; background: #07040f; padding: 4px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03); }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    padding: 6px 12px; border-radius: 15px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 600;
    color: ${PALETTE.muted}; transition: all 0.3s;
  }
  .nav-btn.active { background: ${PALETTE.accent}; color: white; box-shadow: 0 0 10px ${PALETTE.accent}; }

  /* MAIN CONTENEDOR MÓVIL */
  .main { padding: 20px; max-width: 500px; margin: 0 auto; }

  /* TITULOS CON LA ROSA EN SANGRE */
  .section-title {
    font-family: 'Cinzel', serif;
    font-size: 14px; font-weight: 700;
    color: ${PALETTE.accent3}; margin: 15px 0 20px 0;
    letter-spacing: 1.5px; display: flex; align-items: center; gap: 8px;
  }
  .section-title::before { content: '✦'; color: ${PALETTE.accent2}; }

  /* ESTADÍSTICAS EN MATRIZ */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
  .stat-card {
    background: ${PALETTE.surface}; border-radius: 15px;
    border: 1px solid rgba(255,255,255,0.02);
    padding: 16px; position: relative; overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    border-left: 3px solid ${PALETTE.accent};
  }
  .stat-card.candles-card { border-left-color: ${PALETTE.accent2}; }
  .stat-label { font-size: 11px; color: ${PALETTE.muted}; font-weight: 600; }
  .stat-value { font-size: 26px; color: white; font-weight: 700; margin: 4px 0; }
  .stat-sub { font-size: 11px; color: ${PALETTE.muted}; }

  /* WIDGET LUNA DE SANGRE */
  .luna-widget {
    background: linear-gradient(135deg, #2b0b14 0%, #11091f 100%);
    border: 1px solid rgba(169, 29, 34, 0.4); border-radius: 15px;
    padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 25px;
    box-shadow: 0 4px 20px rgba(169, 29, 34, 0.15);
  }
  .luna-icon { 
    font-size: 30px; 
    animation: float 3s ease-in-out infinite;
    filter: hue-rotate(320deg) saturate(3) drop-shadow(0 0 8px ${PALETTE.accent2});
  }

  /* VELAS ANIMADAS */
  .candles-decor { text-align: center; margin: 25px 0; font-size: 22px; letter-spacing: 12px; animation: flicker 1.5s infinite alternate; }

  /* FORMULARIOS Y BOTONES */
  .add-btn {
    width: 100%; background: linear-gradient(90deg, ${PALETTE.accent2}, ${PALETTE.accent}); color: white;
    border: none; cursor: pointer; padding: 12px; border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
    margin-bottom: 20px; box-shadow: 0 4px 15px rgba(169,29,34,0.2);
  }
  
  .filter-bar { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none; }
  .filter-chip {
    padding: 6px 14px; border-radius: 20px; border: 1px solid ${PALETTE.border};
    background: ${PALETTE.surface}; cursor: pointer; font-size: 12px; color: ${PALETTE.muted}; white-space: nowrap;
  }
  .filter-chip.active { background: ${PALETTE.accent}; color: white; border-color: ${PALETTE.accent3}; }

  .search-input {
    width: 100%; padding: 12px 16px; border-radius: 25px; border: 1px solid ${PALETTE.border};
    font-size: 13px; background: #0c0717; color: white; outline: none; margin-bottom: 20px;
  }

  /* LISTADO DE TOMOS */
  .books-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .book-card {
    background: ${PALETTE.surface}; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);
    overflow: hidden; cursor: pointer; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .book-cover-placeholder {
    height: 130px; background: linear-gradient(135deg, #1b0f32, #090512);
    display: flex; align-items: center; justify-content: center; font-size: 36px; position: relative;
  }
  .book-info { padding: 12px; }
  .book-title { font-weight: 700; font-size: 13px; color: white; margin-bottom: 2px; }
  .book-author { font-size: 11px; color: ${PALETTE.muted}; }

  /* PANALES DE RITUALES */
