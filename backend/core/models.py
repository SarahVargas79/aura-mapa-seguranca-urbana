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
    - Não armazena geolocalização GPS exata da usuária, apenas o bairro/região aproximada.
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
        TRANSPORTE = 'transporte', 'Condição de ponto de transporte'
        INFRAESTRUTURA = 'infraestrutura', 'Outro fator urbano'

    class TurnoChoices(models.TextChoices):
        MANHA = 'manha', 'Manhã'
        TARDE = 'tarde', 'Tarde'
        NOITE = 'noite', 'Noite'
        MADRUGADA = 'madrugada', 'Madrugada'

    class PeriodoChoices(models.TextChoices):
        HOJE = 'hoje', 'Hoje'
        ULTIMOS_7_DIAS = 'ultimos_7_dias', 'Nos últimos 7 dias'
        ULTIMOS_30_DIAS = 'ultimos_30_dias', 'Nos últimos 30 dias'
        MAIS_DE_30_DIAS = 'mais_de_30_dias', 'Há mais de 30 dias'
        NAO_SEI = 'nao_sei', 'Não sei informar'

    # Faixas que permitem confirmar com segurança que a situação ocorreu dentro da janela de 90 dias
    PERIODOS_ELEGIVEIS_JANELA = (
        PeriodoChoices.HOJE,
        PeriodoChoices.ULTIMOS_7_DIAS,
        PeriodoChoices.ULTIMOS_30_DIAS,
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
