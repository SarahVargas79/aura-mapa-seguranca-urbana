import { useRef, useEffect } from 'react';

/**
 * COMPONENTE: Header
 * ------------------
 * Responsável pela barra superior fixa (topbar), navegação desktop/mobile,
 * botão de saída rápida de emergência e painéis flutuantes de Conta e Acessibilidade.
 */
export default function Header({
  isDarkMode,
  setIsDarkMode,
  fontScale,
  setFontScale,
  accessPanelOpen,
  setAccessPanelOpen,
  accountPopoverOpen,
  setAccountPopoverOpen,
  mobileNavOpen,
  setMobileNavOpen,
  isLoggedIn,
  onOpenAuthModal,
  onLogout,
  onHelpClick
}) {
  const accessPanelRef = useRef(null);
  const accessBtnRef = useRef(null);
  const accountPopoverRef = useRef(null);
  const accountBtnRef = useRef(null);

  // Fecha os popovers de Acessibilidade e Conta ao clicar fora deles
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        accessPanelOpen &&
        accessPanelRef.current &&
        !accessPanelRef.current.contains(e.target) &&
        accessBtnRef.current &&
        !accessBtnRef.current.contains(e.target)
      ) {
        setAccessPanelOpen(false);
      }
      if (
        accountPopoverOpen &&
        accountPopoverRef.current &&
        !accountPopoverRef.current.contains(e.target) &&
        accountBtnRef.current &&
        !accountBtnRef.current.contains(e.target)
      ) {
        setAccountPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accessPanelOpen, accountPopoverOpen, setAccessPanelOpen, setAccountPopoverOpen]);

  return (
    <>
      <header className="topbar" id="topo">
        <div className="topbar-inner">
          <a className="brand" href="#inicio" aria-label="AURA — Segurança Urbana para Mulheres (Início)">
            <span className="logo" aria-hidden="true">A</span>
            <span><strong>AURA</strong><small>SEGURANÇA URBANA PARA MULHERES</small></span>
          </a>

          <nav className="navlinks" aria-label="Navegação principal">
            <a href="#mapa" aria-current="page">Mapa preventivo</a>
            <a href="#apoio">Rede de apoio</a>
            <a href="#comunidade">Comunidade</a>
          </nav>
          
          <div className="header-actions">
            {/* Botão de Acessibilidade */}
            <button
              ref={accessBtnRef}
              type="button"
              className="header-btn access-btn"
              onClick={() => {
                setAccessPanelOpen(!accessPanelOpen);
                setAccountPopoverOpen(false);
              }}
              title="Acessibilidade"
              aria-label="Opções de acessibilidade"
              aria-expanded={accessPanelOpen}
              aria-controls="painel-acessibilidade"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <circle cx="12" cy="4" r="2.5" />
                <path d="M21 9c-1.42 0-3.15.5-4.65 1.05V20.5a1.5 1.5 0 0 1-3 0v-6.5h-2v6.5a1.5 1.5 0 0 1-3 0v-10.45C6.85 9.5 5.12 9 3.7 9a1.5 1.5 0 0 1 0-3c2 0 4.14.7 5.75 1.34A3.97 3.97 0 0 1 12 7c.92 0 1.76.3 2.55.66C16.16 7.01 18.3 6.3 20.3 6.3a1.5 1.5 0 0 1 0 3z" />
              </svg>
              <span className="header-text">Acessibilidade</span>
            </button>

            {/* Saída Rápida: usa window.location.replace para substituir a entrada atual no histórico */}
            <button
              type="button"
              className="header-btn exit-btn"
              onClick={() => window.location.replace('https://www.google.com')}
              title="Saída rápida"
              aria-label="Saída rápida da página"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/>
                <path d="M14 8l4 4-4 4M8 12h10"/>
              </svg>
            </button>
            
            {/* Botão Preciso de Ajuda */}
            <button
              type="button"
              className="header-btn help-btn"
              onClick={onHelpClick}
              title="Preciso de ajuda"
              aria-label="Preciso de ajuda — Ir para canais de apoio"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 2 2.3Z"/>
              </svg>
            </button>

            {!isLoggedIn ? (
              <button
                type="button"
                className="header-btn login-btn"
                onClick={onOpenAuthModal}
                aria-label="Entrar na conta"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="3.5"/>
                  <path d="M5 20c.6-3.2 3.1-5 7-5s6.4 1.8 7 5"/>
                </svg>
                <span className="header-text">Entrar</span>
              </button>
            ) : (
              <button
                ref={accountBtnRef}
                type="button"
                className="header-btn login-btn"
                onClick={() => {
                  setAccountPopoverOpen(!accountPopoverOpen);
                  setAccessPanelOpen(false);
                }}
                aria-label="Minha conta"
                aria-expanded={accountPopoverOpen}
                aria-controls="popover-conta"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="3.5"/>
                  <path d="M5 20c.6-3.2 3.1-5 7-5s6.4 1.8 7 5"/>
                </svg>
                <span className="header-text">Minha conta</span>
              </button>
            )}

            {/* Botão Menu Hambúrguer com Animação Suave */}
            <button
              type="button"
              className="header-btn menu-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-controls="menu-mobile"
              aria-label={mobileNavOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line className="line-top" x1="4" y1="6" x2="20" y2="6"/>
                <line className="line-mid" x1="4" y1="12" x2="20" y2="12"/>
                <line className="line-bot" x1="4" y1="18" x2="20" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        
        <nav id="menu-mobile" className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`} aria-label="Navegação móvel" aria-hidden={!mobileNavOpen}>
          <a href="#mapa" tabIndex={mobileNavOpen ? 0 : -1} onClick={() => setMobileNavOpen(false)}>Mapa preventivo</a>
          <a href="#apoio" tabIndex={mobileNavOpen ? 0 : -1} onClick={() => setMobileNavOpen(false)}>Rede de apoio</a>
          <a href="#comunidade" tabIndex={mobileNavOpen ? 0 : -1} onClick={() => setMobileNavOpen(false)}>Comunidade</a>
        </nav>
      </header>

      {/* Popover de Conta */}
      <aside
        id="popover-conta"
        ref={accountPopoverRef}
        className={`account-popover ${accountPopoverOpen ? 'open' : ''}`}
        aria-label="Informações da sessão"
      >
        <strong>Sessão de demonstração</strong>
        <p>O acesso está simulado localmente. Nenhum dado foi enviado.</p>
        <div className="account-actions">
          <button type="button" className="btn secondary small" onClick={() => setAccountPopoverOpen(false)}>Fechar</button>
          <button type="button" className="btn small purple" style={{ border: 'none' }} onClick={onLogout}>Sair</button>
        </div>
      </aside>

      {/* Painel Flutuante de Acessibilidade */}
      <aside
        id="painel-acessibilidade"
        ref={accessPanelRef}
        className={`access-panel ${accessPanelOpen ? 'open' : ''}`}
        aria-label="Configurações de acessibilidade"
      >
        <h2>Acessibilidade</h2>
        <p>Personalize a leitura.</p>
        <div className="access-row">
          <span>Tamanho do texto</span>
          <div>
            <button type="button" onClick={() => setFontScale(Math.max(0.875, fontScale - 0.0625))} aria-label="Diminuir tamanho do texto">A−</button> 
            <button type="button" onClick={() => setFontScale(Math.min(1.375, fontScale + 0.0625))} style={{ marginLeft: '4px' }} aria-label="Aumentar tamanho do texto">A+</button>
          </div>
        </div>
        <div className="access-row">
          <span>Modo escuro</span>
          <button type="button" className="mode-btn" onClick={() => setIsDarkMode(!isDarkMode)} aria-pressed={isDarkMode} aria-label="Alternar modo escuro">
            {isDarkMode ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.6 8.6 0 1 0 20.5 14.2Z"/>
              </svg>
            )}
          </button>
        </div>
        <button
          type="button"
          className="btn secondary access-reset"
          onClick={() => {
            setFontScale(1);
            setIsDarkMode(false);
          }}
        >
          Restaurar padrão
        </button>
      </aside>
    </>
  );
}
