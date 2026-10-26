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
  currentUser,
  onOpenAuthModal,
  onLogout,
  onHelpClick,
  onShowToast,
}) {
  const topbarRef = useRef(null);
  const accessPanelRef = useRef(null);
  const accessBtnRef = useRef(null);
  const accountPopoverRef = useRef(null);
  const accountBtnRef = useRef(null);

  const isLoggedIn = Boolean(currentUser);

  // Posiciona dinamicamente os painéis flutuantes logo abaixo da barra superior
  useEffect(() => {
    const targetPanel = accessPanelOpen
      ? accessPanelRef.current
      : accountPopoverOpen
      ? accountPopoverRef.current
      : null;
    if (targetPanel && topbarRef.current) {
      const rect = topbarRef.current.getBoundingClientRect();
      const topOffset = Math.max(74, Math.round(rect.bottom + 8));
      targetPanel.style.top = `${topOffset}px`;
    }
  }, [accessPanelOpen, accountPopoverOpen, fontScale]);

  // Fecha os popovers de Acessibilidade e Conta ao clicar fora deles
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        accessPanelOpen &&
        accessPanelRef.current &&
        !accessPanelRef.current.contains(e.target) &&
        accessBtnRef.current &&
        !accessBtnRef.current.contains(e.target) &&
        e.target.id !== 'linkFooterAccess'
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

  const handleToggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (onShowToast) {
      onShowToast(nextDark ? 'Modo escuro ativado.' : 'Modo claro ativado.', 'info');
    }
  };

  const handleFontDec = () => {
    setFontScale((prev) => Math.max(0.88, +(prev - 0.06).toFixed(2)));
  };

  const handleFontInc = () => {
    setFontScale((prev) => Math.min(1.24, +(prev + 0.06).toFixed(2)));
  };

  const handleResetAccess = () => {
    setFontScale(1);
    setIsDarkMode(false);
    if (onShowToast) {
      onShowToast('Configurações de acessibilidade restauradas.', 'success');
    }
  };

  return (
    <>
      <header className="topbar" id="topo" ref={topbarRef}>
        <div className="topbar-inner">
          <a
            className="brand"
            href="#inicio"
            aria-label="AURA — Segurança Urbana para Mulheres (Início)"
          >
            <span className="logo" aria-hidden="true">
              A
            </span>
            <span>
              <strong>AURA</strong>
              <small>SEGURANÇA URBANA PARA MULHERES</small>
            </span>
          </a>

          <nav className="navlinks" aria-label="Navegação principal">
            <a href="#mapa" className="nav-section-link" aria-current="page">
              Mapa preventivo
            </a>
            <a href="#apoio" className="nav-section-link">
              Rede de apoio
            </a>
            <a href="#comunidade" className="nav-section-link">
              Fórum &amp; apoio
            </a>
          </nav>

          <div className="header-actions">
            {/* Botão de Acessibilidade */}
            <button
              ref={accessBtnRef}
              id="btnAccess"
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
              id="btnQuickExit"
              type="button"
              className="header-btn exit-btn"
              onClick={() => window.location.replace('https://www.google.com')}
              title="Saída rápida"
              aria-label="Saída rápida da página"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
                <path d="M14 8l4 4-4 4M8 12h10" />
              </svg>
            </button>

            {/* Botão Preciso de Ajuda */}
            <button
              id="btnHelpHeader"
              type="button"
              className="header-btn help-btn"
              onClick={onHelpClick}
              title="Preciso de ajuda"
              aria-label="Preciso de ajuda — Ir para canais de apoio"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              >
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 2 2.3Z" />
              </svg>
            </button>

            {!isLoggedIn ? (
              <button
                id="btnAccount"
                type="button"
                className="header-btn login-btn"
                onClick={onOpenAuthModal}
                aria-label="Entrar na conta AURA"
                aria-expanded="false"
                aria-controls="popover-conta"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.6-3.2 3.1-5 7-5s6.4 1.8 7 5" />
                </svg>
                <span className="header-text" id="headerAccountText">
                  Entrar
                </span>
              </button>
            ) : (
              <button
                ref={accountBtnRef}
                id="btnAccount"
                type="button"
                className="header-btn login-btn"
                onClick={() => {
                  setAccountPopoverOpen(!accountPopoverOpen);
                  setAccessPanelOpen(false);
                }}
                aria-label={`Minha conta AURA (${currentUser.identificador_aura})`}
                aria-expanded={accountPopoverOpen}
                aria-controls="popover-conta"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c.6-3.2 3.1-5 7-5s6.4 1.8 7 5" />
                </svg>
                <span className="header-text" id="headerAccountText">
                  {currentUser.identificador_aura}
                </span>
              </button>
            )}

            {/* Botão Menu Hambúrguer com Animação Suave */}
            <button
              id="btnMobileMenu"
              type="button"
              className="header-btn menu-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-controls="menu-mobile"
              aria-label={mobileNavOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line className="line-top" x1="4" y1="6" x2="20" y2="6" />
                <line className="line-mid" x1="4" y1="12" x2="20" y2="12" />
                <line className="line-bot" x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <nav
          id="menu-mobile"
          className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}
          aria-label="Navegação móvel"
          aria-hidden={!mobileNavOpen}
        >
          <a
            href="#mapa"
            className="mobile-nav-link"
            tabIndex={mobileNavOpen ? 0 : -1}
            onClick={() => setMobileNavOpen(false)}
          >
            Mapa preventivo
          </a>
          <a
            href="#apoio"
            className="mobile-nav-link"
            tabIndex={mobileNavOpen ? 0 : -1}
            onClick={() => setMobileNavOpen(false)}
          >
            Rede de apoio
          </a>
          <a
            href="#comunidade"
            className="mobile-nav-link"
            tabIndex={mobileNavOpen ? 0 : -1}
            onClick={() => setMobileNavOpen(false)}
          >
            Fórum &amp; apoio
          </a>
        </nav>
      </header>

      {/* Informações da conta */}
      <aside
        id="popover-conta"
        ref={accountPopoverRef}
        className={`account-popover ${accountPopoverOpen ? 'open' : ''}`}
        aria-label="Informações da conta"
      >
        <strong id="popoverUserTitle">
          {currentUser ? `Identificador: ${currentUser.identificador_aura}` : 'Sua conta AURA'}
        </strong>
        <p>Gerencie sua sessão e saia da conta ao terminar.</p>
        <div className="account-actions">
          <button
            type="button"
            className="btn secondary small"
            id="btnClosePopover"
            onClick={() => setAccountPopoverOpen(false)}
          >
            Fechar
          </button>
          <button
            type="button"
            className="btn small purple"
            id="btnLogout"
            style={{ border: 'none' }}
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Painel Flutuante de Acessibilidade */}
      <aside
        id="painel-acessibilidade"
        ref={accessPanelRef}
        className={`access-panel ${accessPanelOpen ? 'open' : ''}`}
        aria-label="Configurações de acessibilidade"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}
        >
          <h2 style={{ margin: 0 }}>Acessibilidade</h2>
          <button
            type="button"
            className="close-modal"
            id="btnCloseAccess"
            onClick={() => setAccessPanelOpen(false)}
            aria-label="Fechar painel de acessibilidade"
            style={{ minWidth: '34px', minHeight: '34px', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>
        <p>Personalize a leitura e o contraste visual.</p>

        <div className="access-row">
          <span>Tamanho do texto</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              id="btnFontDec"
              onClick={handleFontDec}
              disabled={fontScale <= 0.88}
              aria-label="Diminuir tamanho do texto"
            >
              A−
            </button>
            <span id="fontScaleLabel" className="font-scale-badge" aria-live="polite">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              id="btnFontInc"
              onClick={handleFontInc}
              disabled={fontScale >= 1.24}
              aria-label="Aumentar tamanho do texto"
            >
              A+
            </button>
          </div>
        </div>

        <div className="access-row">
          <span>Modo escuro</span>
          <button
            type="button"
            className="mode-btn"
            id="btnToggleTheme"
            onClick={handleToggleTheme}
            aria-pressed={isDarkMode}
            aria-label="Alternar modo escuro"
          >
            <span id="themeIconWrap">
              {isDarkMode ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="4.2" />
                  <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                >
                  <path d="M20.2 14.4A8.2 8.2 0 1 1 9.6 3.8a6.8 6.8 0 0 0 10.6 10.6Z" />
                </svg>
              )}
            </span>
            <span id="themeStatusText">{isDarkMode ? 'Ativado' : 'Desativado'}</span>
          </button>
        </div>

        <button
          type="button"
          className="btn secondary small access-reset"
          id="btnResetAccess"
          onClick={handleResetAccess}
        >
          Restaurar padrão
        </button>
      </aside>
    </>
  );
}
