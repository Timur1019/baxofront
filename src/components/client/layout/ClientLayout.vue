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
const appraisalOpen = ref(true)

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
  if (route.name === 'client-home') return t('nav.home')
  if (route.name === 'client-requests') return t('client.sectionRealEstate')
  if (route.name === 'client-vehicle-requests') return t('client.sectionVehicle')
  if (route.name === 'client-fixed-assets-requests') return t('client.sectionFixedAssets')
  if (route.name === 'client-request-new') return t('client.createRequest')
  if (route.name === 'client-request-edit') return t('client.editRequestTitle') || 'Редактирование заявки'
  return t('nav.home')
})

const logout = () => {
  clearAuth()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="client-layout" :class="{ 'client-layout--sidebar-closed': !sidebarOpen }">
    <div
      v-if="sidebarOpen"
      class="client-layout__overlay"
      @click="sidebarOpen = false"
    ></div>
    <aside class="client-layout__sidebar">
      <div class="client-layout__sidebar-head">
        <div class="client-layout__brand-inner">
          <div class="client-layout__logo">
            <img :src="appLogo" alt="Baholash" class="client-layout__logo-img" />
          </div>
          <h2 class="client-layout__title">{{ t('client.sidebarTitle') }}</h2>
        </div>
        <button
          type="button"
          class="client-layout__collapse-btn"
          :aria-label="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
          :title="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
          @click="sidebarOpen = !sidebarOpen"
        >
          <i :class="sidebarOpen ? 'bi bi-chevron-left' : 'bi bi-chevron-right'"></i>
        </button>
      </div>
      <nav class="client-layout__nav">
        <div class="client-layout__nav-group">
          <button
            type="button"
            class="client-layout__nav-item client-layout__nav-item--group"
            :class="{ 'client-layout__nav-item--open': appraisalOpen }"
            @click="appraisalOpen = !appraisalOpen"
          >
            <i class="bi bi-clipboard2-data client-layout__nav-icon" aria-hidden="true"></i>
            <span>Оценка</span>
            <i class="bi bi-chevron-down client-layout__nav-chevron" aria-hidden="true"></i>
          </button>
          <div v-show="appraisalOpen" class="client-layout__nav-sub">
            <router-link
              :to="{ name: 'client-requests' }"
              class="client-layout__nav-item client-layout__nav-item--sub"
              :class="{ 'client-layout__nav-item--active': isActive('client-requests') }"
            >
              <i class="bi bi-house-door client-layout__nav-icon"></i>
              <span>{{ t('client.sectionRealEstate') }}</span>
            </router-link>
            <router-link
              :to="{ name: 'client-vehicle-requests' }"
              class="client-layout__nav-item client-layout__nav-item--sub"
              :class="{ 'client-layout__nav-item--active': isActive('client-vehicle-requests') }"
            >
              <i class="bi bi-truck client-layout__nav-icon"></i>
              <span>{{ t('client.sectionVehicle') }}</span>
            </router-link>
            <router-link
              :to="{ name: 'client-fixed-assets-requests' }"
              class="client-layout__nav-item client-layout__nav-item--sub"
              :class="{ 'client-layout__nav-item--active': isActive('client-fixed-assets-requests') }"
            >
              <i class="bi bi-box-seam client-layout__nav-icon"></i>
              <span>{{ t('client.sectionFixedAssets') }}</span>
            </router-link>
          </div>
        </div>
      </nav>
      <div class="client-layout__user">
        <span class="client-layout__user-name">{{ currentUser?.fullName || t('client.userName') }}</span>
        <button type="button" class="client-layout__logout" @click="logout">{{ t('client.logout') }}</button>
      </div>
    </aside>

    <div class="client-layout__body">
      <header class="client-layout__topbar">
        <button
          type="button"
          class="client-layout__burger"
          :aria-label="sidebarOpen ? 'Скрыть меню' : 'Показать меню'"
          @click="sidebarOpen = !sidebarOpen"
        >
          <i class="bi bi-list"></i>
        </button>
        <span class="client-layout__pagetitle">{{ pageTitle }}</span>
      </header>
      <main class="client-layout__main">
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
.client-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width, 260px) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--color-bg);
}

.client-layout--sidebar-closed {
  grid-template-columns: 0 minmax(0, 1fr);
}

.client-layout--sidebar-closed .client-layout__sidebar {
  width: 0;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border-right: none;
  visibility: hidden;
  pointer-events: none;
}

.client-layout__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.client-layout__topbar {
  gap: 1rem;
}

.client-layout__main {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}

.page-enter-active,
.page-leave-active { transition: opacity 0.2s ease; }
.page-enter-from,
.page-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .client-layout {
    grid-template-columns: 1fr;
  }
  .client-layout__sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: var(--sidebar-width, 260px);
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
  }
  .client-layout--sidebar-closed .client-layout__sidebar {
    transform: translateX(-100%);
  }
}
</style>
