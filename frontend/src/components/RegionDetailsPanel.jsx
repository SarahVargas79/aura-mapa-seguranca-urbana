/**
 * COMPONENTE: RegionDetailsPanel
 * ------------------------------
 * Apresenta na coluna direita os indicadores da região selecionada:
 * - Nome da região e descrição territorial breve logo abaixo
 * - Estado de classificação (Dados insuficientes, Atenção, Atenção elevada, Atenção crítica)
 * - Título "Critério da classificação" e resumo objetivo sem repetições
 * - Contagens separadas de relatos elegíveis (últimos 90 dias), ocorrências há mais de 90 dias
 *   e relatos sem período informado
 * - Categorias dos relatos no período e aviso de limitação
 */
export default function RegionDetailsPanel({ region }) {
  const totalElegiveis = region.quantidade_relatos || 0;
  const totalAnteriores90Dias = region.quantidade_anteriores_90_dias || 0;
  const totalPeriodoDesconhecido = region.quantidade_periodo_desconhecido || 0;
  const categorias = region.categorias_registradas || [];

  return (
    <aside className="rightcol" aria-label="Detalhes da região e canais de apoio">
      <section className="panel region-panel" id="panelDetalhesRegiao" aria-live="polite">
        <div className="panelhead">
          <div className="panelhead-main">
            <p className="eyebrow">Detalhes da região</p>
            <h2 id="detailRegionName" style={{ color: `var(--${region.cor_classe})` }}>
              {region.nome}
            </h2>
            <p id="detailRegionDescription" className="region-description">
              {region.descricao_territorial || 'Porto Alegre'}
            </p>
          </div>
          <span id="detailStatePill" className={`pill ${region.cor_classe}`}>
            {region.estado_semantico}
          </span>
        </div>

        <div className="regionbody">
          <div id="detailLevelBox" className={`level ${region.cor_classe}`}>
            <span
              id="detailLevelDot"
              className="leveldot"
              style={{ background: region.cor_hex }}
              aria-hidden="true"
            ></span>
            <div>
              <strong id="detailStateTitle">Critério da classificação</strong>
            </div>
          </div>

          <div className="indicator-meta" aria-label="Resumo dos relatos por período">
            <div className="meta-row">
              <strong>Relatos elegíveis (últimos 90 dias):</strong>
              <span id="detailEligibleCount">
                {totalElegiveis} {totalElegiveis === 1 ? 'relato elegível' : 'relatos elegíveis'}
              </span>
            </div>
            <div className="meta-row">
              <strong>Relatos sobre ocorrências há mais de 90 dias:</strong>
              <span id="detailOlderCount">{totalAnteriores90Dias}</span>
            </div>
            <div className="meta-row">
              <strong>Relatos sem período informado:</strong>
              <span id="detailUnknownCount">{totalPeriodoDesconhecido}</span>
            </div>
            <div className="meta-row">
              <strong>Janela de referência:</strong>
              <span id="detailPeriodText">{region.periodo_referencia}</span>
            </div>
          </div>

          <div className="detail-block">
            <h3>Categorias dos relatos no período</h3>
            <div id="detailCategoriesContainer">
              {categorias.length > 0 ? (
                <div className="factor-list">
                  {categorias.map((cat, idx) => {
                    const percentual =
                      totalElegiveis > 0
                        ? Math.round((cat.quantidade / totalElegiveis) * 100)
                        : 0;
                    const barColor =
                      idx === 0
                        ? region.cor_hex
                        : idx % 2 === 1
                        ? 'var(--blue)'
                        : 'var(--purple)';
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
                              background: barColor,
                            }}
                          ></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-factors">
                  Nenhum relato elegível registrado nesta região no período de referência.
                </p>
              )}
            </div>
          </div>

          <div className="disclaimer">
            <strong>Importante:</strong>{' '}
            <span id="detailDisclaimerText">{region.aviso_limitacao}</span>
          </div>
        </div>
      </section>

      <section className="panel support" id="apoio">
        <div className="support-heading">
          <span className="supporticon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 8.7c0 5-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
            </svg>
          </span>
          <div>
            <h2>Você não precisa resolver tudo sozinha.</h2>
            <p>Canais oficiais.</p>
          </div>
        </div>

        <div className="supportlinks">
          <a
            href="https://www.gov.br/mulheres/pt-br/ligue180"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ligue 180 — Central de Atendimento à Mulher
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 4h6v6M20 4l-9 9" />
              <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
            </svg>
          </a>
          <a
            href="https://www.gov.br/pt-br/servicos/acionar-emergencia-policial-190"
            target="_blank"
            rel="noopener noreferrer"
          >
            190 — Emergência Policial
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 4h6v6M20 4l-9 9" />
              <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
            </svg>
          </a>
        </div>
      </section>
    </aside>
  );
}
