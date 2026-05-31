import { useState, useEffect, useRef } from "react";

// Fuentes místicas y estilos góticos avanzados
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');`;

const GENRES = ["Fantasía", "Romance", "Thriller", "Ciencia Ficción", "Drama", "BL/GL", "Filosófica", "Aventura", "Histórica", "Terror"];
const STATES = ["Pendiente", "En lectura", "Terminado", "Abandonado"];
const RATINGS = [1, 2, 3, 4, 5];

const FRASE_VAMPIRICA = "«La inmortalidad no se mide en años, sino en los mundos que devoramos antes del amanecer».";

// Nueva pista: Órgano gótico y violín sombrío profundo
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"; 

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
  card: "#160c28",
  accent: "#6320a0",
  accent2: "#a91d22",
  accent3: "#9d4edf",
  text: "#e6def5",
  muted: "#7e7099",
  border: "rgba(169, 29, 34, 0.2)",
  gold: "#f59e0b",
};

const styles = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    background: ${PALETTE.bg}; 
    color: ${PALETTE.text};
    background-image: 
      linear-gradient(180deg, rgba(99, 32, 160, 0.15) 0%, rgba(7, 4, 15, 0) 40%, rgba(169, 29, 34, 0.08) 85%, #000000 100%);
    background-attachment: fixed;
    min-height: 100vh;
  }

  .app { min-height: 100vh; padding-bottom: 80px; position: relative; }

  .topbar {
    background: rgba(11, 5, 20, 0.93);
    border-bottom: 1px solid rgba(169, 29, 34, 0.3);
    backdrop-filter: blur(15px);
    padding: 12px 20px;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 20px rgba(0,0,0,0.7);
  }
  
  .topbar-container {
    display: flex; width: 100%; justify-content: space-between; align-items: center; max-width: 500px; margin: 0 auto;
  }

  .goth-logo-box {
    display: flex; align-items: center; gap: 8px;
  }
  .goth-crest {
    font-size: 22px; color: ${PALETTE.accent2};
    filter: drop-shadow(0 0 5px rgba(169, 29, 34, 0.8));
    animation: pulse-glow 3s ease-in-out infinite;
  }
  .topbar-logo {
    font-family: 'Cinzel', serif;
    font-size: 14px; font-weight: 700;
    color: #ffffff; letter-spacing: 1.5px;
    text-shadow: 0 0 8px rgba(169, 29, 34, 0.5);
    line-height: 1.1;
  }
  .topbar-logo span { 
    font-size: 8.5px; color: ${PALETTE.muted}; 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    display: block; font-weight: 600; 
    letter-spacing: 0.5px; margin-top: 1px;
  }
  
  .nav { display: flex; background: #05030a; padding: 4px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.04); }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    padding: 7px 12px; border-radius: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700;
    color: ${PALETTE.muted}; transition: all 0.3s ease;
  }
  .nav-btn.active { background: ${PALETTE.accent2}; color: white; box-shadow: 0 0 12px ${PALETTE.accent2}; }

  .audio-controller {
    display: flex; align-items: center; gap: 8px;
    background: rgba(22, 12, 40, 0.85); border: 1px solid rgba(169, 29, 34, 0.4);
    padding: 6px 12px; border-radius: 20px;
    font-size: 10px; font-weight: 700; color: #ffffff;
    cursor: pointer; transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  .audio-controller.playing {
    border-color: ${PALETTE.accent2};
    box-shadow: 0 0 10px rgba(169, 29, 34, 0.6);
  }
  .audio-wave {
    display: flex; gap: 2px; align-items: flex-end; height: 10px;
  }
  .audio-bar {
    width: 2px; height: 100%; background: ${PALETTE.muted}; border-radius: 1px;
  }
  .playing .audio-bar {
    background: ${PALETTE.accent2};
    animation: wave-bounce 1s ease-in-out infinite alternate;
  }
  .playing .audio-bar:nth-child(2) { animation-delay: 0.2s; }
  .playing .audio-bar:nth-child(3) { animation-delay: 0.4s; }

  .main { padding: 20px; max-width: 500px; margin: 0 auto; }

  .section-title {
    font-family: 'Cinzel', serif;
    font-size: 13px; font-weight: 700;
    color: ${PALETTE.text}; margin: 10px 0 20px 0;
    letter-spacing: 2px; display: flex; align-items: center; gap: 8px;
    text-shadow: 0 0 5px rgba(230, 222, 245, 0.3);
  }
  .section-title::before { content: '✦'; color: ${PALETTE.accent2}; font-size: 14px; }

  /* LUNA GENERADA POR CSS — INFALIBLE Y ULTRA REALISTA */
  .luna-widget {
    background: linear-gradient(135deg, #1f080f 0%, #11061c 100%);
    border: 1px solid rgba(169, 29, 34, 0.45); border-radius: 16px;
    padding: 16px; display: flex; align-items: center; gap: 16px; margin-bottom: 25px;
    box-shadow: 0 6px 25px rgba(169, 29, 34, 0.2), inset 0 0 15px rgba(169,29,34,0.15);
  }
  .luna-css-render {
    width: 44px; height: 44px; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #ff4d4d 0%, #a91d22 50%, #4a0004 100%);
    box-shadow: 
      inset -6px -6px 12px rgba(0, 0, 0, 0.8), 
      inset 6px 6px 8px rgba(255, 255, 255, 0.2),
      0 0 15px rgba(169, 29, 34, 0.8);
    position: relative;
    overflow: hidden;
    animation: float 4s ease-in-out infinite;
    flex-shrink: 0;
  }
  /* Simulador de cráteres lunares oscuros */
  .luna-css-render::before {
    content: ''; position: absolute; width: 100%; height: 100%;
    background-image: 
      radial-gradient(circle at 60% 70%, rgba(0,0,0,0.25) 12%, transparent 13%),
      radial-gradient(circle at 25% 55%, rgba(0,0,0,0.2) 8%, transparent 9%),
      radial-gradient(circle at 45% 30%, rgba(0,0,0,0.2) 10%, transparent 11%),
      radial-gradient(circle at 75% 40%, rgba(0,0,0,0.15) 6%, transparent 7%);
    opacity: 0.8;
  }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 25px; }
  .stat-card {
    background: linear-gradient(145deg, ${PALETTE.card} 0%, ${PALETTE.surface} 100%); 
    border-radius: 16px; border: 1px solid rgba(255,255,255,0.03);
    padding: 16px; position: relative; overflow: hidden;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4); border-left: 3px solid ${PALETTE.accent};
  }
  .stat-card.candles-card { border-left-color: ${PALETTE.accent2}; }
  .stat-label { font-size: 11px; color: ${PALETTE.muted}; font-weight: 600; letter-spacing: 0.3px; }
  .stat-value { font-size: 28px; color: #ffffff; font-weight: 700; margin: 4px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  .stat-sub { font-size: 11px; color: ${PALETTE.muted}; }

  .chart-box {
    background: #11091f; padding: 18px; border-radius: 16px; margin-bottom: 25px;
    border: 1px solid rgba(99, 32, 160, 0.15); box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
  .chart-bar-container { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; justify-content: flex-end; }
  .chart-bar-fill { 
    width: 8px; background: linear-gradient(180deg, ${PALETTE.accent2} 0%, ${PALETTE.accent} 100%); 
    border-radius: 4px; box-shadow: 0 0 8px ${PALETTE.accent2};
    transition: height 0.5s ease;
  }

  .grimorio-quote-box {
    background: linear-gradient(180deg, rgba(23, 13, 42, 0.6) 0%, rgba(11, 5, 20, 0.9) 100%);
    border: 1px dashed rgba(169, 29, 34, 0.4); border-radius: 14px; padding: 22px; text-align: center; margin-top: 20px;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.6); position: relative;
  }
  .grimorio-quote-box::before, .grimorio-quote-box::after {
    content: '✵'; color: ${PALETTE.accent2}; position: absolute; top: 8px; font-size: 10px; opacity: 0.6;
  }
  .grimorio-quote-box::before { left: 12px; }
  .grimorio-quote-box::after { right: 12px; }

  .add-btn {
    width: 100%; background: linear-gradient(90deg, ${PALETTE.accent2}, ${PALETTE.accent}); color: white;
    border: none; cursor: pointer; padding: 14px; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 700;
    margin-bottom: 20px; box-shadow: 0 4px 15px rgba(169,29,34,0.3); letter-spacing: 0.5px;
  }
  
  .search-input {
    width: 100%; padding: 12px 18px; border-radius: 25px; border: 1px solid rgba(157, 78, 223, 0.2);
    font-size: 12px; background: #0b0614; color: white; outline: none; margin-bottom: 20px;
  }

  .filter-bar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; scrollbar-width: none; }
  .filter-chip {
    padding: 7px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.04);
    background: ${PALETTE.surface}; cursor: pointer; font-size: 11px; color: ${PALETTE.muted}; white-space: nowrap; font-weight: 600;
  }
  .filter-chip.active { background: ${PALETTE.accent2}; color: white; border-color: ${PALETTE.accent2}; box-shadow: 0 0 8px ${PALETTE.accent2}; }

  .empty-state-box {
    background: linear-gradient(180deg, #130a24 0%, #0c0617 100%);
    padding: 45px 20px; border-radius: 16px; text-align: center;
    border: 1px dashed rgba(169, 29, 34, 0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }

  .books-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .book-card {
    background: ${PALETTE.surface}; border-radius: 14px; border: 1px solid rgba(255,255,255,0.02);
    overflow: hidden; box-shadow: 0 6px 15px rgba(0,0,0,0.4);
  }
  
  .ritual-box { 
    background: linear-gradient(145deg, ${PALETTE.card} 0%, ${PALETTE.surface} 100%); 
    padding: 22px; border-radius: 16px; border: 1px solid ${PALETTE.border}; box-shadow: 0 8px 25px rgba(0,0,0,0.4);
  }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .form-label { font-size: 10px; color: ${PALETTE.muted}; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
  .form-input {
    padding: 11px; border-radius: 10px; border: 1px solid rgba(157, 78, 223, 0.15);
    background: #090512; color: white; font-family: inherit; font-size: 12px; outline: none;
  }

  .modal-overlay { position: fixed; inset: 0; background: rgba(3,2,7,0.9); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 15px; }
  .modal { background: ${PALETTE.surface}; border-radius: 20px; border: 1px solid rgba(157,78,223,0.3); width: 100%; max-width: 400px; padding: 25px; }

  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes pulse-glow { 0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 4px #a91d22); } 50% { opacity: 1; filter: drop-shadow(0 0 10px #a91d22); } }
  @keyframes wave-bounce { from { height: 3px; } to { height: 12px; } }
`;

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [books, setBooks] = useState(() => JSON.parse(localStorage.getItem("goth_books") || "[]"));
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem("goth_sessions") || "[]"));
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { localStorage.setItem("goth_books", JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem("goth_sessions", JSON.stringify(sessions)); }, [sessions]);

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("Todos");

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Interacción requerida inicial:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const totalPages = sessions.reduce((acc, s) => acc + (Number(s.pages) || 0), 0);
  const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterState === "Todos" || b.state === filterState;
    return matchesSearch && matchesFilter;
  });

  const getMonthHeight = (monthIndex) => {
    if (books.length === 0 && sessions.length === 0) return "6px";
    const count = sessions.filter(s => {
      if (!s.date) return false;
      const parts = s.date.split("/");
      return parts[1] ? parseInt(parts[1], 10) === monthIndex + 1 : false;
    }).length;
    return count > 0 ? `${Math.min(count * 12 + 6, 35)}px` : "6px";
  };

  return (
    <div className="app">
      <style>{styles}</style>
      
      <audio ref={audioRef} src={AUDIO_URL} loop />

      <header className="topbar">
        <div className="topbar-container">
          
          <div className="goth-logo-box">
            <span className="goth-crest">☥</span>
            <div className="topbar-logo">
              BAPTISMA
              <span>BIBLIOTECA DE SANGRE</span>
            </div>
          </div>

          <nav className="nav">
            <button className={`nav-btn ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>🔮 Cripta</button>
            <button className={`nav-btn ${tab === "gallery" ? "active" : ""}`} onClick={() => setTab("gallery")}>📚 Tomos</button>
            <button className={`nav-btn ${tab === "sessions" ? "active" : ""}`} onClick={() => setTab("sessions")}>🕯️ Rituales</button>
          </nav>
        </div>
      </header>

      <main className="main">
        
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div className="section-title" style={{ margin: 0 }}>Panel de la Eternidad</div>
              
              <button className={`audio-controller ${isPlaying ? "playing" : ""}`} onClick={toggleAudio}>
                <div className="audio-wave">
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                  <div className="audio-bar"></div>
                </div>
                <span>{isPlaying ? "SINFONÍA ACTIVA" : "INVOCAR AUDIO"}</span>
              </button>
            </div>
            
            {/* COMPONENTE DE LUNA CSS SANADO Y RESPLANDECIENTE */}
            <div className="luna-widget">
              <div className="luna-css-render"></div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#ffffff", fontFamily: "'Cinzel', serif", letterSpacing: "0.5px" }}>LUNA DE SANGRE</div>
                <div style={{ fontSize: "11px", color: PALETTE.accent2, fontWeight: "600", marginTop: "2px" }}>⚡ Poder máximo — noche de luna de sangre</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">📜 Tomos sellados</div>
                <div className="stat-value">{books.length}</div>
                <div className="stat-sub">en la biblioteca</div>
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
                <div className="stat-sub">sobre grimorios leídos</div>
              </div>
            </div>

            <div className="chart-box">
              <div style={{ fontSize: "11px", color: PALETTE.muted, marginBottom: "15px", fontFamily: "'Cinzel', serif", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🌙</span> Tomos por mes
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "45px", padding: "0 5px" }}>
                {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m, i) => (
                  <div key={i} className="chart-bar-container">
                    <div className="chart-bar-fill" style={{ height: getMonthHeight(i) }}></div>
                    <span style={{ fontSize: "8px", color: PALETTE.muted, fontWeight: "600" }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grimorio-quote-box">
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "9px", color: PALETTE.accent2, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "700" }}>Inscripción del Santuario</div>
              <p style={{ fontSize: "11.5px", color: "#e6def5", fontStyle: "italic", lineHeight: "1.6", letterSpacing: "0.2px" }}>{FRASE_VAMPIRICA}</p>
            </div>
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
              <div className="empty-state-box">
                <div style={{ fontSize: "32px", filter: "drop-shadow(0 0 5px #a91d22)" }}>🌹</div>
                <p style={{ fontSize: "13px", color: "#e6def5", fontWeight: "600", fontFamily: "Cinzel" }}>La cripta está vacía</p>
                <p style={{ fontSize: "11px", color: PALETTE.muted, textAlign: "center" }}>Las sombras aguardan pacientemente la invocación de nuevos tomos oscuros.</p>
              </div>
            ) : (
              <div className="books-grid">
                {filteredBooks.map(b => (
                  <div key={b.id} className="book-card">
                    <div style={{ height: "120px", background: "linear-gradient(135deg, #180d2b, #07040f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", position: "relative", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                      📚
                      <span style={{ position: "absolute", bottom: "8px", left: "8px", background: STATE_COLORS[b.state], fontSize: "8px", padding: "3px 8px", borderRadius: "10px", color: "white", fontWeight: "700" }}>
                        {b.state.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
                      <div style={{ fontSize: "11px", color: PALETTE.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "2px" }}>{b.author}</div>
                      <div style={{ fontSize: "9px", color: PALETTE.gold, marginTop: "6px" }}>{"★".repeat(b.rating || 0)}</div>
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
              <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "Cinzel", letterSpacing: "0.5px" }}>
                <span style={{ color: PALETTE.accent2 }}>🩸</span> Registrar Sesión de Penumbra
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
                  <select name="bookId" className="form-input">
                    {books.length === 0 && <option value="">— Sin tomos disponibles —</option>}
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Páginas devoradas</label>
                    <input type="number" name="pages" className="form-input" placeholder="Ej. 34" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minutos transcurridos</label>
                    <input type="number" name="duration" className="form-input" placeholder="Ej. 45" required />
                  </div>
                </div>

                <button type="submit" className="add-btn" style={{ marginTop: "8px", background: PALETTE.accent, boxShadow: `0 4px 12px ${PALETTE.accent}` }}>
                  Sellar ritual de lectura 🩸
                </button>
              </form>
            </div>

            <div style={{ marginTop: "25px" }}>
              <div style={{ fontSize: "11px", fontFamily: "Cinzel", color: PALETTE.muted, letterSpacing: "1px", marginBottom: "12px" }}>Pergaminos de rituales antiguos</div>
              {sessions.length === 0 ? (
                <div className="empty-state-box" style={{ padding: "30px 20px" }}>
                  <p style={{ fontSize: "11px", color: PALETTE.muted }}>Ningún ritual ha sido consumado en este ciclo lunar.</p>
                </div>
              ) : (
                sessions.map(s => {
                  const b = books.find(bk => String(bk.id) === String(s.bookId));
                  return (
                    <div key={s.id} style={{ background: PALETTE.surface, padding: "14px", borderRadius: "12px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#ffffff" }}>{b ? b.title : "Tomo Desconocido"}</div>
                        <div style={{ fontSize: "10px", color: PALETTE.muted, marginTop: "2px" }}>{s.date} • {s.duration} mins en silencio</div>
                      </div>
                      <div style={{ fontSize: "12px", color: PALETTE.accent3, fontWeight: "700", background: "rgba(157, 78, 223, 0.1)", padding: "4px 8px", borderRadius: "6px" }}>+{s.pages} pág.</div>
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
            <div style={{ fontFamily: "Cinzel", fontSize: "15px", marginBottom: "18px", color: "white", letterSpacing: "0.5px" }}>Invocación de Nuevo Tomo</div>
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
                  <label className="form-label">Estado actual</label>
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

              <div style={{ display: "flex", gap: "10px", marginTop: "22px", justifyContent: "flex-end" }}>
                <button type="button" className="filter-chip" onClick={() => setShowAdd(false)}>Cerrar</button>
                <button type="submit" className="add-btn" style={{ width: "auto", padding: "8px 22px", marginBottom: 0 }}>Sellar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
