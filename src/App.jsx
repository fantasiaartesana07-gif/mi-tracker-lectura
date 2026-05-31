import React, { useState } from 'react';

// Estilos embebidos para no renegar con archivos CSS separados en el celu
const styles = `
  :root {
    --bg-dark: #080512;
    --bg-card: #130a21;
    --bg-input: #1c112e;
    --purple-glow: #6320a0;
    --purple-light: #9d4edf;
    --accent-red: #a91d22;
    --text-light: #e6def5;
    --text-muted: #8c829e;
  }
  body {
    background-color: #080512;
    color: #e6def5;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin: 0;
    padding: 0;
    background-image: linear-gradient(180deg, rgba(99, 32, 160, 0.15) 0%, rgba(0,0,0,0) 100%);
    background-attachment: fixed;
  }
  .gothic-font { font-family: 'Cinzel', serif; }
  .flicker { animation: flicker 2s infinite alternate; }
  @keyframes flicker {
    0% { opacity: 0.6; text-shadow: 0 0 5px var(--accent-red); }
    100% { opacity: 0.9; text-shadow: 0 0 15px #f59e0b, 0 0 5px var(--accent-red); }
  }
`;

export default function App() {
  const [activeTab, setActiveTab] = useState('cripta');
  
  // Estados para simular que la app "hace cosas" como en tu video
  const [tomos, setTomos] = useState([]);
  const [paginasLeidas, setPaginasLeidas] = useState(0);
  const [ritualesCount, setRitualesCount] = useState(0);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <style>{styles}</style>
      
      {/* Encabezado fijo igual al del video */}
      <header style={{
        padding: '20px', textAlign: 'center', background: 'rgba(19, 10, 33, 0.85)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(99, 32, 160, 0.3)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <h1 className="gothic-font" style={{ fontSize: '20px', margin: 0, letterSpacing: '1px', textShadow: '0 0 10px var(--purple-glow)' }}>
            Cripta de Lectura
          </h1>
          
          {/* Selector de pestañas */}
          <div style={{ display: 'flex', background: '#080512', padding: '4px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {['cripta', 'tomos', 'rituales'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#6320a0' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#8c829e',
                  border: 'none', padding: '6px 14px', borderRadius: '15px',
                  fontSize: '12px', cursor: 'pointer', transition: 'all 0.3s',
                  boxShadow: activeTab === tab ? '0 0 8px #6320a0' : 'none',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'cripta' ? '🔮 Cripta' : tab === 'tomos' ? '📚 Tomos' : '🕯️ Rituales'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido Principal con tamaño de celular */}
      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        
        {/* PESTAÑA CRIPTA */}
        {activeTab === 'cripta' && (
          <div>
            <div className="gothic-font" style={{ fontSize: '14px', color: '#9d4edf', margin: '10px 0 15px 0', letterSpacing: '1px' }}>✦ PANEL DE LA ETERNIDAD</div>
            
            {/* Estado de Luna */}
            <div style={{
              background: 'linear-gradient(135deg, #25123e 0%, #130a21 100%)',
              border: '1px solid rgba(99, 32, 160, 0.4)', borderRadius: '15px',
              padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'
            }}>
              <span style={{ fontSize: '30px' }}>🌕</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Luna llena</div>
                <div style={{ fontSize: '11px', color: '#f59e0b' }}>⚡ Poder máximo — noche de luna llena</div>
              </div>
            </div>

            {/* Grid de Estadísticas de Lectura */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: '#130a21', padding: '15px', borderRadius: '15px', borderLeft: '3px solid #6320a0' }}>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>📜 Tomos sellados</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', margin: '5px 0' }}>{tomos.length}</div>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>en la cripta</div>
              </div>

              <div style={{ background: '#130a21', padding: '15px', borderRadius: '15px', borderLeft: '3px solid #6320a0' }}>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>¼️ Páginas devoradas</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', margin: '5px 0' }}>{paginasLeidas}</div>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>en {ritualesCount} rituales</div>
              </div>

              <div style={{ background: '#130a21', padding: '15px', borderRadius: '15px', borderLeft: '3px solid var(--accent-red)' }}>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>🕯️ Horas en las sombras</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', margin: '5px 0' }}>0h</div>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>0 minutos</div>
              </div>

              <div style={{ background: '#130a21', padding: '15px', borderRadius: '15px', borderLeft: '3px solid #6320a0' }}>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>🩸 Calificación media</div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', margin: '5px 0' }}>—</div>
                <div style={{ fontSize: '11px', color: '#8c829e' }}>sobre {tomos.length} tomos</div>
              </div>
            </div>

            {/* Velas encendidas del video */}
            <div className="flicker" style={{ textAlign: 'center', margin: '30px 0', fontSize: '22px', letterSpacing: '10px' }}>
              🕯️ 🕯️ 🕯️
            </div>
          </div>
        )}

        {/* PESTAÑA TOMOS */}
        {activeTab === 'tomos' && (
          <div>
            <div className="gothic-font" style={{ fontSize: '14px', color: '#9d4edf', margin: '10px 0 15px 0' }}>✦ LA BIBLIOTECA OSCURA</div>
            
            {/* Botón para simular agregar un libro */}
            <button 
              onClick={() => {
                setTomos([...tomos, { id: Date.now() }]);
              }}
              style={{
                width: '100%', background: 'linear-gradient(90deg, #a91d22, #6320a0)',
                color: '#fff', border: 'none', padding: '12px', borderRadius: '10px',
                fontWeight: 'bold', fontSize: '13px', marginBottom: '20px', cursor: 'pointer'
              }}
            >
              🩸 Añadir tomo oscuro
            </button>

            {tomos.length === 0 ? (
              <div style={{ background: '#130a21', padding: '40px 20px', borderRadius: '15px', textAlign: 'center', border: '1px dashed rgba(99, 32, 160, 0.3)' }}>
                <div style={{ fontSize: '35px', marginBottom: '10px' }}>🌹</div>
                <p style={{ margin: 0, fontSize: '14px', color: '#8c829e' }}>La cripta está vacía...</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#9d4edf' }}>Añade tu primer tomo</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {tomos.map((t, index) => (
                  <div key={t.id} style={{ background: '#130a21', padding: '15px', borderRadius: '10px', border: '1px solid #6320a0', textAlign: 'center' }}>
                    <div style={{ fontSize: '30px' }}>📖</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '5px' }}>Tomo Oscuro #{index + 1}</div>
                    <div style={{ fontSize: '11px', color: '#8c829e', marginTop: '3px' }}>⏳ Pendiente</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA RITUALES */}
        {activeTab === 'rituales' && (
          <div>
            <div className="gothic-font" style={{ fontSize: '14px', color: '#9d4edf', margin: '10px 0 15px 0' }}>✦ LOS GRANDES RITUALES</div>
            
            <div style={{ background: '#130a21', padding: '20px', borderRadius: '15px', border: '1px solid rgba(169, 29, 34, 0.3)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🩸</span> Nuevo ritual de lectura
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '11px', color: '#8c829e', display: 'block', marginBottom: '5px' }}>Páginas leídas en esta sesión</label>
                <input 
                  type="number" 
                  placeholder="Ej. 45"
                  style={{ width: '90%', background: '#1c112e', border: '1px solid #6320a0', padding: '10px', borderRadius: '8px', color: '#fff' }}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if(val) {
                      setPaginasLeidas(val);
                    }
                  }}
                />
              </div>

              <button 
                onClick={() => setRitualesCount(ritualesCount + 1)}
                style={{
                  width: '100%', background: '#6320a0', color: '#fff', border: 'none',
                  padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                  boxShadow: '0 0 10px #6320a0'
                }}
              >
                Sellar ritual 🩸
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
          }
                  
