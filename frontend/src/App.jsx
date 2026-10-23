import { useState, useEffect, useCallback } from 'react';
import { initialRegionsDB, PERIODO_REFERENCIA_PADRAO } from './data/regionsData';
import {
  api,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
} from './services/api';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import RegionDetailsPanel from './components/RegionDetailsPanel';
import SupportAndCommunity from './components/SupportAndCommunity';
import Modals from './components/Modals';

/**
 * COMPONENTE PRINCIPAL: App
 * -------------------------
 * Integra o frontend React ao backend Django REST Framework:
 * - Consulta os indicadores reais do banco SQLite em GET /api/indicadores/
 * - Gerencia a sessão autenticada por Token (identificador_aura)
 * - Atualiza o mapa e o painel lateral imediatamente após novos relatos
 */
export default function App() {
  const [regionsData, setRegionsData] = useState(initialRegionsDB);
  const [periodoReferencia, setPeriodoReferencia] = useState(PERIODO_REFERENCIA_PADRAO);
  const [apiConnected, setApiConnected] = useState(false);

  const [selectedRegionId, setSelectedRegionId] = useState('centro');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [accessPanelOpen, setAccessPanelOpen] = useState(false);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Bairro pré-selecionado ao abrir o formulário de percepção
  const [reportRegion, setReportRegion] = useState('centro');

  const region = regionsData[selectedRegionId] || regionsData.centro;

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 4000);
  }, []);

  // Consulta os indicadores calculados pelo motor do Django a partir do SQLite
  const carregarIndicadores = useCallback(async () => {
    try {
      const data = await api.getIndicadores();
      if (data && data.regioes) {
        setRegionsData(data.regioes);
        if (data.periodo_referencia_padrao) {
          setPeriodoReferencia(data.periodo_referencia_padrao);
        }
        setApiConnected(true);
      }
    } catch {
      setApiConnected(false);
    }
  }, []);

  // Ao iniciar a aplicação: carrega os indicadores e valida eventual sessão salva
  useEffect(() => {
    let ativo = true;

    api.getIndicadores()
      .then((data) => {
        if (!ativo || !data?.regioes) return;
        setRegionsData(data.regioes);
        if (data.periodo_referencia_padrao) {
          setPeriodoReferencia(data.periodo_referencia_padrao);
        }
        setApiConnected(true);
      })
      .catch(() => {
        if (ativo) setApiConnected(false);
      });

    const token = getStoredToken();
    if (token) {
      api.verificarSessao()
        .then((res) => {
          if (ativo && res?.usuario) {
            setCurrentUser(res.usuario);
          }
        })
        .catch(() => {
          if (!ativo) return;
          clearAuthSession();
          setCurrentUser(null);
        });
    }

    return () => {
      ativo = false;
    };
  }, []);

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

  const handleAuthSuccess = (token, usuario, mensagem) => {
    saveAuthSession(token, usuario);
    setCurrentUser(usuario);
    setActiveModal(null);
    showToast(mensagem || `Sessão iniciada como ${usuario.identificador_aura}.`);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Mesmo se o servidor estiver indisponível, limpa a sessão local com segurança
    }
    clearAuthSession();
    setCurrentUser(null);
    setAccountPopoverOpen(false);
    showToast('Sessão encerrada com sucesso.');
  };

  const requireLogin = (modalName) => {
    if (currentUser) {
      if (modalName === 'community') {
        showToast('O fórum comunitário estará disponível em etapa futura.');
      } else {
        setReportRegion(selectedRegionId);
        setActiveModal(modalName);
      }
    } else {
      setActiveModal('auth');
    }
  };

  const handleReportSuccess = async (regiaoRegistrada) => {
    await carregarIndicadores();
    if (regiaoRegistrada) {
      setSelectedRegionId(regiaoRegistrada);
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
        currentUser={currentUser}
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
              Consulte indicadores de percepção comunitária no território e encontre orientações de apoio para seus deslocamentos.
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
                onClick={() =>
                  showToast(
                    'Os estados semânticos refletem o volume de relatos elegíveis nos últimos 90 dias (0 = Dados insuficientes; 1–2 = Atenção; 3–5 = Atenção elevada; 6+ = Atenção crítica).'
                  )
                }
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
                  <p>Selecione uma região de Porto Alegre para consultar os indicadores.</p>
                </div>
                <span className="pill live">
                  <span className="live-dot" aria-hidden="true"></span>
                  {apiConnected ? 'Dados do banco local' : 'Aguardando conexão API'}
                </span>
              </div>
              <div className="mapwrap">
                <MapComponent
                  regionsData={regionsData}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={(regId) => {
                    setSelectedRegionId(regId);
                    setReportRegion(regId);
                  }}
                />
                <div className="map-foot">
                  <span>◉ <strong>Janela de referência:</strong> {periodoReferencia}.</span>
                  <span>Critérios operacionais baseados no volume de relatos elegíveis.</span>
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
          <span>© AURA · Mapa de Segurança Urbana para Mulheres · Projeto acadêmico</span>
          <span className="footer-links">
            <a href="#apoio">Canais de apoio</a>
            <a
              href="#privacidade"
              onClick={(e) => {
                e.preventDefault();
                showToast('O AURA utiliza apenas identificador de usuário e região aproximada, sem exigir nome civil ou e-mail.');
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
        onAuthSuccess={handleAuthSuccess}
        onReportSuccess={handleReportSuccess}
        reportRegion={reportRegion}
        setReportRegion={setReportRegion}
        onShowToast={showToast}
      />
    </>
  );
}
