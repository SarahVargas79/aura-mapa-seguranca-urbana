/**
 * COMPONENTE: SupportAndCommunity
 * -------------------------------
 * Renderiza a grade inferior da página com duas seções complementares:
 * 1. "Apoio e segurança": cartões interativos com orientações práticas e privacidade.
 * 2. "Apoio mútuo": orientações de acolhimento e confiança com abertura do modal informativo.
 */
export default function SupportAndCommunity({
  onScrollToSupport,
  onShowToast,
  onOpenPrivacyModal,
  onOpenCommunityModal,
}) {
  return (
    <section className="bottomgrid" aria-label="Orientações de segurança e apoio mútuo">
      <section className="panel" id="painelOrientacoes">
        <div className="panelhead">
          <div className="panelhead-main">
            <h2>Apoio e segurança</h2>
            <p>Orientações práticas.</p>
          </div>
          <span className="pill live">Canais e orientações</span>
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className="quick-card"
            id="cardUrgentHelp"
            onClick={() =>
              onScrollToSupport(
                'Em situações urgentes, procure um local seguro e acione o 190.',
                'warning'
              )
            }
          >
            <span className="quick-icon purple-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </span>
            <span>
              <strong className="purple-title">Preciso de ajuda agora</strong>
              <small>Orientações para situações urgentes.</small>
            </span>
          </button>

          <button
            type="button"
            className="quick-card"
            id="cardOfficialChannels"
            onClick={() =>
              onScrollToSupport(
                'Acesse os canais oficiais Ligue 180 e 190 no painel de apoio.',
                'info'
              )
            }
          >
            <span className="quick-icon purple-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.8 8.7c0 5-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
              </svg>
            </span>
            <span>
              <strong className="purple-title">Canais oficiais de apoio</strong>
              <small>Ligue 180 e emergência policial.</small>
            </span>
          </button>

          <button
            type="button"
            className="quick-card"
            id="cardDigitalSafety"
            onClick={() =>
              onShowToast(
                'Segurança digital: revise as permissões de localização do dispositivo e utilize a Saída rápida se necessário.',
                'info'
              )
            }
          >
            <span className="quick-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
                <path d="M9 6h6M10 18h4" />
              </svg>
            </span>
            <span>
              <strong>Segurança digital</strong>
              <small>Cuidados com privacidade e dispositivos.</small>
            </span>
          </button>

          <button
            type="button"
            className="quick-card"
            id="cardPrivacy"
            onClick={onOpenPrivacyModal}
          >
            <span className="quick-icon" aria-hidden="true">
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
            <span>
              <strong>Privacidade no AURA</strong>
              <small>O que é registrado e como os dados são usados.</small>
            </span>
          </button>
        </div>
      </section>

      <section className="panel community-panel" id="comunidade">
        <div className="panelhead">
          <div className="panelhead-main">
            <h2>Apoio mútuo</h2>
          </div>
          <span
            className="pill"
            style={{ background: 'var(--purple-soft)', color: 'var(--title-purple)' }}
          >
            Orientações
          </span>
        </div>

        <p className="community-intro">
          Orientações para oferecer e buscar apoio com respeito e acolhimento.
        </p>

        <div className="community-list">
          <article className="community-item">
            <div className="avatar" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.8 8.7c0 5-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
              </svg>
            </div>
            <div>
              <strong>Apoiar sem pressionar</strong>
              <p>Escuta acolhedora, sem julgamentos e empatia.</p>
            </div>
          </article>

          <article className="community-item">
            <div className="avatar" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
              </svg>
            </div>
            <div>
              <strong>Buscar apoio no próprio ritmo</strong>
              <p>Encontre apoio no seu tempo, compartilhando apenas o que desejar.</p>
            </div>
          </article>

          <article className="community-item">
            <div className="avatar" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5.5a3 3 0 0 1 0 5.8M18 14a4.5 4.5 0 0 1 3 4.2V20" />
              </svg>
            </div>
            <div>
              <strong>Construir uma rede de confiança</strong>
              <p>Apoio, privacidade e acesso a serviços especializados.</p>
            </div>
          </article>
        </div>

        <div className="community-action">
          <button
            type="button"
            className="btn purple full"
            id="btnCommunityAction"
            onClick={onOpenCommunityModal}
          >
            Ver orientações de apoio
          </button>
        </div>
      </section>
    </section>
  );
}
