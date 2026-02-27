<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from '../../i18n/useI18n'
import { useReportQr } from '../../composables/useReportQr'

const props = defineProps({
  requestId: { type: String, default: null },
})

const { t } = useI18n()
const show = ref(false)
const requestIdToLoad = computed(() => (show.value && props.requestId) ? props.requestId : null)
const { qrUrl, qrLoading, qrError } = useReportQr(requestIdToLoad)

watch(() => props.requestId, () => {
  if (!props.requestId) show.value = false
})

function toggle() {
  show.value = !show.value
}

function close() {
  show.value = false
}
</script>

<template>
  <div class="report-qr-trigger">
    <button
      type="button"
      class="report-qr-trigger__btn"
      :title="t('company.qrReportTitle') || 'QR-код отчёта'"
      @click.stop="toggle"
    >
      <i class="bi bi-qr-code"></i>
    </button>
    <Teleport to="body">
      <div v-if="show" class="report-qr-trigger__backdrop" @click="close">
        <div class="report-qr-trigger__popover" @click.stop>
          <button type="button" class="report-qr-trigger__close" @click="close" aria-label="Закрыть">
            <i class="bi bi-x-lg"></i>
          </button>
          <div v-if="qrError" class="report-qr-trigger__error">{{ qrError }}</div>
          <div v-else-if="qrLoading" class="report-qr-trigger__loading">
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            <span>{{ t('company.loading') }}</span>
          </div>
          <div v-else-if="qrUrl" class="report-qr-trigger__content">
            <img :src="qrUrl" alt="QR-код" class="report-qr-trigger__image" />
            <p class="report-qr-trigger__hint">{{ t('company.qrReportHint') || 'Сканируйте для просмотра PDF' }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.report-qr-trigger {
  display: inline-flex;
}

.report-qr-trigger__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-bg-card, #fff);
  color: var(--color-text-muted, #64748b);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-qr-trigger__btn:hover {
  background: var(--color-bg-hover, #f8fafc);
  color: var(--color-primary, #3b82f6);
  border-color: var(--color-primary, #3b82f6);
}

.report-qr-trigger__btn i {
  font-size: 1.25rem;
}

.report-qr-trigger__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.report-qr-trigger__popover {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 90vw;
}

.report-qr-trigger__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.report-qr-trigger__close:hover {
  background: #e2e8f0;
  color: #334155;
}

.report-qr-trigger__loading {
  display: flex;
  align-items: center;
  padding: 2rem 3rem;
  font-size: 0.9rem;
  color: #64748b;
}

.report-qr-trigger__error {
  padding: 2rem 3rem;
  font-size: 0.9rem;
  color: #b91c1c;
  background: #fef2f2;
  border-radius: 8px;
}

.report-qr-trigger__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.report-qr-trigger__image {
  width: 320px;
  height: 320px;
  object-fit: contain;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.report-qr-trigger__hint {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
}
</style>
