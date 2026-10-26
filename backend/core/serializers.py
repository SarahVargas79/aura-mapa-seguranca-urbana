import re
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from .models import Relato

User = get_user_model()


class CadastroAuraSerializer(serializers.Serializer):
    """
    Serializer para criação de conta exigindo apenas:
    - identificador_aura: identificador único escolhido pela usuária (sem exigir nome civil, CPF ou e-mail).
    - senha: armazenada com hash seguro PBKDF2-SHA256 pelo Django.
    """
    identificador_aura = serializers.CharField(
        min_length=3,
        max_length=30,
        trim_whitespace=True,
        error_messages={
            'required': 'Preencha seu identificador AURA e sua senha.',
            'blank': 'Preencha seu identificador AURA e sua senha.',
            'min_length': 'O identificador AURA deve ter entre 3 e 30 caracteres (letras, números, _, . ou -).',
            'max_length': 'O identificador AURA deve ter entre 3 e 30 caracteres (letras, números, _, . ou -).',
        }
    )
    senha = serializers.CharField(
        write_only=True,
        min_length=6,
        max_length=128,
        error_messages={
            'required': 'Preencha seu identificador AURA e sua senha.',
            'blank': 'Preencha seu identificador AURA e sua senha.',
            'min_length': 'A senha deve conter pelo menos 6 caracteres.',
        }
    )

    def validate_identificador_aura(self, value):
        identificador = value.strip()
        if not re.match(r'^[a-zA-Z0-9_.-]+$', identificador):
            raise serializers.ValidationError(
                'O identificador AURA deve ter entre 3 e 30 caracteres (letras, números, _, . ou -).'
            )
        if User.objects.filter(username__iexact=identificador).exists():
            raise serializers.ValidationError(
                'Este identificador AURA já está em uso. Escolha outro identificador.'
            )
        return identificador

    def create(self, validated_data):
        # create_user aplica automaticamente o hash seguro de senha do Django
        user = User.objects.create_user(
            username=validated_data['identificador_aura'],
            password=validated_data['senha'],
        )
        return user


class LoginAuraSerializer(serializers.Serializer):
    """
    Serializer para autenticação por identificador_aura e senha.
    """
    identificador_aura = serializers.CharField(
        trim_whitespace=True,
        error_messages={
            'required': 'Preencha seu identificador AURA e sua senha.',
            'blank': 'Preencha seu identificador AURA e sua senha.',
        }
    )
    senha = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Preencha seu identificador AURA e sua senha.',
            'blank': 'Preencha seu identificador AURA e sua senha.',
        }
    )

    def validate(self, attrs):
        identificador = attrs.get('identificador_aura', '').strip()
        senha = attrs.get('senha', '')

        # Busca case-insensitive pelo username correspondente ao identificador_aura
        user_obj = User.objects.filter(username__iexact=identificador).first()
        username_real = user_obj.username if user_obj else identificador

        user = authenticate(username=username_real, password=senha)
        if not user:
            raise serializers.ValidationError(
                'Identificador AURA ou senha incorretos.'
            )
        if not user.is_active:
            raise serializers.ValidationError(
                'Esta conta está desativada.'
            )

        attrs['user'] = user
        return attrs


class RelatoSerializer(serializers.ModelSerializer):
    """
    Serializer para validação e registro de relatos.
    O campo 'autor' nunca é recebido do frontend: é atribuído exclusivamente
    no backend a partir de request.user.
    """
    regiao_nome = serializers.CharField(source='get_regiao_display', read_only=True)
    categoria_nome = serializers.CharField(source='get_categoria_display', read_only=True)
    turno_nome = serializers.CharField(source='get_turno_ocorrencia_display', read_only=True)
    periodo_nome = serializers.CharField(source='get_periodo_ocorrencia_display', read_only=True)
    trecho = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=100,
        trim_whitespace=True,
        error_messages={
            'required': 'Informe a rua, o cruzamento ou o trecho aproximado da ocorrência.',
            'blank': 'Informe a rua, o cruzamento ou o trecho aproximado da ocorrência.',
            'max_length': 'O trecho de referência deve ter no máximo 100 caracteres.',
        },
    )

    class Meta:
        model = Relato
        fields = [
            'id',
            'regiao',
            'regiao_nome',
            'trecho',
            'categoria',
            'categoria_nome',
            'turno_ocorrencia',
            'turno_nome',
            'periodo_ocorrencia',
            'periodo_nome',
            'descricao_objetiva',
            'data_registro',
        ]
        read_only_fields = ['id', 'data_registro']
        extra_kwargs = {
            'regiao': {
                'error_messages': {
                    'required': 'Selecione o bairro ou a região.',
                    'invalid_choice': 'Selecione o bairro ou a região.',
                }
            },
            'categoria': {
                'error_messages': {
                    'required': 'Selecione uma categoria para o relato.',
                    'invalid_choice': 'Selecione uma categoria para o relato.',
                }
            },
            'turno_ocorrencia': {
                'error_messages': {
                    'required': 'Selecione o turno aproximado da ocorrência.',
                    'invalid_choice': 'Selecione o turno aproximado da ocorrência.',
                }
            },
            'periodo_ocorrencia': {
                'error_messages': {
                    'required': 'Informe o período aproximado da ocorrência.',
                    'invalid_choice': 'Informe o período aproximado da ocorrência.',
                }
            },
        }

    def validate_trecho(self, value):
        texto = re.sub(r'\s+', ' ', (value or '').strip())
        if not texto:
            raise serializers.ValidationError(
                'Informe a rua, o cruzamento ou o trecho aproximado da ocorrência.'
            )
        if len(texto) < 3:
            raise serializers.ValidationError(
                'Informe pelo menos 3 caracteres para identificar a rua ou o trecho.'
            )
        if len(texto) > 100:
            raise serializers.ValidationError(
                'O trecho de referência deve ter no máximo 100 caracteres.'
            )
        return texto

    def validate_descricao_objetiva(self, value):
        if not value:
            return ''
        texto = value.strip()
        if len(texto) > 500:
            raise serializers.ValidationError('A descrição objetiva deve ter no máximo 500 caracteres.')
        return texto
