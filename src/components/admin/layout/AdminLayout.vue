<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../../i18n/useI18n'
import { clearAuth } from '../../../utils/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)

// В меню оставляем только реально работающие разделы
const menuItems = computed(() => [
  {
    name: t('admin.dashboard'),
    routeName: 'admin-dashboard',
    icon: 'bi-bar-chart',
    description: t('admin.dashboardDesc'),
  },
  {
    name: t('admin.users'),
    routeName: 'admin-users',
    icon: 'bi-people',
    description: t('admin.usersDesc'),
  },
  {
    name: t('admin.contactRequests'),
    routeName: 'admin-contact-requests',
    icon: 'bi-envelope',
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
  sidebarOpen.value = !sidebarOpen.value
  if (!sidebarOpen.value) isMobileMenuOpen.value = false
}

const openSidebar = () => {
  sidebarOpen.value = true
  if (typeof window !== 'undefined' && window.innerWidth < 1025) {
    isMobileMenuOpen.value = true
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  sidebarOpen.value = false
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
    '#5b21b6', '#6d28d9', '#d97706', '#059669', '#dc2626', '#7c3aed'
  ]

  if (!currentUser.value?.fullName) return colors[0]

  const index = currentUser.value.fullName.length % colors.length
  return colors[index]
}
</script>

<template>
  <div class="admin-layout" :class="{ 'admin-layout--sidebar-closed': !sidebarOpen }">
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
            <i class="bi bi-journal-bookmark-fill admin-layout__logo-icon"></i>
          </div>
          <div class="admin-layout__brand-info">
            <span class="admin-layout__brand-title">Baholash</span>
            <span class="admin-layout__brand-subtitle">{{ t('admin.brandSubtitle') }}</span>
          </div>
        </div>

        <!-- Кнопка сворачивания -->
        <button
            type="button"
            class="admin-layout__collapse-btn"
            @click="toggleSidebar"
            :aria-label="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
            :title="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
        >
          <i :class="sidebarOpen ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
        </button>
      </div>

      <!-- Навигация -->
      <nav class="admin-layout__nav">
        <div class="admin-layout__nav-section">
          <span class="admin-layout__nav-title">ОСНОВНОЕ</span>

          <button
              v-for="item in menuItems"
              :key="item.name"
              type="button"
              class="admin-layout__nav-item"
              :class="{ 'admin-layout__nav-item--active': isActive(item) }"
              @click="router.push({ name: item.routeName }); isMobileMenuOpen = false"
          >
            <i :class="['bi', item.icon, 'admin-layout__nav-icon']"></i>
            <div class="admin-layout__nav-content">
              <span class="admin-layout__nav-label">{{ item.name }}</span>
              <span class="admin-layout__nav-description">{{ item.description }}</span>
            </div>
          </button>
        </div>
      </nav>

      <!-- Футер боковой панели -->
      <div class="admin-layout__sidebar-footer">
        <div class="admin-layout__version">
          <span class="admin-layout__version-dot"></span>
          <div class="admin-layout__version-info">
            <span class="admin-layout__version-label">{{ t('admin.version') }}</span>
            <span class="admin-layout__version-status">{{ t('admin.production') }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Основной контент -->
    <section class="admin-layout__main">
      <!-- Верхняя панель -->
      <header class="admin-layout__topbar">
        <div class="admin-layout__topbar-left">
          <button
              type="button"
              class="admin-layout__burger"
              :aria-label="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
              @click="sidebarOpen ? toggleSidebar() : openSidebar()"
          >
            <i class="bi bi-list"></i>
          </button>

          <div class="admin-layout__breadcrumbs">
            <router-link to="/admin" class="admin-layout__breadcrumb-home">
              <i class="bi bi-house-door"></i>
            </router-link>
            <span class="admin-layout__breadcrumb-separator">/</span>
            <span class="admin-layout__breadcrumb-current">{{ route.meta?.title || t('admin.contentTitle') }}</span>
          </div>
        </div>

        <div class="admin-layout__topbar-right">
          <!-- Поиск -->
          <div class="admin-layout__search">
            <i class="bi bi-search admin-layout__search-icon"></i>
            <input
                type="text"
                :placeholder="t('admin.searchPlaceholder')"
                class="form-control"
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
                  <i class="bi bi-box-arrow-right admin-layout__dropdown-icon"></i>
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
          <h1 class="admin-layout__content-title fs-4 fw-semibold">{{ route.meta?.title || t('admin.contentTitle') }}</h1>
          <p class="admin-layout__content-description small text-muted mb-0">{{ route.meta?.description || t('admin.contentDescription') }}</p>
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
/* === Основные переменные (совпадают с design system) === */
.admin-layout {
  --sidebar-width: 260px;
  --topbar-height: 52px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  background: var(--color-bg);
}

.admin-layout--sidebar-closed {
  grid-template-columns: 0 minmax(0, 1fr);
}

.admin-layout--sidebar-closed .admin-layout__sidebar {
  width: 0;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border-right: none;
  visibility: hidden;
  pointer-events: none;
}

/* === Боковая панель (единый стиль с client/company) === */
.admin-layout__sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: var(--color-sidebar-bg);
  color: #f9fafb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow-y: auto;
  overflow-x: hidden;
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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(91, 33, 182, 0.4);
}

.admin-layout__logo-icon {
  font-size: 1.25rem;
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
  color: #f9fafb;
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

.admin-layout__collapse-btn i {
  font-size: 1.25rem;
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
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.admin-layout__nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f9fafb;
}

.admin-layout__nav-item--active {
  background: var(--color-primary-light);
  color: #f9fafb;
}

.admin-layout__nav-item--active::before {
  transform: scaleY(1);
}

.admin-layout__nav-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-layout__nav-icon {
  font-size: 1.125rem;
  width: 1.25rem;
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
  background: var(--color-primary);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #f9fafb;
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--color-bg);
}

/* Верхняя панель — базовые стили в topbar.css */
.admin-layout__topbar-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.admin-layout__breadcrumbs {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  line-height: 1;
}

.admin-layout__breadcrumb-home {
  color: var(--color-text-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
}

.admin-layout__breadcrumb-home i {
  font-size: 1.25rem;
}

.admin-layout__breadcrumb-home:hover {
  color: var(--color-primary);
}

.admin-layout__breadcrumb-separator {
  color: var(--color-text-muted);
  font-weight: 300;
}

.admin-layout__breadcrumb-current {
  color: var(--color-text);
  font-weight: 500;
}

.admin-layout__topbar-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

/* Поиск — выровнен по центру topbar */
.admin-layout__search {
  position: relative;
  display: flex;
  align-items: center;
}

.admin-layout__search .form-control {
  height: 38px;
  padding-left: 2.25rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  width: 200px;
}

.admin-layout__search .form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem var(--color-primary-light);
}

.admin-layout__search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

/* Профиль пользователя — выровнен по центру */
.admin-layout__user {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.admin-layout__user-info {
  text-align: right;
  line-height: 1.3;
}

.admin-layout__user-name {
  font-weight: 600;
  color: var(--color-text);
  display: block;
  font-size: 0.875rem;
}

.admin-layout__user-role {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.admin-layout__user-dropdown {
  position: relative;
}

.admin-layout__avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(91, 33, 182, 0.3);
}

.admin-layout__avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(91, 33, 182, 0.4);
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
  color: var(--color-text);
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
  background: var(--color-bg);
  color: var(--color-primary);
}

.admin-layout__dropdown-item--logout:hover {
  color: #f56565;
}

.admin-layout__dropdown-icon {
  font-size: 1.125rem;
}

.admin-layout__dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

/* Основной контент — max-width как у Client/Company, белый блок на серых боковых полях */
.admin-layout__content {
  flex: 1;
  width: 100%;
  max-width: var(--content-max-width, 1570px);
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem;
  background: var(--color-bg-card);
  box-shadow: 0 0 0 1px var(--color-border-light);
  overflow: auto;
}

.admin-layout__content-header {
  margin-bottom: 1.5rem;
}

.admin-layout__content-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.admin-layout__content-description {
  color: var(--color-text-muted);
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
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-layout__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .admin-layout__sidebar--open {
    transform: translateX(0);
  }

  .admin-layout--sidebar-closed .admin-layout__sidebar {
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    transform: translateX(-100%);
  }

  .admin-layout__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    backdrop-filter: blur(4px);
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