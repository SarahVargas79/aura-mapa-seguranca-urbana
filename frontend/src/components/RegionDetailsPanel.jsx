/**
 * COMPONENTE: RegionDetailsPanel
 * ------------------------------
 * Exibe na coluna direita as informações detalhadas da região selecionada no mapa
 * (nível de atenção, descrição contextual, barras de fatores considerados e aviso legal),
 * além do bloco de acesso direto aos canais oficiais (Ligue 180 e 190).
 */
export default function RegionDetailsPanel({ region }) {
  return (
    <aside className="rightcol" aria-label="Detalhes da região e canais de apoio">
      <section className="panel region-panel" aria-live="polite">
        <div className="panelhead">
          <div className="panelhead-main">
            <p className="eyebrow">Detalhes da região</p>
            <h2 style={{ color: `var(--${region.levelClass})` }}>{region.name}</h2>
          </div>
          <span className={`pill ${region.levelClass}`}>{region.level}</span>
        </div>

        <div className="regionbody">
          <div className={`level ${region.levelClass}`}>
            <span className="leveldot" style={{ background: region.color }} aria-hidden="true"></span>
            <div>
              <strong>{region.level}</strong>
              <div className="levelsub">{region.sub}</div>
            </div>
          </div>

          <p className="region-copy">{region.copy}</p>

          <div className="detail-block">
            <h3>Fatores considerados</h3>
            <div className="factor-list">
              {region.factors.map((f, idx) => (
                <div className="factor" key={idx}>
                  <strong>{f[0]}</strong>
                  <span className={`value factor-value-${f[3]}`}>{f[1]}</span>
                  <div
                    className="track"
                    role="progressbar"
                    aria-label={f[0]}
                    aria-valuenow={f[2]}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      style={{
                        width: `${f[2]}%`,
                        background: idx === 0 ? region.color : idx === 1 ? 'var(--blue)' : 'var(--purple)'
                      }}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="disclaimer">
            <strong>Importante:</strong> níveis fictícios desta demonstração. Não preveem crimes nem substituem orientações de emergência.
          </div>
        </div>
      </section>

      <section className="panel support" id="apoio">
        <div className="support-heading">
          <span className="supporticon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 8.7c0 5-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z"/>
            </svg>
          </span>
          <div>
            <h2>Você não precisa resolver tudo sozinha.</h2>
            <p>Canais oficiais.</p>
          </div>
        </div>

        <div className="supportlinks">
          <a href="https://www.gov.br/mulheres/pt-br/ligue180" target="_blank" rel="noopener noreferrer">
            Ligue 180
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 4h6v6M20 4l-9 9"/>
              <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>
            </svg>
          </a>
          <a href="https://www.gov.br/pt-br/servicos/acionar-emergencia-policial-190" target="_blank" rel="noopener noreferrer">
            190
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 4h6v6M20 4l-9 9"/>
              <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>
            </svg>
          </a>
        </div>
      </section>
    </aside>
  );
}
