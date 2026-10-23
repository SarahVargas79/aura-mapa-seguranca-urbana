/**
 * SERVIÇO CENTRALIZADO DE COMUNICAÇÃO COM A API DJANGO (api.js)
 * -------------------------------------------------------------
 * Centraliza todas as chamadas HTTP ao backend Django REST Framework,
 * o gerenciamento do Token de autenticação e a formatação de mensagens de erro.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const TOKEN_STORAGE_KEY = 'aura_auth_token';
const USER_STORAGE_KEY = 'aura_auth_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(token, usuario) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Extrai uma mensagem legível a partir da resposta de erro do Django REST Framework.
 */
export function extractErrorMessage(errorData, fallback = 'Não foi possível concluir a solicitação.') {
  if (!errorData) return fallback;
  if (typeof errorData === 'string') return errorData;
  if (errorData.detail) return String(errorData.detail);
  if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
    return String(errorData.non_field_errors[0]);
  }
  const firstKey = Object.keys(errorData)[0];
  if (firstKey) {
    const val = errorData[firstKey];
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (typeof val === 'string') return val;
  }
  return fallback;
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const err = new Error(extractErrorMessage(data, `Erro HTTP ${response.status}`));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  /**
   * Consulta os indicadores calculados diretamente a partir do SQLite no Django.
   * GET /api/indicadores/
   */
  getIndicadores() {
    return request('/indicadores/', { method: 'GET' });
  },

  /**
   * Cadastra um novo identificador_aura e senha.
   * POST /api/auth/cadastro/
   */
  cadastrar({ identificador_aura, senha }) {
    return request('/auth/cadastro/', {
      method: 'POST',
      body: JSON.stringify({ identificador_aura, senha }),
    });
  },

  /**
   * Autentica com identificador_aura e senha.
   * POST /api/auth/login/
   */
  login({ identificador_aura, senha }) {
    return request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ identificador_aura, senha }),
    });
  },

  /**
   * Encerra a sessão invalidando o token no backend.
   * POST /api/auth/logout/
   */
  logout() {
    return request('/auth/logout/', { method: 'POST' });
  },

  /**
   * Verifica se o token salvo ainda é válido no servidor.
   * GET /api/auth/me/
   */
  verificarSessao() {
    return request('/auth/me/', { method: 'GET' });
  },

  /**
   * Registra um novo relato de percepção urbana (exige usuário autenticado).
   * POST /api/relatos/
   */
  criarRelato(payload) {
    return request('/relatos/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
