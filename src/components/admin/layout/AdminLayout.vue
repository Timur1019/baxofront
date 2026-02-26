<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../../i18n/useI18n'
import { clearAuth } from '../../../utils/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

// В меню оставляем только реально работающие разделы
const menuItems = computed(() => [
  {
    name: t('admin.dashboard'),
    routeName: 'admin-dashboard',
    icon: '📊',
    description: t('admin.dashboardDesc'),
  },
  {
    name: t('admin.users'),
    routeName: 'admin-users',
    icon: '👥',
    description: t('admin.usersDesc'),
  },
  {
    name: t('admin.contactRequests'),
    routeName: 'admin-contact-requests',
    icon: '📬',
    description: t('admin.contactRequestsDesc'),
  },
])

const currentUser = ref(null)

// Загрузка пользователя при монтировании
onMounted(() => {
  loadUser()
})

const loadUser = () => {
  const raw = localStorage.getItem('baholash_auth') || sessionStorage.getItem('baholash_auth')
  if (!raw) return

  try {
    currentUser.value = JSON.parse(raw)
  } catch {
    currentUser.value = null
  }
}

// Проверка активного пункта меню
const isActive = (item) => {
  return route.name === item.routeName
}

const logout = () => {
  if (confirm(t('admin.logoutConfirm'))) {
    clearAuth()
    router.push({ name: 'login' })
  }
}

// Переключение боковой панели
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Получение инициалов пользователя
const getUserInitials = () => {
  if (!currentUser.value?.fullName) return 'A'

  const names = currentUser.value.fullName.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return names[0][0].toUpperCase()
}

// Получение цвета аватара на основе имени
const getAvatarColor = () => {
  const colors = [
    '#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'
  ]

  if (!currentUser.value?.fullName) return colors[0]

  const index = currentUser.value.fullName.length % colors.length
  return colors[index]
}
</script>

<template>
  <div class="admin-layout" :class="{ 'admin-layout--collapsed': isSidebarCollapsed }">
    <!-- Оверлей для мобильных -->
    <div
        v-if="isMobileMenuOpen"
        class="admin-layout__overlay"
        @click="isMobileMenuOpen = false"
    ></div>

    <!-- Боковая панель -->
    <aside class="admin-layout__sidebar" :class="{ 'admin-layout__sidebar--open': isMobileMenuOpen }">
      <!-- Логотип и бренд -->
      <div class="admin-layout__brand">
        <div class="admin-layout__logo-wrapper">
          <div class="admin-layout__logo">
            <span class="admin-layout__logo-icon">📚</span>
          </div>
          <transition name="fade">
            <div v-if="!isSidebarCollapsed" class="admin-layout__brand-info">
              <span class="admin-layout__brand-title">Baholash</span>
              <span class="admin-layout__brand-subtitle">{{ t('admin.brandSubtitle') }}</span>
            </div>
          </transition>
        </div>

        <!-- Кнопка сворачивания -->
        <button
            class="admin-layout__collapse-btn"
            @click="toggleSidebar"
            :title="isSidebarCollapsed ? 'Развернуть' : 'Свернуть'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
                :d="isSidebarCollapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7M19 19l-7-7 7-7'"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Навигация -->
      <nav class="admin-layout__nav">
        <div class="admin-layout__nav-section">
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="admin-layout__nav-title">ОСНОВНОЕ</span>
          </transition>

          <button
              v-for="item in menuItems"
              :key="item.name"
              type="button"
              class="admin-layout__nav-item"
              :class="{
              'admin-layout__nav-item--active': isActive(item),
            }"
              @click="router.push({ name: item.routeName })"
          >
            <span class="admin-layout__nav-icon">{{ item.icon }}</span>

            <transition name="fade">
              <div v-if="!isSidebarCollapsed" class="admin-layout__nav-content">
                <span class="admin-layout__nav-label">{{ item.name }}</span>
                <span class="admin-layout__nav-description">{{ item.description }}</span>
              </div>
            </transition>
          </button>
        </div>
      </nav>

      <!-- Футер боковой панели -->
      <div class="admin-layout__sidebar-footer">
        <div class="admin-layout__version">
          <span class="admin-layout__version-dot"></span>
          <transition name="fade">
            <div v-if="!isSidebarCollapsed" class="admin-layout__version-info">
              <span class="admin-layout__version-label">{{ t('admin.version') }}</span>
              <span class="admin-layout__version-status">{{ t('admin.production') }}</span>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- Основной контент -->
    <section class="admin-layout__main">
      <!-- Верхняя панель -->
      <header class="admin-layout__topbar">
        <div class="admin-layout__topbar-left">
          <button
              class="admin-layout__mobile-menu"
              @click="isMobileMenuOpen = true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 12h18M3 6h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <div class="admin-layout__breadcrumbs">
            <router-link to="/admin" class="admin-layout__breadcrumb-home">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke-width="2"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke-width="2"/>
              </svg>
            </router-link>
            <span class="admin-layout__breadcrumb-separator">/</span>
            <span class="admin-layout__breadcrumb-current">{{ route.meta?.title || t('admin.contentTitle') }}</span>
          </div>
        </div>

        <div class="admin-layout__topbar-right">
          <!-- Поиск -->
          <div class="admin-layout__search">
            <svg class="admin-layout__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" stroke-width="2"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"/>
            </svg>
            <input
                type="text"
                :placeholder="t('admin.searchPlaceholder')"
                class="admin-layout__search-input"
            />
          </div>

          <!-- Профиль пользователя -->
          <div class="admin-layout__user">
            <div class="admin-layout__user-info">
              <span class="admin-layout__user-name">{{ currentUser?.fullName || 'Администратор' }}</span>
              <span class="admin-layout__user-role">{{ currentUser?.role || 'ADMIN' }}</span>
            </div>

            <div class="admin-layout__user-dropdown">
              <div
                  class="admin-layout__avatar"
                  :style="{ backgroundColor: getAvatarColor() }"
              >
                {{ getUserInitials() }}
              </div>

              <!-- Выпадающее меню -->
              <div class="admin-layout__dropdown">
                <button class="admin-layout__dropdown-item admin-layout__dropdown-item--logout" @click="logout">
                  <span class="admin-layout__dropdown-icon">🚪</span>
                  <span>{{ t('nav.logout') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Основной контент -->
      <main class="admin-layout__content">
        <!-- Хлебные крошки и заголовок -->
        <div class="admin-layout__content-header">
          <h1 class="admin-layout__content-title">{{ route.meta?.title || t('admin.contentTitle') }}</h1>
          <p class="admin-layout__content-description">{{ route.meta?.description || t('admin.contentDescription') }}</p>
        </div>

        <!-- Роутер для контента -->
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </section>
  </div>
</template>

<style scoped>
/* === Основные переменные === */
.admin-layout {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --topbar-height: 70px;
  --primary: #667eea;
  --primary-dark: #5a67d8;
  --secondary: #764ba2;
  --dark: #1a202c;
  --gray: #718096;
  --light: #f7fafc;
  --white: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  min-height: 100vh;
  display: flex;
  background: #f0f2f5;
}

/* === Боковая панель === */
.admin-layout__sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, var(--dark) 0%, #2d3748 100%);
  color: var(--white);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
  transition: width 0.3s ease;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-layout--collapsed .admin-layout__sidebar {
  width: var(--sidebar-collapsed-width);
}

/* Бренд */
.admin-layout__brand {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-layout__logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.admin-layout__logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}

.admin-layout__logo-icon {
  font-size: 1.5rem;
}

.admin-layout__brand-info {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.admin-layout__brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.admin-layout__brand-subtitle {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Кнопка сворачивания */
.admin-layout__collapse-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.admin-layout__collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.admin-layout__collapse-btn svg {
  width: 20px;
  height: 20px;
}

/* Навигация */
.admin-layout__nav {
  flex: 1;
  padding: 1.5rem 0;
}

.admin-layout__nav-section {
  margin-bottom: 2rem;
}

.admin-layout__nav-title {
  display: block;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

.admin-layout__nav-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: left;
}

.admin-layout__nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.admin-layout__nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
}

.admin-layout__nav-item--active {
  background: rgba(255, 255, 255, 0.15);
  color: var(--white);
}

.admin-layout__nav-item--active::before {
  transform: scaleY(1);
}

.admin-layout__nav-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-layout__nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.admin-layout__nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}

.admin-layout__nav-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.admin-layout__nav-description {
  font-size: 0.75rem;
  opacity: 0.5;
}

.admin-layout__nav-badge {
  padding: 0.25rem 0.5rem;
  background: var(--primary);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--white);
  margin-left: 0.5rem;
}

.admin-layout__nav-dev {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Футер боковой панели */
.admin-layout__sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-layout__version {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-layout__version-dot {
  width: 8px;
  height: 8px;
  background: #48bb78;
  border-radius: 50%;
  box-shadow: 0 0 10px #48bb78;
  flex-shrink: 0;
}

.admin-layout__version-info {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.admin-layout__version-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.admin-layout__version-status {
  font-size: 0.75rem;
  opacity: 0.5;
}

/* === Основной контент === */
.admin-layout__main {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-layout--collapsed .admin-layout__main {
  margin-left: var(--sidebar-collapsed-width);
}

/* Верхняя панель */
.admin-layout__topbar {
  height: var(--topbar-height);
  background: var(--white);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: var(--shadow);
}

.admin-layout__topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-layout__mobile-menu {
  display: none;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--gray);
}

.admin-layout__mobile-menu:hover {
  background: var(--light);
}

.admin-layout__breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-layout__breadcrumb-home {
  color: var(--gray);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.admin-layout__breadcrumb-home svg {
  width: 20px;
  height: 20px;
}

.admin-layout__breadcrumb-home:hover {
  color: var(--primary);
}

.admin-layout__breadcrumb-separator {
  color: var(--gray);
  font-weight: 300;
}

.admin-layout__breadcrumb-current {
  color: var(--dark);
  font-weight: 500;
}

.admin-layout__topbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Поиск */
.admin-layout__search {
  position: relative;
}

.admin-layout__search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--gray);
}

.admin-layout__search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 0.875rem;
  width: 250px;
  transition: all 0.3s ease;
  background: var(--light);
}

.admin-layout__search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  width: 300px;
  background: var(--white);
}

/* Профиль пользователя */
.admin-layout__user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-layout__user-info {
  text-align: right;
  line-height: 1.2;
}

.admin-layout__user-name {
  font-weight: 600;
  color: var(--dark);
  display: block;
  font-size: 0.875rem;
}

.admin-layout__user-role {
  font-size: 0.75rem;
  color: var(--gray);
}

.admin-layout__user-dropdown {
  position: relative;
}

.admin-layout__avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.admin-layout__avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

/* Выпадающее меню */
.admin-layout__dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  min-width: 200px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 100;
  border: 1px solid #e2e8f0;
}

.admin-layout__user-dropdown:hover .admin-layout__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.admin-layout__dropdown-item {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--dark);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  border: none;
  background: none;
  font-size: 0.875rem;
  text-align: left;
}

.admin-layout__dropdown-item:hover {
  background: var(--light);
  color: var(--primary);
}

.admin-layout__dropdown-item--logout:hover {
  color: #f56565;
}

.admin-layout__dropdown-icon {
  font-size: 1.1rem;
}

.admin-layout__dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

/* Основной контент */
.admin-layout__content {
  flex: 1;
  padding: 2rem;
  background: #f0f2f5;
}

.admin-layout__content-header {
  margin-bottom: 2rem;
}

.admin-layout__content-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.admin-layout__content-description {
  color: var(--gray);
  font-size: 0.95rem;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Медиа-запросы */
@media (max-width: 1024px) {
  .admin-layout__sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .admin-layout__sidebar--open {
    transform: translateX(0);
  }

  .admin-layout__main {
    margin-left: 0 !important;
  }

  .admin-layout__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 45;
    backdrop-filter: blur(4px);
  }

  .admin-layout__mobile-menu {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-layout__search {
    display: none;
  }

  .admin-layout__user-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-layout__topbar {
    padding: 0 1rem;
  }

  .admin-layout__breadcrumbs {
    display: none;
  }

  .admin-layout__content {
    padding: 1rem;
  }

  .admin-layout__content-title {
    font-size: 1.5rem;
  }
}

/* Кастомный скроллбар */
.admin-layout__sidebar::-webkit-scrollbar {
  width: 4px;
}

.admin-layout__sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.admin-layout__sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.admin-layout__sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>