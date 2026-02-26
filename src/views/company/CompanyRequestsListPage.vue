<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'
import { getAllEvaluationRequests, getStatuses } from '../../api/evaluationApi'

const { t } = useI18n()
const router = useRouter()

const list = ref([])
const statuses = ref([])
const statusFilter = ref('')
const loading = ref(true)
const error = ref('')
const totalPages = ref(0)
const currentPage = ref(0)
const pageSize = 15

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
    console.error('Failed to load company requests', e)
    list.value = []
    totalPages.value = 0
    error.value = e.response?.data?.message || t('company.listLoadError') || 'Не удалось загрузить заявки'
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

const goTo = (id) => router.push({name: 'company-request-detail', params: {id}})

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}
</script>

<template>
  <div class="page">
    <!-- Заголовок -->
    <div class="page__header">
      <div>
        <h1 class="page__title">{{ t('company.listTitle') }}</h1>
        <p class="page__subtitle">{{ t('company.listDesc') }}</p>
      </div>
    </div>

    <!-- Фильтр -->
    <div class="filters">
      <div class="filters__group">
        <label class="filters__label">
          {{ t('company.filterStatus') }}
        </label>
        <div class="select-wrapper">
          <select v-model="statusFilter" class="select">
            <option value="">{{ t('company.allStatuses') }}</option>
            <option v-for="s in statuses" :key="s" :value="s">
              {{ statusLabel(s) }}
            </option>
          </select>
          <svg class="select__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Состояния -->
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
      <p>{{ t('company.empty') }}</p>
    </div>

    <!-- Таблица -->
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
              <th class="table__cell--right">{{ t('company.cost') }}</th>
              <th class="table__cell--right"></th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="item in list"
                :key="item.id"
                class="table__row table__row--clickable"
                @click="goTo(item.id)"
            >
              <td class="table__cell--nowrap" data-label="Дата">
                {{ item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : '—' }}
              </td>
              <td class="table__cell--truncate" :title="item.clientFullName || item.clientEmail" data-label="Клиент">
                {{ item.clientFullName || item.clientEmail || '—' }}
              </td>
              <td class="table__cell--truncate" :title="item.objectDescription" data-label="Описание">
                {{
                  item.objectDescription ? item.objectDescription.slice(0, 60) + (item.objectDescription.length > 60 ? '…' : '') : '—'
                }}
              </td>
              <td data-label="Статус">
                  <span :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
              </td>
              <td class="table__cell--right table__cell--nowrap" data-label="Стоимость">
                {{ item.cost != null ? Number(item.cost).toLocaleString('ru-RU') + ' сум' : '—' }}
              </td>
              <td class="table__cell--right" data-label="">
                <span class="link">{{ t('company.open') }} →</span>
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
  margin-bottom: var(--spacing-6);
}

.page__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-1);
  letter-spacing: -0.01em;
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
  text-transform: uppercase;
  letter-spacing: 0.3px;
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
  border-radius: var(--radius-full);
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
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-size: 0.75rem;
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
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-light);
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
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
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

/* Ссылки */
.link {
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-fast) var(--ease);
  white-space: nowrap;
}

.link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Иконки */
.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Спиннер */
.spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-bg-card);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease);
}

.pagination__btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination__info {
  font-size: 0.875rem;
  color: var(--color-text-light);
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 768px) {
  .filters__group {
    flex-direction: column;
    align-items: stretch;
  }

  .select-wrapper {
    min-width: auto;
  }

  .table th,
  .table td {
    padding: var(--spacing-2);
  }
}

@media (max-width: 640px) {
  /* Мобильная версия - карточки */
  .table,
  .table thead,
  .table tbody,
  .table th,
  .table td,
  .table tr {
    display: block;
  }

  .table thead {
    display: none;
  }

  .table tr {
    margin-bottom: var(--spacing-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4);
    background: var(--color-bg-card);
  }

  .table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2) 0;
    border-bottom: 1px dashed var(--color-border-light);
  }

  .table td:last-child {
    border-bottom: none;
  }

  .table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-text-light);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-right: var(--spacing-4);
  }

  .table__cell--truncate {
    max-width: none;
    white-space: normal;
  }

  .badge {
    margin-left: auto;
  }

  .link {
    margin-left: auto;
  }

  .table__cell--right {
    text-align: left;
  }

  .table__cell--right::before {
    text-align: left;
  }
}

/* Анимация появления */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>