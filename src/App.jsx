import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');`;

const GENRES = ["Fantasía", "Romance", "Thriller", "Ciencia Ficción", "Drama", "BL/GL", "Filosófica", "Aventura", "Histórica", "Terror"];
const STATES = ["Pendiente", "En lectura", "Terminado", "Abandonado"];
const RATINGS = [1, 2, 3, 4, 5];

const STATE_COLORS = {
  "Pendiente": "#5ba8c4",
  "En lectura": "#3d9e8c",
  "Terminado": "#2e7d6e",
  "Abandonado": "#7ba7bc",
};

const STATE_ICONS = {
  "Pendiente": "⏳",
  "En lectura": "📖",
  "Terminado": "✅",
  "Abandonado": "💔",
};

const PALETTE = {
  bg: "#eef7f7",
  surface: "#f4fbfb",
  card: "#ffffff",
  accent: "#3a9ead",
  accent2: "#2e8c7a",
  accent3: "#5bb8c4",
  text: "#1a3038",
  muted: "#5a8a94",
  border: "#b8dde4",
  gold: "#4db8b0",
};

const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Lato', sans-serif; background: ${PALETTE.bg}; color: ${PALETTE.text}; }

  .app { min-height: 100vh; }

  /* TOP BAR */
  .topbar {
    background: ${PALETTE.surface};
    border-bottom: 1.5px solid ${PALETTE.border};
    padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .topbar-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: ${PALETTE.accent};
    padding: 14px 0;
    display: flex; align-items: center; gap: 8px;
  }
  .topbar-logo span { font-style: italic; color: ${PALETTE.accent2}; }
  .nav { display: flex; gap: 4px; }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    padding: 8px 16px; border-radius: 20px;
    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700;
    color: ${PALETTE.muted}; transition: all 0.2s;
    letter-spacing: 0.5px;
  }
  .nav-btn:hover { background: ${PALETTE.border}; color: ${PALETTE.text}; }
  .nav-btn.active { background: ${PALETTE.accent}; color: white; }

  /* MAIN */
  .main { padding: 28px 24px; max-width: 1300px; margin: 0 auto; }

  /* SECTION TITLE */
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700;
    color: ${PALETTE.text};
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
  }
  .section-title::after {
    content: ''; flex: 1; height: 1.5px;
    background: linear-gradient(to right, ${PALETTE.border}, transparent);
  }

  /* DASHBOARD STATS */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: ${PALETTE.card}; border-radius: 16px;
    border: 1.5px solid ${PALETTE.border};
    padding: 20px 22px;
    display: flex; flex-direction: column; gap: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .stat-label { font-size: 12px; color: ${PALETTE.muted}; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 36px; color: ${PALETTE.accent}; font-weight: 700; }
  .stat-sub { font-size: 12px; color: ${PALETTE.muted}; }

  /* CHARTS ROW */
  .charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .chart-card {
    background: ${PALETTE.card}; border-radius: 16px;
    border: 1.5px solid ${PALETTE.border};
    padding: 20px 22px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .chart-title { font-size: 13px; font-weight: 700; color: ${PALETTE.muted}; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; }

  /* BAR CHART */
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 100px; }
  .bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; transition: opacity 0.2s; min-height: 4px; }
  .bar:hover { opacity: 0.8; }
  .bar-label { font-size: 10px; color: ${PALETTE.muted}; }

  /* DONUT */
  .donut-wrap { display: flex; align-items: center; gap: 16px; }
  .donut-legend { display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* GOALS */
  .goals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .goal-item { display: flex; flex-direction: column; gap: 6px; }
  .goal-header { display: flex; justify-content: space-between; font-size: 13px; }
  .goal-name { font-weight: 700; }
  .goal-count { color: ${PALETTE.muted}; }
  .progress-bar-bg { height: 8px; background: ${PALETTE.border}; border-radius: 4px; overflow: hidden; }
  .progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }

  /* ADD BOOK */
  .add-btn {
    background: ${PALETTE.accent}; color: white;
    border: none; cursor: pointer;
    padding: 10px 22px; border-radius: 20px;
    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 0.5px; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 20px;
  }
  .add-btn:hover { background: #b56a49; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 20px;
  }
  .modal {
    background: ${PALETTE.card}; border-radius: 20px;
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; margin-bottom: 22px;
    color: ${PALETTE.text};
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: span 2; }
  .form-label { font-size: 12px; font-weight: 700; color: ${PALETTE.muted}; letter-spacing: 0.8px; text-transform: uppercase; }
  .form-input {
    padding: 9px 12px; border-radius: 8px;
    border: 1.5px solid ${PALETTE.border};
    font-family: 'Lato', sans-serif; font-size: 14px;
    background: ${PALETTE.bg}; color: ${PALETTE.text};
    outline: none; transition: border 0.2s;
  }
  .form-input:focus { border-color: ${PALETTE.accent}; }
  select.form-input { cursor: pointer; }
  textarea.form-input { resize: vertical; min-height: 80px; }
  .star-select { display: flex; gap: 6px; }
  .star-btn { background: none; border: none; cursor: pointer; font-size: 22px; transition: transform 0.1s; }
  .star-btn:hover { transform: scale(1.2); }
  .modal-actions { display: flex; gap: 10px; margin-top: 22px; justify-content: flex-end; }
  .btn-primary {
    background: ${PALETTE.accent}; color: white; border: none; cursor: pointer;
    padding: 10px 24px; border-radius: 12px; font-size: 14px; font-weight: 700;
    font-family: 'Lato', sans-serif; transition: all 0.2s;
  }
  .btn-primary:hover { background: #b56a49; }
  .btn-secondary {
    background: ${PALETTE.border}; color: ${PALETTE.text}; border: none; cursor: pointer;
    padding: 10px 24px; border-radius: 12px; font-size: 14px; font-weight: 700;
    font-family: 'Lato', sans-serif; transition: all 0.2s;
  }
  .btn-secondary:hover { background: #d8c8be; }

  /* GALLERY */
  .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
  .filter-chip {
    padding: 6px 14px; border-radius: 16px; border: 1.5px solid ${PALETTE.border};
    background: ${PALETTE.card}; cursor: pointer; font-size: 13px; font-weight: 700;
    color: ${PALETTE.muted}; transition: all 0.2s;
  }
  .filter-chip.active { background: ${PALETTE.accent}; border-color: ${PALETTE.accent}; color: white; }
  .filter-chip:hover:not(.active) { border-color: ${PALETTE.accent}; color: ${PALETTE.accent}; }
  .search-input {
    padding: 8px 14px; border-radius: 16px; border: 1.5px solid ${PALETTE.border};
    font-size: 13px; font-family: 'Lato', sans-serif; color: ${PALETTE.text};
    background: ${PALETTE.card}; outline: none; min-width: 200px;
  }
  .search-input:focus { border-color: ${PALETTE.accent}; }
  .books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 18px; }
  .book-card {
    background: ${PALETTE.card}; border-radius: 14px;
    border: 1.5px solid ${PALETTE.border};
    overflow: hidden; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .book-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-color: ${PALETTE.accent}; }
  .book-cover {
    height: 180px; background: linear-gradient(135deg, ${PALETTE.accent}22, ${PALETTE.accent2}22);
    display: flex; align-items: center; justify-content: center;
    font-size: 48px; position: relative; overflow: hidden;
  }
  .book-cover img { width: 100%; height: 100%; object-fit: cover; }
  .book-state-badge {
    position: absolute; top: 8px; right: 8px;
    padding: 3px 8px; border-radius: 8px; font-size: 11px; font-weight: 700;
    color: white; letter-spacing: 0.5px;
  }
  .book-info { padding: 12px 14px; }
  .book-title { font-weight: 700; font-size: 13px; color: ${PALETTE.text}; margin-bottom: 3px; line-height: 1.3; }
  .book-author { font-size: 11px; color: ${PALETTE.muted}; margin-bottom: 6px; }
  .book-stars { display: flex; gap: 2px; font-size: 14px; }
  .book-genre { font-size: 10px; color: ${PALETTE.accent2}; font-weight: 700; letter-spacing: 0.5px; margin-top: 4px; }

  /* BOOK DETAIL MODAL */
  .detail-grid { display: grid; grid-template-columns: 160px 1fr; gap: 24px; }
  .detail-cover {
    width: 160px; height: 230px; border-radius: 12px;
    background: linear-gradient(135deg, ${PALETTE.accent}33, ${PALETTE.accent2}33);
    display: flex; align-items: center; justify-content: center;
    font-size: 64px; overflow: hidden; flex-shrink: 0;
  }
  .detail-cover img { width: 100%; height: 100%; object-fit: cover; }
  .detail-meta { display: flex; flex-direction: column; gap: 8px; }
  .detail-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; line-height: 1.2; }
  .detail-author { font-size: 14px; color: ${PALETTE.muted}; }
  .detail-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;
    color: white; align-self: flex-start; margin-top: 4px;
  }
  .tags-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
  .tag { padding: 3px 10px; border-radius: 10px; background: ${PALETTE.bg}; border: 1px solid ${PALETTE.border}; font-size: 11px; color: ${PALETTE.muted}; }
  .detail-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid ${PALETTE.border}; }
  .detail-section-title { font-size: 12px; font-weight: 700; color: ${PALETTE.muted}; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .detail-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .detail-item { display: flex; flex-direction: column; gap: 2px; }
  .detail-item-label { font-size: 11px; color: ${PALETTE.muted}; }
  .detail-item-value { font-size: 14px; font-weight: 700; }
  .progress-full { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
  .review-text { font-size: 13px; line-height: 1.6; color: ${PALETTE.text}; font-style: italic; padding: 12px; background: ${PALETTE.bg}; border-radius: 10px; border-left: 3px solid ${PALETTE.accent}; }
  .fav-phrases { display: flex; flex-direction: column; gap: 6px; }
  .fav-phrase { font-size: 12px; color: ${PALETTE.accent}; font-style: italic; padding: 8px; background: ${PALETTE.accent}11; border-radius: 8px; }
  .detail-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
  .btn-danger { background: #e08080; color: white; border: none; cursor: pointer; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'Lato', sans-serif; }
  .btn-edit { background: ${PALETTE.accent2}; color: white; border: none; cursor: pointer; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; font-family: 'Lato', sans-serif; }

  /* SESSIONS */
  .sessions-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 20px; }
  .session-form-card {
    background: ${PALETTE.card}; border-radius: 16px;
    border: 1.5px solid ${PALETTE.border}; padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    align-self: start;
  }
  .session-form-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; margin-bottom: 18px; }
  .session-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
  .sessions-list-card {
    background: ${PALETTE.card}; border-radius: 16px;
    border: 1.5px solid ${PALETTE.border}; padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    max-height: 600px; overflow-y: auto;
  }
  .session-row {
    display: grid; grid-template-columns: 90px 1fr 70px 70px 70px;
    gap: 10px; padding: 12px 0; border-bottom: 1px solid ${PALETTE.border};
    font-size: 13px; align-items: center;
  }
  .session-row:last-child { border-bottom: none; }
  .session-header { font-weight: 700; font-size: 11px; color: ${PALETTE.muted}; letter-spacing: 0.8px; text-transform: uppercase; }
  .session-book { font-weight: 700; color: ${PALETTE.accent}; }
  .session-pages { color: ${PALETTE.accent2}; font-weight: 700; }
  .session-time { color: ${PALETTE.muted}; }
  .delete-session { background: none; border: none; cursor: pointer; color: #e08080; font-size: 16px; padding: 2px; }

  /* EMPTY STATE */
  .empty-state { text-align: center; padding: 60px 20px; color: ${PALETTE.muted}; }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 15px; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .charts-row { grid-template-columns: 1fr; }
    .books-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    .sessions-layout { grid-template-columns: 1fr; }
    .detail-grid { grid-template-columns: 1fr; }
    .detail-cover { width: 100%; height: 200px; }
    .form-grid { grid-template-columns: 1fr; }
    .form-group.full { grid-column: span 1; }
    .goals-grid { grid-template-columns: 1fr; }
  }
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────

function Stars({ rating, onSet }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="star-select">
      {RATINGS.map(n => (
        <button
          key={n}
          className="star-btn"
          onClick={() => onSet && onSet(n)}
          onMouseEnter={() => onSet && setHov(n)}
          onMouseLeave={() => onSet && setHov(0)}
          style={{ cursor: onSet ? "pointer" : "default" }}
        >
          <span style={{ color: n <= (hov || rating) ? PALETTE.gold : PALETTE.border }}>★</span>
        </button>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color: PALETTE.muted, fontSize: 13 }}>Sin datos aún</div>;
  let cumulative = 0;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const segments = data.map(d => {
    const pct = d.value / total;
    const offset = circ * (1 - cumulative);
    const dash = circ * pct;
    cumulative += pct;
    return { ...d, pct, offset, dash };
  });
  return (
    <div className="donut-wrap">
      <svg width={100} height={100} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={18}
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{ background: d.color }} />
            <span style={{ fontSize: 12 }}>{d.label}: <strong>{d.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div className="bar" style={{ height: `${(d.value / max) * 80}px`, background: color || PALETTE.accent }} title={d.value} />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── STORAGE ────────────────────────────────────────────────────────────────

const BOOKS_KEY = "rt_books_v1";
const SESSIONS_KEY = "rt_sessions_v1";

function loadBooks() {
  try {
    const r = window.storage && window.storage.get ? null : null;
    const local = localStorage.getItem(BOOKS_KEY);
    return local ? JSON.parse(local) : [];
  } catch { return []; }
}
function saveBooks(books) {
  try { localStorage.setItem(BOOKS_KEY, JSON.stringify(books)); } catch {}
}
function loadSessions() {
  try {
    const local = localStorage.getItem(SESSIONS_KEY);
    return local ? JSON.parse(local) : [];
  } catch { return []; }
}
function saveSessions(sessions) {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

// ─── BOOK FORM ───────────────────────────────────────────────────────────────

function BookForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    title: "", author: "", genre: "Fantasía", state: "Pendiente",
    rating: 0, pages: "", currentPage: "", saga: "", format: "Físico",
    startDate: "", endDate: "", tags: "", review: "", favPhrases: "", coverUrl: ""
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return alert("El título es obligatorio");
    onSave({ ...form, id: initial?.id || Date.now().toString() });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{initial ? "Editar libro" : "Añadir libro 📚"}</div>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Título *</label>
            <input className="form-input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Título del libro" />
          </div>
          <div className="form-group">
            <label className="form-label">Autor</label>
            <input className="form-input" value={form.author} onChange={e => set("author", e.target.value)} placeholder="Nombre del autor" />
          </div>
          <div className="form-group">
            <label className="form-label">Género</label>
            <select className="form-input" value={form.genre} onChange={e => set("genre", e.target.value)}>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-input" value={form.state} onChange={e => set("state", e.target.value)}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Formato</label>
            <select className="form-input" value={form.format} onChange={e => set("format", e.target.value)}>
              {["Físico", "Digital", "Audiolibro"].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total páginas</label>
            <input className="form-input" type="number" value={form.pages} onChange={e => set("pages", e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Página actual</label>
            <input className="form-input" type="number" value={form.currentPage} onChange={e => set("currentPage", e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Saga</label>
            <input className="form-input" value={form.saga} onChange={e => set("saga", e.target.value)} placeholder="Nombre de la saga" />
          </div>
          <div className="form-group">
            <label className="form-label">Calificación</label>
            <Stars rating={form.rating} onSet={v => set("rating", v)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha inicio</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha fin</label>
            <input className="form-input" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
          </div>
          <div className="form-group full">
            <label className="form-label">URL portada (opcional)</label>
            <input className="form-input" value={form.coverUrl} onChange={e => set("coverUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group full">
            <label className="form-label">Tags / palabras clave (separadas por coma)</label>
            <input className="form-input" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="Magia, Aventura, Romance..." />
          </div>
          <div className="form-group full">
            <label className="form-label">Reseña personal</label>
            <textarea className="form-input" value={form.review} onChange={e => set("review", e.target.value)} placeholder="Escribe tu opinión..." />
          </div>
          <div className="form-group full">
            <label className="form-label">Frases favoritas (una por línea)</label>
            <textarea className="form-input" value={form.favPhrases} onChange={e => set("favPhrases", e.target.value)} placeholder="Escribe tus frases favoritas..." />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOK DETAIL ─────────────────────────────────────────────────────────────

function BookDetail({ book, onClose, onEdit, onDelete }) {
  const pct = book.pages > 0 ? Math.round((Number(book.currentPage) / Number(book.pages)) * 100) : 0;
  const phrases = book.favPhrases ? book.favPhrases.split("\n").filter(Boolean) : [];
  const tags = book.tags ? book.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="detail-grid">
          <div className="detail-cover">
            {book.coverUrl ? <img src={book.coverUrl} alt={book.title} onError={e => e.target.style.display="none"} /> : "📚"}
          </div>
          <div className="detail-meta">
            <div className="detail-title">{book.title}</div>
            <div className="detail-author">{book.author}</div>
            <div className="detail-badge" style={{ background: STATE_COLORS[book.state] }}>
              {STATE_ICONS[book.state]} {book.state}
            </div>
            <Stars rating={book.rating} />
            <div style={{ fontSize: 13, color: PALETTE.muted }}>{book.genre} {book.saga && `· ${book.saga}`} · {book.format}</div>
            {tags.length > 0 && (
              <div className="tags-row">
                {tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {(book.pages || book.startDate) && (
          <div className="detail-section">
            <div className="detail-section-title">Progreso</div>
            <div className="detail-row">
              {book.pages && <div className="detail-item">
                <span className="detail-item-label">Páginas</span>
                <span className="detail-item-value">{book.currentPage || 0} / {book.pages}</span>
              </div>}
              {book.startDate && <div className="detail-item">
                <span className="detail-item-label">Inicio</span>
                <span className="detail-item-value">{book.startDate}</span>
              </div>}
              {book.endDate && <div className="detail-item">
                <span className="detail-item-label">Fin</span>
                <span className="detail-item-value">{book.endDate}</span>
              </div>}
            </div>
            {book.pages > 0 && (
              <div className="progress-full">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{pct}% completado</span>
                  <span style={{ color: PALETTE.accent2, fontWeight: 700 }}>{pct === 100 ? "✅ Terminado" : `Faltan ${Number(book.pages) - Number(book.currentPage || 0)} págs.`}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct === 100 ? PALETTE.accent2 : PALETTE.accent }} />
                </div>
              </div>
            )}
          </div>
        )}

        {book.review && (
          <div className="detail-section">
            <div className="detail-section-title">Reseña personal</div>
            <div className="review-text">{book.review}</div>
          </div>
        )}

        {phrases.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Frases favoritas</div>
            <div className="fav-phrases">
              {phrases.map((p, i) => <div key={i} className="fav-phrase">"{p}"</div>)}
            </div>
          </div>
        )}

        <div className="detail-actions">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn-edit" onClick={() => onEdit(book)}>✏️ Editar</button>
          <button className="btn-danger" onClick={() => { if (confirm("¿Eliminar este libro?")) onDelete(book.id); }}>🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({ books, sessions }) {
  const finished = books.filter(b => b.state === "Terminado").length;
  const reading = books.filter(b => b.state === "En lectura").length;
  const pending = books.filter(b => b.state === "Pendiente").length;
  const totalPages = sessions.reduce((s, sess) => s + (Number(sess.pages) || 0), 0);
  const totalMinutes = sessions.reduce((s, sess) => s + (Number(sess.minutes) || 0), 0);

  const genreData = GENRES.map(g => ({ label: g.slice(0, 3), value: books.filter(b => b.genre === g).length })).filter(d => d.value > 0);

  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const booksPerMonth = monthNames.map((label, mi) => ({
    label,
    value: books.filter(b => b.endDate && new Date(b.endDate).getMonth() === mi).length
  }));

  const avgRating = books.filter(b => b.rating > 0).length > 0
    ? (books.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / books.filter(b => b.rating > 0).length).toFixed(1)
    : "—";

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Libros terminados</div>
          <div className="stat-value">{finished}</div>
          <div className="stat-sub">de {books.length} en total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Páginas leídas</div>
          <div className="stat-value">{totalPages.toLocaleString()}</div>
          <div className="stat-sub">en {sessions.length} sesiones</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tiempo total</div>
          <div className="stat-value">{Math.floor(totalMinutes / 60)}<span style={{ fontSize: 18 }}>h</span></div>
          <div className="stat-sub">{totalMinutes % 60} minutos extra</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Calificación media</div>
          <div className="stat-value">{avgRating}<span style={{ fontSize: 18, color: PALETTE.gold }}>★</span></div>
          <div className="stat-sub">sobre {books.filter(b => b.rating > 0).length} libros</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">Estado de libros</div>
          <DonutChart data={[
            { label: "Terminados", value: finished, color: STATE_COLORS["Terminado"] },
            { label: "En lectura", value: reading, color: STATE_COLORS["En lectura"] },
            { label: "Pendientes", value: pending, color: STATE_COLORS["Pendiente"] },
            { label: "Abandonados", value: books.filter(b => b.state === "Abandonado").length, color: STATE_COLORS["Abandonado"] },
          ].filter(d => d.value > 0)} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Libros terminados por mes</div>
          <BarChart data={booksPerMonth} color={PALETTE.accent} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Libros por género</div>
          {genreData.length > 0 ? <BarChart data={genreData} color={PALETTE.accent2} /> : <div style={{ color: PALETTE.muted, fontSize: 13 }}>Sin datos aún</div>}
        </div>
      </div>

      <div className="charts-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="chart-card">
          <div className="chart-title">Formatos</div>
          <DonutChart data={[
            { label: "Físico", value: books.filter(b => b.format === "Físico").length, color: PALETTE.accent },
            { label: "Digital", value: books.filter(b => b.format === "Digital").length, color: PALETTE.accent2 },
            { label: "Audio", value: books.filter(b => b.format === "Audiolibro").length, color: PALETTE.accent3 },
          ].filter(d => d.value > 0)} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Lecturas en progreso</div>
          {books.filter(b => b.state === "En lectura").length === 0 ? (
            <div style={{ color: PALETTE.muted, fontSize: 13 }}>No hay libros en progreso</div>
          ) : (
            <div className="goals-grid">
              {books.filter(b => b.state === "En lectura").map(b => {
                const pct = b.pages > 0 ? Math.round((Number(b.currentPage || 0) / Number(b.pages)) * 100) : 0;
                return (
                  <div key={b.id} className="goal-item">
                    <div className="goal-header">
                      <span className="goal-name" style={{ fontSize: 12 }}>{b.title.slice(0, 22)}{b.title.length > 22 ? "…" : ""}</span>
                      <span className="goal-count">{pct}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: PALETTE.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────

function Gallery({ books, onAdd, onEdit, onDelete, onUpdate }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editBook, setEditBook] = useState(null);

  const filters = ["Todos", ...STATES];
  const filtered = books.filter(b => {
    const matchState = filter === "Todos" || b.state === filter;
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(search.toLowerCase());
    return matchState && matchSearch;
  });

  const handleEdit = (book) => { setSelected(null); setEditBook(book); };
  const handleSaveEdit = (book) => { onEdit(book); setEditBook(null); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <button className="add-btn" onClick={onAdd} style={{ marginBottom: 0 }}>
          + Añadir libro
        </button>
        <input className="search-input" placeholder="🔍 Buscar libro o autor..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="filter-bar">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "Todos" ? f : `${STATE_ICONS[f]} ${f}`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-text">No hay libros aquí aún.<br />¡Añade tu primero!</div>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(book => (
            <div key={book.id} className="book-card" onClick={() => setSelected(book)}>
              <div className="book-cover">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} onError={e => { e.target.style.display = "none"; }} />
                ) : "📖"}
                <div className="book-state-badge" style={{ background: STATE_COLORS[book.state] }}>
                  {STATE_ICONS[book.state]}
                </div>
              </div>
              <div className="book-info">
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author}</div>
                <Stars rating={book.rating} />
                <div className="book-genre">{book.genre}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <BookDetail
          book={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onDelete={(id) => { onDelete(id); setSelected(null); }}
        />
      )}
      {editBook && (
        <BookForm initial={editBook} onSave={handleSaveEdit} onClose={() => setEditBook(null)} />
      )}
    </div>
  );
}

// ─── SESSIONS ────────────────────────────────────────────────────────────────

function Sessions({ books, sessions, onAdd, onDelete }) {
  const [form, setForm] = useState({
    bookId: books[0]?.id || "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "", endTime: "",
    startPage: "", endPage: "", notes: ""
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcMinutes = () => {
    if (!form.startTime || !form.endTime) return 0;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  };

  const handleAdd = () => {
    if (!form.bookId || !form.date) return alert("Selecciona un libro y una fecha");
    const book = books.find(b => b.id === form.bookId);
    const minutes = calcMinutes();
    const pages = Math.max(0, Number(form.endPage || 0) - Number(form.startPage || 0));
    onAdd({
      id: Date.now().toString(),
      bookId: form.bookId,
      bookTitle: book?.title || "Desconocido",
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      startPage: form.startPage,
      endPage: form.endPage,
      minutes,
      pages,
      notes: form.notes,
      speed: minutes > 0 && pages > 0 ? ((pages / minutes) * 60).toFixed(1) : "—"
    });
    setForm(f => ({ ...f, startTime: "", endTime: "", startPage: "", endPage: "", notes: "" }));
  };

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="sessions-layout">
      <div className="session-form-card">
        <div className="session-form-title">📝 Nueva sesión</div>
        <div className="session-field">
          <label className="form-label">Libro</label>
          <select className="form-input" value={form.bookId} onChange={e => set("bookId", e.target.value)}>
            {books.length === 0 && <option value="">— Añade un libro primero —</option>}
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>
        <div className="session-field">
          <label className="form-label">Fecha</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="session-field">
            <label className="form-label">Hora inicio</label>
            <input className="form-input" type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} />
          </div>
          <div className="session-field">
            <label className="form-label">Hora fin</label>
            <input className="form-input" type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)} />
          </div>
          <div className="session-field">
            <label className="form-label">Pág. inicio</label>
            <input className="form-input" type="number" value={form.startPage} onChange={e => set("startPage", e.target.value)} placeholder="0" />
          </div>
          <div className="session-field">
            <label className="form-label">Pág. fin</label>
            <input className="form-input" type="number" value={form.endPage} onChange={e => set("endPage", e.target.value)} placeholder="0" />
          </div>
        </div>
        {(form.startTime && form.endTime) && (
          <div style={{ padding: "10px 12px", background: PALETTE.bg, borderRadius: 10, marginBottom: 12, fontSize: 13 }}>
            ⏱️ <strong>{calcMinutes()} min</strong> · 📄 <strong>{Math.max(0, Number(form.endPage || 0) - Number(form.startPage || 0))} páginas</strong>
          </div>
        )}
        <div className="session-field">
          <label className="form-label">Notas</label>
          <input className="form-input" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Comentario opcional..." />
        </div>
        <button className="btn-primary" onClick={handleAdd} style={{ width: "100%" }}>Guardar sesión</button>
      </div>

      <div className="sessions-list-card">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Historial de sesiones</div>
        {sorted.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 0" }}>
            <div className="empty-icon">⏱️</div>
            <div className="empty-text">Sin sesiones registradas aún</div>
          </div>
        ) : (
          <>
            <div className="session-row session-header">
              <span>Fecha</span><span>Libro</span><span>Tiempo</span><span>Páginas</span><span></span>
            </div>
            {sorted.map(s => (
              <div key={s.id} className="session-row">
                <span style={{ color: PALETTE.muted, fontSize: 12 }}>{s.date}</span>
                <span className="session-book">{s.bookTitle?.slice(0, 22)}{s.bookTitle?.length > 22 ? "…" : ""}</span>
                <span className="session-time">{s.minutes}m</span>
                <span className="session-pages">{s.pages}p</span>
                <button className="delete-session" onClick={() => onDelete(s.id)} title="Eliminar">×</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [books, setBooks] = useState(() => loadBooks());
  const [sessions, setSessions] = useState(() => loadSessions());
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { saveBooks(books); }, [books]);
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  const addBook = (book) => { setBooks(prev => [...prev, book]); setShowAdd(false); };
  const editBook = (book) => { setBooks(prev => prev.map(b => b.id === book.id ? book : b)); };
  const deleteBook = (id) => { setBooks(prev => prev.filter(b => b.id !== id)); };
  const addSession = (s) => { setSessions(prev => [...prev, s]); };
  const deleteSession = (id) => { setSessions(prev => prev.filter(s => s.id !== id)); };

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "gallery", label: "📚 Galería" },
    { id: "sessions", label: "⏱️ Sesiones" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="topbar">
          <div className="topbar-logo">🌿 Mi Tracker de <span>Lectura</span></div>
          <nav className="nav">
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="main">
          {tab === "dashboard" && (
            <>
              <div className="section-title">Dashboard</div>
              <Dashboard books={books} sessions={sessions} />
            </>
          )}
          {tab === "gallery" && (
            <>
              <div className="section-title">Mi Galería de Libros</div>
              <Gallery
                books={books}
                onAdd={() => setShowAdd(true)}
                onEdit={editBook}
                onDelete={deleteBook}
              />
            </>
          )}
          {tab === "sessions" && (
            <>
              <div className="section-title">Tiempo de Lectura</div>
              <Sessions books={books} sessions={sessions} onAdd={addSession} onDelete={deleteSession} />
            </>
          )}
        </div>

        {showAdd && <BookForm onSave={addBook} onClose={() => setShowAdd(false)} />}
      </div>
    </>
  );
}
