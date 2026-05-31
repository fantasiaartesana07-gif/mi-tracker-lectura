import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap');`;

const GENRES = ["Fantasía", "Romance", "Thriller", "Ciencia Ficción", "Drama", "Esoterismo", "Gótico", "Terror", "Misterio", "Historia"];
const STATES = ["Pendiente", "En lectura", "Terminado", "Abandonado"];
const RATINGS = [1, 2, 3, 4, 5];

const STATE_COLORS = {
  "Pendiente": "#7a6a95",
  "En lectura": "#a91d22",
  "Terminado": "#4dff88",
  "Abandonado": "#3d354e",
};

const STATE_ICONS = {
  "Pendiente": "🌙",
  "En lectura": "🩸",
  "Terminado": "✨",
  "Abandonado": "🥀",
};

// --- PALETA GÓTICA COMPLETA ---
const PALETTE = {
  bg: "#07040f",          // Fondo absoluto de la cripta
  surface: "#110b24",     // Superficie de los paneles
  card: "#171032",        // Fondo de las tarjetas de libros
  accent: "#a91d22",      // Carmesí gótico
  accent2: "#ff4d54",     // Carmesí brillante para detalles
  accent3: "#3d354e",     // Metal viejo / bordes
  text: "#ffffff",        // Texto principal
  muted: "#7a6a95",       // Texto morado místico
  border: "rgba(122, 106, 149, 0.25)",
};

export default App;

function App() {
  const [tab, setTab] = useState("dashboard");
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem("books");
    return saved ? JSON.parse(saved) : [];
  });
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  const addBook = (book) => {
    setBooks([...books, { ...book, id: Date.now().toString(), readPages: 0 }]);
    setShowAdd(false);
  };

  const editBook = (updated) => {
    setBooks(books.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBook = (id) => {
    if (confirm("¿Desterrar este manuscrito para siempre?")) {
      setBooks(books.filter(b => b.id !== id));
      setSessions(sessions.filter(s => s.bookId !== id));
    }
  };

  const addSession = (session) => {
    const newSession = { ...session, id: Date.now().toString() };
    setSessions([...sessions, newSession]);

    setBooks(books.map(b => {
      if (b.id === session.bookId) {
        const upPages = Math.max(b.readPages, session.endPage);
        const autoState = upPages >= b.totalPages ? "Terminado" : b.status;
        return { ...b, readPages: upPages, status: autoState };
      }
      return b;
    }));
  };

  const deleteSession = (id, bookId, startPage) => {
    if (confirm("¿Eliminar este registro ritual?")) {
      setSessions(sessions.filter(s => s.id !== id));
      const bookSessions = sessions.filter(s => s.bookId === bookId && s.id !== id);
      const maxPage = bookSessions.length > 0 ? Math.max(...bookSessions.map(s => s.endPage)) : 0;
      setBooks(books.map(b => b.id === bookId ? { ...b, readPages: maxPage, status: maxPage >= b.totalPages ? "Terminado" : b.status } : b));
    }
  };

  const TABS = [
    { id: "dashboard", label: "🏰 Cripta" },
    { id: "gallery", label: "🔮 Tomos" },
    { id: "sessions", label: "🩸 Rituales" },
  ];

  return (
    <>
      <style>{FONTS}</style>
      <style>{styles}</style>
      <div className="app">
        <header className="topbar">
          <div className="topbar-logo">
            <span className="crest-icon">☥</span>
            NEÓFITO <span>BIBLIOTECA DE SANGRE</span>
          </div>
          
          <nav className="nav">
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="main">
          {tab === "dashboard" && (
            <>
              <div className="section-title">✦ Panel de la Eternidad ✦</div>
              <div className="luna-llena-banner">
                🌕 <strong>Luna llena</strong> — <em>Poder máximo - noche de lectura y misticismo</em>
              </div>
              <Dashboard books={books} sessions={sessions} />
            </>
          )}
          {tab === "gallery" && (
            <>
              <div className="section-title">✦ La Biblioteca Oscura ✦</div>
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
              <div className="section-title">✦ Los Grandes Rituales ✦</div>
              <Sessions books={books} sessions={sessions} onAdd={addSession} onDelete={deleteSession} />
            </>
          )}
        </main>

        <footer className="goth-footer">
          © Neófito App — Diseñado en las Sombras
        </footer>

        {showAdd && <BookForm onSave={addBook} onClose={() => setShowAdd(false)} />}
      </div>
    </>
  );
}

// --- COMPONENTES SECUNDARIOS ---

function Dashboard({ books, sessions }) {
  const finished = books.filter(b => b.status === "Terminado").length;
  const totalPages = sessions.reduce((acc, s) => acc + (s.endPage - s.startPage), 0);
  const activeBooks = books.filter(b => b.status === "En lectura").length;
  
  const rated = books.filter(b => b.rating > 0);
  const avgRating = rated.length > 0 ? (rated.reduce((acc, b) => acc + b.rating, 0) / rated.length).toFixed(1) : 0;

  return (
    <div className="dashboard-grid">
      <div className="card stat-card">
        <span className="stat-icon">📚</span>
        <div className="stat-num">{finished}</div>
        <div className="stat-lbl">Tomos sellados de {books.length} en la cripta</div>
      </div>
      <div className="card stat-card">
        <span className="stat-icon">📜</span>
        <div className="stat-num">{totalPages}</div>
        <div className="stat-lbl">Páginas devoradas en {sessions.length} rituales</div>
      </div>
      <div className="card stat-card">
        <span className="stat-icon">⏳</span>
        <div className="stat-num">{activeBooks}</div>
        <div className="stat-lbl">Grimorios invocados en lectura</div>
      </div>
      <div className="card stat-card">
        <span className="stat-icon">🩸</span>
        <div className="stat-num">{avgRating} ★</div>
        <div className="stat-lbl">Calificación de la Orden</div>
      </div>
    </div>
  );
}

function Gallery({ books, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const filtered = books.filter(b => {
    const matchFilter = filter === "Todos" || b.status === filter;
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <button className="btn btn-add" onClick={onAdd}>➕ Añadir tomo oculto</button>
      
      <div className="search-box">
        <input type="text" placeholder="Buscar manuscrito..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="filter-row">
        {["Todos", ...STATES].map(s => (
          <button key={s} className={`filter-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s === "Todos" ? "🌑 Todos" : `${STATE_ICONS[s]} ${s}`}
          </button>
        ))}
      </div>

      <div className="books-list">
        {filtered.map(b => {
          const pct = Math.round((b.readPages / b.totalPages) * 100) || 0;
          return (
            <div key={b.id} className="book-item" style={{ borderLeftColor: STATE_COLORS[b.status] }}>
              <div className="book-main-info">
                <h4>{b.title}</h4>
                <p>Por {b.author} — <span className="genre-tag">{b.genre}</span></p>
                <div className="progress-bg"><div className="progress-bar" style={{ width: `${pct}%` }}></div></div>
                <span className="pct-text">{b.readPages} / {b.totalPages} páginas ({pct}%)</span>
              </div>
              <div className="book-actions">
                <select value={b.status} onChange={e => onEdit({ ...b, status: e.target.value })}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={b.rating || 0} onChange={e => onEdit({ ...b, rating: parseInt(e.target.value) })}>
                  <option value="0">⭐ Calificar</option>
                  {RATINGS.map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
                <button className="btn-del" onClick={() => onDelete(b.id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sessions({ books, sessions, onAdd, onDelete }) {
  const [bookId, setBookId] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [notes, setNotes] = useState("");

  const activeBooks = books.filter(b => b.status !== "Terminado");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookId || !startPage || !endPage) return;
    const selected = books.find(b => b.id === bookId);
    onAdd({ bookId, bookTitle: selected.title, startPage: parseInt(startPage), endPage: parseInt(endPage), notes, date: new Date().toLocaleDateString('es-AR') });
    setBookId(""); setStartPage(""); setEndPage(""); setNotes("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="card form-container">
        <h3>🩸 Sellar Nuevo Ritual de Lectura</h3>
        <select value={bookId} onChange={e => { setBookId(e.target.value); const b = books.find(x => x.id === e.target.value); setStartPage(b ? b.readPages : ""); }} required>
          <option value="">— Seleccionar Tomo Invocado —</option>
          {activeBooks.map(b => <option key={b.id} value={b.id}>{b.title} (Vas por pág. {b.readPages})</option>)}
        </select>
        <div className="input-row">
          <input type="number" placeholder="Pág Inicio" value={startPage} onChange={e => setStartPage(e.target.value)} required />
          <input type="number" placeholder="Pág Fin" value={endPage} onChange={e => setEndPage(e.target.value)} required />
        </div>
        <input type="text" placeholder="Anotaciones/Hechizos del tomo..." value={notes} onChange={e => setNotes(e.target.value)} />
        <button type="submit" className="btn btn-submit">Consagrar Ritual 🔥</button>
      </form>

      <div className="sessions-list">
        <h3>📜 Anales de Rituales Pasados</h3>
        {sessions.slice().reverse().map(s => (
          <div key={s.id} className="session-item">
            <div className="session-head">
              <strong>{s.bookTitle}</strong>
              <span>{s.date}</span>
            </div>
            <p>Leídas <strong>{s.endPage - s.startPage} páginas</strong> (De la pág. {s.startPage} a la {s.endPage})</p>
            {s.notes && <p className="session-notes"><em>"{s.notes}"</em></p>}
            <button className="btn-del-session" onClick={() => onDelete(s.id, s.bookId, s.startPage)}>Deshacer Ritual ✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookForm({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !totalPages) return;
    onSave({ title, author: author || "Anónimo", totalPages: parseInt(totalPages), genre, status: "Pendiente" });
  };

  return (
    <div className="modal-overlay">
      <div className="modal card">
        <h3>✨ Convocar Nuevo Grimorio</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Título Sagrado" value={title} onChange={e => setTitle(e.target.value)} required />
          <input type="text" placeholder="Autor / Entidad" value={author} onChange={e => setAuthor(e.target.value)} />
          <input type="number" placeholder="Cantidad de Páginas" value={totalPages} onChange={e => setTotalPages(e.target.value)} required />
          <select value={genre} onChange={e => setGenre(e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="modal-actions">
            <button type="submit" className="btn btn-submit">Sellar tomo</button>
            <button type="button" className="btn btn-cancel" onClick={onClose}>Cerrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- VARIABLE DE ESTILOS CSS ---
const styles = `
  .app {
    background-color: ${PALETTE.bg};
    color: ${PALETTE.text};
    min-height: 100vh;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-family: 'Lato', sans-serif;
  }
  .topbar {
    border-bottom: 2px solid ${PALETTE.accent};
    padding-bottom: 14px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .topbar-logo {
    font-family: 'Cinzel', serif;
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .crest-icon { color: ${PALETTE.accent2}; font-size: 24px; text-shadow: 0 0 8px ${PALETTE.accent2}; }
  .topbar-logo span { font-size: 10px; color: ${PALETTE.muted}; letter-spacing: 2px; font-family: 'Lato', sans-serif; display: block; margin-top: 2px; }

  .nav { display: flex; background: ${PALETTE.surface}; padding: 4px; border-radius: 25px; gap: 4px; }
  .nav-btn { flex: 1; background: transparent; border: none; color: ${PALETTE.muted}; padding: 10px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: bold; }
  .nav-btn.active { background: ${PALETTE.accent3}; color: #fff; box-shadow: 0 0 10px rgba(255,77,84,0.15); }
  
  .section-title { font-family: 'Cinzel', serif; font-size: 20px; text-align: center; margin-bottom: 12px; color: #fff; }
  .luna-llena-banner { background: #160f29; border: 1px solid ${PALETTE.accent}; text-align: center; padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 16px; }
  
  .card { background-color: ${PALETTE.surface}; border: 1px solid ${PALETTE.border}; border-radius: 12px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
  .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-card { display: flex; flex-direction: column; justify-content: center; min-height: 100px; position: relative; }
  .stat-icon { font-size: 20px; margin-bottom: 4px; }
  .stat-num { font-size: 30px; font-weight: bold; color: #fff; font-family: 'Cinzel', serif; }
  .stat-lbl { font-size: 11px; color: ${PALETTE.muted}; margin-top: 4px; line-height: 1.3; }
  
  .btn { display: block; width: 100%; background: ${PALETTE.accent}; color: #fff; border: none; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; margin-bottom: 16px; }
  .search-box input, .form-container input, .form-container select, .modal input, .modal select { width: 100%; background: ${PALETTE.bg}; border: 1px solid ${PALETTE.accent3}; color: #fff; padding: 12px; border-radius: 6px; box-sizing: border-box; margin-bottom: 12px; outline: none; font-size: 13px; }
  .input-row { display: flex; gap: 10px; }
  
  .filter-row { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; }
  .filter-btn { background: ${PALETTE.surface}; border: 1px solid ${PALETTE.accent3}; color: ${PALETTE.text}; padding: 6px 14px; border-radius: 16px; font-size: 11px; white-space: nowrap; cursor: pointer; }
  .filter-btn.active { background: ${PALETTE.accent}; border-color: ${PALETTE.accent2}; }
  
  .books-list { display: flex; flex-direction: column; gap: 12px; }
  .book-item { background: ${PALETTE.card}; border: 1px solid ${PALETTE.border}; border-left: 4px solid #fff; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .book-main-info h4 { margin: 0 0 4px 0; font-size: 15px; color: #fff; }
  .book-main-info p { margin: 0 0 10px 0; font-size: 12px; color: ${PALETTE.muted}; }
  .genre-tag { background: ${PALETTE.bg}; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
  .progress-bg { background: ${PALETTE.bg}; height: 6px; border-radius: 3px; overflow: hidden; }
  .progress-bar { background: linear-gradient(90deg, ${PALETTE.accent}, ${PALETTE.accent2}); height: 100%; }
  .pct-text { font-size: 11px; color: ${PALETTE.muted}; display: block; margin-top: 4px; }
  
  .book-actions { display: flex; gap: 8px; }
  .book-actions select { background: ${PALETTE.bg}; color: #fff; border: 1px solid ${PALETTE.accent3}; padding: 6px; border-radius: 4px; font-size: 11px; flex: 1; }
  .btn-del { background: transparent; border: none; color: ${PALETTE.muted}; cursor: pointer; font-size: 14px; padding: 0 8px; }
  .btn-del:hover { color: ${PALETTE.accent2}; }

  .session-item { background: ${PALETTE.surface}; border: 1px solid ${PALETTE.border}; padding: 12px; border-radius: 8px; margin-bottom: 10px; position: relative; }
  .session-head { display: flex; justify-content: space-between; font-size: 13px; color: #fff; margin-bottom: 4px; }
  .session-head span { color: ${PALETTE.muted}; font-size: 11px; }
  .session-notes { font-size: 11px; color: ${PALETTE.muted}; margin-top: 4px; }
  .btn-del-session { background: none; border: none; color: ${PALETTE.accent2}; font-size: 10px; cursor: pointer; padding: 0; margin-top: 6px; display: block; }

  .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; }
  .modal { width: 100%; max-width: 400px; }
  .modal-actions { display: flex; gap: 10px; }
  .btn-cancel { background: ${PALETTE.accent3}; }
  
  .goth-footer { text-align: center; font-size: 11px; color: ${PALETTE.muted}; padding: 25px 0 10px 0; margin-top: auto; border-top: 1px solid ${PALETTE.border}; }
`;
