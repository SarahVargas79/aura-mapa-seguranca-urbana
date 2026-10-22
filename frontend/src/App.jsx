import { useState, useEffect } from 'react';
import { regionsDB } from './data/regionsData';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import RegionDetailsPanel from './components/RegionDetailsPanel';
import SupportAndCommunity from './components/SupportAndCommunity';
import Modals from './components/Modals';

/**
 * COMPONENTE PRINCIPAL: App
 * -------------------------
 * Papel arquitetural (Orquestrador):
 * - Gerencia os estados globais da interface (região selecionada, tema claro/escuro,
 *   escala tipográfica de acessibilidade, sessão demonstrativa e modais).
 * - Conecta os componentes modulares passando dados e funções via propriedades (props).
 */
export default function App() {
  const [selectedRegionId, setSelectedRegionId] = useState('centro');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [accessPanelOpen, setAccessPanelOpen] = useState(false);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Estados controlados do formulário de percepção
  const [reportRegion, setReportRegion] = useState('centro');
  const [reportType, setReportType] = useState('');

  // Busca os dados da região ativa na camada de dados (com fallback seguro para 'centro')
  const region = regionsDB[selectedRegionId] || regionsDB.centro;

  // Sincroniza a classe 'dark' no <body> e a variável CSS '--scale' no <html>
  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--scale', fontScale);
  }, [fontScale]);

  // Permite fechar qualquer modal, popover ou menu aberto pressionando a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeModal) setActiveModal(null);
        if (accessPanelOpen) setAccessPanelOpen(false);
        if (accountPopoverOpen) setAccountPopoverOpen(false);
        if (mobileNavOpen) setMobileNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, accessPanelOpen, accountPopoverOpen, mobileNavOpen]);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setActiveModal(null);
    showToast('Sessão iniciada com sucesso.');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccountPopoverOpen(false);
    showToast('Sessão de demonstração encerrada.');
  };

  const requireLogin = (modalName) => {
    if (isLoggedIn) {
      if (modalName === 'community') {
        showToast('Esta demonstração não possui chat online.');
      } else {
        setActiveModal(modalName);
      }
    } else {
      setActiveModal('auth');
    }
  };

  const scrollToSupport = (toastMsg) => {
    const el = document.getElementById('apoio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (toastMsg) showToast(toastMsg);
  };

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      
      {/* Notificação Flutuante Acessível */}
      <div className={`toast-container ${toast.visible ? 'show' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        {toast.message}
      </div>

      {/* Cabeçalho, Navegação Mobile, Painel de Acessibilidade e Popover de Conta */}
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        fontScale={fontScale}
        setFontScale={setFontScale}
        accessPanelOpen={accessPanelOpen}
        setAccessPanelOpen={setAccessPanelOpen}
        accountPopoverOpen={accountPopoverOpen}
        setAccountPopoverOpen={setAccountPopoverOpen}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={() => setActiveModal('auth')}
        onLogout={handleLogout}
        onHelpClick={() => scrollToSupport('Canais oficiais de apoio: Ligue 180 ou 190 em caso de emergência.')}
      />

      <main id="conteudo">
        {/* Seção de Abertura (Hero) */}
        <section className="hero" id="inicio">
          <div className="hero-main">
            <p className="eyebrow">Porto Alegre · prevenção e informação</p>
            <h1>Seu caminho, com mais informação.</h1>
            <p className="hero-copy">
              Consulte fatores de atenção no território e encontre orientações de apoio para seus deslocamentos.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn primary" onClick={() => requireLogin('report')}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Compartilhar percepção
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => showToast('Os níveis do mapa são indicadores de exemplo explicativos do projeto.')}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.6c-1.1 1-1.7 1.2-1.7 2.7M12 16.5h.01"/>
                </svg>
                Como funciona
              </button>
            </div>
          </div>
        </section>

        {/* Seção Principal: Mapa Interativo de POA + Detalhes da Região */}
        <section id="mapa" aria-label="Mapa preventivo e detalhes regionais">
          <div className="layout">
            <section className="panel">
              <div className="panelhead">
                <div className="panelhead-main">
                  <h2>Mapa urbano preventivo</h2>
                  <p>Selecione uma região.</p>
                </div>
                <span className="pill live">
                  <span className="live-dot" aria-hidden="true"></span>
                  Mapa demonstrativo
                </span>
              </div>
              <div className="mapwrap">
                <MapComponent
                  regionsData={regionsDB}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />
                <div className="map-foot">
                  <span>◉ <strong>Dados ilustrativos</strong>.</span>
                  <span>Metodologia deve ser documentada.</span>
                </div>
              </div>
            </section>

            <RegionDetailsPanel region={region} />
          </div>
        </section>

        {/* Grade Inferior: Apoio & Segurança + Comunidade */}
        <SupportAndCommunity
          onScrollToSupport={scrollToSupport}
          onShowToast={showToast}
          onRequireLogin={requireLogin}
        />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>© AURA · Mapa de Segurança Urbana para Mulheres · Protótipo acadêmico</span>
          <span className="footer-links">
            <a href="#apoio">Canais de apoio</a>
            <a
              href="#privacidade"
              onClick={(e) => {
                e.preventDefault();
                showToast('Política de privacidade em construção.');
              }}
            >
              Privacidade
            </a>
            <a
              href="#acessibilidade"
              onClick={(e) => {
                e.preventDefault();
                setAccessPanelOpen(true);
              }}
            >
              Acessibilidade
            </a>
          </span>
        </div>
      </footer>

      {/* Modais de Autenticação e Compartilhamento de Percepção */}
      <Modals
        activeModal={activeModal}
        onCloseModal={() => setActiveModal(null)}
        onLoginSubmit={handleLoginSubmit}
        reportRegion={reportRegion}
        setReportRegion={setReportRegion}
        reportType={reportType}
        setReportType={setReportType}
        onShowToast={showToast}
      />
    </>
  );
}
