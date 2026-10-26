from datetime import timedelta
from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import REGIOES_POA_METADATA, Relato
from .serializers import CadastroAuraSerializer, LoginAuraSerializer, RelatoSerializer


def classificar_volume_relatos(quantidade_elegivel: int) -> dict:
    """
    Aplica as regras operacionais do AURA para classificar o volume
    de relatos elegíveis na janela temporal de referência (90 dias).

    Observações:
    - 0 relatos elegíveis resulta em 'Dados insuficientes' (cinza), nunca em 'Baixa atenção'
      ou garantia de local seguro.
    - 1 a 2 relatos: 'Atenção' (amarelo)
    - 3 a 5 relatos: 'Atenção elevada' (laranja)
    - 6 ou mais relatos: 'Atenção crítica' (vermelho)
    """
    if quantidade_elegivel <= 0:
        return {
            'estado_semantico': 'Dados insuficientes',
            'cor_classe': 'gray',
            'cor_hex': '#64748b',
            'subtitulo_estado': 'Sem relatos elegíveis suficientes no período de referência.',
        }
    if quantidade_elegivel <= 2:
        return {
            'estado_semantico': 'Atenção',
            'cor_classe': 'yellow',
            'cor_hex': '#eab308',
            'subtitulo_estado': f'{quantidade_elegivel} relato(s) elegível(is) considerado(s) no período de referência.',
        }
    if quantidade_elegivel <= 5:
        return {
            'estado_semantico': 'Atenção elevada',
            'cor_classe': 'orange',
            'cor_hex': '#ea6418',
            'subtitulo_estado': f'{quantidade_elegivel} relatos elegíveis considerados no período de referência.',
        }
    return {
        'estado_semantico': 'Atenção crítica',
        'cor_classe': 'red',
        'cor_hex': '#cc4759',
        'subtitulo_estado': f'{quantidade_elegivel} relatos elegíveis considerados no período de referência.',
    }


class CadastroAuraView(APIView):
    """
    POST /api/auth/cadastro/
    Registra um novo usuário utilizando apenas identificador_aura e senha.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CadastroAuraSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    'mensagem': f'Identificador AURA criado com sucesso: {user.username}.',
                    'token': token.key,
                    'usuario': {
                        'id': user.id,
                        'identificador_aura': user.username,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAuraView(APIView):
    """
    POST /api/auth/login/
    Autentica um usuário existente com identificador_aura e senha e retorna seu Token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginAuraSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    'mensagem': f'Acesso iniciado com sucesso, {user.username}.',
                    'token': token.key,
                    'usuario': {
                        'id': user.id,
                        'identificador_aura': user.username,
                    },
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutAuraView(APIView):
    """
    POST /api/auth/logout/
    Invalida o token de autenticação atual do usuário no banco de dados.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.auth:
            request.auth.delete()
        return Response(
            {'mensagem': 'Você saiu da sua conta.'},
            status=status.HTTP_200_OK,
        )


class SessaoAuraView(APIView):
    """
    GET /api/auth/me/
    Retorna os dados básicos do identificador autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                'usuario': {
                    'id': request.user.id,
                    'identificador_aura': request.user.username,
                }
            },
            status=status.HTTP_200_OK,
        )


class RelatoCreateView(APIView):
    """
    POST /api/relatos/
    Registra um novo relato de percepção urbana.
    Exige usuário autenticado e obtém o autor exclusivamente de request.user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RelatoSerializer(data=request.data)
        if serializer.is_valid():
            relato = serializer.save(autor=request.user)
            return Response(
                {
                    'mensagem': 'Relato registrado com sucesso. Os indicadores da região foram atualizados.',
                    'relato': RelatoSerializer(relato).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IndicadoresView(APIView):
    """
    GET /api/indicadores/
    Motor de cálculo dos indicadores por região diretamente a partir do SQLite.

    Regra de inclusão na janela temporal de 90 dias:
    - Considera elegíveis para o indicador principal apenas os relatos enviados nos últimos 90 dias
      (data_registro >= agora - 90 dias) E cujo período aproximado informado pela usuária esteja
      entre 'hoje' e 'de_61_a_90_dias'.
    - Relatos marcados como 'mais_de_90_dias' (ou com data_registro anterior a 90 dias) e relatos
      marcados como 'nao_sei' são contabilizados separadamente e não entram na classificação
      nem nos percentuais por categoria.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        agora = timezone.now()
        limite_90_dias = agora - timedelta(days=90)
        periodo_referencia_texto = (
            'Últimos 90 dias — período aproximado da ocorrência informado pela pessoa'
        )

        # 1. Relatos elegíveis para o cálculo do indicador principal (janela de 90 dias)
        qs_elegiveis = Relato.objects.filter(
            data_registro__gte=limite_90_dias,
            periodo_ocorrencia__in=Relato.PERIODOS_ELEGIVEIS_JANELA,
        )

        # 2. Relatos sem período informado
        qs_periodo_desconhecido = Relato.objects.filter(
            periodo_ocorrencia=Relato.PeriodoChoices.NAO_SEI,
        )

        # 3. Relatos sobre ocorrências há mais de 90 dias (pelo período informado ou pela data do registro)
        qs_anteriores_90_dias = Relato.objects.exclude(
            id__in=qs_elegiveis.values_list('id', flat=True)
        ).exclude(
            id__in=qs_periodo_desconhecido.values_list('id', flat=True)
        )

        # Contagem agregada no banco por região (evita N+1 queries e contagens duplicadas)
        contagem_elegiveis_por_regiao = dict(
            qs_elegiveis.values_list('regiao').annotate(total=Count('id'))
        )
        contagem_anteriores_por_regiao = dict(
            qs_anteriores_90_dias.values_list('regiao').annotate(total=Count('id'))
        )
        contagem_desconhecidos_por_regiao = dict(
            qs_periodo_desconhecido.values_list('regiao').annotate(total=Count('id'))
        )

        # Contagem de categorias e turnos dentro dos relatos elegíveis por região
        categorias_rows = (
            qs_elegiveis.values('regiao', 'categoria')
            .annotate(total=Count('id'))
            .order_by('-total', 'categoria')
        )
        turnos_rows = (
            qs_elegiveis.values('regiao', 'turno_ocorrencia')
            .annotate(total=Count('id'))
            .order_by('-total', 'turno_ocorrencia')
        )

        rotulos_categorias = dict(Relato.CategoriaChoices.choices)
        rotulos_turnos = dict(Relato.TurnoChoices.choices)

        categorias_por_regiao = {}
        for row in categorias_rows:
            reg_id = row['regiao']
            categorias_por_regiao.setdefault(reg_id, []).append({
                'id': row['categoria'],
                'rotulo': rotulos_categorias.get(row['categoria'], row['categoria']),
                'quantidade': row['total'],
            })

        turnos_por_regiao = {}
        for row in turnos_rows:
            reg_id = row['regiao']
            turnos_por_regiao.setdefault(reg_id, []).append({
                'id': row['turno_ocorrencia'],
                'rotulo': rotulos_turnos.get(row['turno_ocorrencia'], row['turno_ocorrencia']),
                'quantidade': row['total'],
            })

        regioes_resposta = {}

        for reg_id, meta in REGIOES_POA_METADATA.items():
            qtd_elegivel = contagem_elegiveis_por_regiao.get(reg_id, 0)
            qtd_anterior_90_dias = contagem_anteriores_por_regiao.get(reg_id, 0)
            qtd_periodo_desconhecido = contagem_desconhecidos_por_regiao.get(reg_id, 0)
            qtd_indeterminada = qtd_anterior_90_dias + qtd_periodo_desconhecido
            classificacao = classificar_volume_relatos(qtd_elegivel)
            lista_categorias = categorias_por_regiao.get(reg_id, [])
            lista_turnos = turnos_por_regiao.get(reg_id, [])

            avisos = []
            if 0 < qtd_elegivel <= 2:
                avisos.append('Há poucos relatos elegíveis; interprete o resultado com cautela.')
            avisos.append(
                'Os indicadores refletem o volume de relatos elegíveis registrados. '
                'Eles não representam necessariamente ocorrências únicas nem estatísticas criminais oficiais. '
                'A ausência de relatos não garante segurança.'
            )
            aviso_limitacao = ' '.join(avisos)

            regioes_resposta[reg_id] = {
                'id': reg_id,
                'nome': meta['nome'],
                'descricao_territorial': meta['descricao_territorial'],
                'lat': meta['lat'],
                'lng': meta['lng'],
                'quantidade_relatos': qtd_elegivel,
                'quantidade_anteriores_90_dias': qtd_anterior_90_dias,
                'quantidade_periodo_desconhecido': qtd_periodo_desconhecido,
                'quantidade_historicos_indeterminados': qtd_indeterminada,
                'estado_semantico': classificacao['estado_semantico'],
                'cor_classe': classificacao['cor_classe'],
                'cor_hex': classificacao['cor_hex'],
                'subtitulo_estado': classificacao['subtitulo_estado'],
                'periodo_referencia': periodo_referencia_texto,
                'categorias_registradas': lista_categorias,
                'turnos_registrados': lista_turnos,
                'aviso_limitacao': aviso_limitacao,
            }

        return Response(
            {
                'periodo_referencia_padrao': periodo_referencia_texto,
                'nota_metodologica': (
                    'As faixas de classificação (0 = Dados insuficientes; 1–2 = Atenção; 3–5 = Atenção elevada; '
                    '6+ = Atenção crítica) baseiam-se no volume de relatos elegíveis nos últimos 90 dias.'
                ),
                'regioes': regioes_resposta,
            },
            status=status.HTTP_200_OK,
        )
