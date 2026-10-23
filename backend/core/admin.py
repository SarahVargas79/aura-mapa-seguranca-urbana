from django.contrib import admin
from .models import Relato


@admin.register(Relato)
class RelatoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'regiao',
        'categoria',
        'turno_ocorrencia',
        'periodo_ocorrencia',
        'autor',
        'data_registro',
    )
    list_filter = ('regiao', 'categoria', 'turno_ocorrencia', 'periodo_ocorrencia')
    search_fields = ('autor__username', 'descricao_objetiva')
    readonly_fields = ('data_registro',)
