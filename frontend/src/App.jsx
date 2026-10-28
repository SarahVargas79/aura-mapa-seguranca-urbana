import { useState, useEffect, useCallback, useRef } from 'react';
import { initialRegionsDB } from './data/regionsData';
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
  const [apiConnected, setApiConnected] = useState(false);

  const [selectedRegionId, setSelectedRegionId] = useState('centro');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [accessPanelOpen, setAccessPanelOpen] = useState(false);
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const toastTimerRef = useRef(null);

  // Região pré-selecionada ao abrir o formulário de relato
  const [reportRegion, setReportRegion] = useState('centro');

  const region = regionsData[selectedRegionId] || regionsData.centro;

  const showToast = useCallback((message, type = 'info') => {
    const validTypes = ['success', 'error', 'warning', 'info'];
    const toastType = validTypes.includes(type) ? type : 'info';
    setToast({ visible: true, message, type: toastType });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4200);
  }, []);

  const highlightPanel = useCallback((elementId, accent = 'blue') => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const highlightClass = accent === 'purple' ? 'panel-highlight-purple' : 'panel-highlight';
    el.classList.remove('panel-highlight', 'panel-highlight-purple');
    el.classList.add(highlightClass);
    setTimeout(() => {
      el.classList.remove(highlightClass);
    }, 1800);
  }, []);

  // Consulta os indicadores calculados pelo motor do Django a partir do SQLite
  const carregarIndicadores = useCallback(async () => {
    try {
      const data = await api.getIndicadores();
      if (data && data.regioes) {
        setRegionsData(data.regioes);
        setApiConnected(true);
      }
    } catch {
      setApiConnected(false);
    }
  }, []);

  // Ao iniciar a aplicação: carrega os indicadores e valida eventual sessão salva
  useEffect(() => {
    let ativo = true;

    api
      .getIndicadores()
      .then((data) => {
        if (!ativo || !data?.regioes) return;
        setRegionsData(data.regioes);
        setApiConnected(true);
      })
      .catch(() => {
        if (ativo) setApiConnected(false);
      });

    const token = getStoredToken();
    if (token) {
      api
        .verificarSessao()
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
    showToast(mensagem || `Acesso iniciado com sucesso, ${usuario.identificador_aura}.`, 'success');
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
    showToast('Você saiu da sua conta.', 'success');
  };

  const requireLogin = (modalName) => {
    if (currentUser) {
      setReportRegion(selectedRegionId);
      setActiveModal(modalName);
    } else {
      setActiveModal('auth');
    }
  };

  const handleReportSuccess = async (regiaoRegistrada) => {
    await carregarIndicadores();
    if (regiaoRegistrada) {
      setSelectedRegionId(regiaoRegistrada);
    }
    highlightPanel('panelDetalhesRegiao');
  };

  const scrollToSupport = (toastMsg, toastType) => {
    const el = document.getElementById('apoio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightPanel('apoio', 'purple');
    }
    if (toastMsg) {
      const resolvedType =
        toastType || (/urgente|emergência/i.test(toastMsg) ? 'warning' : 'info');
      showToast(toastMsg, resolvedType);
    }
  };

  const renderToastIcon = (type) => {
    if (type === 'success') {
      return (
        <>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </>
      );
    }
    if (type === 'error') {
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </>
      );
    }
    if (type === 'warning') {
      return (
        <>
          <path d="M10.3 3.9 1.8 18.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </>
      );
    }
    return (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 11v5M12 7h.01" />
      </>
    );
  };

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo principal
      </a>

      {/* Notificação Flutuante Acessível (Toast) */}
      <div
        id="toast"
        className={`toast-container toast-${toast.type} ${toast.visible ? 'show' : ''}`}
        role={toast.type === 'error' ? 'alert' : 'status'}
        aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true"
      >
        <svg
          id="toastIcon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {renderToastIcon(toast.type)}
        </svg>
        <span id="toastMessage">{toast.message}</span>
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
        onHelpClick={() =>
          scrollToSupport(
            'Canais oficiais de apoio: Ligue 180 ou 190 em caso de emergência.',
            'warning'
          )
        }
        onShowToast={showToast}
      />

      <main id="conteudo">
        {/* Seção de Abertura (Hero) */}
        <section className="hero" id="inicio">
          <div className="hero-main">
            <p className="eyebrow">Porto Alegre · prevenção e informação</p>
            <h1>Seu caminho, com mais informação.</h1>
            <p className="hero-copy">
              Explore relatos por região e conheça melhor as ruas dos bairros antes de se deslocar.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn primary"
                id="btnHeroReport"
                onClick={() => requireLogin('report')}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Compartilhar relato
              </button>
              <button
                type="button"
                className="btn secondary"
                id="btnHowItWorks"
                onClick={() => setActiveModal('how')}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.6c-1.1 1-1.7 1.2-1.7 2.7M12 16.5h.01" />
                </svg>
                Como funciona
              </button>
            </div>
          </div>
        </section>

        {/* Seção Principal: Mapa Interativo de POA + Detalhes da Região */}
        <section id="mapa" aria-label="Mapa preventivo e detalhes regionais">
          <div className="layout">
            <section className="panel" id="panelMapa">
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
                  onShowToast={showToast}
                />
                <div className="map-foot">
                  <span>
                    ◉ <strong>Janela de referência:</strong> Últimos 90 dias, considerando o período aproximado da ocorrência informado no relato.
                  </span>
                  <span>Classificação baseada no volume de relatos elegíveis.</span>
                </div>
              </div>
            </section>

            <RegionDetailsPanel region={region} />
          </div>
        </section>

        {/* Grade Inferior: Apoio & Segurança + Apoio Mútuo */}
        <SupportAndCommunity
          onScrollToSupport={scrollToSupport}
          onShowToast={showToast}
          onOpenPrivacyModal={() => setActiveModal('privacy')}
          onOpenCommunityModal={() => setActiveModal('community')}
        />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>© AURA · Mapa de Segurança Urbana para Mulheres</span>
          <span className="footer-links">
            <a
              href="#apoio"
              id="linkFooterSupport"
              onClick={(e) => {
                e.preventDefault();
                scrollToSupport('Canais oficiais destacados: Ligue 180 e Emergência 190.', 'info');
              }}
            >
              Canais de apoio
            </a>
            <a
              href="#painelOrientacoes"
              id="linkFooterPrivacy"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('painelOrientacoes');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  highlightPanel('painelOrientacoes');
                  document.getElementById('cardPrivacy')?.focus({ preventScroll: true });
                }
                showToast(
                  'Acesse “Privacidade no AURA” para consultar as informações completas.',
                  'info'
                );
              }}
            >
              Privacidade
            </a>
            <a
              href="#painel-acessibilidade"
              id="linkFooterAccess"
              onClick={(e) => {
                e.preventDefault();
                setAccessPanelOpen(true);
                setAccountPopoverOpen(false);
                setTimeout(() => {
                  document.getElementById('btnToggleTheme')?.focus();
                }, 20);
                showToast('Painel de acessibilidade aberto.', 'info');
              }}
            >
              Acessibilidade
            </a>
          </span>
        </div>
      </footer>

      {/* Modais: Área de Acesso, Compartilhar Relato, Como Funciona, Privacidade e Apoio Mútuo */}
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
