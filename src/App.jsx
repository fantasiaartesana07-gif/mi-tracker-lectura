import { useState, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap');`;

const GENRES = ["Fantasía", "Romance", "Thriller", "Ciencia Ficción", "Drama", "Esoterismo", "Gótico", "Terror", "Misterio", "Historia"];
const STATES = ["Pendiente", "En lectura", "Terminado", "Abandonado"];
const RATINGS = [1, 2, 3, 4, 5];
const LANGUAGES = ["Español", "Francés"];

const PALETTE = {
  bg: "#07040f",
  surface: "#110b24",
  card: "#171032",
  accent: "#a91d22",
  accent2: "#ff4d54",
  accent3: "#3d354e",
  text: "#ffffff",
  muted: "#7a6a95",
  border: "rgba(122, 106, 149, 0.25)",
};

export default function App() {
  const [tab, setTab] = useState("gallery");
  const [books, setBooks] = useState(() => JSON.parse(localStorage.getItem("books")) || []);
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem("sessions")) || []);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { localStorage.setItem("books", JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem("sessions", JSON.stringify(sessions)); }, [sessions]);

  const addBook = (book) => { setBooks([...books, { ...book, id: Date.now().toString(), readPages: 0 }]); setShowAdd(false); };
  const editBook = (updated) => setBooks(books.map(b => b.id === updated.id ? updated : b));
  const deleteBook = (id) => { if (confirm("¿Desterrar este manuscrito?")) { setBooks(books.filter(b => b.id !== id)); } };

  return (
    <>
      <style>{FONTS}</style>
      <style>{styles}</style>
      <div className="app">
        <header className="topbar">
          <div className="topbar-logo">Neófito: Biblioteca de Sangre</div>
          <nav className="nav">
            <button className={tab === "gallery" ? "active" : ""} onClick={() => setTab("gallery")}>🔮 Tomos</button>
          </nav>
        </header>

        <main>
          <button className="btn-add" onClick={() => setShowAdd(true)}>➕ Convocar nuevo tomo</button>
          <div className="books-list">
            {books.map(b => (
              <div key={b.id} className="book-item">
                <h4 className={b.lang === "Francés" ? "french-title" : ""}>{b.title}</h4>
                <p>{b.author} | {b.lang}</p>
                <button className="btn-del" onClick={() => deleteBook(b.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        </main>

        {showAdd && <BookForm onSave={addBook} onClose={() => setShowAdd(false)} />}
      </div>
    </>
  );
}

function BookForm({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [lang, setLang] = useState("Español");
  const [genre, setGenre] = useState(GENRES[0]);

  return (
    <div className="modal-overlay">
      <div className="card modal">
        <h3>Convocar Grimorio</h3>
        <input placeholder="Título" onChange={e => setTitle(e.target.value)} />
        <input placeholder="Autor" onChange={e => setAuthor(e.target.value)} />
        <select onChange={e => setLang(e.target.value)}>{LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}</select>
        <select onChange={e => setGenre(e.target.value)}>{GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select>
        <button onClick={() => onSave({ title, author, lang, genre })}>Guardar</button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

const styles = `
  .app {
    background: ${PALETTE.bg};
    background-image: radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px);
    background-size: 550px 550px, 350px 350px;
    color: ${PALETTE.text};
    min-height: 100vh;
    padding: 20px;
    font-family: 'Lato', sans-serif;
  }
  .book-item {
    background: ${PALETTE.card};
    border: 1px solid ${PALETTE.border};
    border-left: none;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 8px;
  }
  .french-title { font-style: italic; color: ${PALETTE.accent2}; }
  .card { background: ${PALETTE.surface}; padding: 20px; border-radius: 12px; border: 1px solid ${PALETTE.border}; }
  .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; }
  input, select, button { width: 100%; margin-bottom: 10px; padding: 10px; background: ${PALETTE.bg}; color: white; border: 1px solid ${PALETTE.accent3}; }
`;
