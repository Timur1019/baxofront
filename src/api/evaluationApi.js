import { apiClient, API } from './http'
import { getAuth } from '../utils/auth'

/**
 * Заявки на оценку.
 * Клиент: создание, мои заявки, загрузка документов, скачивание отчёта.
 * Сотрудник компании: все заявки, фильтр, редактирование, статус, отчёт, стоимость.
 */

export async function createEvaluationRequest(payload) {
  const { data } = await apiClient.post('/evaluation-requests', {
    requestType: payload.requestType || 'REAL_ESTATE',
    objectDescription: payload.objectDescription || null,
    cadastralNumber: payload.cadastralNumber || null,
    appraisalPurpose: payload.appraisalPurpose || null,
    ownerPhone: payload.ownerPhone || null,
    bankEmployeePhone: payload.bankEmployeePhone || null,
    borrowerInn: payload.borrowerInn || null,
    appraisedObjectName: payload.appraisedObjectName || null,
    borrowerName: payload.borrowerName || null,
    regionId: payload.regionId || null,
    districtId: payload.districtId || null,
    propertyOwnerName: payload.propertyOwnerName || null,
    objectAddress: payload.objectAddress || null,
    fixedAssetItems: payload.fixedAssetItems || null,
  })
  return data
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

export async function getMyEvaluationRequests(params = {}) {
  const { page = 0, size = 20, requestType, status, regionId, districtId, search, dateFrom, dateTo } = params
  const { data } = await apiClient.get('/evaluation-requests/my', {
    params: { page, size, requestType, status, regionId, districtId, search, dateFrom, dateTo },
  })
  return parsePageResponse(data)
}

export async function getAllEvaluationRequests(params = {}) {
  const { page = 0, size = 20, status } = params
  const { data } = await apiClient.get('/evaluation-requests', {
    params: { page, size, status },
  })
  return parsePageResponse(data)
}

export async function getEvaluationRequestById(id) {
  const { data } = await apiClient.get(`/evaluation-requests/${id}`)
  return data
}

export async function updateEvaluationRequest(id, payload) {
  const { data } = await apiClient.put(`/evaluation-requests/${id}`, payload)
  return data
}

export async function uploadDocument(requestId, file) {
  const form = new FormData()
  form.append('file', file)
  await apiClient.post(`/evaluation-requests/${requestId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function uploadReport(requestId, file) {
  const form = new FormData()
  form.append('file', file)
  await apiClient.post(`/evaluation-requests/${requestId}/report`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteReport(requestId) {
  await apiClient.delete(`/evaluation-requests/${requestId}/report`)
}

/** Удалить заявку (мягкое удаление). Компания/админ — любую; клиент — только свою */
export async function deleteEvaluationRequest(requestId) {
  await apiClient.delete(`/evaluation-requests/${requestId}`)
}

export async function confirmCompletion(requestId) {
  await apiClient.post(`/evaluation-requests/${requestId}/confirm-completion`)
}

export async function getStatuses() {
  const { data } = await apiClient.get('/evaluation-requests/statuses')
  return data
}

export async function exportEvaluationRequestsToExcel(params = {}) {
  const { status } = params
  const query = new URLSearchParams()
  if (status) query.append('status', status)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  const res = await apiClient.get(`/evaluation-requests/export${suffix}`, {
    responseType: 'blob',
  })
  return res.data
}

export async function exportEvaluationRequestToWord(requestId) {
  const res = await apiClient.get(`/evaluation-requests/${requestId}/export-word`, {
    responseType: 'blob',
  })
  return res.data
}

/** Создать заявку с документом: REAL_ESTATE, VEHICLE или FIXED_ASSETS. */
export async function createEvaluationRequestWithDocument(dto, cadastralFile, techPassportFile, fixedAssetsFile) {
  const formData = new FormData()
  formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  if (cadastralFile) formData.append('cadastralDocument', cadastralFile)
  if (techPassportFile) formData.append('techPassportDocument', techPassportFile)
  if (fixedAssetsFile) formData.append('fixedAssetsDocument', fixedAssetsFile)
  const { data } = await apiClient.post('/evaluation-requests/with-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Скачать отчёт. Возвращает blob и имя файла из Content-Disposition или по умолчанию.
 */
export async function downloadReport(requestId) {
  const { token } = getAuth()
  const res = await fetch(`${API}/api/evaluation-requests/${requestId}/report/download`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  })
  if (!res.ok) throw new Error('Не удалось скачать отчёт')
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  let fileName = 'report'
  if (disposition) {
    const match = disposition.match(/filename\*=UTF-8''(.+)/)
    if (match) fileName = decodeURIComponent(match[1].trim())
  }
  return { blob, fileName }
}

/**
 * Получить QR-код (PNG blob) для просмотра PDF-отчёта по сканированию.
 * Использовать с URL.createObjectURL для отображения в <img>.
 */
export async function getReportQrBlob(requestId) {
  const { data } = await apiClient.get(`/evaluation-requests/${requestId}/report-qr`, {
    responseType: 'blob',
  })
  return data
}

/**
 * Скачать документ по id.
 */
export async function downloadDocument(documentId) {
  const { token } = getAuth()
  const res = await fetch(`${API}/api/evaluation-requests/documents/${documentId}/download`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  })
  if (!res.ok) throw new Error('Не удалось скачать документ')
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  let fileName = 'document'
  if (disposition) {
    const match = disposition.match(/filename\*=UTF-8''(.+)/)
    if (match) fileName = decodeURIComponent(match[1].trim())
  }
  return { blob, fileName }
}
