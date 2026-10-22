import { useState, useEffect, useRef } from 'react';
import MapComponent from './components/MapComponent';

// Componente Exclusivo de Select Moderno Fiel aos Anexos
const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'open' : ''}`} 
      ref={selectRef} 
      tabIndex={0} 
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }}
    >
      <div className="cs-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className={!selectedOption ? 'placeholder' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="cs-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      {isOpen && (
        <ul className="cs-menu" role="listbox">
          <li className="cs-option disabled" aria-disabled="true">{placeholder}</li>
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cs-option ${opt.value === value ? 'selected' : ''}`}
              onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
            >
              {opt.label}
              {opt.value === value && (
                <svg className="cs-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Base de Dados com Coordenadas para o React-Leaflet
const regionsDB = {
  centro: { 
    id: 'centro', name: 'Centro Histórico', level: 'Atenção', levelClass: 'yellow', color: '#d1a738', 
    desc: 'Região central · Porto Alegre', copy: 'Esta região é usada para demonstrar como os fatores podem ser apresentados. A classificação não representa uma avaliação real do bairro.', 
    sub: 'Consulte os fatores disponíveis antes de decidir seu trajeto.', advice: 'Confira opções de transporte, observe as condições do trajeto e procure canais de apoio quando necessário.', 
    factors: [['Iluminação e visibilidade', 'Consultar', 55, 'check'], ['Movimento no entorno', 'Variável', 60, 'variable'], ['Relatos comunitários', 'Demonstrativo', 35, 'demo']],
    lat: -30.0328, lng: -51.2300 
  },
  cidade: { 
    id: 'cidade', name: 'Cidade Baixa', level: 'Alerta', levelClass: 'orange', color: '#cf8534', 
    desc: 'Área de circulação e lazer · Porto Alegre', copy: 'A movimentação pode variar conforme o horário e as atividades no entorno. Os fatores abaixo são exemplos de apresentação.', 
    sub: 'Informações contextuais, não uma previsão de risco.', advice: 'Observe as condições atuais do trajeto e identifique opções de transporte e pontos de referência próximos.', 
    factors: [['Iluminação e visibilidade', 'Consultar', 48, 'check'], ['Movimento no entorno', 'Variável', 76, 'variable'], ['Relatos comunitários', 'Demonstrativo', 43, 'demo']],
    lat: -30.0400, lng: -51.2200 
  },
  menino: { 
    id: 'menino', name: 'Menino Deus', level: 'Perigo', levelClass: 'red', color: '#cc4759', 
    desc: 'Área residencial e de serviços · Porto Alegre', copy: 'Esta visualização demonstra uma categoria de cor do projeto. O marcador e o nível são fictícios e não indicam perigo real.', 
    sub: 'Classificação fictícia: confirme sempre as condições no local.', advice: 'Consulte informações oficiais, confira opções de transporte e, diante de perigo imediato, procure um local seguro.', 
    factors: [['Iluminação e visibilidade', 'Consultar', 70, 'check'], ['Movimento no entorno', 'Variável', 52, 'variable'], ['Relatos comunitários', 'Demonstrativo', 60, 'demo']],
    lat: -30.0500, lng: -51.2250 
  }
};

const regionOptions = [
  { value: 'centro', label: 'Centro Histórico' },
  { value: 'cidade', label: 'Cidade Baixa' },
  { value: 'menino', label: 'Menino Deus' }
];

const typeOptions = [
  { value: 'iluminacao', label: 'Iluminação insuficiente' },
  { value: 'isolamento', label: 'Trecho isolado ou com pouca circulação' },
  { value: 'assedio', label: 'Assédio ou importunação' },
  { value: 'transporte', label: 'Condição de ponto de transporte' },
  { value: 'infraestrutura', label: 'Outro fator urbano' }
];

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

  // Estados dos Selects do Formulário
  const [reportRegion, setReportRegion] = useState('centro');
  const [reportType, setReportType] = useState('');

  const region = regionsDB[selectedRegionId];

  useEffect(() => { document.body.classList.toggle('dark', isDarkMode); }, [isDarkMode]);
  useEffect(() => { document.documentElement.style.setProperty('--scale', fontScale); }, [fontScale]);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3500);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setActiveModal(null);
    showToast("Sessão iniciada com sucesso.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccountPopoverOpen(false);
    showToast("Sessão de demonstração encerrada.");
  };

  const requireLogin = (modalName) => {
    if(isLoggedIn) {
      if(modalName === 'community') showToast("Esta demonstração não possui chat online.");
      else setActiveModal(modalName);
    } else {
      setActiveModal('auth');
    }
  };

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      
      <div className={`toast-container ${toast.visible ? 'show' : ''}`} role="alert">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        {toast.message}
      </div>

      <header className="topbar" id="topo">
        <div className="topbar-inner">
          <a className="brand" href="#inicio">
            <span className="logo">A</span>
            <span><strong>AURA</strong><small>SEGURANÇA URBANA PARA MULHERES</small></span>
          </a>
          <nav className="navlinks">
            <a href="#mapa" aria-current="page">Mapa preventivo</a>
            <a href="#apoio">Rede de apoio</a>
            <a href="#comunidade">Comunidade</a>
          </nav>
          
          <div className="header-actions">
            {/* Ícone Universal Sólido de Acessibilidade */}
            <button className="header-btn access-btn" onClick={() => setAccessPanelOpen(!accessPanelOpen)} title="Acessibilidade">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <circle cx="12" cy="4" r="2.5" />
                <path d="M21 9c-1.42 0-3.15.5-4.65 1.05V20.5a1.5 1.5 0 0 1-3 0v-6.5h-2v6.5a1.5 1.5 0 0 1-3 0v-10.45C6.85 9.5 5.12 9 3.7 9a1.5 1.5 0 0 1 0-3c2 0 4.14.7 5.75 1.34A3.97 3.97 0 0 1 12 7c.92 0 1.76.3 2.55.66C16.16 7.01 18.3 6.3 20.3 6.3a1.5 1.5 0 0 1 0 3z" />
              </svg>
              <span className="header-text">Acessibilidade</span>
            </button>
            <button className="header-btn exit-btn" onClick={() => window.location.replace('https://www.google.com')} title="Saída rápida">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M14 8l4 4-4 4M8 12h10"/></svg>
            </button>
            
            {/* Botão Preciso de Ajuda com Padrão Roxo Integrado */}
            <button className="header-btn help-btn" title="Preciso de ajuda">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 2 2.3Z"/></svg>
            </button>

            {!isLoggedIn ? (
              <button className="header-btn login-btn" onClick={() => setActiveModal('auth')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.2 3.1-5 7-5s6.4 1.8 7 5"/></svg>
                <span className="header-text">Entrar</span>
              </button>
            ) : (
              <button className="header-btn login-btn" onClick={() => setAccountPopoverOpen(!accountPopoverOpen)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.2 3.1-5 7-5s6.4 1.8 7 5"/></svg>
                <span className="header-text">Minha conta</span>
              </button>
            )}

            <button className="header-btn menu-btn" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-expanded={mobileNavOpen}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line className="line-top" x1="4" y1="6" x2="20" y2="6"/>
                <line className="line-mid" x1="4" y1="12" x2="20" y2="12"/>
                <line className="line-bot" x1="4" y1="18" x2="20" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        
        <nav className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
          <a href="#mapa" onClick={()=>setMobileNavOpen(false)}>Mapa preventivo</a>
          <a href="#apoio" onClick={()=>setMobileNavOpen(false)}>Rede de apoio</a>
          <a href="#comunidade" onClick={()=>setMobileNavOpen(false)}>Comunidade</a>
        </nav>
      </header>

      {/* Botão Sair Minimalista - Somente a borda foi removida */}
      <aside className={`account-popover ${accountPopoverOpen ? 'open' : ''}`}>
        <strong>Sessão de demonstração</strong>
        <p>O acesso está simulado localmente. Nenhum dado foi enviado.</p>
        <div className="account-actions">
          <button className="btn secondary small" onClick={() => setAccountPopoverOpen(false)}>Fechar</button>
          <button className="btn small purple" style={{ border: 'none' }} onClick={handleLogout}>Sair</button>
        </div>
      </aside>

      <aside className={`access-panel ${accessPanelOpen ? 'open' : ''}`}>
        <h2>Acessibilidade</h2><p>Personalize a leitura.</p>
        <div className="access-row">
          <span>Tamanho do texto</span>
          <div>
            <button onClick={() => setFontScale(Math.max(0.875, fontScale - 0.0625))}>A−</button> 
            <button onClick={() => setFontScale(Math.min(1.375, fontScale + 0.0625))} style={{marginLeft: '4px'}}>A+</button>
          </div>
        </div>
        <div className="access-row">
          <span>Modo escuro</span>
          <button className="mode-btn" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Alternar modo escuro">
            {isDarkMode ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.6 8.6 0 1 0 20.5 14.2Z"/></svg>}
          </button>
        </div>
        <button className="btn secondary access-reset" onClick={() => { setFontScale(1); setIsDarkMode(false); }}>Restaurar padrão</button>
      </aside>

      <main id="conteudo">
        <section className="hero" id="inicio">
          <div className="hero-main">
            <p className="eyebrow">Porto Alegre · prevenção e informação</p>
            <h1>Seu caminho, com mais informação.</h1>
            <p className="hero-copy">Consulte fatores de atenção no território e encontre orientações de apoio para seus deslocamentos.</p>
            <div className="hero-actions">
              <button className="btn primary" onClick={() => requireLogin('report')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> Compartilhar percepção
              </button>
              <button className="btn secondary" onClick={() => showToast('Os níveis do mapa são indicadores de exemplo explicativos do projeto.')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.6c-1.1 1-1.7 1.2-1.7 2.7M12 16.5h.01"/></svg> Como funciona
              </button>
            </div>
          </div>
        </section>

        <section id="mapa">
          <div className="layout">
            <section className="panel">
              <div className="panelhead">
                <div className="panelhead-main"><h2>Mapa urbano preventivo</h2><p>Selecione uma região.</p></div>
                <span className="pill live"><span className="live-dot"></span>Mapa demonstrativo</span>
              </div>
              <div className="mapwrap">
                <MapComponent regionsData={regionsDB} selectedRegionId={selectedRegionId} onSelectRegion={setSelectedRegionId} isDarkMode={isDarkMode} />
                <div className="map-foot"><span>◉ <strong>Dados ilustrativos</strong>.</span><span>Metodologia deve ser documentada.</span></div>
              </div>
            </section>

            <aside className="rightcol">
              <section className="panel region-panel">
                <div className="panelhead">
                  <div className="panelhead-main"><p className="eyebrow">Detalhes da região</p>
                    <h2 style={{ color: region.levelClass === 'red' ? 'var(--danger-region-text)' : region.color }}>{region.name}</h2>
                  </div>
                  <span className={`pill ${region.levelClass}`}>{region.level}</span>
                </div>
                <div className="regionbody">
                  <div className={`level ${region.levelClass}`}>
                    <span className="leveldot" style={{ background: region.color }}></span>
                    <div><strong>{region.level}</strong><div className="levelsub">{region.sub}</div></div>
                  </div>
                  <p className="region-copy">{region.copy}</p>
                  <div className="detail-block">
                    <h4>Fatores considerados</h4>
                    <div className="factor-list">
                      {region.factors.map((f, idx) => (
                        <div className="factor" key={idx}>
                          <strong>{f[0]}</strong><span className={`value factor-value-${f[3]}`}>{f[1]}</span>
                          <div className="track"><span style={{ width: `${f[2]}%`, background: idx === 0 ? region.color : idx === 1 ? 'var(--blue)' : 'var(--purple)' }}></span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Disclaimer Limpo Retido */}
                  <div className="disclaimer"><strong>Importante:</strong> níveis fictícios desta demonstração. Não preveem crimes nem substituem orientações de emergência.</div>
                </div>
              </section>

              <section className="panel support" id="apoio">
                <div className="support-heading">
                  <span className="supporticon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 8.7c0 5-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z"/></svg></span>
                  <div><h2>Você não precisa resolver tudo sozinha.</h2><p>Canais oficiais.</p></div>
                </div>
                <div className="supportlinks">
                  <a href="https://www.gov.br/mulheres/pt-br/ligue180" target="_blank" rel="noreferrer">Ligue 180 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg></a>
                  <a href="https://www.gov.br/pt-br/servicos/acionar-emergencia-policial-190" target="_blank" rel="noreferrer">190 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg></a>
                </div>
              </section>
            </aside>
          </div>
        </section>

        <section className="bottomgrid">
          <section className="panel">
            <div className="panelhead">
              <div className="panelhead-main"><h2>Apoio e segurança</h2><p>Orientações práticas.</p></div>
              <span className="pill live">Canais e orientações</span>
            </div>
            
            <div className="quick-actions">
              <button className="quick-card">
                <span className="quick-icon purple-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="M12 8v4M12 16h.01"/></svg></span>
                <span><strong className="purple-title">Preciso de ajuda agora</strong><small>Orientações para situações urgentes.</small></span>
              </button>
              <button className="quick-card">
                <span className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 8.7c0 5-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z"/></svg></span>
                <span><strong>Canais oficiais de apoio</strong><small>Ligue 180 e emergência policial.</small></span>
              </button>
              <button className="quick-card" onClick={() => showToast('Revise permissões de localização do dispositivo.')}>
                <span className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M9 6h6M10 18h4"/></svg></span>
                <span><strong>Segurança digital</strong><small>Cuidados com privacidade e dispositivos.</small></span>
              </button>
              <button className="quick-card" onClick={() => showToast('O projeto prevê coleta mínima de dados.')}>
                <span className="quick-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg></span>
                <span><strong>Privacidade no AURA</strong><small>Princípios de uso responsável dos dados.</small></span>
              </button>
            </div>
          </section>

          <section className="panel community-panel" id="comunidade">
            <div className="panelhead">
              <div className="panelhead-main"><h2>Fórum &amp; apoio mútuo</h2><p>Troca de informações com respeito e cuidado.</p></div>
              <span className="pill" style={{background: 'var(--purple-soft)', color: 'var(--title-purple)'}}>Área com login</span>
            </div>
            <p className="community-intro">A leitura pública apresenta a proposta da comunidade. Para conversar, é necessário entrar no AURA.</p>
            <div className="community-list">
              <article className="community-item">
                <div className="avatar">A</div>
                <div><strong>Dicas de trajeto na região central</strong><p>Conversas comunitárias estarão disponíveis para pessoas autenticadas.</p><small>Prévia demonstrativa · conteúdo ilustrativo</small></div>
              </article>
            </div>
            <div className="community-action">
              <button className="btn purple full" onClick={() => requireLogin('community')}>Entrar para conversar</button>
            </div>
          </section>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>© AURA · Mapa de Segurança Urbana para Mulheres · Protótipo acadêmico</span>
          <span className="footer-links">
            <a href="#apoio">Canais de apoio</a>
            <a href="#privacidade" onClick={(e) => { e.preventDefault(); showToast("Política de privacidade em construção."); }}>Privacidade</a>
            <a href="#acessibilidade" onClick={(e) => { e.preventDefault(); setAccessPanelOpen(true); }}>Acessibilidade</a>
          </span>
        </div>
      </footer>

      {/* MODAL DE ENTRADA */}
      <div className={`modal-backdrop ${activeModal === 'auth' ? 'open' : ''}`}>
        <section className="modal">
          <div className="modal-head">
            <div className="auth-brand"><span className="logo">A</span><div><h2>Área de acesso</h2><p className="modal-subtitle">Acesse a comunidade e compartilhe percepções.</p></div></div>
            <button className="close-modal" onClick={() => setActiveModal(null)} aria-label="Fechar modal">✕</button>
          </div>
          <form className="modal-content" onSubmit={handleLoginSubmit}>
            <p className="auth-lead">O mapa e as orientações públicas continuam disponíveis sem login. Para registrar um relato ou participar da comunidade, entre na plataforma.</p>
            <div className="field"><label>E-mail</label><input type="email" placeholder="voce@exemplo.com" required /></div>
            <div className="field"><label>Senha</label><input type="password" placeholder="Senha de demonstração" required /></div>
            <div className="privacy-notice">Protótipo local: a autenticação é apenas simulada.</div>
            <div className="form-actions mt-2">
              <button type="button" className="btn secondary" onClick={() => setActiveModal(null)}>Agora não</button>
              <button type="submit" className="btn primary">Simular entrada</button>
            </div>
          </form>
        </section>
      </div>

      {/* MODAL DE COMPARTILHAR PERCEPÇÃO COM O SELECT MODERNO */}
      <div className={`modal-backdrop ${activeModal === 'report' ? 'open' : ''}`}>
        <section className="modal wide">
          <div className="modal-head">
            <div className="modal-title-wrap">
              <span className="modal-title-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></span>
              <div><h2>Compartilhar percepção</h2><p className="modal-subtitle">Registre uma observação sobre o espaço urbano.</p></div>
            </div>
            <button className="close-modal" onClick={() => setActiveModal(null)} aria-label="Fechar modal">✕</button>
          </div>
          <form className="modal-content" onSubmit={(e) => { e.preventDefault(); setActiveModal(null); showToast("Relato demonstrativo registrado com sucesso!"); }}>
            <p className="modal-description">Informe apenas o necessário para orientar outras mulheres na região selecionada.</p>
            
            <div className="field">
              <label>Região aproximada</label>
              <CustomSelect 
                options={regionOptions}
                value={reportRegion}
                onChange={setReportRegion}
                placeholder="Selecione a região"
              />
            </div>
            
            <div className="field">
              <label>Tipo de percepção</label>
              <CustomSelect 
                options={typeOptions}
                value={reportType}
                onChange={setReportType}
                placeholder="Selecione uma categoria"
              />
            </div>
            
            <label className="form-check" style={{ marginTop: '8px' }}>
              <input type="checkbox" required />
              <span>Entendo que este é um protótipo demonstrativo e que o relato não será enviado a um serviço oficial.</span>
            </label>
            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => setActiveModal(null)}>Cancelar</button>
              <button type="submit" className="btn primary">Registrar demonstração</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
