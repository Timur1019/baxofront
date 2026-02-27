<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'
import { fetchUsers } from '../../api/usersApi'

const { t } = useI18n()
const router = useRouter()

// Данные для дашборда
const totalUsers = ref(0)
const activeUsers = ref(0)
const adminUsers = ref(0)
const newUsersToday = ref(0)
const recentUsers = ref([])
const isLoading = ref(false)

const systemHealth = ref({
  live: false,
  database: 0,
  api: 0,
  memory: 0,
  cpu: 0,
  lastRefresh: null,
})
const lastRefreshTime = ref(null)

// Последние действия: формируем из реальных данных (обновление дашборда + последние пользователи)
const recentActivities = computed(() => {
  const items = []
  if (lastRefreshTime.value) {
    items.push({
      icon: '🔄',
      text: 'Данные дашборда обновлены',
      time: lastRefreshTime.value,
      at: new Date(lastRefreshTime.value).getTime(),
    })
  }
  recentUsers.value.forEach((u) => {
    const at = u.createdAt ? new Date(u.createdAt).getTime() : 0
    items.push({
      icon: '👤',
      text: `Пользователь ${u.fullName || u.login || '—'} в системе`,
      time: formatRelativeTime(u.createdAt),
      at: at || 0,
    })
  })
  items.sort((a, b) => b.at - a.at)
  return items.slice(0, 8)
})

function formatRelativeTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const min = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин. назад`
  if (h < 24) return `${h} ч. назад`
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн. назад`
  return d.toLocaleDateString('ru-RU')
}

// Вычисляемые значения
const activePercentage = computed(() => {
  if (totalUsers.value === 0) return 0
  return Math.round((activeUsers.value / totalUsers.value) * 100)
})

const adminPercentage = computed(() => {
  if (totalUsers.value === 0) return 0
  return Math.round((adminUsers.value / totalUsers.value) * 100)
})

const loadSummary = async () => {
  isLoading.value = true
  const start = performance.now()
  try {
    const pageRes = await fetchUsers({ page: 0, size: 50 })
    const elapsed = Math.round(performance.now() - start)
    const list = pageRes.content ?? []
    totalUsers.value = pageRes.totalElements ?? list.length
    activeUsers.value = list.filter((u) => u.active).length
    adminUsers.value = list.filter((u) => u.role === 'ADMIN').length
    recentUsers.value = list.slice(0, 5)
    newUsersToday.value = Math.max(0, list.filter((u) => {
      if (!u.createdAt) return false
      const created = new Date(u.createdAt)
      const today = new Date()
      return created.toDateString() === today.toDateString()
    }).length)

    // Состояние системы: реальные данные после запроса
    systemHealth.value = {
      live: true,
      database: 100,
      api: Math.min(elapsed, 999),
      memory: 0,
      cpu: 0,
      lastRefresh: new Date().toISOString(),
    }
    lastRefreshTime.value = new Date().toISOString()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    systemHealth.value = {
      ...systemHealth.value,
      live: false,
    }
  } finally {
    isLoading.value = false
  }
}

const goToUsers = () => {
  router.push({ name: 'admin-users' })
}

const goToAddUser = () => {
  router.push({ name: 'admin-users', query: { action: 'add' } })
}

const getStatusBadgeClass = (active) => {
  return active
      ? 'dashboard__badge dashboard__badge--success'
      : 'dashboard__badge dashboard__badge--inactive'
}

const getRoleBadgeClass = (role) => {
  const classes = {
    'ADMIN': 'dashboard__badge dashboard__badge--admin',
    'MODERATOR': 'dashboard__badge dashboard__badge--moderator',
    'USER': 'dashboard__badge dashboard__badge--user'
  }
  return classes[role] || 'dashboard__badge dashboard__badge--user'
}

onMounted(loadSummary)
</script>

<template>
  <div class="dashboard">
    <!-- Заголовок дашборда -->
    <div class="dashboard__header">
      <div>
        <h1 class="dashboard__title">{{ t('admin.dashboardTitle') }}</h1>
        <p class="dashboard__date">{{ new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>
      <div class="dashboard__actions">
        <button class="dashboard__refresh-btn" @click="loadSummary" :disabled="isLoading">
          <i class="bi bi-arrow-repeat dashboard__refresh-icon" :class="{ 'dashboard__refresh-icon--spin': isLoading }"></i>
          Обновить
        </button>
      </div>
    </div>

    <!-- Основные метрики -->
    <div class="dashboard__metrics">
      <div class="dashboard__metric-card dashboard__metric-card--primary">
        <div class="dashboard__metric-icon">
          <i class="bi bi-people-fill"></i>
        </div>
        <div class="dashboard__metric-content">
          <span class="dashboard__metric-label">Всего пользователей</span>
          <span class="dashboard__metric-value">{{ totalUsers }}</span>
          <span class="dashboard__metric-trend">+{{ newUsersToday }} сегодня</span>
        </div>
      </div>

      <div class="dashboard__metric-card dashboard__metric-card--success">
        <div class="dashboard__metric-icon">
          <i class="bi bi-clock-fill"></i>
        </div>
        <div class="dashboard__metric-content">
          <span class="dashboard__metric-label">Активные</span>
          <span class="dashboard__metric-value">{{ activeUsers }}</span>
          <span class="dashboard__metric-trend">{{ activePercentage }}% от всех</span>
        </div>
      </div>

      <div class="dashboard__metric-card dashboard__metric-card--warning">
        <div class="dashboard__metric-icon">
          <i class="bi bi-shield-fill-check"></i>
        </div>
        <div class="dashboard__metric-content">
          <span class="dashboard__metric-label">Администраторы</span>
          <span class="dashboard__metric-value">{{ adminUsers }}</span>
          <span class="dashboard__metric-trend">{{ adminPercentage }}% от всех</span>
        </div>
      </div>

      <div class="dashboard__metric-card dashboard__metric-card--info">
        <div class="dashboard__metric-icon">
          <i class="bi bi-person-plus-fill"></i>
        </div>
        <div class="dashboard__metric-content">
          <span class="dashboard__metric-label">Новых сегодня</span>
          <span class="dashboard__metric-value">{{ newUsersToday }}</span>
          <span class="dashboard__metric-trend">за последние 24ч</span>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="dashboard__grid">
      <!-- Таблица последних пользователей -->
      <div class="dashboard__card dashboard__card--table">
        <div class="dashboard__card-header">
          <div>
            <h2 class="dashboard__card-title">Последние пользователи</h2>
            <p class="dashboard__card-subtitle">Недавно зарегистрированные в системе</p>
          </div>
          <button class="dashboard__card-action" @click="goToUsers">
            Все пользователи
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Дата регистрации</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="isLoading" class="table__row">
              <td colspan="5" class="table__loading-cell">
                <div class="dashboard__loader"></div>
                <span>Загрузка данных...</span>
              </td>
            </tr>
            <tr v-else-if="!recentUsers.length" class="table__row">
              <td colspan="5" class="table__empty-cell">Нет данных о пользователях</td>
            </tr>
            <tr v-for="user in recentUsers" :key="user.id" class="table__row">
              <td>
                <div class="dashboard__user-info">
                  <div class="dashboard__user-avatar">
                    {{ user.login?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div>
                    <div class="dashboard__user-name">{{ user.login }}</div>
                    <div class="dashboard__user-fullname">{{ user.fullName || '—' }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                  <span :class="getRoleBadgeClass(user.role)">
                    {{ user.role }}
                  </span>
              </td>
              <td>
                  <span :class="getStatusBadgeClass(user.active)">
                    {{ user.active ? 'Активен' : 'Неактивен' }}
                  </span>
              </td>
              <td>{{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Боковая панель -->
      <div class="dashboard__side">
        <!-- Быстрые действия -->
        <div class="dashboard__card">
          <h2 class="dashboard__card-title">Быстрые действия</h2>
          <div class="dashboard__quick-actions">
            <button class="dashboard__quick-action" @click="goToUsers">
              <i class="bi bi-people dashboard__quick-action-icon"></i>
              <span>Управление пользователями</span>
            </button>
            <button class="dashboard__quick-action" @click="goToAddUser">
              <i class="bi bi-person-plus dashboard__quick-action-icon"></i>
              <span>Добавить пользователя</span>
            </button>
            <button class="dashboard__quick-action" @click="router.push({ name: 'admin-contact-requests' })">
              <i class="bi bi-envelope dashboard__quick-action-icon"></i>
              <span>Заявки с сайта</span>
            </button>
          </div>
        </div>

        <!-- Состояние системы (реальные данные после загрузки) -->
        <div class="dashboard__card">
          <div class="dashboard__card-header">
            <h2 class="dashboard__card-title">Состояние системы</h2>
            <span
              class="dashboard__system-status"
              :class="{ 'dashboard__system-status--live': systemHealth.live, 'dashboard__system-status--off': !systemHealth.live }"
            >
              ● {{ systemHealth.live ? 'Live' : 'Нет данных' }}
            </span>
          </div>

          <div class="dashboard__system-metrics">
            <div class="dashboard__metric-item">
              <div class="dashboard__metric-info">
                <span>База данных</span>
                <span>{{ systemHealth.live ? 'Подключена' : '—' }}</span>
              </div>
              <div class="dashboard__progress">
                <div class="dashboard__progress-bar" :style="{ width: (systemHealth.live ? 100 : 0) + '%' }"></div>
              </div>
            </div>

            <div class="dashboard__metric-item">
              <div class="dashboard__metric-info">
                <span>Задержка API</span>
                <span>{{ systemHealth.api }} мс</span>
              </div>
              <div class="dashboard__progress">
                <div
                  class="dashboard__progress-bar dashboard__progress-bar--api"
                  :style="{ width: Math.min((systemHealth.api / 500) * 100, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div v-if="lastRefreshTime" class="dashboard__system-info">
            <div class="dashboard__system-info-item">
              <span>Обновлено:</span>
              <strong>{{ formatRelativeTime(lastRefreshTime) }}</strong>
            </div>
          </div>
        </div>

        <!-- Последние действия (из реальных данных) -->
        <div class="dashboard__card">
          <h2 class="dashboard__card-title">Последние действия</h2>
          <div class="dashboard__activity-list">
            <template v-if="recentActivities.length">
              <div
                v-for="(item, idx) in recentActivities"
                :key="idx"
                class="dashboard__activity-item"
              >
                <span class="dashboard__activity-icon">{{ item.icon }}</span>
                <div class="dashboard__activity-content">
                  <span class="dashboard__activity-text">{{ item.text }}</span>
                  <span class="dashboard__activity-time">{{ item.time }}</span>
                </div>
              </div>
            </template>
            <p v-else class="dashboard__activity-empty">Нажмите «Обновить» для загрузки данных</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === Основные переменные === */
.dashboard {
  --primary: var(--color-primary);
  --primary-dark: var(--color-primary-hover);
  --secondary: var(--color-primary-hover);
  --success: #48bb78;
  --warning: #ed8936;
  --danger: #f56565;
  --info: #4299e1;
  --dark: #1a202c;
  --gray: #718096;
  --light: #f7fafc;
  --white: #ffffff;

  padding: 2rem;
  background: var(--color-bg);
  min-height: 100vh;
}

/* === Заголовок === */
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.dashboard__date {
  color: var(--gray);
  font-size: 0.9rem;
  text-transform: capitalize;
}

.dashboard__refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--white);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: var(--dark);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dashboard__refresh-btn:hover:not(:disabled) {
  background: var(--light);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.dashboard__refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dashboard__refresh-icon {
  width: 18px;
  height: 18px;
}

.dashboard__refresh-icon--spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === Метрики === */
.dashboard__metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard__metric-card {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.dashboard__metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.dashboard__metric-card--primary .dashboard__metric-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: var(--primary);
}

.dashboard__metric-card--success .dashboard__metric-icon {
  background: rgba(72, 187, 120, 0.2);
  color: var(--success);
}

.dashboard__metric-card--warning .dashboard__metric-icon {
  background: rgba(237, 137, 54, 0.2);
  color: var(--warning);
}

.dashboard__metric-card--info .dashboard__metric-icon {
  background: rgba(66, 153, 225, 0.2);
  color: var(--info);
}

.dashboard__metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashboard__metric-icon svg {
  width: 30px;
  height: 30px;
}

.dashboard__metric-content {
  flex: 1;
}

.dashboard__metric-label {
  display: block;
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 0.25rem;
}

.dashboard__metric-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.dashboard__metric-trend {
  font-size: 0.8rem;
  color: var(--gray);
}

/* === Основная сетка === */
.dashboard__grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
}

/* === Карточки === */
.dashboard__card {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.dashboard__card--table {
  min-height: 420px;
  border-radius: 3%;
  border: 2px solid var(--color-border);
  overflow: hidden;
}

.dashboard__card--table .table-responsive {
  min-height: 320px;
  border: 1px solid var(--color-border);
  border-radius: 3%;
  margin-top: 0.5rem;
}

.dashboard__card--table .table,
.dashboard__card--table .table td,
.dashboard__card--table .table th {
  border-color: var(--color-border) !important;
}

.dashboard__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dashboard__card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.dashboard__card-subtitle {
  font-size: 0.875rem;
  color: var(--gray);
}

.dashboard__card-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--light);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: var(--dark);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dashboard__card-action:hover {
  background: var(--white);
  border-color: var(--primary);
  color: var(--primary);
}

.dashboard__card-action svg {
  width: 16px;
  height: 16px;
}

.dashboard__loader,
.table__loading-cell .dashboard__loader {
  width: 28px;
  height: 28px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.5rem;
  display: block;
}

.table__loading-cell,
.table__empty-cell {
  text-align: center;
  padding: 2rem;
}

/* === Бейджи === */
.dashboard__badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.dashboard__badge--success {
  background: rgba(72, 187, 120, 0.2);
  color: var(--success);
}

.dashboard__badge--inactive {
  background: #e2e8f0;
  color: var(--gray);
}

.dashboard__badge--admin {
  background: rgba(237, 137, 54, 0.2);
  color: var(--warning);
}

.dashboard__badge--moderator {
  background: rgba(66, 153, 225, 0.2);
  color: var(--info);
}

.dashboard__badge--user {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary);
}

/* === Информация о пользователе === */
.dashboard__user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard__user-avatar {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.dashboard__user-name {
  font-weight: 600;
  color: var(--dark);
}

.dashboard__user-fullname {
  font-size: 0.8rem;
  color: var(--gray);
}

/* === Быстрые действия === */
.dashboard__quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard__quick-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--light);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: var(--dark);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;
}

.dashboard__quick-action:hover:not(:disabled) {
  background: var(--white);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateX(5px);
}

.dashboard__quick-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dashboard__quick-action-icon {
  font-size: 1.2rem;
  width: 24px;
}

.dashboard__quick-action-badge {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  background: var(--warning);
  color: white;
  border-radius: 999px;
}

/* === Системные метрики === */
.dashboard__system-status {
  font-size: 0.875rem;
  font-weight: 600;
}
.dashboard__system-status--live {
  color: var(--success);
}
.dashboard__system-status--off {
  color: var(--gray);
}

.dashboard__system-metrics {
  margin: 1rem 0;
}

.dashboard__metric-item {
  margin-bottom: 1rem;
}

.dashboard__metric-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--gray);
}

.dashboard__progress {
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.dashboard__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.dashboard__progress-bar--api {
  background: var(--info);
}

.dashboard__progress-bar--memory {
  background: var(--warning);
}

.dashboard__progress-bar--cpu {
  background: var(--success);
}

.dashboard__system-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.dashboard__system-info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 0.5rem;
}

/* === Список активности === */
.dashboard__activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard__activity-empty {
  padding: 1rem;
  text-align: center;
  color: var(--gray);
  font-size: 0.9rem;
  margin: 0;
}

.dashboard__activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--light);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.dashboard__activity-item:hover {
  transform: translateX(5px);
  background: #edf2f7;
}

.dashboard__activity-icon {
  font-size: 1.2rem;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.dashboard__activity-content {
  flex: 1;
}

.dashboard__activity-text {
  display: block;
  font-size: 0.9rem;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.dashboard__activity-time {
  font-size: 0.75rem;
  color: var(--gray);
}

/* === Лоадер === */
.dashboard__loader {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* === Адаптивность === */
@media (max-width: 1200px) {
  .dashboard__metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard__header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .dashboard__metrics {
    grid-template-columns: 1fr;
  }

  .dashboard__card--table .table th:nth-child(2),
  .dashboard__card--table .table td:nth-child(2) {
    display: none;
  }
}

@media (max-width: 480px) {
  .dashboard__card--table .table th:nth-child(3),
  .dashboard__card--table .table td:nth-child(3) {
    display: none;
  }
}
</style>