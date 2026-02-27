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
          <button type="button" class="btn btn-outline-secondary" @click="resetFilters">
            {{ t('admin.contactRequestsResetFilters') }}
          </button>
        </div>

        <button
            type="button"
            class="btn btn-danger"
            :disabled="deletingAll || isLoading || !requests.length"
            @click="handleDeleteAll"
        >
          {{ deletingAll ? t('common.loading') : t('admin.contactRequestsDeleteAll') }}
        </button>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-if="errorMessage" class="alert alert--danger">
      <i class="bi bi-exclamation-circle-fill"></i>
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
          <table class="table table-bordered table-hover">
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
                  <i class="bi bi-inbox empty-state__icon"></i>
                  <p class="empty-state__text">
                    {{ requests.length === 0 ? t('admin.contactRequestsEmpty') : t('admin.contactRequestsNoResultsByFilters') }}
                  </p>
                  <button
                    v-if="requests.length > 0"
                    type="button"
                    class="btn btn-outline-secondary btn-sm empty-state__reset"
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
                    class="btn btn-danger btn-sm"
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

  .page__title {
    font-size: 1.5rem;
  }

  .content {
    margin-top: var(--spacing-4);
  }
}

@media (max-width: 480px) {
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