import { useState, useEffect, useRef } from 'react';
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
 * Centraliza os modais acessíveis da aplicação:
 * 1. Modal "Área de acesso" (auth):
 *    - Login e cadastro utilizando apenas identificador_aura e senha.
 * 2. Modal "Compartilhar relato" (report):
 *    - Registra uma situação ou condição observada em Porto Alegre.
 * 3. Modal "Como funciona o indicador" (how):
 *    - Explica a janela de referência de 90 dias, as faixas de classificação e os registros separados.
 * 4. Modal "Privacidade no AURA" (privacy):
 *    - Concentra as informações sobre uso dos dados, localização aproximada e cadastro.
 */
export default function Modals({
  activeModal,
  onCloseModal,
  onAuthSuccess,
  onReportSuccess,
  reportRegion,
  setReportRegion,
  onShowToast,
}) {
  // Estados do formulário de autenticação/cadastro
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [identificadorAura, setIdentificadorAura] = useState('');
  const [senha, setSenha] = useState('');
  const [authError, setAuthError] = useState('');
  const [authInvalidField, setAuthInvalidField] = useState({ id: false, pass: false });
  const [authLoading, setAuthLoading] = useState(false);

  // Estados do formulário "Compartilhar relato"
  const [reportType, setReportType] = useState('');
  const [reportShift, setReportShift] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportConsent, setReportConsent] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportInvalidSelect, setReportInvalidSelect] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Referências para gerenciamento de foco e validação acessível
  const lastFocusedRef = useRef(null);
  const authModalRef = useRef(null);
  const reportModalRef = useRef(null);
  const howModalRef = useRef(null);
  const privacyModalRef = useRef(null);

  const authIdInputRef = useRef(null);
  const authPassInputRef = useRef(null);
  const authErrorRef = useRef(null);

  const regiaoSelectRef = useRef(null);
  const categoriaSelectRef = useRef(null);
  const periodoSelectRef = useRef(null);
  const turnoSelectRef = useRef(null);
  const consentInputRef = useRef(null);
  const reportErrorRef = useRef(null);

  const handleClose = () => {
    setAuthError('');
    setAuthInvalidField({ id: false, pass: false });
    setReportError('');
    setReportInvalidSelect('');
    onCloseModal();
  };

  // Gerencia o foco ao abrir/fechar modais e mantém o foco preso (focus trap) dentro do modal ativo
  useEffect(() => {
    if (activeModal) {
      if (!lastFocusedRef.current) {
        lastFocusedRef.current = document.activeElement;
      }

      const modalMap = {
        auth: authModalRef.current,
        report: reportModalRef.current,
        how: howModalRef.current,
        privacy: privacyModalRef.current,
      };
      const currentModalEl = modalMap[activeModal];
      const closeBtn = currentModalEl?.querySelector('.close-modal');
      if (closeBtn) {
        closeBtn.focus();
      }

      const handleTabTrap = (e) => {
        if (e.key === 'Escape') {
          setAuthError('');
          setAuthInvalidField({ id: false, pass: false });
          setReportError('');
          setReportInvalidSelect('');
          return;
        }
        if (e.key !== 'Tab' || !currentModalEl) return;
        const focusable = Array.from(
          currentModalEl.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.closest('[hidden]'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || !currentModalEl.contains(document.activeElement))
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener('keydown', handleTabTrap);
      return () => document.removeEventListener('keydown', handleTabTrap);
    } else if (lastFocusedRef.current) {
      const returnEl = lastFocusedRef.current;
      lastFocusedRef.current = null;
      if (typeof returnEl.focus === 'function') {
        returnEl.focus();
      }
    }
  }, [activeModal]);

  const handleAuthFormSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthInvalidField({ id: false, pass: false });

    const idLimpo = identificadorAura.trim();
    if (!idLimpo || !senha) {
      setAuthError('Preencha seu identificador AURA e sua senha.');
      setAuthInvalidField({ id: !idLimpo, pass: !senha });
      if (!idLimpo) authIdInputRef.current?.focus();
      else authPassInputRef.current?.focus();
      return;
    }

    if (idLimpo.length < 3 || idLimpo.length > 30 || !/^[a-zA-Z0-9_.-]+$/.test(idLimpo)) {
      setAuthError(
        'O identificador AURA deve ter entre 3 e 30 caracteres (letras, números, _, . ou -).'
      );
      setAuthInvalidField({ id: true, pass: false });
      authIdInputRef.current?.focus();
      return;
    }

    if (senha.length < 6) {
      setAuthError('A senha deve conter pelo menos 6 caracteres.');
      setAuthInvalidField({ id: false, pass: true });
      authPassInputRef.current?.focus();
      return;
    }

    setAuthLoading(true);
    try {
      const response =
        authMode === 'register'
          ? await api.cadastrar({ identificador_aura: idLimpo, senha })
          : await api.login({ identificador_aura: idLimpo, senha });

      setIdentificadorAura('');
      setSenha('');
      const fallbackMsg =
        authMode === 'register'
          ? `Identificador AURA criado com sucesso: ${response.usuario.identificador_aura}.`
          : `Acesso iniciado com sucesso, ${response.usuario.identificador_aura}.`;
      onAuthSuccess(response.token, response.usuario, response.mensagem || fallbackMsg);
    } catch (err) {
      setAuthError(err.message || 'Falha na autenticação. Verifique os dados informados.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportInvalidSelect('');

    if (!reportRegion) {
      setReportError('Selecione o bairro ou a região.');
      setReportInvalidSelect('regiao');
      regiaoSelectRef.current?.focus();
      return;
    }
    if (!reportType) {
      setReportError('Selecione uma categoria para o relato.');
      setReportInvalidSelect('categoria');
      categoriaSelectRef.current?.focus();
      return;
    }
    if (!reportPeriod) {
      setReportError('Informe o período aproximado da ocorrência.');
      setReportInvalidSelect('periodo');
      periodoSelectRef.current?.focus();
      return;
    }
    if (!reportShift) {
      setReportError('Selecione o turno aproximado da ocorrência.');
      setReportInvalidSelect('turno');
      turnoSelectRef.current?.focus();
      return;
    }
    if (!reportConsent) {
      setReportError(
        'Confirme que compreendeu a finalidade informativa dos relatos antes de continuar.'
      );
      consentInputRef.current?.focus();
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

      const regiaoAlvo = reportRegion;
      setReportType('');
      setReportShift('');
      setReportPeriod('');
      setReportDescription('');
      setReportConsent(false);
      onCloseModal();
      onShowToast(
        'Relato registrado com sucesso. Os indicadores da região foram atualizados.',
        'success'
      );
      if (onReportSuccess) {
        await onReportSuccess(regiaoAlvo);
      }
    } catch (err) {
      setReportError(err.message || 'Não foi possível registrar o relato.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      {/* MODAL 1: ÁREA DE ACESSO */}
      <div
        id="modalAuthBackdrop"
        className={`modal-backdrop ${activeModal === 'auth' ? 'open' : ''}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <section
          ref={authModalRef}
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-auth-title"
        >
          <div className="modal-head">
            <div className="auth-brand">
              <span className="logo" aria-hidden="true">
                A
              </span>
              <div>
                <h2 id="modal-auth-title">Área de acesso</h2>
                <p className="modal-subtitle" id="modalAuthSubtitle">
                  {authMode === 'login'
                    ? 'Entre com seu identificador AURA para registrar relatos.'
                    : 'Crie um identificador AURA para acessar sua conta, sem informar nome civil, CPF, telefone ou e-mail.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="close-modal"
              onClick={handleClose}
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>

          <form className="modal-content" id="formAuth" onSubmit={handleAuthFormSubmit} noValidate>
            <div className="auth-tabs" role="tablist" aria-label="Modo de acesso">
              <button
                type="button"
                role="tab"
                id="tabAuthLogin"
                aria-selected={authMode === 'login'}
                className={`btn small ${authMode === 'login' ? 'primary' : 'secondary'}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthInvalidField({ id: false, pass: false });
                }}
              >
                Já tenho identificador
              </button>
              <button
                type="button"
                role="tab"
                id="tabAuthRegister"
                aria-selected={authMode === 'register'}
                className={`btn small ${authMode === 'register' ? 'primary' : 'secondary'}`}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthInvalidField({ id: false, pass: false });
                }}
              >
                Criar identificador
              </button>
            </div>

            <p className="auth-lead">
              O mapa e as orientações públicas permanecem abertos sem login. Para registrar um relato, utilize apenas um identificador único e uma senha.
            </p>

            {authError && (
              <div ref={authErrorRef} id="authErrorBox" className="form-error" role="alert">
                {authError}
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-identificador">Identificador AURA *</label>
              <input
                ref={authIdInputRef}
                id="auth-identificador"
                type="text"
                className={authInvalidField.id ? 'invalid' : ''}
                value={identificadorAura}
                onChange={(e) => {
                  setIdentificadorAura(e.target.value);
                  if (authInvalidField.id) setAuthInvalidField((p) => ({ ...p, id: false }));
                }}
                placeholder="Seu identificador AURA"
                autoComplete="off"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="auth-password">Senha *</label>
              <input
                ref={authPassInputRef}
                id="auth-password"
                type="password"
                className={authInvalidField.pass ? 'invalid' : ''}
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (authInvalidField.pass) setAuthInvalidField((p) => ({ ...p, pass: false }));
                }}
                placeholder="Sua senha"
                autoComplete="off"
                required
              />
            </div>

            <div className="privacy-notice">
              <strong>Sobre privacidade:</strong> o cadastro utiliza identificador e senha, sem solicitar nome civil, CPF, telefone ou e-mail. A senha é armazenada com hash seguro. O uso de identificador reduz a exposição de dados cadastrais, mas não garante anonimato absoluto.
            </div>

            <div className="form-actions mt-2">
              <button type="button" className="btn secondary" onClick={handleClose}>
                Agora não
              </button>
              <button
                type="submit"
                className="btn primary"
                id="btnAuthSubmit"
                disabled={authLoading}
              >
                {authLoading
                  ? 'Processando...'
                  : authMode === 'login'
                  ? 'Entrar'
                  : 'Criar identificador e entrar'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* MODAL 2: COMPARTILHAR RELATO */}
      <div
        id="modalReportBackdrop"
        className={`modal-backdrop ${activeModal === 'report' ? 'open' : ''}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <section
          ref={reportModalRef}
          className="modal wide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-report-title"
        >
          <div className="modal-head">
            <div className="modal-title-wrap">
              <span className="modal-title-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
              </span>
              <div>
                <h2 id="modal-report-title">Compartilhar relato</h2>
                <p className="modal-subtitle">
                  Registre uma situação ou condição observada em Porto Alegre.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="close-modal"
              onClick={handleClose}
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>

          <form
            className="modal-content"
            id="formReport"
            onSubmit={handleReportSubmit}
            noValidate
          >
            <p className="modal-description">
              Informe apenas o necessário para orientar outras mulheres na região selecionada. O período da ocorrência é uma estimativa e não substitui boletim de ocorrência oficial.
            </p>

            {reportError && (
              <div ref={reportErrorRef} id="reportErrorBox" className="form-error" role="alert">
                {reportError}
              </div>
            )}

            <div className="form-grid-2">
              <div className="field">
                <label id="report-region-label">Região de Porto Alegre *</label>
                <CustomSelect
                  selectKey="regiao"
                  containerRef={regiaoSelectRef}
                  labelId="report-region-label"
                  options={regionOptions}
                  value={reportRegion}
                  onChange={(val) => {
                    setReportRegion(val);
                    setReportError('');
                    if (reportInvalidSelect === 'regiao') setReportInvalidSelect('');
                  }}
                  placeholder="Selecione a região"
                  invalid={reportInvalidSelect === 'regiao'}
                />
              </div>

              <div className="field">
                <label id="report-type-label">Categoria *</label>
                <CustomSelect
                  selectKey="categoria"
                  containerRef={categoriaSelectRef}
                  labelId="report-type-label"
                  options={typeOptions}
                  value={reportType}
                  onChange={(val) => {
                    setReportType(val);
                    setReportError('');
                    if (reportInvalidSelect === 'categoria') setReportInvalidSelect('');
                  }}
                  placeholder="Selecione o tipo de situação"
                  invalid={reportInvalidSelect === 'categoria'}
                />
              </div>

              <div className="field">
                <label id="report-period-label">Período da ocorrência (aproximado) *</label>
                <CustomSelect
                  selectKey="periodo"
                  containerRef={periodoSelectRef}
                  labelId="report-period-label"
                  options={periodOptions}
                  value={reportPeriod}
                  onChange={(val) => {
                    setReportPeriod(val);
                    setReportError('');
                    if (reportInvalidSelect === 'periodo') setReportInvalidSelect('');
                  }}
                  placeholder="Selecione uma faixa de tempo"
                  invalid={reportInvalidSelect === 'periodo'}
                />
              </div>

              <div className="field">
                <label id="report-shift-label">Turno da ocorrência *</label>
                <CustomSelect
                  selectKey="turno"
                  containerRef={turnoSelectRef}
                  labelId="report-shift-label"
                  options={shiftOptions}
                  value={reportShift}
                  onChange={(val) => {
                    setReportShift(val);
                    setReportError('');
                    if (reportInvalidSelect === 'turno') setReportInvalidSelect('');
                  }}
                  placeholder="Selecione o período do dia"
                  invalid={reportInvalidSelect === 'turno'}
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
                placeholder="Descreva objetivamente a situação. Não inclua nomes ou dados pessoais."
              />
            </div>

            <label className="form-check">
              <input
                ref={consentInputRef}
                type="checkbox"
                id="report-consent"
                checked={reportConsent}
                onChange={(e) => {
                  setReportConsent(e.target.checked);
                  if (e.target.checked) setReportError('');
                }}
                required
              />
              <span>
                Compreendo que os relatos enviados pelas usuárias compõem indicadores de percepção sobre o espaço urbano e não substituem os canais oficiais de emergência: 190 (Polícia) e 180 (Central de Atendimento à Mulher). *
              </span>
            </label>

            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={handleClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn primary"
                id="btnReportSubmit"
                disabled={reportLoading}
              >
                {reportLoading ? 'Registrando...' : 'Registrar relato'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* MODAL 3: COMO FUNCIONA O INDICADOR */}
      <div
        id="modalHowBackdrop"
        className={`modal-backdrop ${activeModal === 'how' ? 'open' : ''}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <section
          ref={howModalRef}
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-how-title"
          aria-describedby="modal-how-subtitle"
        >
          <div className="modal-head">
            <div className="modal-title-wrap">
              <span className="modal-title-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.6c-1.1 1-1.7 1.2-1.7 2.7M12 16.5h.01" />
                </svg>
              </span>
              <div>
                <h2 id="modal-how-title">Como funciona o indicador</h2>
                <p className="modal-subtitle" id="modal-how-subtitle">
                  Como ler os números e a classificação.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="close-modal"
              onClick={handleClose}
              aria-label="Fechar janela Como funciona"
            >
              ✕
            </button>
          </div>

          <div className="modal-content">
            <div className="privacy-notice">
              <strong>Janela de referência:</strong> entram na classificação apenas relatos cujo período aproximado vai de hoje até 90 dias atrás.
            </div>
            <div className="privacy-notice">
              <strong>Faixas de classificação:</strong>
              <ul>
                <li>
                  <strong>0 relatos elegíveis:</strong> Dados insuficientes
                </li>
                <li>
                  <strong>1 a 2:</strong> Atenção
                </li>
                <li>
                  <strong>3 a 5:</strong> Atenção elevada
                </li>
                <li>
                  <strong>6 ou mais:</strong> Atenção crítica
                </li>
              </ul>
            </div>
            <div className="privacy-notice">
              <strong>Registros fora do indicador:</strong> relatos de ocorrências há mais de 90 dias e relatos sem período informado são contabilizados separadamente. Não entram na classificação nem nos percentuais por categoria.
            </div>
            <p className="modal-description">
              Os indicadores refletem o volume de relatos elegíveis registrados. Eles não representam necessariamente ocorrências únicas nem estatísticas criminais oficiais. A ausência de relatos não garante segurança.
            </p>
            <div className="form-actions">
              <button type="button" className="btn primary" onClick={handleClose}>
                Entendi
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL 4: PRIVACIDADE NO AURA */}
      <div
        id="modalPrivacyBackdrop"
        className={`modal-backdrop ${activeModal === 'privacy' ? 'open' : ''}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <section
          ref={privacyModalRef}
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-privacy-title"
        >
          <div className="modal-head">
            <div className="modal-title-wrap">
              <span className="modal-title-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div>
                <h2 id="modal-privacy-title">Privacidade no AURA</h2>
                <p className="modal-subtitle">Como o AURA trata os dados.</p>
              </div>
            </div>
            <button
              type="button"
              className="close-modal"
              onClick={handleClose}
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>

          <div className="modal-content">
            <div className="privacy-notice">
              <strong>Uso dos dados:</strong> os relatos enviados pelas usuárias são utilizados para apresentar indicadores por região. Informe apenas o necessário e evite incluir dados pessoais na descrição.
            </div>
            <div className="privacy-notice">
              <strong>Localização aproximada:</strong> o formulário pede uma região de Porto Alegre, não o GPS exato. Evite informar nomes, endereços específicos ou outros dados pessoais no campo de detalhes.
            </div>
            <div className="privacy-notice">
              <strong>Cadastro:</strong> o AURA utiliza identificador e senha, sem solicitar nome civil, CPF, telefone ou e-mail. A senha é armazenada com hash seguro. O uso de identificador reduz a exposição de dados cadastrais, mas não garante anonimato absoluto.
            </div>
            <div className="form-actions">
              <button type="button" className="btn primary" onClick={handleClose}>
                Entendi
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
