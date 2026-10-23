import { useState } from 'react';
import CustomSelect from './CustomSelect';
import {
  regionOptions,
  typeOptions,
  shiftOptions,
  periodOptions,
} from '../data/regionsData';
import { api } from '../services/api';

/**
 * COMPONENTE: Modals
 * ------------------
 * Centraliza os dois modais integrados ao backend Django:
 * 1. Modal de Acesso ("Área de acesso"):
 *    - Permite alternar entre Login e Cadastro usando apenas `identificador_aura` e `senha`.
 *    - Não solicita e-mail, CPF ou nome civil.
 *    - Informa claramente que o identificador AURA dispensa dados civis no cadastro,
 *      mas não representa garantia de anonimato absoluto.
 *
 * 2. Modal de Registro de Relato ("Compartilhar percepção"):
 *    - Contém os 4 campos obrigatórios de seleção (Bairro, Categoria, Turno e Período aproximado)
 *      e o campo opcional de descrição objetiva.
 *    - Envia POST autenticado para /api/relatos/ e atualiza os indicadores do mapa em tempo real.
 */
export default function Modals({
  activeModal,
  onCloseModal,
  onAuthSuccess,
  onReportSuccess,
  reportRegion,
  setReportRegion,
  onShowToast
}) {
  // Estados do formulário de autenticação/cadastro
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [identificadorAura, setIdentificadorAura] = useState('');
  const [senha, setSenha] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Estados do formulário "Compartilhar Percepção"
  const [reportType, setReportType] = useState('');
  const [reportShift, setReportShift] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const handleAuthFormSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const idLimpo = identificadorAura.trim();
    if (!idLimpo || !senha) {
      setAuthError('Preencha seu identificador AURA e sua senha.');
      return;
    }

    setAuthLoading(true);
    try {
      const response = authMode === 'register'
        ? await api.cadastrar({ identificador_aura: idLimpo, senha })
        : await api.login({ identificador_aura: idLimpo, senha });

      setIdentificadorAura('');
      setSenha('');
      onAuthSuccess(response.token, response.usuario, response.mensagem);
    } catch (err) {
      setAuthError(err.message || 'Falha na autenticação. Verifique os dados informados.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');

    if (!reportRegion) {
      setReportError('Selecione o bairro da ocorrência.');
      return;
    }
    if (!reportType) {
      setReportError('Selecione a categoria de percepção.');
      return;
    }
    if (!reportShift) {
      setReportError('Selecione o turno da ocorrência.');
      return;
    }
    if (!reportPeriod) {
      setReportError('Selecione o período aproximado da ocorrência.');
      return;
    }

    setReportLoading(true);
    try {
      await api.criarRelato({
        regiao: reportRegion,
        categoria: reportType,
        turno_ocorrencia: reportShift,
        periodo_ocorrencia: reportPeriod,
        descricao_objetiva: reportDescription.trim(),
      });

      setReportType('');
      setReportShift('');
      setReportPeriod('');
      setReportDescription('');
      onCloseModal();
      onShowToast('Relato registrado com sucesso! Indicadores atualizados.');
      if (onReportSuccess) {
        await onReportSuccess(reportRegion);
      }
    } catch (err) {
      setReportError(err.message || 'Não foi possível registrar o relato.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      {/* MODAL DE ACESSO (LOGIN E CADASTRO POR IDENTIFICADOR_AURA) */}
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
                <p className="modal-subtitle">
                  {authMode === 'login'
                    ? 'Entre com seu identificador AURA para registrar percepções.'
                    : 'Crie um identificador AURA sem precisar informar nome civil ou e-mail.'}
                </p>
              </div>
            </div>
            <button type="button" className="close-modal" onClick={onCloseModal} aria-label="Fechar modal">✕</button>
          </div>

          <form className="modal-content" onSubmit={handleAuthFormSubmit}>
            <div className="auth-tabs" role="tablist" aria-label="Modo de acesso">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                className={`btn small ${authMode === 'login' ? 'primary' : 'secondary'}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
              >
                Já tenho identificador
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'register'}
                className={`btn small ${authMode === 'register' ? 'primary' : 'secondary'}`}
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
              >
                Criar identificador
              </button>
            </div>

            <p className="auth-lead">
              O mapa e as orientações públicas permanecem abertos sem login. Para registrar um relato, utilize apenas um identificador único e uma senha.
            </p>

            {authError && (
              <div className="form-error" role="alert">
                {authError}
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-identificador">Identificador AURA</label>
              <input
                id="auth-identificador"
                type="text"
                value={identificadorAura}
                onChange={(e) => setIdentificadorAura(e.target.value)}
                placeholder="Ex.: usuaria_poa_24"
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="auth-password">Senha</label>
              <input
                id="auth-password"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                required
              />
            </div>

            <div className="privacy-notice">
              <strong>Sobre privacidade:</strong> o cadastro exige apenas um identificador de usuário e senha (armazenada com hash seguro), sem solicitar nome civil, CPF ou e-mail. O uso de identificador reduz a exposição de dados cadastrais, mas não representa garantia de anonimato absoluto.
            </div>

            <div className="form-actions mt-2">
              <button type="button" className="btn secondary" onClick={onCloseModal}>Agora não</button>
              <button type="submit" className="btn primary" disabled={authLoading}>
                {authLoading
                  ? 'Processando...'
                  : authMode === 'login'
                  ? 'Entrar'
                  : 'Cadastrar e entrar'}
              </button>
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
                <p className="modal-subtitle">Registre uma observação sobre o espaço urbano em Porto Alegre.</p>
              </div>
            </div>
            <button type="button" className="close-modal" onClick={onCloseModal} aria-label="Fechar modal">✕</button>
          </div>

          <form className="modal-content" onSubmit={handleReportSubmit}>
            <p className="modal-description">
              Informe apenas o necessário para orientar outras mulheres na região selecionada. O período da ocorrência é uma estimativa e não substitui boletim de ocorrência oficial.
            </p>

            {reportError && (
              <div className="form-error" role="alert">
                {reportError}
              </div>
            )}

            <div className="form-grid-2">
              <div className="field">
                <label id="report-region-label">Bairro *</label>
                <CustomSelect 
                  labelId="report-region-label"
                  options={regionOptions}
                  value={reportRegion}
                  onChange={setReportRegion}
                  placeholder="Selecione o bairro"
                />
              </div>

              <div className="field">
                <label id="report-type-label">Categoria *</label>
                <CustomSelect 
                  labelId="report-type-label"
                  options={typeOptions}
                  value={reportType}
                  onChange={setReportType}
                  placeholder="Selecione a categoria"
                />
              </div>

              <div className="field">
                <label id="report-shift-label">Turno da ocorrência *</label>
                <CustomSelect 
                  labelId="report-shift-label"
                  options={shiftOptions}
                  value={reportShift}
                  onChange={setReportShift}
                  placeholder="Selecione o turno"
                />
              </div>

              <div className="field">
                <label id="report-period-label">Período da ocorrência *</label>
                <CustomSelect 
                  labelId="report-period-label"
                  options={periodOptions}
                  value={reportPeriod}
                  onChange={setReportPeriod}
                  placeholder="Quando aconteceu?"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="report-description">Descrição objetiva (opcional)</label>
              <textarea
                id="report-description"
                rows={2}
                maxLength={500}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Ex.: Iluminação apagada na esquina próxima ao ponto de ônibus (evite incluir nomes ou dados pessoais)."
              />
            </div>
            
            <label className="form-check">
              <input type="checkbox" required />
              <span>
                Compreendo que os relatos compõem um indicador comunitário de percepção urbana e não substituem canais oficiais de emergência (190 / 180).
              </span>
            </label>

            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={onCloseModal}>Cancelar</button>
              <button type="submit" className="btn primary" disabled={reportLoading}>
                {reportLoading ? 'Registrando...' : 'Registrar percepção'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
