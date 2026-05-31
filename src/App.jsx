import React, { useState } from 'react';
import './App.css';

// Datos de ejemplo para simular los libros/grimorios de la biblioteca
const GRIMORIOS_DEMO = [
  { id: 1, titulo: "El Despertar del Vampiro", autor: "Ciel", categoria: "Sangre", leido: "45%" },
  { id: 2, titulo: "Ritos de la Luna Menguante", autor: "Anónimo", categoria: "Esoterismo", leido: "12%" },
  { id: 3, titulo: "Tratado de Alquimia Oscura", autor: "Fausto", categoria: "Magia", leido: "90%" },
  { id: 4, titulo: "Crónicas de la Cripta", autor: "Stoker", categoria: "Historia", leido: "0%" }
];

function App() {
  const [busqueda, setBusqueda] = useState("");

  // Filtrar libros según lo que se escriba en el buscador
  const librosFiltrados = GRIMORIOS_DEMO.filter(libro =>
    libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    libro.autor.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="app-container">
      
      {/* BARRA SUPERIOR (TOPBAR) */}
      <header className="goth-topbar">
        <div className="goth-logo-box">
          <span className="goth-crest" aria-label="Ankh">☥</span>
          <div className="topbar-logo">
            NEÓFITO
            <span>BIBLIOTECA DE SANGRE</span>
          </div>
        </div>
        <nav className="topbar-nav">
          <button className="goth-nav-btn" title="Perfil del Iniciado">🦇</button>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        
        {/* SECCIÓN DE BIENVENIDA / BUSCADOR */}
        <section className="welcome-section">
          <h1>Bienvenido al Santuario, Neófito</h1>
          <p>Sumergite en los manuscritos prohibidos de la biblioteca.</p>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Buscar grimorio o autor..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="goth-input"
            />
            <span className="search-icon">👁️‍🗨️</span>
          </div>
        </section>

        {/* ESTANTERÍA DE LIBROS */}
        <section className="shelf-section">
          <h2><span className="goth-bullet">✦</span> Mis Lecturas Activas</h2>
          
          <div className="books-grid">
            {librosFiltrados.length > 0 ? (
              librosFiltrados.map(libro => (
                <div key={libro.id} className="book-card">
                  <div className="book-badge">{libro.categoria}</div>
                  <h3 className="book-title">{libro.titulo}</h3>
                  <p className="book-author">Por {libro.autor}</p>
                  
                  {/* Barra de progreso de lectura estilo gótico */}
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: libro.leido }}></div>
                  </div>
                  <span className="progress-text">Progreso: {libro.leido}</span>
                </div>
              ))
            ) : (
              <p className="no-results">Ningún manuscrito coincide con tu búsqueda...</p>
            )}
          </div>
        </section>

      </main>

      {/* PIE DE PÁGINA GÓTICO */}
      <footer className="goth-footer">
        <p>© 2026 Neófito App — Hecho en las Sombras</p>
      </footer>

    </div>
  );
}

export default App;
