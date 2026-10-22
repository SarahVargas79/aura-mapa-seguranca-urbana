import CustomSelect from './CustomSelect';
import { regionOptions, typeOptions } from '../data/regionsData';

/**
 * COMPONENTE: Modals
 * ------------------
 * Centraliza os dois modais de interação da plataforma:
 * 1. Modal de Autenticação ("Área de acesso")
 * 2. Modal de Registro de Relato ("Compartilhar percepção")
 *
 * Boas práticas de segurança e validação aplicadas:
 * - Valida os valores selecionados contra listas permitidas (allowlists: regionOptions e typeOptions)
 *   antes de aceitar o envio, prevenindo submissões incompletas ou inválidas.
 * - Segue o princípio de Minimização de Dados (LGPD): solicita apenas região aproximada
 *   e categoria urbana, sem coletar endereço exato ou dados sensíveis desnecessários.
 */
export default function Modals({
  activeModal,
  onCloseModal,
  onLoginSubmit,
  reportRegion,
  setReportRegion,
  reportType,
  setReportType,
  onShowToast
}) {
  const handleReportSubmit = (e) => {
    e.preventDefault();

    // Validação em lista permitida (allowlist) para região e categoria de percepção
    const isValidRegion = regionOptions.some(opt => opt.value === reportRegion);
    const isValidType = typeOptions.some(opt => opt.value === reportType);

    if (!isValidRegion) {
      onShowToast('Selecione uma região válida antes de registrar.');
      return;
    }

    if (!isValidType) {
      onShowToast('Selecione uma categoria em "Tipo de percepção".');
      return;
    }

    onCloseModal();
    setReportType('');
    onShowToast('Relato demonstrativo registrado com sucesso!');
  };

  return (
    <>
      {/* MODAL DE ENTRADA (AUTENTICAÇÃO SIMULADA) */}
      <div
        className={`modal-backdrop ${activeModal === 'auth' ? 'open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) onCloseModal(); }}
      >
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-auth-title">
          <div className="modal-head">
            <div className="auth-brand">
              <span className="logo" aria-hidden="true">A</span>
              <div>
                <h2 id="modal-auth-title">Área de acesso</h2>
                <p className="modal-subtitle">Acesse a comunidade e compartilhe percepções.</p>
              </div>
            </div>
            <button type="button" className="close-modal" onClick={onCloseModal} aria-label="Fechar modal">✕</button>
          </div>

          <form className="modal-content" onSubmit={onLoginSubmit}>
            <p className="auth-lead">
              O mapa e as orientações públicas continuam disponíveis sem login. Para registrar um relato ou participar da comunidade, entre na plataforma.
            </p>
            <div className="field">
              <label htmlFor="auth-email">E-mail</label>
              <input id="auth-email" type="email" placeholder="voce@exemplo.com" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="auth-password">Senha</label>
              <input id="auth-password" type="password" placeholder="Senha de demonstração" autoComplete="current-password" required />
            </div>
            <div className="privacy-notice">
              Protótipo local: a autenticação é apenas simulada. Em ambiente de produção, a validação ocorre no servidor via HTTPS.
            </div>
            <div className="form-actions mt-2">
              <button type="button" className="btn secondary" onClick={onCloseModal}>Agora não</button>
              <button type="submit" className="btn primary">Simular entrada</button>
            </div>
          </form>
        </section>
      </div>

      {/* MODAL DE COMPARTILHAR PERCEPÇÃO */}
      <div
        className={`modal-backdrop ${activeModal === 'report' ? 'open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) onCloseModal(); }}
      >
        <section className="modal wide" role="dialog" aria-modal="true" aria-labelledby="modal-report-title">
          <div className="modal-head">
            <div className="modal-title-wrap">
              <span className="modal-title-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
                </svg>
              </span>
              <div>
                <h2 id="modal-report-title">Compartilhar percepção</h2>
                <p className="modal-subtitle">Registre uma observação sobre o espaço urbano.</p>
              </div>
            </div>
            <button type="button" className="close-modal" onClick={onCloseModal} aria-label="Fechar modal">✕</button>
          </div>

          <form className="modal-content" onSubmit={handleReportSubmit}>
            <p className="modal-description">
              Informe apenas o necessário para orientar outras mulheres na região selecionada.
            </p>
            
            <div className="field">
              <label id="report-region-label">Região aproximada</label>
              <CustomSelect 
                labelId="report-region-label"
                options={regionOptions}
                value={reportRegion}
                onChange={setReportRegion}
                placeholder="Selecione a região"
              />
            </div>
            
            <div className="field">
              <label id="report-type-label">Tipo de percepção</label>
              <CustomSelect 
                labelId="report-type-label"
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
              <button type="button" className="btn secondary" onClick={onCloseModal}>Cancelar</button>
              <button type="submit" className="btn primary">Registrar demonstração</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
