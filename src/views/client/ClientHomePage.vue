<script setup>
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="client-home">
    <div class="client-home__placeholder">
      <div class="client-home__icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 12h48v40H8z" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 24h24M20 32h16M20 40h24" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="client-home__text">{{ t('client.chooseFromPanel') }}</p>
    </div>
  </div>
</template>

<style scoped>
.client-home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.client-home__placeholder {
  text-align: center;
  max-width: 360px;
}

.client-home__icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  color: #c4c8cc;
}

.client-home__icon svg {
  width: 100%;
  height: 100%;
}

.client-home__text {
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}
</style>
