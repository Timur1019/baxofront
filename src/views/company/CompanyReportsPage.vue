<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from '../../i18n/useI18n'
import { useFileDownload } from '../../composables/useFileDownload'
import { getAllEvaluationRequests, getStatuses, exportEvaluationRequestsToExcel, exportEvaluationRequestToWord } from '../../api/evaluationApi'

const { t } = useI18n()
const { triggerDownload } = useFileDownload()

const list = ref([])
const statuses = ref([])
const statusFilter = ref('')
const loading = ref(true)
const error = ref('')
const totalPages = ref(0)
const currentPage = ref(0)
const pageSize = 15
const downloadingId = ref(null)
const exporting = ref(false)

const statusLabel = (s) => {
  const key = {
    SUBMITTED: 'client.statusSubmitted',
    IN_PROGRESS: 'client.statusInProgress',
    REPORT_READY: 'client.statusReportReady',
    COMPLETED: 'client.statusCompleted',
    CANCELLED: 'client.statusCancelled',
    NOT_REVIEWED: 'client.statusNotReviewed',
    ASSIGNED_TO_APPRAISER: 'client.statusAssignedToAppraiser',
    IN_APPRAISAL: 'client.statusInAppraisal',
    APPROVED: 'client.statusApproved',
    NOT_READY: 'client.statusNotReady',
    IN_IDENTIFICATION: 'client.statusInIdentification'
  }[s]
  return key ? t(key) : s
}

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getAllEvaluationRequests({
      page: currentPage.value,
      size: pageSize,
      status: statusFilter.value || undefined,
    })
    list.value = res.content ?? []
    totalPages.value = res.totalPages ?? 0
  } catch (e) {
    console.error('Failed to load reports list', e)
    list.value = []
    totalPages.value = 0
    error.value = e.response?.data?.message || t('company.reportsLoadError')
  } finally {
    loading.value = false
  }
}

const loadStatuses = async () => {
  try {
    statuses.value = await getStatuses()
  } catch {
    statuses.value = []
  }
}

onMounted(() => {
  loadStatuses()
  load()
})

watch([statusFilter, currentPage], () => load())

const downloadWord = async (item) => {
  if (!item?.id) return
  downloadingId.value = item.id
  try {
    const blob = await exportEvaluationRequestToWord(item.id)
    const fileName = `request-${item.id}.docx`
    triggerDownload(blob, fileName)
  } catch (err) {
    console.error('Download Word report failed', err)
    error.value = err.response?.data?.message || t('company.reportsDownloadError')
  } finally {
    downloadingId.value = null
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--
}

const exportExcel = async () => {
  exporting.value = true
  error.value = ''
  try {
    const blob = await exportEvaluationRequestsToExcel({
      status: statusFilter.value || undefined,
    })
    triggerDownload(blob, 'evaluation-requests.xlsx')
  } catch (e) {
    console.error('Export to Excel failed', e)
    error.value = e.response?.data?.message || t('company.reportsDownloadError')
  } finally {
    exporting.value = false
  }
}

// Класс статуса для бейджа
const statusClass = (status) => {
  const map = {
    'CANCELLED': 'danger',
    'NOT_REVIEWED': 'warning',
    'SUBMITTED': 'warning',
    'IN_PROGRESS': 'info',
    'ASSIGNED_TO_APPRAISER': 'info',
    'IN_APPRAISAL': 'info',
    'IN_IDENTIFICATION': 'info',
    'REPORT_READY': 'success',
    'COMPLETED': 'success',
    'APPROVED': 'success',
    'NOT_READY': 'secondary'
  }
  return `badge badge--${map[status] || 'secondary'}`
}
</script>

<template>
  <div class="page">
    <!-- Заголовок -->
    <div class="page__header">
      <div>
        <h1 class="page__title">{{ t('company.reportsTitle') }}</h1>
        <p class="page__subtitle">{{ t('company.reportsDesc') }}</p>
      </div>

      <button
          class="btn btn--primary btn--icon-left"
          :disabled="exporting || loading"
          @click="exportExcel"
      >
        <svg v-if="!exporting" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span v-if="exporting" class="spinner spinner--small"></span>
        <span>{{ exporting ? t('company.loading') : t('company.reportsExportExcel') }}</span>
      </button>
    </div>

    <!-- Фильтр -->
    <div class="filters">
      <div class="filters__group">
        <label class="filters__label">{{ t('company.filterStatus') }}</label>
        <div class="select-wrapper">
          <select v-model="statusFilter" class="select">
            <option value="">{{ t('company.allStatuses') }}</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
          <svg class="select__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Состояния загрузки/ошибки/пусто -->
    <div v-if="loading" class="state state--loading">
      <div class="spinner"></div>
      <p>{{ t('company.loading') }}</p>
    </div>

    <div v-else-if="error" class="alert alert--danger">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
      </svg>
      <span>{{ error }}</span>
      <button class="alert__close" @click="error = ''">×</button>
    </div>

    <div v-else-if="list.length === 0" class="state state--empty">
      <svg class="state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
      <p>{{ t('company.reportsEmpty') }}</p>
    </div>

    <!-- Таблица с данными -->
    <div v-else class="content">
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th>{{ t('company.date') }}</th>
              <th>{{ t('company.client') }}</th>
              <th>{{ t('company.description') }}</th>
              <th>{{ t('company.status') }}</th>
              <th class="table__cell--right">Word</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="item in list"
                :key="item.id"
                class="table__row"
            >
              <td class="table__cell--nowrap">
                {{ item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : '—' }}
              </td>
              <td class="table__cell--truncate" :title="item.clientFullName || item.clientEmail">
                {{ item.clientFullName || item.clientEmail || '—' }}
              </td>
              <td class="table__cell--truncate" :title="item.objectDescription">
                {{ item.objectDescription ? item.objectDescription.slice(0, 50) + (item.objectDescription.length > 50 ? '…' : '') : '—' }}
              </td>
              <td>
                  <span :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
              </td>
              <td class="table__cell--right" @click.stop>
                <button
                    class="btn btn--small btn--outline"
                    :disabled="downloadingId === item.id"
                    @click="downloadWord(item)"
                >
                  <span v-if="downloadingId === item.id" class="spinner spinner--small"></span>
                  <span>{{ downloadingId === item.id ? t('company.loading') : t('company.reportsDownloadWord') }}</span>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="pagination">
          <button
              class="pagination__btn"
              :disabled="loading || currentPage === 0"
              @click="prevPage"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <span class="pagination__info">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>

          <button
              class="pagination__btn"
              :disabled="loading || currentPage >= totalPages - 1"
              @click="nextPage"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Используем глобальные переменные */
.page {
  animation: slideIn var(--transition-base) var(--ease);
}

/* Заголовок страницы */
.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
}

.page__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-1);
}

.page__subtitle {
  font-size: 1rem;
  color: var(--color-text-light);
  margin: 0;
}

/* Фильтры */
.filters {
  margin-bottom: var(--spacing-6);
}

.filters__group {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.filters__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-light);
}

/* Кастомный селект */
.select-wrapper {
  position: relative;
  min-width: 250px;
}

.select {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-8) var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: 0.875rem;
  line-height: 1.5;
  appearance: none;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease);
}

.select:hover {
  border-color: var(--color-border-dark);
}

.select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

.select__arrow {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-text-light);
  pointer-events: none;
}

/* Состояния */
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.state--loading {
  gap: var(--spacing-4);
}

.state--empty {
  gap: var(--spacing-4);
}

.state__icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-lighter);
}

.state p {
  color: var(--color-text-light);
  margin: 0;
}

/* Контент */
.content {
  margin-top: var(--spacing-6);
}

/* Карточка */
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Таблица */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th {
  text-align: left;
  padding: var(--spacing-3) var(--spacing-4);
  font-weight: 600;
  color: var(--color-text-light);
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.table td {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text);
}

.table__row {
  transition: background-color var(--transition-fast) var(--ease);
}

.table__row--clickable {
  cursor: pointer;
}

.table__row--clickable:hover {
  background: var(--color-bg-hover);
}

.table__cell--truncate {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table__cell--nowrap {
  white-space: nowrap;
}

.table__cell--right {
  text-align: right;
}

/* Бейджи статусов */
.badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.badge--primary {
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
}

.badge--secondary {
  background: var(--color-secondary-bg);
  color: var(--color-secondary-dark);
}

.badge--success {
  background: var(--color-success-bg);
  color: var(--color-success-dark);
}

.badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning-dark);
}

.badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger-dark);
}

.badge--info {
  background: var(--color-info-bg);
  color: var(--color-info-dark);
}

/* Кнопки */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease);
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn--outline {
  background: transparent;
  border-color: var(--color-border);
  color: var(--color-text);
}

.btn--outline:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-dark);
}

.btn--small {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: 0.813rem;
}

.btn--icon-left svg {
  margin-right: var(--spacing-1);
}

/* Иконки */
.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Спиннер */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner--small {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Алерт */
.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-6);
  background: var(--color-bg-card);
  border: 1px solid;
}

.alert--danger {
  background: var(--color-danger-bg);
  border-color: var(--color-danger);
  color: var(--color-danger-dark);
}

.alert__close {
  margin-left: auto;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: currentColor;
  opacity: 0.7;
  transition: opacity var(--transition-fast) var(--ease);
}

.alert__close:hover {
  opacity: 1;
}

/* Пагинация */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease);
}

.pagination__btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-dark);
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__info {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

/* Текст */
.text-muted {
  color: var(--color-text-lighter);
  font-size: 0.875rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters__group {
    flex-direction: column;
    align-items: stretch;
  }

  .select-wrapper {
    min-width: auto;
  }

  .table td {
    padding: var(--spacing-2);
  }

  .table__cell--truncate {
    max-width: 120px;
  }
}

@media (max-width: 640px) {
  .table-responsive {
    margin: 0 calc(var(--spacing-4) * -1);
    padding: 0 var(--spacing-4);
    width: calc(100% + var(--spacing-8));
  }

  .table th,
  .table td {
    white-space: nowrap;
  }
}
</style>