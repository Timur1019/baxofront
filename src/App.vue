<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainHeader from './components/layout/MainHeader.vue'

const route = useRoute()

const showMainHeader = computed(() => !route.path.startsWith('/admin'))
</script>

<template>
  <div class="app">
    <MainHeader v-if="showMainHeader" />
    <div v-if="showMainHeader" class="app-content-width">
      <router-view />
    </div>
    <div v-else class="app-admin-wrapper">
      <router-view />
    </div>
  </div>
</template>

