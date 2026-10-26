from django.conf import settings
from django.db import models

# ==============================================================================
# CATÁLOGO FIXO DE BAIRROS / REGIÕES DE PORTO ALEGRE (RS)
# ==============================================================================
REGIOES_POA_METADATA = {
    'centro': {
        'id': 'centro',
        'nome': 'Centro Histórico',
        'descricao_territorial': 'Região central · Porto Alegre',
        'lat': -30.0328,
        'lng': -51.2300,
    },
    'cidade': {
        'id': 'cidade',
        'nome': 'Cidade Baixa',
        'descricao_territorial': 'Área de circulação e lazer · Porto Alegre',
        'lat': -30.0400,
        'lng': -51.2200,
    },
    'menino': {
        'id': 'menino',
        'nome': 'Menino Deus',
        'descricao_territorial': 'Área residencial e de serviços · Porto Alegre',
        'lat': -30.0500,
        'lng': -51.2250,
    },
    'bom_fim': {
        'id': 'bom_fim',
        'nome': 'Bom Fim',
        'descricao_territorial': 'Área cultural, residencial e de serviços · Porto Alegre',
        'lat': -30.0335,
        'lng': -51.2105,
    },
    'moinhos': {
        'id': 'moinhos',
        'nome': 'Moinhos de Vento',
        'descricao_territorial': 'Área comercial e residencial · Porto Alegre',
        'lat': -30.0258,
        'lng': -51.2045,
    },
    'praia_de_belas': {
        'id': 'praia_de_belas',
        'nome': 'Praia de Belas',
        'descricao_territorial': 'Área institucional, parques e serviços · Porto Alegre',
        'lat': -30.0495,
        'lng': -51.2315,
    },
}


class Relato(models.Model):
    """
    Modelo de Relato de Percepção Urbana no AURA.

    Observações metodológicas e de privacidade:
    - O autor é sempre vinculado ao usuário autenticado na requisição (nunca enviado livremente pelo cliente).
    - Não armazena geolocalização GPS exata da usuária, apenas o bairro/região e a rua ou trecho aproximado.
    - O campo 'periodo_ocorrencia' representa uma estimativa informada pela usuária,
      enquanto 'data_registro' armazena automaticamente quando o relato foi salvo no sistema.
    """

    class RegiaoChoices(models.TextChoices):
        CENTRO = 'centro', 'Centro Histórico'
        CIDADE_BAIXA = 'cidade', 'Cidade Baixa'
        MENINO_DEUS = 'menino', 'Menino Deus'
        BOM_FIM = 'bom_fim', 'Bom Fim'
        MOINHOS = 'moinhos', 'Moinhos de Vento'
        PRAIA_DE_BELAS = 'praia_de_belas', 'Praia de Belas'

    class CategoriaChoices(models.TextChoices):
        ILUMINACAO = 'iluminacao', 'Iluminação insuficiente'
        ISOLAMENTO = 'isolamento', 'Trecho isolado ou com pouca circulação'
        ASSEDIO = 'assedio', 'Assédio ou importunação'
        TRANSPORTE = 'transporte', 'Problema em ponto de transporte'
        INFRAESTRUTURA = 'infraestrutura', 'Outro fator relacionado ao espaço urbano'

    class TurnoChoices(models.TextChoices):
        MANHA = 'manha', 'Manhã'
        TARDE = 'tarde', 'Tarde'
        NOITE = 'noite', 'Noite'
        MADRUGADA = 'madrugada', 'Madrugada'

    class PeriodoChoices(models.TextChoices):
        HOJE = 'hoje', 'Hoje'
        DE_1_A_7_DIAS = 'de_1_a_7_dias', 'De 1 a 7 dias atrás'
        DE_8_A_30_DIAS = 'de_8_a_30_dias', 'De 8 a 30 dias atrás'
        DE_31_A_60_DIAS = 'de_31_a_60_dias', 'De 31 a 60 dias atrás'
        DE_61_A_90_DIAS = 'de_61_a_90_dias', 'De 61 a 90 dias atrás'
        MAIS_DE_90_DIAS = 'mais_de_90_dias', 'Há mais de 90 dias'
        NAO_SEI = 'nao_sei', 'Não sei informar'

    # Faixas mutuamente exclusivas dentro da janela de referência de 90 dias
    PERIODOS_ELEGIVEIS_JANELA = (
        PeriodoChoices.HOJE,
        PeriodoChoices.DE_1_A_7_DIAS,
        PeriodoChoices.DE_8_A_30_DIAS,
        PeriodoChoices.DE_31_A_60_DIAS,
        PeriodoChoices.DE_61_A_90_DIAS,
    )

    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='relatos',
        verbose_name='Autora (Identificador AURA)',
    )
    regiao = models.CharField(
        max_length=40,
        choices=RegiaoChoices.choices,
        verbose_name='Bairro / Região',
    )
    trecho = models.CharField(
        max_length=100,
        default='',
        verbose_name='Rua ou trecho de referência',
    )
    categoria = models.CharField(
        max_length=40,
        choices=CategoriaChoices.choices,
        verbose_name='Categoria de percepção',
    )
    turno_ocorrencia = models.CharField(
        max_length=20,
        choices=TurnoChoices.choices,
        verbose_name='Turno da ocorrência',
    )
    periodo_ocorrencia = models.CharField(
        max_length=30,
        choices=PeriodoChoices.choices,
        verbose_name='Período aproximado da ocorrência',
    )
    descricao_objetiva = models.TextField(
        blank=True,
        default='',
        max_length=500,
        verbose_name='Descrição objetiva (opcional)',
    )
    data_registro = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data e hora do registro',
    )

    class Meta:
        ordering = ['-data_registro']
        verbose_name = 'Relato de Percepção'
        verbose_name_plural = 'Relatos de Percepção'

    def __str__(self):
        return f"{self.get_regiao_display()} - {self.get_categoria_display()} ({self.get_turno_ocorrencia_display()})"
