<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../../i18n/useI18n'
import { clearAuth } from '../../../utils/auth'
import appLogo from '../../../log.png'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const currentUser = ref(null)
const sidebarOpen = ref(true)

onMounted(() => {
  const raw = localStorage.getItem('baholash_auth') || sessionStorage.getItem('baholash_auth')
  if (raw) {
    try {
      currentUser.value = JSON.parse(raw)
    } catch {
      currentUser.value = null
    }
  }
})

const isActive = (name) => route.name === name

const pageTitle = computed(() => {
  if (route.name === 'company-dashboard') return t('company.dashboard')
  if (route.name === 'company-requests') return t('company.requests')
  if (route.name === 'company-reports') return t('company.reports')
  return t('company.brand')
})

const logout = () => {
  clearAuth()
  router.push({ name: 'login' })
}

const menuItems = [
  { name: t('company.dashboard'), routeName: 'company-dashboard', icon: 'bi-speedometer2' },
  { name: t('company.requests'), routeName: 'company-requests', icon: 'bi-folder2-open' },
  { name: t('company.reports'), routeName: 'company-reports', icon: 'bi-graph-up' },
]
</script>

<template>
  <div class="company-layout" :class="{ 'company-layout--sidebar-closed': !sidebarOpen }">
    <div
      v-if="sidebarOpen"
      class="company-layout__overlay"
      @click="sidebarOpen = false"
    ></div>
    <aside class="company-layout__sidebar">
      <div class="company-layout__brand">
        <div class="company-layout__brand-inner">
          <router-link to="/" class="company-layout__logo">
            <img :src="appLogo" alt="Baholash" class="company-layout__logo-img" />
          </router-link>
          <div class="company-layout__brand-text">
            <span class="company-layout__brand-title">Baholash</span>
            <span class="company-layout__subtitle">{{ t('company.brand') }}</span>
          </div>
        </div>
        <button
          type="button"
          class="company-layout__collapse-btn"
          :aria-label="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
          :title="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
          @click="sidebarOpen = !sidebarOpen"
        >
          <i :class="sidebarOpen ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
        </button>
      </div>
      <nav class="company-layout__nav">
        <router-link
          v-for="item in menuItems"
          :key="item.routeName"
          :to="{ name: item.routeName }"
          class="company-layout__nav-item"
          :class="{ 'company-layout__nav-item--active': isActive(item.routeName) }"
        >
          <i :class="['bi', item.icon, 'company-layout__nav-icon']"></i>
          <span v-show="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
      <div class="company-layout__user">
        <span class="company-layout__user-name">{{ currentUser?.fullName || t('company.userName') }}</span>
        <button type="button" class="company-layout__logout" @click="logout">{{ t('company.logout') }}</button>
      </div>
    </aside>

    <div class="company-layout__body">
      <header class="company-layout__topbar">
        <button
          type="button"
          class="company-layout__burger"
          :aria-label="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
          @click="sidebarOpen = !sidebarOpen"
        >
          <i class="bi bi-list"></i>
        </button>
        <span class="company-layout__pagetitle">{{ pageTitle }}</span>
      </header>
      <main class="company-layout__main">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.company-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--sidebar-width, 260px) minmax(0, 1fr);
  background: var(--color-bg);
}

.company-layout--sidebar-closed {
  grid-template-columns: 0 minmax(0, 1fr);
}

.company-layout--sidebar-closed .company-layout__sidebar {
  width: 0;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border-right: none;
  visibility: hidden;
  pointer-events: none;
}

.company-layout__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

 .company-layout__overlay {
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.4);
   z-index: 90;
   display: none;
 }

/* Topbar base styles in topbar.css */
.company-layout__topbar {
  gap: 1rem;
}

.company-layout__main {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}

.company-layout__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.page-enter-active,
.page-leave-active { transition: opacity 0.2s ease; }
.page-enter-from,
.page-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .company-layout {
    grid-template-columns: 1fr;
  }
  .company-layout__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--sidebar-width, 260px);
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }
  .company-layout--sidebar-closed .company-layout__sidebar {
    transform: translateX(-100%);
  }

  .company-layout__overlay {
    display: block;
  }
}
</style>
