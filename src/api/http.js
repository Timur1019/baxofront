import axios from 'axios'
import { getAuth, clearAuth } from '../utils/auth'

const API = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL: `${API}/api`,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const { token } = getAuth()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      const requestUrl = error.config?.url || ''
      // 401/403 на защищённых эндпоинтах — токен недействителен, очищаем и редиректим на логин
      const isProtectedEndpoint = requestUrl.includes('/evaluation-requests/my') ||
        requestUrl.includes('/evaluation-requests/') ||
        requestUrl.includes('/users') ||
        requestUrl.includes('/contact-requests')
      if ((status === 401 || status === 403) && isProtectedEndpoint) {
        clearAuth()
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
        return Promise.reject(new Error('Сессия истекла. Войдите снова.'))
      }
      if (status === 401) {
        error.message = 'Не авторизован. Войдите в систему.'
      } else if (status === 403) {
        error.message = 'Доступ запрещён. Недостаточно прав.'
      } else if (status >= 500) {
        error.message = error.message || 'Ошибка сервера. Попробуйте позже.'
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Сервер не отвечает. Проверьте, что бэкенд запущен (порт 8080).'
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Нет связи с сервером. Запустите бэкенд и обновите страницу.'
    }
    return Promise.reject(error)
  }
)

export { apiClient, API }

