import React, { useState, useEffect } from 'react';

function App() {
  // --- ESTADOS DE NAVEGACIÓN Y FILTROS ---
  const [pestanaActiva, setPestanaActiva] = useState('cripta'); // 'cripta', 'tomos', 'rituales'
  const [filtroTomo, setFiltroTomo] = useState('todos');
  const [busqueda, setBusqueda] = useState("");

  // --- PERSISTENCIA DE DATOS REALES ---
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
  
  // Nuevos campos
  const [nuevoGenero, setNuevoGenero] = useState("");
  const [nuevaPortada, setNuevaPortada] = useState("");
  const [nuevaSinopsis, setNuevaSinopsis] = useState("");
  
  // CONTROL DE EDICIÓN
  const [tomoEdicionId, setTomoEdicionId] = useState(null);

  const [ritualTomoId, setRitualTomoId] = useState("");
  const [pagInicio, setPagInicio] = useState(0);
  const [pagFin, setPagFin] = useState(0);
  const [notaRitual, setNotaRitual] = useState("");

  useEffect(() => {
    localStorage.setItem('neofito_tomos', JSON.stringify(tomos));
  }, [tomos]);

  useEffect(() => {
    localStorage.setItem('neofito_rituales', JSON.stringify(rituales));
  }, [rituales]);

  // --- MANEJADORES DE LOGICA ---
  const guardarTomo = (e) => {
    e.preventDefault();
    if (!nuevoTitulo || !totalPaginas) return;

    if (tomoEdicionId) {
      // MODO EDICIÓN: Actualizar manuscrito existente
      setTomos(tomos.map(t => {
        if (t.id === tomoEdicionId) {
          return {
            ...t,
            titulo: nuevoTitulo,
            autor: nuevoAutor || "Anónimo",
            genero: nuevoGenero || "Desconocido",
            portada: nuevaPortada || "",
            sinopsis: nuevaSinopsis || "",
            paginasTotales: parseInt(totalPaginas)
          };
        }
        return t;
      }));
      setTomoEdicionId(null);
    } else {
      // MODO CREACIÓN: Añadir nuevo tomo oculto
      const nuevo = {
        id: Date.now(),
        titulo: nuevoTitulo,
        autor: nuevoAutor || "Anónimo",
        genero: nuevoGenero || "Desconocido",
        portada: nuevaPortada || "",
        sinopsis: nuevaSinopsis || "",
        paginasTotales: parseInt(totalPaginas),
        paginasLeidas: 0,
        estado: 'pendiente',
        calificacion: 0
      };
      setTomos([...tomos, nuevo]);
    }

    // Resetear formulario
    setNuevoTitulo("");
    setNuevoAutor("");
    setTotalPaginas("");
    setNuevoGenero("");
    setNuevaPortada("");
    setNuevaSinopsis("");
  };

  // Activa el modo edición cargando los datos en el formulario
  const activarEdicion = (tomo) => {
    setTomoEdicionId(tomo.id);
    setNuevoTitulo(tomo.titulo);
    setNuevoAutor(tomo.autor === "Anónimo" ? "" : tomo.autor);
    setTotalPaginas(tomo.paginasTotales);
    setNuevoGenero(tomo.genero === "Desconocido" ? "" : tomo.genero);
    setNuevaPortada(tomo.portada);
    setNuevaSinopsis(tomo.sinopsis);
    
    // Abre automáticamente el <details> del formulario si estuviera cerrado
    const detallesForm = document.getElementById('detalles-tomo');
    if (detallesForm) detallesForm.open = true;
  };

  // Cancela la edición y limpia los inputs
  const cancelarEdicion = () => {
    setTomoEdicionId(null);
    setNuevoTitulo("");
    setNuevoAutor("");
    setTotalPaginas("");
    setNuevoGenero("");
    setNuevaPortada("");
    setNuevaSinopsis("");
  };

  // Elimina permanentemente el manuscrito de la cripta
  const desterrarTomo = (id) => {
    if (window.confirm("¿Seguro que deseas desterrar este manuscrito para siempre en el olvido?")) {
      setTomos(tomos.filter(t => t.id !== id));
      // Si se estaba editando ese tomo, cancelamos la edición
      if (tomoEdicionId === id) {
        cancelarEdicion();
      }
    }
  };

  const agregarRitual = (e) => {
    e.preventDefault();
    if (!ritualTomoId || parseInt(pagFin) < parseInt(pagInicio)) return;

    const tomoAsociado = tomos.find(t => t.id === parseInt(ritualTomoId));
    if (!tomoAsociado) return;

    const nuevo = {
      id: Date.now(),
      tomoId: tomoAsociado.id,
      tomoTitulo: tomoAsociado.titulo,
      fecha: new Date().toLocaleDateString('es-AR'),
      pagInicio: parseInt(pagInicio),
      pagFin: parseInt(pagFin),
      nota: notaRitual
    };

    setRituales([...rituales, nuevo]);
    
    setTomos(tomos.map(t => {
      if (t.id === tomoAsociado.id) {
        const avanzadas = Math.max(t.paginasLeidas, parseInt(pagFin));
        const finalizado = avanzadas >= t.paginasTotales ? 'terminado' : 'lectura';
        return { ...t, paginasLeidas: avanzadas, estado: finalizado };
      }
      return t;
    }));

    setNotaRitual("");
    setPagInicio(pagFin);
  };

  const calificarTomo = (id, nota) => {
    setTomos(tomos.map(t => t.id === id ? { ...t, calificacion: nota } : t));
  };

  // --- CÁLCULOS DEL PANEL DE LA ETERNIDAD ---
  const tomosSellados = tomos.length;
  const paginasDevoradas = rituales.reduce((acc, r) => acc + (r.pagFin - r.pagInicio), 0);
  const tomosTerminados = tomos.filter(t => t.estado === 'terminado').length;
  const calificados = tomos.filter(t => t.calificacion > 0);
  const mediaCalificacion = calificados.length > 0 
    ? (calificados.reduce((acc, t) => acc + t.calificacion, 0) / calificados.length).toFixed(1)
    : "0";

  const tomosFiltrados = tomos.filter(t => {
    const cumpleFiltro = filtroTomo === 'todos' || t.estado === filtroTomo;
    const cumpleBusqueda = t.titulo.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  return (
    <div style={styles.appContainer}>
      
      <style>{`
        body { background-color: #07040f !important; margin: 0; color: #cdcbd1; font-family: sans-serif; }
        input::placeholder, textarea::placeholder { color: #5a4b75; }
        select { appearance: none; WebkitAppearance: none; }
      `}</style>

      {/* HEADER DE LA APP */}
      <header style={styles.header}>
        <div style={styles.logoBox}>
          <span style={styles.crest}>☥</span>
          <h1 style={styles.logoText}>NEÓFITO<span style={styles.subLogo}>BIBLIOTECA DE SANGRE</span></h1>
        </div>

        <div style={styles.tabsContainer}>
          <button style={{...styles.tabBtn, ...(pestanaActiva === 'cripta' ? styles.tabActive : {})}} onClick={() => setPestanaActiva('cripta')}>
            🏰 Cripta
          </button>
          <button style={{...styles.tabBtn, ...(pestanaActiva === 'tomos' ? styles.tabActive : {})}} onClick={() => setPestanaActiva('tomos')}>
            🔮 Tomos
          </button>
          <button style={{...styles.tabBtn, ...(pestanaActiva === 'rituales' ? styles.tabActive : {})}} onClick={() => setPestanaActiva('rituales')}>
            🩸 Rituales
          </button>
        </div>
      </header>

      {/* CUERPO DINÁMICO */}
      <main style={styles.main}>
        
        {/* PESTAÑA: CRIPTA */}
        {pestanaActiva === 'cripta' && (
          <div>
            <h2 style={styles.sectionTitle}>✦ Panel de la Eternidad ✦</h2>
            <div style={styles.lunaStatus}>
              🌕 <strong>Luna llena</strong> — <em>Poder máximo - noche de luna llena</em>
            </div>

            <div style={styles.gridCards}>
              <div style={styles.card}>
                <span style={styles.cardIcon}>📚</span>
                <span style={styles.cardNum}>{tomosTerminados}</span>
                <span style={styles.cardLabel}>Tomos sellados de {tomosSellados} en la cripta</span>
              </div>
              <div style={styles.card}>
                <span style={styles.cardIcon}>📜</span>
                <span style={styles.cardNum}>{paginasDevoradas}</span>
                <span style={styles.cardLabel}>Páginas devoradas en {rituales.length} rituales</span>
              </div>
              <div style={styles.card}>
                <span style={styles.cardIcon}>⏳</span>
                <span style={styles.cardNum}>{rituales.length * 20}m</span>
                <span style={styles.cardLabel}>Horas en las sombras</span>
              </div>
              <div style={styles.card}>
                <span style={styles.cardIcon}>💀</span>
                <span style={styles.cardNum}>{mediaCalificacion}</span>
                <span style={styles.cardLabel}>Calificación media sobre {calificados.length} tomos</span>
              </div>
            </div>

            <div style={styles.shadowBox}>
              <h3 style={{margin: 0, fontSize: '15px', color: '#fff'}}>📊 Distribución de Sombras</h3>
              <p style={{fontSize: '12px', color: '#7a6a95', margin: '4px 0 12px 0'}}>Formatos y géneros literarios en posesión...</p>
              <div style={{color: '#7a6a95', fontSize: '13px', fontStyle: 'italic'}}>Las sombras aguardan datos aún...</div>
            </div>
          </div>
        )}

        {/* PESTAÑA: TOMOS */}
        {pestanaActiva === 'tomos' && (
          <div>
            <h2 style={styles.sectionTitle}>✦ La Biblioteca Oscura ✦</h2>

            {/* Añadir / Editar Libro Formulario */}
            <details id="detalles-tomo" style={{marginBottom: '15px'}}>
              <summary style={{...styles.summaryBtn, borderColor: tomoEdicionId ? '#ff4d54' : '#1f163a'}}>
                {tomoEdicionId ? '✍️ Modificando Manuscrito Oculto' : '➕ Añadir tomo oculto'}
              </summary>
              <form onSubmit={guardarTomo} style={styles.formBox}>
                <input style={styles.input} type="text" placeholder="Título del Tomo *" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} required />
                <input style={styles.input} type="text" placeholder="Autor / Entidad" value={nuevoAutor} onChange={e => setNuevoAutor(e.target.value)} />
                
                <div style={{display: 'flex', gap: '10px'}}>
                  <select style={{...styles.select, flex: 1}} value={nuevoGenero} onChange={e => setNuevoGenero(e.target.value)}>
                    <option value="">Género Oscuro...</option>
                    <option value="Horror">Horror</option>
                    <option value="Ocultismo">Ocultismo</option>
                    <option value="Fantasía Oscura">Fantasía Oscura</option>
                    <option value="Misterio">Misterio</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <input style={{...styles.input, flex: 1}} type="number" placeholder="Páginas *" value={totalPaginas} onChange={e => setTotalPaginas(e.target.value)} required />
                </div>
                
                <input style={styles.input} type="url" placeholder="URL de la Portada (Opcional)" value={nuevaPortada} onChange={e => setNuevaPortada(e.target.value)} />
                <textarea style={styles.textarea} placeholder="Sinopsis maldita..." value={nuevaSinopsis} onChange={e => setNuevaSinopsis(e.target.value)} />
                
                <div style={{display: 'flex', gap: '10px'}}>
                  <button style={{...styles.submitBtn, flex: 2, backgroundColor: tomoEdicionId ? '#800e13' : '#2d1b4e'}} type="submit">
                    {tomoEdicionId ? 'Reescribir Alquimia' : 'Sellar Manuscrito'}
                  </button>
                  {tomoEdicionId && (
                    <button style={{...styles.submitBtn, flex: 1, backgroundColor: '#333'}} type="button" onClick={cancelarEdicion}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </details>

            {/* Buscador */}
            <div style={{position: 'relative', marginBottom: '15px'}}>
              <input style={styles.input} type="text" placeholder="Buscar en la cripta..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              <span style={{position: 'absolute', right: '12px', top: '10px'}}>👁️</span>
            </div>

            {/* Chips de Filtrado */}
            <div style={styles.chipsRow}>
              {['todos', 'pendiente', 'lectura', 'terminado', 'abandonado'].map(f => (
                <button key={f} style={{...styles.chip, ...(filtroTomo === f ? styles.chipActive : {})}} onClick={() => setFiltroTomo(f)}>
                  {f === 'todos' && '🌑 Todos'}
                  {f === 'pendiente' && '🌙 Pendiente'}
                  {f === 'lectura' && '🩸 En lectura'}
                  {f === 'terminado' && '✨ Terminado'}
                  {f === 'abandonado' && '🥀 Abandonado'}
                </button>
              ))}
            </div>

            {/* Render de Tomos Expandido */}
            <div>
              {tomosFiltrados.length > 0 ? (
                tomosFiltrados.map(t => (
                  <div key={t.id} style={styles.tomoCard}>
                    <div style={{display: 'flex', gap: '12px', width: '100%'}}>
                      
                      {/* Portada */}
                      <div style={styles.portadaContainer}>
                        {t.portada ? (
                          <img src={t.portada} alt={t.titulo} style={styles.portadaImg} />
                        ) : (
                          <div style={styles.portadaPlaceholder}>🌑</div>
                        )}
                      </div>

                      {/* Información Central */}
                      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                        
                        {/* Fila del Título y Acciones de Edición/Destierro */}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px'}}>
                          <h4 style={{margin: '0 0 2px 0', color: '#fff', fontSize: '14px'}}>{t.titulo}</h4>
                          <div style={{display: 'flex', gap: '8px', flexShrink: 0}}>
                            <button title="Editar pergamino" onClick={() => activarEdicion(t)} style={styles.actionIconBtn}>✍️</button>
                            <button title="Desterrar manuscrito" onClick={() => desterrarTomo(t.id)} style={styles.actionIconBtn}>❌</button>
                          </div>
                        </div>

                        <p style={{margin: '0 0 6px 0', fontSize: '12px', color: '#7a6a95'}}>Por {t.autor}</p>
                        
                        <div style={{display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap'}}>
                          <span style={styles.miniTag}>{t.genero}</span>
                          <span style={{...styles.miniTag, color: '#ff4d54', borderColor: '#ff4d54'}}>
                            {t.paginasLeidas}/{t.paginasTotales} pág
                          </span>
                        </div>

                        {t.sinopsis && (
                          <p style={styles.sinopsisText}>{t.sinopsis}</p>
                        )}

                        {/* Selector de Cráneos & Estado */}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px'}}>
                          <div style={styles.craneosBox}>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <span 
                                key={num} 
                                onClick={() => calificarTomo(t.id, num)}
                                style={{
                                  ...styles.craneo,
                                  opacity: t.calificacion >= num ? 1 : 0.2
                                }}
                              >
                                💀
                              </span>
                            ))}
                          </div>

                          <select style={styles.miniSelect} value={t.estado} onChange={e => setTomos(tomos.map(item => item.id === t.id ? {...item, estado: e.target.value} : item))}>
                            <option value="pendiente">Pendiente</option>
                            <option value="lectura">Lectura</option>
                            <option value="terminado">Terminado</option>
                            <option value="abandonado">Abandonado</option>
                          </select>
                        </div>

                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', color: '#7a6a95', padding: '30px 0'}}>
                  <span style={{fontSize: '24px'}}>🥀</span>
                  <p style={{fontSize: '13px', marginTop: '5px'}}>La cripta está vacía... Añade tu primer tomo oscuro.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: RITUALES */}
        {pestanaActiva === 'rituales' && (
          <div>
            <h2 style={styles.sectionTitle}>✦ Los Grandes Rituales ✦</h2>
            
            <form onSubmit={agregarRitual} style={styles.formBox}>
              <h3 style={{margin: '0 0 5px 0', fontSize: '15px', color: '#fff'}}>🩸 Registrar Nuevo Ritual</h3>
              
              <label style={styles.label}>Tomo a invocar:</label>
              <select style={styles.select} value={ritualTomoId} onChange={e => setRitualTomoId(e.target.value)} required>
                <option value="">— Seleccionar Manuscrito Activo —</option>
                {tomos.filter(t => t.estado !== 'terminado').map(t => (
                  <option key={t.id} value={t.id}>{t.titulo} (Vas por la pág. {t.paginasLeidas})</option>
                ))}
              </select>

              <div style={{display: 'flex', gap: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Pág. Inicio:</label>
                  <input style={styles.input} type="number" value={pagInicio} onChange={e => setPagInicio(e.target.value)} />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Pág. Fin:</label>
                  <input style={styles.input} type="number" value={pagFin} onChange={e => setPagFin(e.target.value)} />
                </div>
              </div>

              <input style={styles.input} type="text" placeholder="Notas del ritual (Comentario opcional)..." value={notaRitual} onChange={e => setNotaRitual(e.target.value)} />
              <button style={{...styles.submitBtn, backgroundColor: '#800e13'}} type="submit">Sellar ritual 🔥</button>
            </form>

            <div style={{marginTop: '25px'}}>
              <h3 style={{fontSize: '15px', color: '#fff', borderBottom: '1px solid #1f163a', paddingBottom: '8px'}}>📜 Pergaminos de Rituales</h3>
              {rituales.length > 0 ? (
                rituales.slice().reverse().map(r => (
                  <div key={r.id} style={styles.ritualCard}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <strong style={{color: '#fff', fontSize: '13px'}}>{r.tomoTitulo}</strong>
                      <span style={{fontSize: '11px', color: '#7a6a95'}}>{r.fecha}</span>
                    </div>
                    <p style={{margin: 0, fontSize: '12px', color: '#cdcbd1'}}>Devoradas páginas {r.pagInicio} a {r.pagFin}.</p>
                    {r.nota && <p style={{margin: '4px 0 0 0', fontSize: '11px', color: '#7a6a95', fontStyle: 'italic'}}>"{r.nota}"</p>}
                  </div>
                ))
              ) : (
                <div style={{color: '#7a6a95', fontSize: '13px', padding: '15px 0'}}>Sin rituales registrados en los anales...</div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer style={styles.footer}>
        © Neófito App — Hecho en las Sombras
      </footer>
    </div>
  );
}

// --- OBJETO DE ESTILOS INTEGRADOS ---
const styles = {
  appContainer: {
    backgroundColor: '#07040f',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #1f163a',
    marginBottom: '16px',
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  crest: {
    color: '#ff4d54',
    fontSize: '22px',
  },
  logoText: {
    margin: 0,
    fontSize: '18px',
    letterSpacing: '1.5px',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  subLogo: {
    fontSize: '8px',
    color: '#7a6a95',
    letterSpacing: '2px',
    marginTop: '2px',
  },
  tabsContainer: {
    display: 'flex',
    backgroundColor: '#110b24',
    padding: '4px',
    borderRadius: '25px',
    gap: '4px',
  },
  tabBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#7a6a95',
    padding: '8px 4px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: '#1c123a',
    color: '#ffffff',
    boxShadow: '0 0 10px rgba(255, 77, 84, 0.15)',
  },
  main: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '19px',
    color: '#ffffff',
    margin: '0 0 8px 0',
    textAlign: 'center',
    fontWeight: '500',
  },
  lunaStatus: {
    backgroundColor: '#110b24',
    border: '1px dashed #2d2050',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '16px',
    color: '#cdcbd1',
  },
  gridCards: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#110b24',
    border: '1px solid #1f163a',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100px',
  },
  cardIcon: {
    fontSize: '18px',
    marginBottom: '6px',
  },
  cardNum: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: '1',
    marginBottom: '6px',
  },
  cardLabel: {
    fontSize: '10px',
    color: '#5a4b75',
    lineHeight: '1.3',
  },
  shadowBox: {
    backgroundColor: '#110b24',
    border: '1px solid #1f163a',
    borderRadius: '10px',
    padding: '14px',
  },
  summaryBtn: {
    backgroundColor: '#110b24',
    border: '1px solid #1f163a',
    padding: '10px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'center',
    listStyle: 'none',
  },
  formBox: {
    backgroundColor: '#110b24',
    border: '1px solid #1f163a',
    padding: '14px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  input: {
    backgroundColor: '#07040f',
    border: '1px solid #1f163a',
    color: '#fff',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  textarea: {
    backgroundColor: '#07040f',
    border: '1px solid #1f163a',
    color: '#fff',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    minHeight: '70px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    backgroundColor: '#07040f',
    border: '1px solid #1f163a',
    color: '#fff',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  submitBtn: {
    backgroundColor: '#2d1b4e',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  chipsRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '8px',
    marginBottom: '15px',
  },
  chip: {
    background: '#110b24',
    border: '1px solid #1f163a',
    color: '#cdcbd1',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '11px',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  chipActive: {
    background: '#800e13',
    borderColor: '#ff4d54',
    color: '#fff',
  },
  tomoCard: {
    backgroundColor: '#110b24',
    borderLeft: '3px solid #ff4d54',
    borderTop: '1px solid #1f163a',
    borderRight: '1px solid #1f163a',
    borderBottom: '1px solid #1f163a',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '10px',
    display: 'flex',
  },
  portadaContainer: {
    width: '70px',
    flexShrink: 0,
  },
  portadaImg: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #1f163a',
  },
  portadaPlaceholder: {
    width: '100%',
    height: '100px',
    backgroundColor: '#07040f',
    borderRadius: '4px',
    border: '1px solid #1f163a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  miniTag: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '10px',
    backgroundColor: '#07040f',
    border: '1px solid #2d2050',
    color: '#cdcbd1'
  },
  sinopsisText: {
    margin: '0 0 10px 0',
    fontSize: '11px',
    color: '#5a4b75',
    fontStyle: 'italic',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  craneosBox: {
    display: 'flex',
    gap: '2px',
  },
  craneo: {
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'opacity 0.2s',
  },
  miniSelect: {
    backgroundColor: '#07040f',
    border: '1px solid #1f163a',
    color: '#ff4d54',
    fontSize: '11px',
    padding: '4px',
    borderRadius: '4px',
  },
  label: {
    fontSize: '11px',
    color: '#7a6a95',
    marginBottom: '2px',
    display: 'block',
  },
  ritualCard: {
    backgroundColor: '#110b24',
    border: '1px solid #1f163a',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#5a4b75',
    paddingTop: '20px',
    marginTop: 'auto',
  },
  actionIconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    outline: 'none',
    ':hover': { opacity: 1 }
  }
};

export default App;
