# AURA — Mapa de Segurança Urbana para Mulheres

Plataforma web em desenvolvimento para apoiar a consulta de informações territoriais relacionadas à segurança urbana de mulheres, com foco inicial em Porto Alegre (RS).

> **Status:** MVP em desenvolvimento.

## Sobre o projeto

O AURA busca reunir informações territoriais que possam auxiliar mulheres a compreender melhor o contexto urbano durante seus deslocamentos. A proposta considera a visualização de informações por região.

O projeto dialoga com os Objetivos de Desenvolvimento Sustentável (ODS) 5 — Igualdade de Gênero — e 11 — Cidades e Comunidades Sustentáveis.

**Importante:** o AURA é uma ferramenta em desenvolvimento. As informações exibidas não garantem a segurança de um local nem substituem serviços de emergência, orientações oficiais ou avaliação das condições no momento do deslocamento.

## O que já foi desenvolvido

- Organização inicial das pastas do projeto.
- Inicialização do repositório Git e configuração do `.gitignore`.
- Configuração inicial do backend com Django e Django REST Framework.
- Aplicação das migrações iniciais do SQLite.
- Criação da aplicação frontend com React e Vite.
- Instalação do Leaflet e do React-Leaflet.
- Implementação do mapa interativo e de um painel de detalhes por região no frontend.

## Tecnologias

| Camada         | Tecnologia                  | Finalidade                                |
| -------------- | --------------------------- | ----------------------------------------- |
| Frontend       | React + Vite                | Interface web e componentes da aplicação  |
| Mapa           | Leaflet + React-Leaflet     | Mapa interativo e visualização por região |
| Backend        | Python + Django             | Estrutura e regras do servidor            |
| API            | Django REST Framework (DRF) | Desenvolvimento dos endpoints da API      |
| Banco de dados | SQLite                      | Persistência local dos dados              |
| Versionamento  | Git                         | Histórico e controle das alterações       |

## Estrutura do projeto

```text
aura/
├── frontend/          # Aplicação React + Vite
├── backend/           # Projeto Django e API
│   ├── config/        # Configurações do Django
│   ├── core/          # Aplicação inicial do backend
│   ├── manage.py
│   └── requirements.txt
├── docs/              # Documentação e materiais do projeto
├── .gitignore
└── README.md
```

## Como executar localmente

### Pré-requisitos

- Python instalado.
- Node.js e npm instalados.
- Git instalado.

Os comandos abaixo consideram o Windows com PowerShell e que os diretórios `backend` e `frontend` estão na raiz do projeto.

### 1. Iniciar o backend

Em um terminal, a partir da pasta raiz do projeto:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Por padrão, o servidor de desenvolvimento do Django fica disponível em `http://127.0.0.1:8000/`.

Se o ambiente virtual já estiver criado e as dependências instaladas, basta ativá-lo e executar `python manage.py runserver`.

### 2. Iniciar o frontend

Abra um **segundo terminal**, a partir da raiz do projeto:

```powershell
cd frontend
npm install
npm run dev
```

O Vite normalmente disponibiliza a aplicação em `http://localhost:5173/`. Use o endereço indicado no terminal caso a porta seja diferente.

### Observações de desenvolvimento

- O arquivo `backend/requirements.txt` registra as dependências Python do projeto.
- O banco SQLite é criado localmente conforme as configurações do Django e as migrações aplicadas.
- A exibição do mapa pode depender do acesso à internet para carregar os mapas-base.

## Próximas etapas

Conforme o escopo e o cronograma do projeto, estão previstas as seguintes etapas:

- Conclusão das telas principais e do cadastro.
- Desenvolvimento dos modelos de dados, dos endpoints da API e do registro de relatos.
- Implementação do cálculo do indicador de atenção no backend.
- Desenvolvimento do Fórum e Apoio Mútuo e da área “Preciso de Ajuda”.
- Inclusão de orientações sobre segurança digital e informações sobre canais oficiais de apoio.
- Testes e validação do sistema.

## Desenvolvimento e colaboração

O histórico de alterações é mantido com Git.

---

**AURA — Mapa de Segurança Urbana para Mulheres**  
Projeto acadêmico em desenvolvimento.
