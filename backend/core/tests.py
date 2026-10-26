from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Relato

User = get_user_model()


class AuraFullStackTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_cadastro_e_login_identificador_aura(self):
        """Testa cadastro e login usando apenas identificador_aura e senha (com hash seguro)."""
        resp_cadastro = self.client.post(
            '/api/auth/cadastro/',
            {'identificador_aura': 'usuaria_poa_01', 'senha': 'SenhaSegura123'},
            format='json',
        )
        self.assertEqual(resp_cadastro.status_code, 201)
        self.assertIn('token', resp_cadastro.data)
        self.assertEqual(resp_cadastro.data['usuario']['identificador_aura'], 'usuaria_poa_01')

        # Verifica que a senha foi armazenada com hash e não em texto puro
        user = User.objects.get(username='usuaria_poa_01')
        self.assertNotEqual(user.password, 'SenhaSegura123')
        self.assertTrue(user.check_password('SenhaSegura123'))

        # Testa login com as mesmas credenciais
        resp_login = self.client.post(
            '/api/auth/login/',
            {'identificador_aura': 'usuaria_poa_01', 'senha': 'SenhaSegura123'},
            format='json',
        )
        self.assertEqual(resp_login.status_code, 200)
        self.assertEqual(resp_login.data['token'], resp_cadastro.data['token'])

    def test_relato_exige_autenticacao_e_ignora_autor_externo(self):
        """Garante que apenas usuárias autenticadas registrem relatos e que o autor venha do token."""
        payload = {
            'regiao': 'centro',
            'trecho': 'Rua dos Andradas, próximo à Esquina Democrática',
            'categoria': 'iluminacao',
            'turno_ocorrencia': 'noite',
            'periodo_ocorrencia': 'de_1_a_7_dias',
            'descricao_objetiva': 'Poste apagado próximo à parada.',
        }
        # Sem token deve retornar 401
        resp_anon = self.client.post('/api/relatos/', payload, format='json')
        self.assertEqual(resp_anon.status_code, 401)

        # Com token deve registrar e atribuir autor=user autenticado
        user1 = User.objects.create_user(username='autora_real', password='SenhaSegura123')
        user2 = User.objects.create_user(username='outra_pessoa', password='SenhaSegura123')
        self.client.force_authenticate(user=user1)

        payload_com_autor_falso = {**payload, 'autor': user2.id}
        resp_auth = self.client.post('/api/relatos/', payload_com_autor_falso, format='json')
        self.assertEqual(resp_auth.status_code, 201)

        relato_salvo = Relato.objects.first()
        self.assertEqual(relato_salvo.autor, user1)
        self.assertEqual(relato_salvo.trecho, 'Rua dos Andradas, próximo à Esquina Democrática')

    def test_motor_indicadores_sem_dados_e_limites_contagem(self):
        """
        Verifica as faixas operacionais:
        0 -> Dados insuficientes (gray)
        1 a 2 -> Atenção (yellow)
        3 a 5 -> Atenção elevada (orange)
        6+ -> Atenção crítica (red)
        """
        user = User.objects.create_user(username='avaliadora', password='SenhaSegura123')

        # 0 relatos -> Dados insuficientes
        resp0 = self.client.get('/api/indicadores/')
        self.assertEqual(resp0.status_code, 200)
        centro = resp0.data['regioes']['centro']
        self.assertEqual(centro['quantidade_relatos'], 0)
        self.assertEqual(centro['estado_semantico'], 'Dados insuficientes')
        self.assertEqual(centro['cor_classe'], 'gray')
        self.assertEqual(centro['trechos_registrados'], [])

        # 1 relato elegível -> Atenção (yellow)
        Relato.objects.create(
            autor=user,
            regiao='centro',
            trecho='Rua dos Andradas',
            categoria='iluminacao',
            turno_ocorrencia='noite',
            periodo_ocorrencia='hoje',
        )
        resp1 = self.client.get('/api/indicadores/')
        self.assertEqual(resp1.data['regioes']['centro']['estado_semantico'], 'Atenção')
        self.assertEqual(resp1.data['regioes']['centro']['cor_classe'], 'yellow')

        # 3 relatos elegíveis (incluindo faixas de 31 a 60 e 61 a 90 dias) -> Atenção elevada (orange)
        Relato.objects.create(
            autor=user,
            regiao='centro',
            trecho='Rua dos Andradas',
            categoria='isolamento',
            turno_ocorrencia='madrugada',
            periodo_ocorrencia='de_31_a_60_dias',
        )
        Relato.objects.create(
            autor=user,
            regiao='centro',
            trecho='Rua dos Andradas',
            categoria='isolamento',
            turno_ocorrencia='madrugada',
            periodo_ocorrencia='de_61_a_90_dias',
        )
        resp3 = self.client.get('/api/indicadores/')
        self.assertEqual(resp3.data['regioes']['centro']['quantidade_relatos'], 3)
        self.assertEqual(resp3.data['regioes']['centro']['estado_semantico'], 'Atenção elevada')
        self.assertEqual(resp3.data['regioes']['centro']['cor_classe'], 'orange')

        # 6 relatos elegíveis -> Atenção crítica (red)
        for _ in range(3):
            Relato.objects.create(
                autor=user,
                regiao='centro',
                trecho='Largo Glênio Peres',
                categoria='assedio',
                turno_ocorrencia='noite',
                periodo_ocorrencia='de_8_a_30_dias',
            )
        resp6 = self.client.get('/api/indicadores/')
        self.assertEqual(resp6.data['regioes']['centro']['quantidade_relatos'], 6)
        self.assertEqual(resp6.data['regioes']['centro']['estado_semantico'], 'Atenção crítica')
        self.assertEqual(resp6.data['regioes']['centro']['cor_classe'], 'red')

    def test_filtro_temporal_separa_historicos_e_indeterminados(self):
        """
        Garante que relatos 'mais_de_90_dias', 'nao_sei' ou com data_registro > 90 dias
        não inflem o indicador principal e sejam contabilizados separadamente.
        """
        user = User.objects.create_user(username='temporal_tester', password='SenhaSegura123')

        # Relato com 'mais_de_90_dias'
        Relato.objects.create(
            autor=user,
            regiao='cidade',
            trecho='Rua da República',
            categoria='iluminacao',
            turno_ocorrencia='noite',
            periodo_ocorrencia='mais_de_90_dias',
        )
        # Relato com 'nao_sei'
        Relato.objects.create(
            autor=user,
            regiao='cidade',
            trecho='Rua da República',
            categoria='transporte',
            turno_ocorrencia='tarde',
            periodo_ocorrencia='nao_sei',
        )
        # Relato com data_registro há 100 dias (fora da janela de 90 dias)
        relato_antigo = Relato.objects.create(
            autor=user,
            regiao='cidade',
            trecho='Rua da República',
            categoria='isolamento',
            turno_ocorrencia='noite',
            periodo_ocorrencia='hoje',
        )
        Relato.objects.filter(id=relato_antigo.id).update(
            data_registro=timezone.now() - timedelta(days=100)
        )

        resp = self.client.get('/api/indicadores/')
        cidade = resp.data['regioes']['cidade']
        self.assertEqual(cidade['quantidade_relatos'], 0)
        self.assertEqual(cidade['quantidade_anteriores_90_dias'], 2)
        self.assertEqual(cidade['quantidade_periodo_desconhecido'], 1)
        self.assertEqual(cidade['quantidade_historicos_indeterminados'], 3)
        self.assertEqual(cidade['categorias_registradas'], [])
        self.assertEqual(cidade['trechos_registrados'], [])
        self.assertEqual(cidade['estado_semantico'], 'Dados insuficientes')
        self.assertEqual(cidade['cor_classe'], 'gray')

    def test_coerencia_categorias_e_validacoes_formulario(self):
        """
        Verifica que apenas relatos elegíveis compõem as categorias registradas
        e testa as mensagens de validação de cadastro e relato (incluindo trecho).
        """
        # Teste de validação de identificador fora do padrão (menos de 3 caracteres)
        resp_invalido = self.client.post(
            '/api/auth/cadastro/',
            {'identificador_aura': 'ab', 'senha': 'SenhaSegura123'},
            format='json',
        )
        self.assertEqual(resp_invalido.status_code, 400)

        user = User.objects.create_user(username='usuaria_teste', password='SenhaSegura123')
        self.client.force_authenticate(user=user)

        # Validação do trecho obrigatório e tamanho mínimo
        resp_sem_trecho = self.client.post(
            '/api/relatos/',
            {
                'regiao': 'bom_fim',
                'trecho': '',
                'categoria': 'transporte',
                'turno_ocorrencia': 'noite',
                'periodo_ocorrencia': 'de_1_a_7_dias',
            },
            format='json',
        )
        self.assertEqual(resp_sem_trecho.status_code, 400)
        self.assertIn('trecho', resp_sem_trecho.data)

        resp_trecho_curto = self.client.post(
            '/api/relatos/',
            {
                'regiao': 'bom_fim',
                'trecho': 'ab',
                'categoria': 'transporte',
                'turno_ocorrencia': 'noite',
                'periodo_ocorrencia': 'de_1_a_7_dias',
            },
            format='json',
        )
        self.assertEqual(resp_trecho_curto.status_code, 400)
        self.assertIn('trecho', resp_trecho_curto.data)

        # Relato elegível (de_1_a_7_dias)
        self.client.post(
            '/api/relatos/',
            {
                'regiao': 'bom_fim',
                'trecho': 'Av. Osvaldo Aranha, próximo ao Parque Farroupilha',
                'categoria': 'transporte',
                'turno_ocorrencia': 'noite',
                'periodo_ocorrencia': 'de_1_a_7_dias',
            },
            format='json',
        )
        # Relato fora da janela (mais_de_90_dias) não deve entrar nas categorias do período
        self.client.post(
            '/api/relatos/',
            {
                'regiao': 'bom_fim',
                'trecho': 'Av. Osvaldo Aranha, próximo ao Parque Farroupilha',
                'categoria': 'assedio',
                'turno_ocorrencia': 'tarde',
                'periodo_ocorrencia': 'mais_de_90_dias',
            },
            format='json',
        )

        resp = self.client.get('/api/indicadores/')
        bom_fim = resp.data['regioes']['bom_fim']
        self.assertEqual(bom_fim['quantidade_relatos'], 1)
        self.assertEqual(bom_fim['quantidade_anteriores_90_dias'], 1)
        self.assertEqual(len(bom_fim['categorias_registradas']), 1)
        self.assertEqual(bom_fim['categorias_registradas'][0]['id'], 'transporte')
        self.assertEqual(
            bom_fim['categorias_registradas'][0]['rotulo'],
            'Problema em ponto de transporte',
        )
        self.assertEqual(bom_fim['categorias_registradas'][0]['quantidade'], 1)

    def test_agregacao_e_ordenacao_trechos_com_pelo_menos_3_relatos(self):
        """
        Verifica que:
        - Trechos com menos de 3 relatos elegíveis não são listados.
        - Variações simples de caixa, acentuação e pontuação são agrupadas no mesmo trecho.
        - A ordem considera prioridade preventiva (assedio > isolamento > transporte > iluminacao > infraestrutura),
          volume na categoria prioritária e total de relatos.
        """
        user = User.objects.create_user(username='trechos_tester', password='SenhaSegura123')

        # Trecho A: 2 relatos elegíveis -> NÃO deve aparecer
        for _ in range(2):
            Relato.objects.create(
                autor=user,
                regiao='moinhos',
                trecho='Rua Padre Chagas',
                categoria='assedio',
                turno_ocorrencia='noite',
                periodo_ocorrencia='hoje',
            )

        # Trecho B: 4 relatos de iluminação (com variação de escrita)
        variacoes_b = [
            'Rua 24 de Outubro, próximo à Praça',
            'rua 24 de outubro proximo a praca',
            'Rua 24 de Outubro, próximo à praça.',
            'Rua 24 de Outubro,  próximo à Praça',
        ]
        for texto in variacoes_b:
            Relato.objects.create(
                autor=user,
                regiao='moinhos',
                trecho=texto,
                categoria='iluminacao',
                turno_ocorrencia='noite',
                periodo_ocorrencia='de_1_a_7_dias',
            )

        # Trecho C: 3 relatos de assédio (prioridade preventiva 1 > iluminação prioridade 4)
        for _ in range(3):
            Relato.objects.create(
                autor=user,
                regiao='moinhos',
                trecho='Parcão, lateral da Av. Goethe',
                categoria='assedio',
                turno_ocorrencia='noite',
                periodo_ocorrencia='de_8_a_30_dias',
            )

        resp = self.client.get('/api/indicadores/')
        moinhos = resp.data['regioes']['moinhos']
        trechos = moinhos['trechos_registrados']

        self.assertEqual(len(trechos), 2)
        # Primeiro deve vir o trecho com categoria prioritária 'assedio'
        self.assertEqual(trechos[0]['nome'], 'Parcão, lateral da Av. Goethe')
        self.assertEqual(trechos[0]['quantidade'], 3)
        self.assertEqual(trechos[0]['categoria_destaque']['id'], 'assedio')
        self.assertEqual(trechos[0]['categoria_destaque']['quantidade'], 3)

        # Segundo deve vir o trecho de 'iluminacao' com 4 relatos agrupados
        self.assertEqual(trechos[1]['nome'], 'Rua 24 de Outubro, próximo à Praça')
        self.assertEqual(trechos[1]['quantidade'], 4)
        self.assertEqual(trechos[1]['categoria_destaque']['id'], 'iluminacao')
        self.assertEqual(trechos[1]['categoria_destaque']['quantidade'], 4)
