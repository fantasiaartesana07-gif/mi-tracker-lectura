import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- ESTADOS PRINCIPALES ---
  const [pestanaActiva, setPestanaActiva] = useState('cripta'); // 'cripta', 'tomos', 'rituales'
  const [filtroTomo, setFiltroTomo] = useState('todos'); // 'todos', 'pendiente', 'lectura', 'terminado', 'abandonado'
  const [busqueda, setBusqueda] = useState("");

  // Persistencia en LocalStorage para no perder tus datos reales
  const [tomos, setTomos] = useState(() => {
    const guardados = localStorage.getItem('neofito_tomos');
    return guardados ? JSON.parse(guardados) : [];
  });

  const [rituales, setRituales] = useState(() => {
    const guardados = localStorage.getItem('neofito_rituales');
    return guardados ? JSON.parse(guardados) : [];
  });

  // --- ESTADOS DE FORMULARIOS ---
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoAutor, setNuevoAutor] = useState("");
  const [totalPaginas, setTotalPaginas] = useState("");
  const [formatoTomo, setFormatoTomo] = useState("Físico");
  const [generoTomo, setGeneroTomo] = useState("Fantasía");

  // Formulario de Rituales
  const [ritualTomoId, setRitualTomoId] = useState("");
  const [ritualFecha, setRitualFecha] = useState("2026-05-31");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [pagInicio, setPagInicio] = useState(0);
  const [pagFin, setPagFin] = useState(0);
  const [notaRitual, setNotaRitual] = useState("");

  useEffect(() => {
    localStorage.setItem('neofito_tomos', JSON.stringify(tomos));
  }, [tomos]);

  useEffect(() => {
    localStorage.setItem('neofito_rituales', JSON.stringify(rituales));
  }, [rituales]);

  // --- MANEJADORES DE EVENTOS ---
  const manejarAgregarTomo = (e) => {
    e.preventDefault();
    if (!nuevoTitulo || !totalPaginas) return;

    const nuevoTomo = {
      id: Date.now(),
      titulo: nuevoTitulo,
      autor: nuevoAutor || "Anónimo",
      paginasTotales: parseInt(totalPaginas),
      paginasLeidas: 0,
      estado: 'pendiente', // 'pendiente', 'lectura', 'terminado', 'abandonado'
      formato: formatoTomo,
      genero: generoTomo,
      calificacion: 0
    };

    setTomos([...tomos, nuevoTomo]);
    setNuevoTitulo("");
    setNuevoAutor("");
    setTotalPaginas("");
  };

  const manejarAgregarRitual = (e) => {
    e.preventDefault();
    if (!ritualTomoId || pagFin < pagInicio) return;

    const tomoAsociado = tomos.find(t => t.id === parseInt(ritualTomoId));
    if (!tomoAsociado) return;

    const nuevoRitual = {
      id: Date.now(),
      tomoId: tomoAsociado.id,
      tomoTitulo: tomoAsociado.titulo,
      fecha: ritualFecha,
      horaInicio,
      horaFin,
      pagInicio: parseInt(pagInicio),
      pagFin: parseInt(pagFin),
      nota: notaRitual
    };

    setRituales([...rituales, nuevoRitual]);
    
    // Actualizar páginas leídas en el tomo de forma automática
    setTomos(tomos.map(t => {
      if (t.id === tomoAsociado.id) {
        const nuevasLeidas = Math.max(t.paginasLeidas, parseInt(pagFin));
        const nuevoEstado = nuevasLeidas >= t.paginasTotales ? 'terminado' : 'lectura';
        return { ...t, paginasLeidas: nuevasLeidas, estado: nuevoEstado };
      }
      return t;
    }));

    setNotaRitual("");
  };

  const actualizarCalificacion = (id, estrellas) => {
    setTomos(tomos.map(t => t.id === id ? { ...t, calificacion: estrellas } : t));
  };

  const cambiarEstadoTomo = (id, nuevoEstado) => {
    setTomos(tomos.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
  };

  // --- ANALÍTICAS Y CONTEOS (PANEL DE LA ETERNIDAD) ---
  const tomosSellados = tomos.length;
  const paginasDevoradas = rituales.reduce((acc, curr) => acc + (curr.pagFin - curr.pagInicio), 0);
  const tomosTerminados = tomos.filter(t => t.estado === 'terminado').length;
  
  const tomosConCalificacion = tomos.filter(t => t.calificacion > 0);
  const calificacionMedia = tomosConCalificacion.length > 0 
    ? (tomosConCalificacion.reduce((acc, curr) => acc + curr.calificacion, 0) / tomosConCalificacion.length).toFixed(1)
    : 0;

  const librosFiltrados = tomos.filter(t => {
    const coincideBusqueda = t.titulo.toLowerCase().includes(busqueda.toLowerCase()) || t.autor.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFiltro = filtroTomo === 'todos' || t.estado === filtroTomo;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="app-container">
      
      {/* HEADER PRINCIPAL */}
      <header className="goth-topbar">
        <div className="goth-logo-box">
          <span className="goth-crest">☥</span>
          <div className="topbar-logo">
            NEÓFITO
            <span>BIBLIOTECA DE SANGRE</span>
          </div>
        </div>

        {/* NAVEGACIÓN MÍSTICA DE PESTAÑAS (IGUAL AL VIDEO) */}
        <nav className="goth-tabs">
          <button className={`tab-btn ${pestanaActiva === 'cripta' ? 'active' : ''}`} onClick={() => setPestanaActiva('cripta')}>
            <span className="tab-icon">🏰</span> Cripta
          </button>
          <button className={`tab-btn ${pestanaActiva === 'tomos' ? 'active' : ''}`} onClick={() => setPestanaActiva('tomos')}>
            <span className="tab-icon">🔮</span> Tomos
          </button>
          <button className={`tab-btn ${pestanaActiva === 'rituales' ? 'active' : ''}`} onClick={() => setPestanaActiva('rituales')}>
            <span className="tab-icon">🩸</span> Rituales
          </button>
        </nav>
      </header>

      {/* CONTENIDO DINÁMICO SEGÚN PESTAÑA */}
      <main className="main-content">
        
        {/* PESTAÑA 1: CRIPTA (PANEL DE LA ETERNIDAD) */}
        {pestanaActiva === 'cripta' && (
          <section className="fade-in">
            <div className="section-title-box">
              <h2>✦ Panel de la Eternidad ✦</h2>
              <div className="luna-status">
                <span className="moon-icon">🌕</span> <strong>Luna llena</strong> — <em>Poder máximo - noche de luna llena</em>
              </div>
            </div>

            {/* Grid de Analíticas Estilo Tarjetas Cuadradas */}
            <div className="stats-grid-cards">
              <div className="stat-card-premium">
                <span className="card-icon">📚</span>
                <span className="card-number">{tomosTerminados}</span>
                <span className="card-label">Tomos sellados de {tomosSellados} en la cripta</span>
              </div>

              <div className="stat-card-premium">
                <span className="card-icon">📜</span>
                <span className="card-number">{paginasDevoradas}</span>
                <span className="card-label">Páginas devoradas en {rituales.length} rituales</span>
              </div>

              <div className="stat-card-premium">
                <span className="card-icon">⏳</span>
                <span className="card-number">{rituales.length * 30}m</span>
                <span className="card-label">Horas en las sombras</span>
              </div>

              <div className="stat-card-premium">
                <span className="card-icon">🩸</span>
                <span className="card-number">{calificacionMedia}</span>
                <span className="card-label">Calificación media sobre {tomosConCalificacion.length} tomos</span>
              </div>
            </div>

            {/* Gráficos / Listas informativas inferiores */}
            <div className="shadow-info-box">
              <h3>📊 Distribución de Sombras</h3>
              <p className="sub-shadow">Formatos y géneros literarios en posesión...</p>
              <div className="genres-placeholder">
                {tomosSellados === 0 ? "Las sombras aguardan datos aún..." : `Gestionando tus formatos activos.`}
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 2: TOMOS (BIBLIOTECA ÓSCURA) */}
        {pestanaActiva === 'tomos' && (
          <section className="fade-in">
            <div className="section-title-box">
              <h2>✦ La Biblioteca Oscura ✦</h2>
            </div>

            {/* Formulario Desplegable para añadir libro */}
            <details className="goth-details-form">
              <summary className="btn-trigger-form">➕ Añadir tomo oculto</summary>
              <form onSubmit={manejarAgregarTomo} className="goth-form-box">
                <input type="text" placeholder="Título del Tomo" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} required />
                <input type="text" placeholder="Autor / Entidad" value={nuevoAutor} onChange={(e) => setNuevoAutor(e.target.value)} />
                <input type="number" placeholder="Páginas Totales" value={totalPaginas} onChange={(e) => setTotalPaginas(e.target.value)} required min="1" />
                <div className="form-row">
                  <select value={formatoTomo} onChange={(e) => setFormatoTomo(e.target.value)}>
                    <option value="Físico">Físico</option>
                    <option value="Digital">Digital</option>
                    <option value="Audio">Audiolibro</option>
                  </select>
                  <select value={generoTomo} onChange={(e) => setGeneroTomo(e.target.value)}>
                    <option value="Fantasía">Fantasía</option>
                    <option value="Gótico">Gótico</option>
                    <option value="Esoterismo">Esoterismo</option>
                    <option value="Misterio">Misterio</option>
                  </select>
                </div>
                <button type="submit" className="goth-btn">Sellar Manuscrito</button>
              </form>
            </details>

            {/* Buscador de la Cripta */}
            <div className="search-bar-box">
              <input type="text" placeholder="Buscar en la cripta..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              <span className="search-eye">👁️</span>
            </div>

            {/* Filtros de Estado Estilo Botones de la Cripta */}
            <div className="filter-chips">
              <button className={filtroTomo === 'todos' ? 'active' : ''} onClick={() => setFiltroTomo('todos')}>🌑 Todos</button>
              <button className={filtroTomo === 'pendiente' ? 'active' : ''} onClick={() => setFiltroTomo('pendiente')}>🌙 Pendiente</button>
              <button className={filtroTomo === 'lectura' ? 'active' : ''} onClick={() => setFiltroTomo('lectura')}>🩸 En lectura</button>
              <button className={filtroTomo === 'terminado' ? 'active' : ''} onClick={() => setFiltroTomo('terminado')}>✨ Terminado</button>
              <button className={filtroTomo === 'abandonado' ? 'active' : ''} onClick={() => setFiltroTomo('abandonado')}>🥀 Abandonado</button>
            </div>

            {/* Listado de Libros Reales */}
            <div className="tomos-list">
              {librosFiltrados.length > 0 ? (
                librosFiltrados.map(tomo => {
                  const pct = Math.round((tomo.paginasLeidas / tomo.paginasTotales) * 100);
                  return (
                    <div key={tomo.id} className="tomo-row-card">
                      <div className="tomo-info">
                        <h3>{tomo.titulo}</h3>
                        <p>Por {tomo.autor} — <span>{tomo.genero} ({tomo.formato})</span></p>
                      </div>
                      
                      <div className="tomo-interactive">
                        <div className="progress-bar-goth"><div style={{ width: `${pct}%` }}></div></div>
                        <span className="pct-text">{tomo.paginasLeidas}/{tomo.paginasTotales} px ({pct}%)</span>
                        
                        <div className="tomo-actions">
                          <select value={tomo.estado} onChange={(e) => cambiarEstadoTomo(tomo.id, e.target.value)}>
                            <option value="pendiente">Pendiente</option>
                            <option value="lectura">En Lectura</option>
                            <option value="terminado">Terminado</option>
                            <option value="abandonado">Abandonado</option>
                          </select>
                          
                          <div className="stars-rating">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={tomo.calificacion >= s ? 'star full' : 'star'} onClick={() => actualizarCalificacion(tomo.id, s)}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <div className="withered-rose">🥀</div>
                  <p>La cripta está vacía... Añade tu primer tomo oscuro.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* PESTAÑA 3: RITUALES (LOS GRANDES RITUALES) */}
        {pestanaActiva === 'rituales' && (
          <section className="fade-in">
            <div className="section-title-box">
              <h2>✦ Los Grandes Rituales ✦</h2>
            </div>

            {/* Formulario de Registro de Lectura Diaria */}
            <form onSubmit={manejarAgregarRitual} className="goth-form-box ritual-form">
              <h3>🩸 Registrar Nuevo Ritual</h3>
              
              <label>Tomo a invocar:</label>
              <select value={ritualTomoId} onChange={(e) => setRitualTomoId(e.target.value)} required>
                <option value="">— Seleccionar Manuscrito Activo —</option>
                {tomos.filter(t => t.estado !== 'terminado').map(t => (
                  <option key={t.id} value={t.id}>{t.titulo} (Vas por la pág. {t.paginasLeidas})</option>
                ))}
              </select>

              <div className="form-row">
                <div>
                  <label>Fecha:</label>
                  <input type="date" value={ritualFecha} onChange={(e) => setRitualFecha(e.target.value)} />
                </div>
                <div>
                  <label>Pág. Inicio:</label>
                  <input type="number" value={pagInicio} onChange={(e) => setPagInicio(e.target.value)} min="0" />
                </div>
                <div>
                  <label>Pág. Fin:</label>
                  <input type="number" value={pagFin} onChange={(e) => setPagFin(e.target.value)} min="0" />
                </div>
              </div>

              <input type="text" placeholder="Notas del ritual (Comentario opcional)..." value={notaRitual} onChange={(e) => setNotaRitual(e.target.value)} />
              
              <button type="submit" className="goth-btn btn-blood">Sellar ritual 🔥</button>
            </form>

            {/* Historial de Rituales */}
            <div className="rituales-history">
              <h3>📜 Pergaminos de Rituales</h3>
              {rituales.length > 0 ? (
                rituales.slice().reverse().map(rit => (
                  <div key={rit.id} className="ritual-scroll-card">
                    <div className="scroll-header">
                      <h4>{rit.tomoTitulo}</h4>
                      <span className="scroll-date">📅 {rit.fecha}</span>
                    </div>
                    <p>Leídas <strong>{rit.pagFin - rit.pagInicio} páginas</strong> (Desde la pág. {rit.pagInicio} hasta la {rit.pagFin}).</p>
                    {rit.nota && <p className="scroll-note"><em>"{rit.nota}"</em></p>}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Sin rituales registrados en los anales...</p>
                </div>
              )}
            </div>
          </section>
        )}

      </main>

      <footer className="goth-footer">
        <p>© 2026 Neófito App — Hecho en las Sombras</p>
      </footer>

    </div>
  );
}

export default App;
