<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../../i18n/useI18n'
import { clearAuth } from '../../../utils/auth'

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
  if (route.name === 'client-request-detail') return t('client.detailTitle')
  return t('nav.home')
})

const logout = () => {
  clearAuth()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="client-layout" :class="{ 'client-layout--sidebar-closed': !sidebarOpen }">
    <aside class="client-layout__sidebar">
      <div class="client-layout__sidebar-head">
        <h2 class="client-layout__title">{{ t('client.sidebarTitle') }}</h2>
      </div>
      <nav class="client-layout__nav">
        <div class="client-layout__nav-group">
          <button
            type="button"
            class="client-layout__nav-item client-layout__nav-item--group"
            :class="{ 'client-layout__nav-item--open': appraisalOpen }"
            @click="appraisalOpen = !appraisalOpen"
          >
            <span class="client-layout__nav-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </span>
            <span>Оценка</span>
            <span class="client-layout__nav-chevron" aria-hidden="true">▼</span>
          </button>
          <div v-show="appraisalOpen" class="client-layout__nav-sub">
            <router-link
              :to="{ name: 'client-requests' }"
              class="client-layout__nav-item client-layout__nav-item--sub"
              :class="{ 'client-layout__nav-item--active': isActive('client-requests') }"
            >
              <span>{{ t('client.sectionRealEstate') }}</span>
            </router-link>
            <router-link
              :to="{ name: 'client-vehicle-requests' }"
              class="client-layout__nav-item client-layout__nav-item--sub"
              :class="{ 'client-layout__nav-item--active': isActive('client-vehicle-requests') }"
            >
              <span>{{ t('client.sectionVehicle') }}</span>
            </router-link>
            <router-link
              :to="{ name: 'client-fixed-assets-requests' }"
              class="client-layout__nav-item client-layout__nav-item--sub"
              :class="{ 'client-layout__nav-item--active': isActive('client-fixed-assets-requests') }"
            >
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
          <span /><span /><span />
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
  display: flex;
  min-height: calc(100vh - 64px);
  background: #f8f9fa;
}

.client-layout__sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.client-layout__sidebar-head {
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.client-layout__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #343a40;
  margin: 0;
  letter-spacing: 0.02em;
}

.client-layout__nav {
  flex: 1;
  padding: 0.75rem 0;
}

.client-layout__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  color: #495057;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;
}

.client-layout__nav-item:hover {
  background: #f8f9fa;
  color: #212529;
}

.client-layout__nav-item--active {
  background: rgba(111, 66, 193, 0.08);
  color: #6f42c1;
  font-weight: 500;
}

.client-layout__nav-group {
  margin-bottom: 0.25rem;
}

.client-layout__nav-item--group {
  width: 100%;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: #495057;
}

.client-layout__nav-item--group .client-layout__nav-chevron {
  font-size: 0.65rem;
  opacity: 0.7;
  transition: transform 0.2s;
}

.client-layout__nav-item--open .client-layout__nav-chevron {
  transform: rotate(180deg);
}

.client-layout__nav-sub {
  padding-left: 2.5rem;
}

.client-layout__nav-item--sub {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
}

.client-layout__nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.client-layout__nav-icon svg {
  width: 100%;
  height: 100%;
}

.client-layout__user {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e9ecef;
}

.client-layout__user-name {
  font-size: 0.8rem;
  color: #6c757d;
  display: block;
  margin-bottom: 0.5rem;
}

.client-layout__logout {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid #dee2e6;
  color: #495057;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s, border-color 0.2s;
}

.client-layout__logout:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.client-layout__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.client-layout__topbar {
  height: 52px;
  padding: 0 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-layout__burger {
  width: 36px;
  height: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  transition: background 0.2s, color 0.2s;
}

.client-layout__burger:hover {
  background: #f8f9fa;
  color: #343a40;
}

.client-layout__burger span {
  display: block;
  width: 18px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  margin: 0 auto;
}

.client-layout__pagetitle {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #495057;
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
  .client-layout__sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 100;
    box-shadow: 2px 0 12px rgba(0,0,0,0.08);
    transition: transform 0.2s ease;
  }
  .client-layout--sidebar-closed .client-layout__sidebar {
    transform: translateX(-100%);
  }
  .client-layout__body {
    margin-left: 0;
  }
}
</style>
