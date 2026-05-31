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
  .ritual-box { background: ${PALETTE.surface}; padding: 20px; border-radius: 15px; border: 1px solid ${PALETTE.border}; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 15px; }
  .form-label { font-size: 11px; color: ${PALETTE.muted}; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-input {
    padding: 10px; border-radius: 8px; border: 1px solid ${PALETTE.border};
    background: #180e29; color: white; font-family: inherit; font-size: 13px; outline: none;
  }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(5,3,10,0.85); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 15px; }
  .modal { background: ${PALETTE.surface}; border-radius: 20px; border: 1px solid ${PALETTE.border}; width: 100%; max-width: 420px; padding: 25px; max-height: 85vh; overflow-y: auto; }

  /* ANIMACIONES INTERNAS */
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes flicker { 0% { opacity: 0.5; text-shadow: 0 0 4px ${PALETTE.accent2}; } 100% { opacity: 0.9; text-shadow: 0 0 12px ${PALETTE.gold}; } }
`;

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem("goth_books");
    return saved ? JSON.parse(saved) : [];
  });
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("goth_sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("Todos");

  useEffect(() => { localStorage.setItem("goth_books", JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem("goth_sessions", JSON.stringify(sessions)); }, [sessions]);

  // Cálculos de estadísticas existentes
  const totalPages = sessions.reduce((acc, s) => acc + (Number(s.pages) || 0), 0);
  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterState === "Todos" || b.state === filterState;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app">
      <style>{styles}</style>
      
      <header className="topbar">
        <div className="topbar-container">
          <div className="topbar-logo">
            Cripta de Lectura
            <span>Módulo de Monitoreo de Tomos</span>
          </div>
          <nav className="nav">
            <button className={`nav-btn ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>🔮 Cripta</button>
            <button className={`nav-btn ${tab === "gallery" ? "active" : ""}`} onClick={() => setTab("gallery")}>📚 Tomos</button>
            <button className={`nav-btn ${tab === "sessions" ? "active" : ""}`} onClick={() => setTab("sessions")}>🕯️ Rituales</button>
          </nav>
        </div>
      </header>

      <main className="main">
        
        {/* PESTAÑA 1: DASHBOARD (CRIPTA) */}
        {tab === "dashboard" && (
          <div>
            <div className="section-title">Panel de la Eternidad</div>
            
            {/* WIDGET LUNA DE SANGRE ACTUALIZADO */}
            <div className="luna-widget">
              <div className="luna-icon">🌕</div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#e6def5", fontFamily: "'Cinzel', serif" }}>Luna de sangre</div>
                <div style={{ fontSize: "11px", color: PALETTE.accent2, fontWeight: "600" }}>⚡ Poder máximo — noche de luna de sangre</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">📜 Tomos sellados</div>
                <div className="stat-value">{books.length}</div>
                <div className="stat-sub">en la cripta</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">📖 Páginas devoradas</div>
                <div className="stat-value">{totalPages}</div>
                <div className="stat-sub">en {sessions.length} rituales</div>
              </div>
              <div className="stat-card candles-card">
                <div className="stat-label">🕯️ Horas en las sombras</div>
                <div className="stat-value">{hours}h</div>
                <div className="stat-sub">{minutes} minutos</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">🩸 Calificación media</div>
                <div className="stat-value">
                  {books.filter(b => b.rating).length 
                    ? (books.reduce((acc, b) => acc + Number(b.rating || 0), 0) / books.filter(b => b.rating).length).toFixed(1)
                    : "—"}
                </div>
                <div className="stat-sub">sobre tomos leídos</div>
              </div>
            </div>

            <div style={{ background: PALETTE.surface, padding: "15px", borderRadius: "15px", marginBottom: "20px", border: `1px solid ${PALETTE.border}` }}>
              <div style={{ fontSize: "12px", color: PALETTE.muted, marginBottom: "10px", fontFamily: "Cinzel" }}>🌙 Tomos por mes</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "40px", padding: "0 10px" }}>
                {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
                    <div style={{ width: "60%", height: "4px", background: PALETTE.accent, borderRadius: "2px" }}></div>
                    <span style={{ fontSize: "8px", color: PALETTE.muted }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="candles-decor">🕯️ 🕯️ 🕯️</div>
          </div>
        )}

        {/* PESTAÑA 2: LISTADO (TOMOS) */}
        {tab === "gallery" && (
          <div>
            <div className="section-title">La Biblioteca Oscura</div>
            
            <button className="add-btn" onClick={() => setShowAdd(true)}>🩸 Añadir tomo oscuro</button>
            
            <input 
              type="text" 
              className="search-input" 
              placeholder="🔮 Buscar en la cripta..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="filter-bar">
              {["Todos", ...STATES].map(st => (
                <button 
                  key={st} 
                  className={`filter-chip ${filterState === st ? "active" : ""}`}
                  onClick={() => setFilterState(st)}
                >
                  {st === "Todos" ? "🔮 Todos" : `${STATE_ICONS[st] || ""} ${st}`}
                </button>
              ))}
            </div>

            {filteredBooks.length === 0 ? (
              <div style={{ background: PALETTE.surface, padding: "40px 20px", borderRadius: "15px", textAlign: "center", border: `1px dashed ${PALETTE.accent}` }}>
                <div style={{ fontSize: "35px", marginBottom: "10px" }}>🌹</div>
                <p style={{ fontSize: "13px", color: PALETTE.muted }}>La cripta está vacía...</p>
                <p style={{ fontSize: "11px", color: PALETTE.accent3, marginTop: "4px" }}>Las sombras aguardan nuevos tomos</p>
              </div>
            ) : (
              <div className="books-grid">
                {filteredBooks.map(b => (
                  <div key={b.id} className="book-card">
                    <div className="book-cover-placeholder">
                      📖
                      <span style={{ position: "absolute", top: "6px", right: "6px", background: STATE_COLORS[b.state], fontSize: "9px", padding: "2px 6px", borderRadius: "6px", color: "white" }}>
                        {b.state}
                      </span>
                    </div>
                    <div className="book-info">
                      <div className="book-title">{b.title}</div>
                      <div className="book-author">{b.author}</div>
                      <div style={{ fontSize: "10px", color: PALETTE.gold, marginTop: "4px" }}>{"★".repeat(b.rating || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: SESIONES (RITUALES) */}
        {tab === "sessions" && (
          <div>
            <div className="section-title">Los Grandes Rituales</div>
            
            <div className="ritual-box">
              <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "15px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "Cinzel" }}>
                <span style={{ color: PALETTE.accent2 }}>🩸</span> Nuevo Ritual de Lectura
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const newSession = {
                  id: Date.now(),
                  bookId: fd.get("bookId"),
                  pages: fd.get("pages"),
                  duration: fd.get("duration"),
                  date: new Date().toLocaleDateString()
                };
                if(newSession.pages) {
                  setSessions([newSession, ...sessions]);
                  e.target.reset();
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Seleccionar Tomo Sello</label>
                  <select name="bookId" className="form-input" style={{ background: "#180e29" }}>
                    {books.length === 0 && <option value="">— Sin tomos disponibles —</option>}
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group">
                    <label className="form-label">Páginas devoradas</label>
                    <input type="number" name="pages" className="form-input" placeholder="Ej. 34" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minutos en penumbra</label>
                    <input type="number" name="duration" className="form-input" placeholder="Ej. 45" required />
                  </div>
                </div>

                <button type="submit" className="add-btn" style={{ marginTop: "10px", background: PALETTE.accent }}>
                  Sellar ritual 🩸
                </button>
              </form>
            </div>

            <div style={{ marginTop: "25px" }}>
              <div style={{ fontSize: "12px", fontFamily: "Cinzel", color: PALETTE.muted, marginBottom: "10px" }}>Pergaminos de rituales</div>
              {sessions.length === 0 ? (
                <div style={{ color: PALETTE.muted, fontSize: "12px", textAlign: "center", padding: "20px" }}>Sin rituales registrados...</div>
              ) : (
                sessions.map(s => {
                  const b = books.find(bk => String(bk.id) === String(s.bookId));
                  return (
                    <div key={s.id} style={{ background: PALETTE.surface, padding: "12px", borderRadius: "10px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700" }}>{b ? b.title : "Tomo Desconocido"}</div>
                        <div style={{ fontSize: "10px", color: PALETTE.muted }}>{s.date} • {s.duration} mins</div>
                      </div>
                      <div style={{ fontSize: "12px", color: PALETTE.accent3, fontWeight: "700" }}>+{s.pages} pág.</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE AGREGAR LIBRO */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ fontFamily: "Cinzel", fontSize: "16px", marginBottom: "15px", color: "white" }}>Invocación de Nuevo Tomo</div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const newBook = {
                id: Date.now(),
                title: fd.get("title"),
                author: fd.get("author"),
                genre: fd.get("genre"),
                state: fd.get("state"),
                rating: fd.get("rating")
              };
              setBooks([newBook, ...books]);
              setShowAdd(false);
            }}>
              <div className="form-group"><label className="form-label">Título del Tomo</label><input type="text" name="title" className="form-input" required /></div>
              <div className="form-group"><label className="form-label">Autor / Grimorio</label><input type="text" name="author" className="form-input" required /></div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Género místico</label>
                  <select name="genre" className="form-input">
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado de posesión</label>
                  <select name="state" className="form-input">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Calificación de Sangre</label>
                <select name="rating" className="form-input">
                  {RATINGS.map(r => <option key={r} value={r}>{"★".repeat(r)}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
                <button type="button" className="filter-chip" onClick={() => setShowAdd(false)}>Cerrar</button>
                <button type="submit" className="add-btn" style={{ width: "auto", padding: "8px 20px", marginBottom: 0 }}>Sellar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
                    }
