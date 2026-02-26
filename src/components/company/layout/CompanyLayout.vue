<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../../../i18n/useI18n'
import { clearAuth } from '../../../utils/auth'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const currentUser = ref(null)

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

const logout = () => {
  clearAuth()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="company-layout">
    <aside class="company-layout__sidebar">
      <div class="company-layout__brand">
        <router-link to="/" class="company-layout__logo">Baholash</router-link>
        <span class="company-layout__subtitle">{{ t('company.brand') }}</span>
      </div>
      <nav class="company-layout__nav">
        <router-link
          :to="{ name: 'company-dashboard' }"
          class="company-layout__nav-item"
          :class="{ 'company-layout__nav-item--active': isActive('company-dashboard') }"
        >
          {{ t('company.dashboard') }}
        </router-link>
        <router-link
          :to="{ name: 'company-requests' }"
          class="company-layout__nav-item"
          :class="{ 'company-layout__nav-item--active': isActive('company-requests') }"
        >
          {{ t('company.requests') }}
        </router-link>
        <router-link
          :to="{ name: 'company-reports' }"
          class="company-layout__nav-item"
          :class="{ 'company-layout__nav-item--active': isActive('company-reports') }"
        >
          {{ t('company.reports') }}
        </router-link>
      </nav>
      <div class="company-layout__user">
        <span class="company-layout__user-name">{{ currentUser?.fullName || t('company.userName') }}</span>
        <button type="button" class="company-layout__logout" @click="logout">{{ t('company.logout') }}</button>
      </div>
    </aside>
    <main class="company-layout__main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.company-layout {
  min-height: 100vh;
  display: flex;
  background: #f5f5f7;
}
.company-layout__sidebar {
  width: 260px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
}
.company-layout__brand {
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.company-layout__logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  display: block;
}
.company-layout__subtitle {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  margin-top: 0.25rem;
  display: block;
}
.company-layout__nav {
  flex: 1;
  padding: 1rem 0;
}
.company-layout__nav-item {
  display: block;
  padding: 0.65rem 1.25rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;
}
.company-layout__nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.company-layout__nav-item--active {
  background: rgba(255,255,255,0.12);
  color: #fff;
}
.company-layout__user {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.company-layout__user-name {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  display: block;
  margin-bottom: 0.5rem;
}
.company-layout__logout {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.company-layout__logout:hover {
  background: rgba(255,255,255,0.1);
}
.company-layout__main {
  flex: 1;
  padding: 2rem;
  overflow: auto;
}
.page-enter-active,
.page-leave-active { transition: opacity 0.2s ease; }
.page-enter-from,
.page-leave-to { opacity: 0; }
</style>
