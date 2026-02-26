<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'
import { useStatusLabel } from '../../composables/useStatusLabel'
import { useFormatting } from '../../composables/useFormatting'
import { getAllEvaluationRequests } from '../../api/evaluationApi'

const { t } = useI18n()
const router = useRouter()
const { statusLabel } = useStatusLabel()
const { formatDate, formatSum } = useFormatting()

const totalRequests = ref(0)
const pendingCount = ref(0)
const inProgressCount = ref(0)
const completedCount = ref(0)
const recentRequests = ref([])
const isLoading = ref(false)
const error = ref(null)

async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    const [allRes, pendingRes, inProgressRes, completedRes] = await Promise.allSettled([
      getAllEvaluationRequests({ page: 0, size: 15 }),
      getAllEvaluationRequests({ page: 0, size: 1, status: 'NOT_REVIEWED' }),
      getAllEvaluationRequests({ page: 0, size: 1, status: 'IN_APPRAISAL' }),
      getAllEvaluationRequests({ page: 0, size: 1, status: 'COMPLETED' }),
    ])

    totalRequests.value = allRes.status === 'fulfilled' ? (allRes.value.totalElements ?? 0) : 0
    pendingCount.value = pendingRes.status === 'fulfilled' ? (pendingRes.value.totalElements ?? 0) : 0
    inProgressCount.value = inProgressRes.status === 'fulfilled' ? (inProgressRes.value.totalElements ?? 0) : 0
    completedCount.value = completedRes.status === 'fulfilled' ? (completedRes.value.totalElements ?? 0) : 0
    recentRequests.value = allRes.status === 'fulfilled' ? (allRes.value.content ?? []) : []

    if (allRes.status === 'rejected' || pendingRes.status === 'rejected' ||
        inProgressRes.status === 'rejected' || completedRes.status === 'rejected') {
      error.value = t('company.loadError')
    }
  } catch (err) {
    error.value = t('company.loadError')
    console.error('Dashboard load error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
  // Обновляем данные каждые 5 минут
  const interval = setInterval(loadData, 5 * 60 * 1000)
  return () => clearInterval(interval)
})

function goToRequest(id) {
  router.push({ name: 'company-request-detail', params: { id } })
}

function goToRequests() {
  router.push({ name: 'company-requests' })
}

function displayObject(item) {
  return item.appraisedObjectName || item.propertyOwnerName || item.objectDescription || '—'
}

// Мемоизация для производительности
const statusClass = (status) => {
  const map = {
    'CANCELLED': 'danger',
    'NOT_REVIEWED': 'warning',
    'NOT_READY': 'warning',
    'IN_APPRAISAL': 'info',
    'IN_PROGRESS': 'info',
    'ASSIGNED_TO_APPRAISER': 'info',
    'REPORT_READY': 'success',
    'COMPLETED': 'success',
    'APPROVED': 'success'
  }
  return `badge badge--${map[status] || 'secondary'}`
}
</script>

<template>
  <div class="dashboard">
    <!-- Заголовок -->
    <div class="dashboard__header">
      <div>
        <h1 class="dashboard__title">{{ t('company.dashboardTitle') }}</h1>
        <p class="dashboard__date">
          {{ new Date().toLocaleDateString('ru-RU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) }}
        </p>
      </div>

      <button
          class="btn btn--outline btn--icon-left"
          :disabled="isLoading"
          @click="loadData"
      >
        <svg class="icon" :class="{ 'icon--spin': isLoading }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M23 4v6h-6M1 20v-6h6" stroke-width="2"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke-width="2"/>
        </svg>
        <span>{{ isLoading ? t('company.loading') : t('company.dashboardRefresh') }}</span>
      </button>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="alert alert--danger">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
      </svg>
      <span>{{ error }}</span>
      <button class="alert__close" @click="error = null">×</button>
    </div>

    <!-- Метрики -->
    <div class="dashboard__metrics">
      <div class="metric-card">
        <div class="metric-card__icon metric-card__icon--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <div class="metric-card__content">
          <span class="metric-card__label">{{ t('company.dashboardTotal') }}</span>
          <span class="metric-card__value">{{ totalRequests.toLocaleString() }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-card__icon metric-card__icon--warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="metric-card__content">
          <span class="metric-card__label">{{ t('company.dashboardPending') }}</span>
          <span class="metric-card__value">{{ pendingCount.toLocaleString() }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-card__icon metric-card__icon--info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="metric-card__content">
          <span class="metric-card__label">{{ t('company.dashboardInProgress') }}</span>
          <span class="metric-card__value">{{ inProgressCount.toLocaleString() }}</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-card__icon metric-card__icon--success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="metric-card__content">
          <span class="metric-card__label">{{ t('company.dashboardCompleted') }}</span>
          <span class="metric-card__value">{{ completedCount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Основная сетка -->
    <div class="dashboard__grid">
      <!-- Таблица с заявками -->
      <div class="card">
        <div class="card__header">
          <div>
            <h2 class="card__title">{{ t('company.dashboardRecent') }}</h2>
            <p class="card__subtitle">{{ t('company.dashboardRecentDesc') }}</p>
          </div>

          <button class="btn btn--link" @click="goToRequests">
            <span>{{ t('company.dashboardAllRequests') }}</span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="card__body">
          <div class="table-responsive">
            <table class="table">
              <thead>
              <tr>
                <th>{{ t('company.date') }}</th>
                <th>{{ t('company.dashboardObject') }}</th>
                <th>{{ t('company.client') }}</th>
                <th>{{ t('company.status') }}</th>
                <th class="table__cell--right">{{ t('company.cost') }}</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <!-- Состояние загрузки -->
              <tr v-if="isLoading" class="table__row--loading">
                <td colspan="6">
                  <div class="skeleton-loader">
                    <div class="skeleton-loader__line"></div>
                    <div class="skeleton-loader__line"></div>
                    <div class="skeleton-loader__line"></div>
                  </div>
                </td>
              </tr>

              <!-- Пустое состояние -->
              <tr v-else-if="recentRequests.length === 0" class="table__row--empty">
                <td colspan="6">
                  <div class="empty-state">
                    <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <p class="empty-state__text">{{ t('company.empty') }}</p>
                  </div>
                </td>
              </tr>

              <!-- Строки с данными -->
              <tr
                  v-else
                  v-for="item in recentRequests"
                  :key="item.id"
                  class="table__row table__row--clickable"
                  @click="goToRequest(item.id)"
              >
                <td class="table__cell--nowrap">{{ formatDate(item.createdAt) }}</td>
                <td class="table__cell--truncate" :title="displayObject(item)">
                  {{ displayObject(item) }}
                </td>
                <td class="table__cell--truncate" :title="item.clientFullName || item.clientEmail">
                  {{ item.clientFullName || item.clientEmail || '—' }}
                </td>
                <td>
                    <span :class="statusClass(item.status)">
                      {{ statusLabel(item.status) }}
                    </span>
                </td>
                <td class="table__cell--right table__cell--nowrap">
                  {{ item.cost != null ? formatSum(item.cost) + ' сум' : '—' }}
                </td>
                <td class="table__cell--right">
                  <span class="link">{{ t('company.open') }}</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Боковая панель -->
      <div class="dashboard__sidebar">
        <!-- Быстрые действия -->
        <div class="card">
          <div class="card__header">
            <h2 class="card__title">{{ t('company.dashboardQuickActions') }}</h2>
          </div>

          <div class="card__body">
            <button class="btn btn--block btn--outline btn--icon-left" @click="goToRequests">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <span>{{ t('company.dashboardAllRequests') }}</span>
            </button>
          </div>
        </div>

        <!-- Статистика (можно добавить позже) -->
        <div class="card">
          <div class="card__header">
            <h2 class="card__title">{{ t('company.dashboardStats') }}</h2>
          </div>

          <div class="card__body">
            <div class="stats-list">
              <div class="stats-list__item">
                <span class="stats-list__label">{{ t('company.dashboardPending') }}</span>
                <span class="stats-list__value stats-list__value--warning">{{ pendingCount }}</span>
              </div>
              <div class="stats-list__item">
                <span class="stats-list__label">{{ t('company.dashboardInProgress') }}</span>
                <span class="stats-list__value stats-list__value--info">{{ inProgressCount }}</span>
              </div>
              <div class="stats-list__item">
                <span class="stats-list__label">{{ t('company.dashboardCompleted') }}</span>
                <span class="stats-list__value stats-list__value--success">{{ completedCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  animation: slideIn var(--transition-base) var(--ease);
}

/* Заголовок */
.dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  flex-wrap: wrap;
}

.dashboard__title {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0 0 var(--spacing-1);
}

.dashboard__date {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
  text-transform: capitalize;
}

/* Метрики */
.dashboard__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.metric-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: all var(--transition-fast) var(--ease);
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-dark);
}

.metric-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-card__icon svg {
  width: 24px;
  height: 24px;
}

.metric-card__icon--primary {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.metric-card__icon--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning-dark);
}

.metric-card__icon--info {
  background: var(--color-info-bg);
  color: var(--color-info-dark);
}

.metric-card__icon--success {
  background: var(--color-success-bg);
  color: var(--color-success-dark);
}

.metric-card__content {
  min-width: 0;
  flex: 1;
}

.metric-card__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: var(--spacing-1);
}

.metric-card__value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

/* Основная сетка */
.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-6);
}

/* Карточка */
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card__header {
  padding: var(--spacing-5);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--spacing-1);
}

.card__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin: 0;
}

.card__body {
  padding: var(--spacing-5);
}

/* Таблица */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: calc(var(--spacing-5) * -1);
  padding: var(--spacing-5);
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

.table__row--loading,
.table__row--empty {
  text-align: center;
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

/* Бейджи */
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

.btn--secondary {
  background: var(--color-secondary);
  color: white;
  border-color: var(--color-secondary);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-secondary-dark);
  border-color: var(--color-secondary-dark);
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

.btn--link {
  background: transparent;
  border-color: transparent;
  color: var(--color-primary);
  padding: var(--spacing-2);
}

.btn--link:hover:not(:disabled) {
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
}

.btn--block {
  width: 100%;
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

.icon--spin {
  animation: spin 1s linear infinite;
}

/* Ссылки */
.link {
  color: var(--color-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--transition-fast) var(--ease);
}

.link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* Скелетон загрузки */
.skeleton-loader {
  padding: var(--spacing-2) 0;
}

.skeleton-loader__line {
  height: 20px;
  background: linear-gradient(
      90deg,
      var(--color-border-light) 25%,
      var(--color-border) 50%,
      var(--color-border-light) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-sm);
  margin: var(--spacing-2) 0;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  text-align: center;
}

.empty-state__icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-lighter);
  margin-bottom: var(--spacing-4);
}

.empty-state__text {
  color: var(--color-text-light);
  font-size: 0.875rem;
  margin: 0;
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

/* Статистика в сайдбаре */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.stats-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.stats-list__item:last-child {
  border-bottom: none;
}

.stats-list__label {
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.stats-list__value {
  font-weight: 600;
  font-size: 1rem;
}

.stats-list__value--warning { color: var(--color-warning-dark); }
.stats-list__value--info { color: var(--color-info-dark); }
.stats-list__value--success { color: var(--color-success-dark); }

/* Адаптивность */
@media (max-width: 1024px) {
  .dashboard__metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard__header {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard__metrics {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: var(--spacing-4);
  }

  .card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn--block-mobile {
    width: 100%;
  }
}

/* Оптимизация производительности */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>