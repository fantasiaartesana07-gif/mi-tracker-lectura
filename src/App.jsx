import { useState } from 'react';
import './Goth.css';

export default function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [lang, setLang] = useState("Español");

  const addTomo = () => {
    if (!title.trim()) return;
    setBooks([...books, { id: Date.now(), title, lang }]);
    setTitle("");
  };

  return (
    <div className="app">
      <h1>🏰 Neófito: Biblioteca de Sangre</h1>
      
      <div className="card">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Título del manuscrito..." 
        />
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="Español">Español</option>
          <option value="Francés">Francés</option>
        </select>
        <button onClick={addTomo}>Consagrar</button>
      </div>

      <div className="books-list">
        {books.map(b => (
          <div key={b.id} className="book-item">
            <h4 className={b.lang === "Francés" ? "french-title" : ""}>
              {b.title}
            </h4>
            <small style={{ color: "#7a6a95" }}>Idioma: {b.lang}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
