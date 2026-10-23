/**
 * COMPONENTE: RegionDetailsPanel
 * ------------------------------
 * Apresenta na coluna direita os indicadores semânticos retornados pelo Django:
 * - Nome da região
 * - Estado semântico (Dados insuficientes, Atenção, Atenção elevada, Atenção crítica)
 * - Quantidade de relatos considerados no período de referência (últimos 90 dias)
 * - Período analisado
 * - Categorias disponíveis nos registros da região
 * - Aviso de limitação metodológica quando houver poucos dados ou registros indeterminados
 */
export default function RegionDetailsPanel({ region }) {
  const totalElegiveis = region.quantidade_relatos || 0;
  const totalIndeterminados = region.quantidade_historicos_indeterminados || 0;
  const categorias = region.categorias_registradas || [];

  return (
    <aside className="rightcol" aria-label="Detalhes da região e canais de apoio">
      <section className="panel region-panel" aria-live="polite">
        <div className="panelhead">
          <div className="panelhead-main">
            <p className="eyebrow">Detalhes da região</p>
            <h2 style={{ color: `var(--${region.cor_classe})` }}>{region.nome}</h2>
          </div>
          <span className={`pill ${region.cor_classe}`}>{region.estado_semantico}</span>
        </div>

        <div className="regionbody">
          <div className={`level ${region.cor_classe}`}>
            <span className="leveldot" style={{ background: region.cor_hex }} aria-hidden="true"></span>
            <div>
              <strong>{region.estado_semantico}</strong>
              <div className="levelsub">{region.subtitulo_estado}</div>
            </div>
          </div>

          <div className="indicator-meta">
            <div className="meta-row">
              <strong>Relatos no período:</strong>
              <span>
                {totalElegiveis} {totalElegiveis === 1 ? 'relato elegível' : 'relatos elegíveis'}
              </span>
            </div>
            <div className="meta-row">
              <strong>Período analisado:</strong>
              <span>{region.periodo_referencia}</span>
            </div>
            {totalIndeterminados > 0 && (
              <div className="meta-row">
                <strong>Registros históricos / indeterminados:</strong>
                <span>
                  {totalIndeterminados} (mantidos separadamente do indicador)
                </span>
              </div>
            )}
          </div>

          <div className="detail-block">
            <h3>Categorias disponíveis nos registros</h3>
            {categorias.length > 0 ? (
              <div className="factor-list">
                {categorias.map((cat, idx) => {
                  const percentual = totalElegiveis > 0
                    ? Math.round((cat.quantidade / totalElegiveis) * 100)
                    : 0;
                  return (
                    <div className="factor" key={cat.id}>
                      <strong>{cat.rotulo}</strong>
                      <span className="value factor-value-check">
                        {cat.quantidade} {cat.quantidade === 1 ? 'relato' : 'relatos'}
                      </span>
                      <div
                        className="track"
                        role="progressbar"
                        aria-label={cat.rotulo}
                        aria-valuenow={percentual}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span
                          style={{
                            width: `${Math.max(percentual, 12)}%`,
                            background: idx === 0 ? region.cor_hex : idx % 2 === 1 ? 'var(--blue)' : 'var(--purple)'
                          }}
                        ></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-factors">
                Nenhuma categoria registrada nesta região dentro do período de referência analisado.
              </p>
            )}
          </div>

          <div className="disclaimer">
            <strong>Importante:</strong> {region.aviso_limitacao}
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
