import { apiClient } from './http'

/** Извлечь массив и метаданные из ответа Page (Spring) */
function parsePageResponse(data) {
  const empty = { content: [], totalElements: 0, totalPages: 1 }
  if (!data) return empty
  if (Array.isArray(data)) {
    return { content: [...data], totalElements: data.length, totalPages: 1 }
  }
  const raw = data.content !== undefined ? data : data.data || data.page || data
  if (!raw || typeof raw !== 'object') return empty
  let content = []
  if (Array.isArray(raw.content)) {
    content = raw.content
  } else if (Array.isArray(raw._embedded?.users)) {
    content = raw._embedded.users
  }
  const totalElements = Number(raw.totalElements ?? raw.total_elements ?? content.length) || 0
  const totalPages = Math.max(1, Number(raw.totalPages ?? raw.total_pages ?? (content.length ? 1 : 0)))
  return {
    content: [...content],
    totalElements,
    totalPages,
  }
}

export async function fetchUsers({ page = 0, size = 20, search, role, active } = {}) {
  const params = { page, size }
  if (search != null && String(search).trim()) params.search = search
  if (role != null && role !== 'ALL') params.role = role
  if (active != null && active !== 'ALL') params.active = active === 'ACTIVE'
  const { data } = await apiClient.get('/users', { params })
  return parsePageResponse(data)
}

export async function createUser(payload) {
  const { data } = await apiClient.post('/users', payload)
  return data
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.put(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`)
}

