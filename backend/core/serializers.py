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
        max_length=40,
        trim_whitespace=True,
        error_messages={
            'required': 'Informe um identificador AURA.',
            'blank': 'O identificador AURA não pode ficar em branco.',
            'min_length': 'O identificador AURA deve ter pelo menos 3 caracteres.',
            'max_length': 'O identificador AURA deve ter no máximo 40 caracteres.',
        }
    )
    senha = serializers.CharField(
        write_only=True,
        min_length=6,
        max_length=128,
        error_messages={
            'required': 'Informe uma senha.',
            'blank': 'A senha não pode ficar em branco.',
            'min_length': 'A senha deve ter pelo menos 6 caracteres.',
        }
    )

    def validate_identificador_aura(self, value):
        identificador = value.strip()
        if not re.match(r'^[a-zA-Z0-9_.-]+$', identificador):
            raise serializers.ValidationError(
                'Use apenas letras, números, ponto (.), hífen (-) ou sublinhado (_), sem espaços.'
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
            'required': 'Informe seu identificador AURA.',
            'blank': 'Informe seu identificador AURA.',
        }
    )
    senha = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'Informe sua senha.',
            'blank': 'Informe sua senha.',
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

    class Meta:
        model = Relato
        fields = [
            'id',
            'regiao',
            'regiao_nome',
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
                    'required': 'Selecione um bairro da lista.',
                    'invalid_choice': 'Selecione um bairro válido de Porto Alegre.',
                }
            },
            'categoria': {
                'error_messages': {
                    'required': 'Selecione uma categoria de percepção.',
                    'invalid_choice': 'Selecione uma categoria válida.',
                }
            },
            'turno_ocorrencia': {
                'error_messages': {
                    'required': 'Selecione o turno da ocorrência.',
                    'invalid_choice': 'Selecione um turno válido (Manhã, Tarde, Noite ou Madrugada).',
                }
            },
            'periodo_ocorrencia': {
                'error_messages': {
                    'required': 'Selecione o período aproximado da ocorrência.',
                    'invalid_choice': 'Selecione um período aproximado válido.',
                }
            },
        }

    def validate_descricao_objetiva(self, value):
        if not value:
            return ''
        texto = value.strip()
        if len(texto) > 500:
            raise serializers.ValidationError('A descrição objetiva deve ter no máximo 500 caracteres.')
        return texto
