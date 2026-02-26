<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'
import { clearAuth } from '../../utils/auth'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const currentUser = ref(null)
const searchQuery = ref('')

onMounted(() => {
  checkAuth()
})
onUnmounted(() => {})

const checkAuth = () => {
  const raw = localStorage.getItem('baholash_auth') || sessionStorage.getItem('baholash_auth')
  if (raw) {
    try {
      currentUser.value = JSON.parse(raw)
    } catch {
      currentUser.value = null
    }
  }
}

// Главная — переход по клику на логотип; в меню только «О нас» и «Контакты»
const menuItems = computed(() => [
  { name: t('nav.about'), path: '/about' },
  { name: t('nav.contacts'), path: '/contacts' },
])

const isActive = (item) => {
  if (item.exact) return route.path === item.path
  return item.path !== '/' && route.path.startsWith(item.path)
}

const closeMobileMenu = () => { isMobileMenuOpen.value = false }

const logout = () => {
  clearAuth()
  currentUser.value = null
  isUserMenuOpen.value = false
  router.push('/')
}

const setLocale = (code) => {
  locale.value = code
}

const getUserInitials = () => {
  if (!currentUser.value?.fullName) return '?'
  const names = currentUser.value.fullName.trim().split(/\s+/)
  if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase()
  return (names[0][0] || '').toUpperCase()
}

const userRoleLabel = computed(() => {
  const r = currentUser.value?.role
  if (!r) return ''
  if (r === 'ADMIN') return 'ADMIN'
  if (r === 'CLIENT_EMPLOYEE') return 'CLIENT'
  if (r === 'COMPANY_EMPLOYEE') return 'COMPANY'
  return r
})
</script>

<template>
  <header class="header">
    <div class="header__container">
      <div class="header__left">
        <router-link to="/" class="header__brand" @click="closeMobileMenu">
          <span class="header__brand-logo">{{ t('app.name').charAt(0) }}</span>
          <div class="header__brand-text">
            <span class="header__brand-name">{{ t('app.name') }}</span>
            <span class="header__brand-subtitle">{{ t('app.subtitle') }}</span>
          </div>
        </router-link>
        <nav class="header__nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="header__nav-link"
            :class="{ 'header__nav-link--active': isActive(item) }"
          >
            {{ item.name }}
          </router-link>
        </nav>
      </div>

      <div class="header__center">
        <div class="header__search-wrap">
          <svg class="header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="header__search-input"
            :placeholder="t('nav.searchPlaceholder')"
            :aria-label="t('nav.searchPlaceholder')"
          />
        </div>
      </div>

      <div class="header__right">
        <div class="header__lang">
          <button
            v-for="lang in ['uz', 'ru', 'en']"
            :key="lang"
            type="button"
            class="header__lang-btn"
            :class="{ 'header__lang-btn--active': locale === lang }"
            @click="setLocale(lang)"
          >
            {{ lang.toUpperCase() }}
          </button>
        </div>

        <template v-if="!currentUser">
          <router-link to="/login" class="header__login">
            {{ t('nav.login') }}
          </router-link>
        </template>
        <div v-else class="header__user-wrap">
          <button type="button" class="header__user-btn" @click="isUserMenuOpen = !isUserMenuOpen">
            <div class="header__user-info">
              <span class="header__user-name">{{ currentUser.fullName }}</span>
              <span v-if="userRoleLabel" class="header__user-role">{{ userRoleLabel }}</span>
            </div>
            <span class="header__avatar">{{ getUserInitials() }}</span>
          </button>
          <transition name="fade">
            <div v-if="isUserMenuOpen" class="header__dropdown">
              <router-link to="/admin" class="header__dropdown-item" @click="isUserMenuOpen = false">
                {{ t('nav.dashboard') }}
              </router-link>
              <div class="header__dropdown-divider" />
              <button type="button" class="header__dropdown-item header__dropdown-item--action" @click="logout">
                {{ t('nav.logout') }}
              </button>
            </div>
          </transition>
        </div>

        <button
          type="button"
          class="header__burger"
          :class="{ 'header__burger--open': isMobileMenuOpen }"
          :aria-label="t('nav.menuAria')"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span /><span /><span />
        </button>
      </div>
    </div>

    <transition name="slide">
      <div v-if="isMobileMenuOpen" class="header__mobile">
        <nav class="header__mobile-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="header__mobile-link"
            :class="{ 'header__mobile-link--active': isActive(item) }"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </router-link>
        </nav>
        <div class="header__mobile-search">
          <input
            v-model="searchQuery"
            type="search"
            class="header__mobile-search-input"
            :placeholder="t('nav.searchPlaceholder')"
          />
        </div>
        <div class="header__mobile-lang">
          <button
            v-for="lang in ['uz', 'ru', 'en']"
            :key="lang"
            type="button"
            class="header__mobile-lang-btn"
            :class="{ 'header__mobile-lang-btn--active': locale === lang }"
            @click="setLocale(lang); closeMobileMenu()"
          >
            {{ lang.toUpperCase() }}
          </button>
        </div>
        <div v-if="!currentUser" class="header__mobile-auth">
          <router-link to="/login" class="header__mobile-login" @click="closeMobileMenu">
            {{ t('nav.login') }}
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Цвета макета: белый фон, серые тексты, акцент красный (бейдж), фиолетовый аватар */
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.header__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 24px;
  gap: 16px;
}

/* ——— Левая часть: логотип и навигация ——— */
.header__left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;
  gap: 28px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.header__brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #6f42c1;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header__brand-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.25;
}

.header__brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #343a40;
}

.header__brand-subtitle {
  font-size: 0.6875rem;
  color: #6c757d;
  font-weight: 500;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header__nav-link {
  padding: 6px 12px;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;
}

.header__nav-link:hover {
  color: #343a40;
  background: #f8f9fa;
}

.header__nav-link--active {
  color: #343a40;
  background: #f8f9fa;
}

/* ——— Центр: поиск (pill) ——— */
.header__center {
  flex: 1;
  max-width: 420px;
  margin: 0 16px;
  min-width: 0;
}

.header__search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 16px;
  background: #f8f9fa;
  border: none;
  border-radius: 999px;
  transition: background 0.2s, box-shadow 0.2s;
}

.header__search-wrap:focus-within {
  background: #e9ecef;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.header__search-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #adb5bd;
}

.header__search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #343a40;
  outline: none;
}

.header__search-input::placeholder {
  color: #adb5bd;
}

/* ——— Правая часть: язык, уведомления, пользователь ——— */
.header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header__lang {
  display: flex;
  padding: 3px;
  border-radius: 8px;
  background: #f8f9fa;
}

.header__lang-btn {
  padding: 5px 10px;
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.header__lang-btn:hover {
  color: #343a40;
}

.header__lang-btn--active {
  background: #ffffff;
  color: #343a40;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.header__login {
  padding: 8px 20px;
  border: 1px solid #dee2e6;
  color: #343a40;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.header__login:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.header__user-wrap {
  position: relative;
}

.header__user-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px 6px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.header__user-btn:hover {
  background: #f8f9fa;
}

.header__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  line-height: 1.25;
}

.header__user-name {
  font-size: 14px;
  font-weight: 500;
  color: #343a40;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header__user-role {
  font-size: 11px;
  font-weight: 500;
  color: #adb5bd;
  letter-spacing: 0.02em;
}

.header__avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #6f42c1;
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(111, 66, 193, 0.35);
  transition: box-shadow 0.2s;
}

.header__user-btn:hover .header__avatar {
  box-shadow: 0 3px 10px rgba(111, 66, 193, 0.4);
}

.header__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 8px 0;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header__dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  color: #343a40;
  font-size: 14px;
  text-decoration: none;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.header__dropdown-item:hover {
  background: #f8f9fa;
  color: #212529;
}

.header__dropdown-item--action:hover {
  color: #dc3545;
}

.header__dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 6px 0;
}

.header__burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #343a40;
  border-radius: 8px;
  transition: background 0.2s;
}

.header__burger:hover {
  background: #f8f9fa;
}

.header__burger span {
  display: block;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: transform 0.3s, opacity 0.3s;
}

.header__burger--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.header__burger--open span:nth-child(2) {
  opacity: 0;
}
.header__burger--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ——— Мобильное меню ——— */
.header__mobile {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e9ecef;
  padding: 16px 24px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: none;
}

.header__mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.header__mobile-link {
  padding: 12px 16px;
  color: #343a40;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.header__mobile-link:hover,
.header__mobile-link--active {
  background: #f8f9fa;
  color: #212529;
}

.header__mobile-search {
  margin-bottom: 16px;
}

.header__mobile-search-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  background: #f8f9fa;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  color: #343a40;
}

.header__mobile-search-input::placeholder {
  color: #adb5bd;
}

.header__mobile-lang {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.header__mobile-lang-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.header__mobile-lang-btn--active {
  background: #e9ecef;
  color: #343a40;
}

.header__mobile-login {
  display: block;
  text-align: center;
  padding: 12px;
  border: 1px solid #dee2e6;
  color: #343a40;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.2s, color 0.2s;
}

.header__mobile-login:hover {
  background: #f8f9fa;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .header__nav {
    display: none;
  }
  .header__center {
    display: none;
  }
  .header__burger {
    display: flex;
  }
  .header__mobile {
    display: block;
  }
  .header__lang {
    display: none;
  }
}

@media (max-width: 640px) {
  .header__container {
    padding: 0 16px;
  }
  .header__brand-subtitle {
    display: none;
  }
  .header__user-info {
    display: none;
  }
  .header__login {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>
