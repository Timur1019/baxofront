<script setup>
import { onMounted, ref, computed } from 'vue'
import { useI18n } from '../../i18n/useI18n'
import { getContactRequests, deleteContactRequest, deleteAllContactRequests } from '../../api/contactApi'

const { t } = useI18n()
const requests = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const totalElements = ref(0)
const currentPage = ref(0)
const pageSize = 20
const dateFrom = ref('')
const dateTo = ref('')
const onlyRecent = ref(false)
const deletingId = ref(null)
const deletingAll = ref(false)

const subjectLabels = computed(() => ({
  general: t('contacts.subjectGeneral'),
  support: t('contacts.subjectSupport'),
  sales: t('contacts.subjectSales'),
  partnership: t('contacts.subjectPartnership'),
}))

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getSubjectLabel(value) {
  return subjectLabels.value[value] || value || '—'
}

const loadRequests = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await getContactRequests({ page: currentPage.value, size: pageSize })
    requests.value = res.content ?? []
    totalElements.value = res.totalElements ?? 0
  } catch (e) {
    errorMessage.value = t('admin.contactRequestsLoadError')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRequests()
})

const filteredRequests = computed(() => {
  const from = dateFrom.value ? new Date(dateFrom.value + 'T00:00:00') : null
  const to = dateTo.value ? new Date(dateTo.value + 'T23:59:59.999') : null
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return (requests.value || []).filter((r) => {
    if (!r?.createdAt) return false
    const created = new Date(r.createdAt)

    if (from && created < from) return false
    if (to && created > to) return false

    if (onlyRecent.value && created < sevenDaysAgo) return false

    return true
  })
})

const resetFilters = () => {
  dateFrom.value = ''
  dateTo.value = ''
  onlyRecent.value = false
}

const handleDeleteOne = async (id) => {
  if (!id) return
  if (!confirm(t('admin.contactRequestsDeleteConfirm'))) return
  deletingId.value = id
  errorMessage.value = ''
  try {
    await deleteContactRequest(id)
    await loadRequests()
  } catch (e) {
    console.error('Failed to delete contact request', e)
    errorMessage.value = t('admin.contactRequestsDeleteError')
  } finally {
    deletingId.value = null
  }
}

const handleDeleteAll = async () => {
  if (!confirm(t('admin.contactRequestsDeleteAllConfirm'))) return
  deletingAll.value = true
  errorMessage.value = ''
  try {
    await deleteAllContactRequests()
    await loadRequests()
  } catch (e) {
    console.error('Failed to delete all contact requests', e)
    errorMessage.value = t('admin.contactRequestsDeleteAllError')
  } finally {
    deletingAll.value = false
  }
}
</script>

<template>
  <div class="page">
    <!-- Заголовок -->
    <div class="page__header">
      <div>
        <h1 class="page__title">{{ t('admin.contactRequestsTitle') }}</h1>
        <p class="page__subtitle">{{ t('admin.contactRequestsDesc') }}</p>
      </div>

      <div class="page__actions">
        <div class="page__filters">
          <label class="page__filter">
            <span>{{ t('admin.contactRequestsFilterDateFrom') }}</span>
            <input v-model="dateFrom" type="date" class="page__filter-input" />
          </label>
          <label class="page__filter">
            <span>{{ t('admin.contactRequestsFilterDateTo') }}</span>
            <input v-model="dateTo" type="date" class="page__filter-input" />
          </label>
          <label class="page__filter page__filter--checkbox">
            <input v-model="onlyRecent" type="checkbox" />
            <span>{{ t('admin.contactRequestsFilterOnlyNew') }}</span>
          </label>
          <button type="button" class="btn btn--ghost" @click="resetFilters">
            {{ t('admin.contactRequestsResetFilters') }}
          </button>
        </div>

        <button
            type="button"
            class="btn btn--danger"
            :disabled="deletingAll || isLoading || !requests.length"
            @click="handleDeleteAll"
        >
          {{ deletingAll ? t('common.loading') : t('admin.contactRequestsDeleteAll') }}
        </button>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-if="errorMessage" class="alert alert--danger">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
      </svg>
      <span>{{ errorMessage }}</span>
      <button class="alert__close" @click="errorMessage = ''">×</button>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="isLoading" class="state state--loading">
      <div class="spinner"></div>
      <p>{{ t('admin.loading') }}</p>
    </div>

    <!-- Таблица -->
    <div v-else class="content">
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th>{{ t('admin.date') }}</th>
              <th>{{ t('admin.name') }}</th>
              <th>{{ t('admin.email') }}</th>
              <th>{{ t('admin.phone') }}</th>
              <th>{{ t('admin.subject') }}</th>
              <th>{{ t('admin.message') }}</th>
              <th class="table__cell--actions-head"></th>
            </tr>
            </thead>
            <tbody>
            <!-- Пустое состояние -->
            <tr v-if="filteredRequests.length === 0" class="table__row--empty">
              <td colspan="7">
                <div class="empty-state">
                  <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <p class="empty-state__text">
                    {{ requests.length === 0 ? t('admin.contactRequestsEmpty') : t('admin.contactRequestsNoResultsByFilters') }}
                  </p>
                  <button
                    v-if="requests.length > 0"
                    type="button"
                    class="btn btn--ghost btn--sm empty-state__reset"
                    @click="resetFilters"
                  >
                    {{ t('admin.contactRequestsResetFilters') }}
                  </button>
                </div>
              </td>
            </tr>

            <!-- Строки с данными -->
            <tr
                v-for="r in filteredRequests"
                :key="r.id"
                class="table__row"
            >
              <td class="table__cell--nowrap" data-label="Дата">
                {{ formatDate(r.createdAt) }}
              </td>
              <td data-label="Имя">
                {{ r.name || '—' }}
              </td>
              <td data-label="Email">
                <a
                    v-if="r.email"
                    :href="`mailto:${r.email}`"
                    class="link"
                >
                  {{ r.email }}
                </a>
                <span v-else>—</span>
              </td>
              <td data-label="Телефон">
                <a
                    v-if="r.phone"
                    :href="`tel:${r.phone}`"
                    class="link"
                >
                  {{ r.phone }}
                </a>
                <span v-else>—</span>
              </td>
              <td data-label="Тема">
                  <span class="badge badge--info">
                    {{ getSubjectLabel(r.subject) }}
                  </span>
              </td>
              <td class="table__cell--message" data-label="Сообщение">
                {{ r.message || '—' }}
              </td>
              <td class="table__cell--actions">
                <button
                    type="button"
                    class="btn btn--text btn--danger"
                    :disabled="deletingId === r.id"
                    @click="handleDeleteOne(r.id)"
                >
                  {{ deletingId === r.id ? t('common.loading') : t('admin.contactRequestsDelete') }}
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Информация о пагинации -->
        <div v-if="totalElements > pageSize" class="pagination-info">
          <span class="pagination-info__text">
            {{ t('admin.showing') }} {{ requests.length }} {{ t('admin.of') }} {{ totalElements }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  animation: slideIn var(--transition-base) var(--ease);
}

/* === Заголовок страницы === */
.page__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.page__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--spacing-1);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page__subtitle {
  font-size: 0.95rem;
  color: var(--color-text-light);
  margin: 0;
}

.page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  align-items: center;
}

/* === Фильтры === */
.page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  align-items: center;
  background: var(--color-bg-card);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.page__filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-light);
}

.page__filter-input {
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition: all var(--transition-fast) var(--ease);
  width: 140px;
}

.page__filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

.page__filter--checkbox {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-2);
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--color-text);
}

.page__filter--checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

/* === Кнопки === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease);
  white-space: nowrap;
  line-height: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn--secondary {
  background: var(--color-secondary-bg);
  color: var(--color-secondary-dark);
  border-color: var(--color-border);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-secondary);
  color: white;
  border-color: var(--color-secondary);
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

.btn--danger {
  background: var(--color-danger);
  color: white;
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn--text {
  background: transparent;
  border: none;
  padding: var(--spacing-1) var(--spacing-2);
  color: var(--color-primary);
  font-weight: 500;
}

.btn--text:hover:not(:disabled) {
  background: var(--color-primary-bg);
  color: var(--color-primary-dark);
}

.btn--text.btn--danger {
  color: var(--color-danger);
}

.btn--text.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-bg);
  color: var(--color-danger-dark);
}

.btn--ghost {
  background: var(--color-bg);
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-dark);
}

.btn--sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: 0.8125rem;
}

/* === Состояния === */
.state--loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  gap: var(--spacing-4);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === Контент === */
.content {
  margin-top: var(--spacing-6);
}

/* === Карточка === */
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* === Таблица === */
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
  letter-spacing: 0.4px;
  font-size: 0.75rem;
  background: var(--color-bg);
}

.table td {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text);
  vertical-align: middle;
}

.table__row {
  transition: background-color var(--transition-fast) var(--ease);
}

.table__row:hover {
  background: var(--color-bg-hover);
}

.table__row--empty td {
  padding: 0;
}

.table__cell--nowrap {
  white-space: nowrap;
}

.table__cell--message {
  max-width: 300px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  color: var(--color-text);
}

.table__cell--actions-head {
  width: 1%;
}

.table__cell--actions {
  text-align: right;
  white-space: nowrap;
}

/* === Пустое состояние === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-lighter);
  margin-bottom: var(--spacing-4);
  stroke-width: 1.2;
}

.empty-state__text {
  color: var(--color-text-light);
  font-size: 1rem;
  margin: 0;
}

.empty-state__reset {
  margin-top: var(--spacing-4);
}

/* === Бейджи === */
.badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.badge--info {
  background: var(--color-info-bg);
  color: var(--color-info-dark);
  border: 1px solid var(--color-info);
}

/* === Ссылки === */
.link {
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--transition-fast) var(--ease);
  font-weight: 500;
}

.link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

/* === Алерт === */
.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-6);
  border: 1px solid;
  font-size: 0.875rem;
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
  opacity: 0.6;
  transition: all var(--transition-fast) var(--ease);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.alert__close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}

/* === Иконки === */
.icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* === Информация о пагинации === */
.pagination-info {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.pagination-info__text {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

/* === Анимации === */
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

/* === Адаптивность === */
@media (max-width: 1024px) {
  .page__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page__actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .page__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .page__filters {
    width: 100%;
    justify-content: flex-start;
  }

  .table th,
  .table td {
    padding: var(--spacing-2) var(--spacing-3);
  }

  .table__cell--message {
    max-width: 200px;
  }
}

@media (max-width: 640px) {
  .page__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .page__filter {
    width: 100%;
  }

  .page__filter-input {
    width: 100%;
  }

  .page__filter--checkbox {
    flex-direction: row;
    align-items: center;
  }

  /* Мобильная версия таблицы - карточки */
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
    box-shadow: var(--shadow-sm);
  }

  .table td {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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
    min-width: 90px;
  }

  .table__cell--message {
    max-width: none;
    white-space: normal;
  }

  .badge {
    margin-left: auto;
  }

  .table__cell--actions {
    text-align: left;
  }

  .table__cell--actions .btn {
    margin-left: auto;
  }

  .page__title {
    font-size: 1.5rem;
  }

  .content {
    margin-top: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .table td::before {
    min-width: 70px;
  }

  .empty-state__icon {
    width: 48px;
    height: 48px;
  }

  .empty-state__text {
    font-size: 0.875rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .page__actions {
    gap: var(--spacing-2);
  }
}
</style>