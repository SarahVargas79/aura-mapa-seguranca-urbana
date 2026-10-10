import { useState } from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeLarge, setFontSizeLarge] = useState(false);

  // Função de Saída Rápida exigida no escopo
  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  return (
    <div className={`app-container ${highContrast ? 'high-contrast' : ''} ${fontSizeLarge ? 'font-large' : ''}`}>
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="logo-area">
          <h1>AURA</h1>
          <p>Mapa de Segurança Urbana para Mulheres — Porto Alegre</p>
        </div>
        <div className="accessibility-controls">
          <button onClick={() => setHighContrast(!highContrast)} title="Alternar Alto Contraste">
            Contraste
          </button>
          <button onClick={() => setFontSizeLarge(!fontSizeLarge)} title="Aumentar Fonte">
            A+
          </button>
          <button onClick={handleQuickExit} className="btn-quick-exit" title="Sai rapidamente da página">
            Saída Rápida
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <section className="intro-section">
          <h2>Consulte a segurança do seu trajeto</h2>
          <p>Selecione uma região no mapa para verificar o nível de atenção e os fatores relatados pela comunidade.</p>
        </section>

        <div className="dashboard-grid">
          <div className="map-wrapper">
            <MapComponent onSelectRegion={setSelectedRegion} />
          </div>

          <div className="details-panel">
            <h3>Painel de Informações da Região</h3>
            {selectedRegion ? (
              <div className="region-card">
                <h4>{selectedRegion.nome}</h4>
                <p><strong>Nível de Atenção:</strong> <span className={`badge ${selectedRegion.nivel.toLowerCase()}`}>{selectedRegion.nivel}</span></p>
                <p><strong>Fatores Identificados:</strong> {selectedRegion.desc}</p>
                <div className="action-hint">
                  <p><em>Esta classificação é um indicador colaborativo do projeto e não substitui os dados oficiais de segurança.</em></p>
                </div>
              </div>
            ) : (
              <p className="placeholder-text">Clique em um marcador no mapa de Porto Alegre para visualizar os detalhes e fatores da área.</p>
            )}
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="app-footer">
        <p>Projeto Acadêmico ADS | UniSenac Centro Universitário – RS</p>
      </footer>
    </div>
  );
}