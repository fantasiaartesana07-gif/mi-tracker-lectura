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
