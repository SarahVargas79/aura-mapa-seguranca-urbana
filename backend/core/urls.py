from django.urls import path
from .views import (
    CadastroAuraView,
    IndicadoresView,
    LoginAuraView,
    LogoutAuraView,
    RelatoCreateView,
    SessaoAuraView,
)

urlpatterns = [
    path('auth/cadastro/', CadastroAuraView.as_view(), name='auth-cadastro'),
    path('auth/login/', LoginAuraView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutAuraView.as_view(), name='auth-logout'),
    path('auth/me/', SessaoAuraView.as_view(), name='auth-me'),
    path('relatos/', RelatoCreateView.as_view(), name='relatos-create'),
    path('indicadores/', IndicadoresView.as_view(), name='indicadores-list'),
]
