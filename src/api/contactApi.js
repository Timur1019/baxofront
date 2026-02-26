import { apiClient } from './http'

/**
 * Отправить заявку с формы «Напишите нам» (публичный, без токена).
 */
export async function submitContact(data) {
  const payload = {
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone || null,
    subject: data.subject || null,
    message: data.message ?? '',
  }
  const { data: result } = await apiClient.post('/contact', payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return result
}

/** Извлечь массив и метаданные из ответа Page (Spring) */
function parsePageResponse(data) {
  if (!data) return { content: [], totalElements: 0, totalPages: 0 }
  if (Array.isArray(data)) return { content: data, totalElements: data.length, totalPages: 1 }
  return {
    content: Array.isArray(data.content) ? data.content : [],
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
  }
}

/**
 * Список заявок для админки (требуется авторизация).
 */
export async function getContactRequests(params = {}) {
  const { page = 0, size = 20 } = params
  const { data } = await apiClient.get('/admin/contact-requests', {
    params: { page, size },
  })
  return parsePageResponse(data)
}

export async function deleteContactRequest(id) {
  await apiClient.delete(`/admin/contact-requests/${id}`)
}

export async function deleteAllContactRequests() {
  await apiClient.delete('/admin/contact-requests')
}
