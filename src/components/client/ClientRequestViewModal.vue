<script setup>
import { ref, watch } from 'vue'
import { useI18n } from '../../i18n/useI18n'
import { useStatusLabel } from '../../composables/useStatusLabel'
import { useFormatting } from '../../composables/useFormatting'
import { useFileDownload } from '../../composables/useFileDownload'
import {
  getEvaluationRequestById,
  downloadReport,
  downloadDocument,
  exportEvaluationRequestToWord,
} from '../../api/evaluationApi'
import LocationMapView from '../shared/LocationMapView.vue'

const props = defineProps({
  requestId: { type: String, default: null },
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const { statusLabel } = useStatusLabel()
const { formatDate, formatSum } = useFormatting()
const { triggerDownload } = useFileDownload()

const detail = ref(null)
const loading = ref(false)
const downloadError = ref('')

const hasLocation = ref(false)

async function load() {
  if (!props.requestId) return
  loading.value = true
  detail.value = null
  downloadError.value = ''
  try {
    detail.value = await getEvaluationRequestById(props.requestId)
    hasLocation.value = detail.value && detail.value.latitude != null && detail.value.longitude != null
  } catch {
    detail.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.show, props.requestId],
  ([show, id]) => {
    if (show && id) load()
  }
)

const doDownloadReport = async () => {
  if (!detail.value?.id) return
  downloadError.value = ''
  try {
    const { blob, fileName } = await downloadReport(detail.value.id)
    triggerDownload(blob, fileName)
  } catch {
    downloadError.value = t('client.formErrorSaveFailed') || 'Ошибка'
  }
}

const doDownloadWord = async () => {
  if (!detail.value?.id) return
  downloadError.value = ''
  try {
    const blob = await exportEvaluationRequestToWord(detail.value.id)
    const fileName = `evaluation-request-${detail.value.id}.docx`
    triggerDownload(blob, fileName)
  } catch {
    downloadError.value = t('client.downloadWordError') || 'Не удалось скачать Word'
  }
}

const doDownloadDocument = async (docId) => {
  downloadError.value = ''
  try {
    const { blob, fileName } = await downloadDocument(docId)
    triggerDownload(blob, fileName)
  } catch {
    downloadError.value = t('client.download') + ': ' + (t('client.formErrorSaveFailed') || 'Ошибка')
  }
}

function close() {
  emit('close')
}

</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="view-modal-overlay" @click.self="close">
      <div class="view-modal">
        <div class="view-modal__header">
          <div class="view-modal__header-content">
            <h2 class="view-modal__title">{{ t('client.viewModalTitle') }}</h2>
          </div>
          <div class="view-modal__header-actions">
            <button
              v-if="detail?.id && !loading"
              type="button"
              class="view-modal__header-btn"
              @click="doDownloadWord"
            >
              {{ t('client.downloadGeneralInfo') }}
            </button>
            <button type="button" class="view-modal__close" @click="close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="view-modal__body">
          <div v-if="downloadError" class="view-modal__error view-modal__error--top">
            {{ downloadError }}
            <button type="button" class="view-modal__error-close" @click="downloadError = ''">×</button>
          </div>
          <div v-if="loading" class="view-modal__loading">
            <span class="view-modal__spinner"></span>
            {{ t('client.loading') }}
          </div>
          <template v-else-if="detail">
            <div class="view-modal__block view-modal__block--data">
              <h3 class="view-modal__block-title">{{ t('client.detailData') }}</h3>
              <div class="view-modal__grid">
              <div class="view-modal__row">
                <span class="view-modal__label">{{ t('client.detailStatus') }}</span>
                <span class="view-modal__status" :data-status="detail.status">{{ statusLabel(detail.status) }}</span>
              </div>
              <div v-if="detail.cost != null" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.detailCost') }}</span>
                <span class="view-modal__value">{{ formatSum(detail.cost) }} сум</span>
              </div>
              <div class="view-modal__row">
                <span class="view-modal__label">{{ t('client.detailDescription') }}</span>
                <p class="view-modal__desc">{{ detail.objectDescription || '—' }}</p>
              </div>
              <div v-if="detail.appraisedObjectName" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.tableAppraisedObject') }}</span>
                <span class="view-modal__value">{{ detail.appraisedObjectName }}</span>
              </div>
              <div v-if="detail.borrowerName" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.tableBorrower') }}</span>
                <span class="view-modal__value">{{ detail.borrowerName }}</span>
              </div>
              <div v-if="detail.cadastralNumber" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.modalCadastralNumber') }}</span>
                <span class="view-modal__value">{{ detail.cadastralNumber }}</span>
              </div>
              <div v-if="detail.licensePlate" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.tableLicensePlate') }}</span>
                <span class="view-modal__value">{{ detail.licensePlate }}</span>
              </div>
              <div v-if="detail.propertyOwnerName" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.fixedAssets.propertyOwnerName') }}</span>
                <span class="view-modal__value">{{ detail.propertyOwnerName }}</span>
              </div>
              <div v-if="detail.objectAddress" class="view-modal__row">
                <span class="view-modal__label">{{ t('client.fixedAssets.objectAddress') }}</span>
                <span class="view-modal__value">{{ detail.objectAddress }}</span>
              </div>
              <div class="view-modal__row">
                <span class="view-modal__label">{{ t('client.tableCreatedAt') }}</span>
                <span class="view-modal__value">{{ formatDate(detail.createdAt) }}</span>
              </div>
              </div>
            </div>

            <div class="view-modal__divider"></div>

            <div class="view-modal__cards-row">
              <div class="view-modal__section view-modal__section--card">
                <h3 class="view-modal__section-title">
                  <span class="view-modal__section-icon">📎</span>
                  {{ t('client.viewModalCompanyDocs') }}
                </h3>
                <ul v-if="detail.documents?.length" class="view-modal__doc-list">
                  <li v-for="doc in detail.documents" :key="doc.id" class="view-modal__doc-item">
                    <span>{{ doc.fileName }}</span>
                    <button type="button" class="view-modal__link" @click="doDownloadDocument(doc.id)">
                      {{ t('client.download') }}
                    </button>
                  </li>
                </ul>
                <p v-else class="view-modal__muted">{{ t('client.noDocuments') }}</p>
              </div>

              <div class="view-modal__section view-modal__section--card">
                <h3 class="view-modal__section-title">
                  <span class="view-modal__section-icon">📋</span>
                  {{ t('client.reportTitle') }}
                </h3>
                <p v-if="downloadError" class="view-modal__error">{{ downloadError }}</p>
                <p v-if="!detail.hasReportFile" class="view-modal__muted view-modal__muted--small">{{ t('client.reportDownloadHint') }}</p>
                <button
                  v-if="detail.hasReportFile"
                  type="button"
                  class="view-modal__btn view-modal__btn--primary"
                  @click="doDownloadReport"
                >
                  {{ t('client.downloadReport') }}
                </button>
              </div>
            </div>

            <div class="view-modal__divider"></div>

            <div class="view-modal__section view-modal__section--location">
              <h3 class="view-modal__section-title view-modal__section-title--bold">
                <span class="view-modal__section-icon">📍</span>
                {{ t('client.location') }}
              </h3>
              <template v-if="hasLocation">
                <LocationMapView
                  :lat="Number(detail.latitude)"
                  :lng="Number(detail.longitude)"
                  :address="detail.locationAddress || ''"
                  height="320px"
                />
              </template>
              <p v-else class="view-modal__muted view-modal__muted--block">{{ t('client.locationNotSet') }}</p>
            </div>
          </template>
          <div v-else-if="!loading" class="view-modal__empty">{{ t('client.notFound') }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.view-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 24px;
  animation: viewModalFadeIn 0.3s ease;
}

@keyframes viewModalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.view-modal {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 32px 64px -12px rgba(26, 26, 46, 0.25), 0 0 0 1px rgba(111, 66, 193, 0.06);
  animation: viewModalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes viewModalSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.view-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #6f42c1 0%, #5a32a8 100%);
  color: #fff;
}

.view-modal__header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.view-modal__icon {
  font-size: 1.5rem;
  opacity: 0.95;
}

.view-modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
}

.view-modal__header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-modal__header-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.view-modal__header-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.7);
}

.view-modal__header-btn--outline {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.6);
}

.view-modal__header-btn--outline:hover {
  background: rgba(255, 255, 255, 0.15);
}

.view-modal__close {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.view-modal__close svg {
  width: 20px;
  height: 20px;
}

.view-modal__close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.view-modal__body {
  padding: 2rem;
  overflow-y: auto;
}

.view-modal__loading,
.view-modal__empty {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
}

.view-modal__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.view-modal__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #6f42c1;
  border-radius: 50%;
  animation: viewModalSpin 0.8s linear infinite;
}

@keyframes viewModalSpin {
  to { transform: rotate(360deg); }
}

.view-modal__section {
  margin-bottom: 1.25rem;
}

.view-modal__cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 560px) {
  .view-modal__cards-row {
    grid-template-columns: 1fr;
  }
}

.view-modal__section:last-child {
  margin-bottom: 0;
}

.view-modal__block--data {
  padding-bottom: 1.5rem;
}

.view-modal__block-title {
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.view-modal__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
}

.view-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 2rem;
}

@media (max-width: 560px) {
  .view-modal__grid {
    grid-template-columns: 1fr;
  }
}

.view-modal__section--card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 2px solid #e2e8f0;
}

.view-modal__section--card .view-modal__section-title {
  font-weight: 700;
  color: #000;
}

.view-modal__section--location {
  padding: 1.5rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-top: 0.5rem;
}

.view-modal__section--location .view-modal__section-title {
  margin-bottom: 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #000;
}

.view-modal__section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.75rem;
}

.view-modal__section-title--bold {
  font-weight: 700;
  color: #000;
  margin-bottom: 1rem;
}

.view-modal__section-icon {
  font-size: 1rem;
  opacity: 0.9;
}

.view-modal__row {
  margin-bottom: 0.75rem;
}

.view-modal__row:last-child {
  margin-bottom: 0;
}

.view-modal__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.3rem;
}

.view-modal__value,
.view-modal__desc {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #111;
  line-height: 1.5;
}

.view-modal__status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  display: inline-block;
}

.view-modal__status[data-status="CANCELLED"] { background: #fef2f2; color: #b91c1c; }
.view-modal__status[data-status="NOT_REVIEWED"],
.view-modal__status[data-status="IN_PROGRESS"],
.view-modal__status[data-status="ASSIGNED_TO_APPRAISER"] { background: #fff7ed; color: #c2410c; }
.view-modal__status[data-status="REPORT_READY"],
.view-modal__status[data-status="COMPLETED"],
.view-modal__status[data-status="APPROVED"] { background: #f0fdf4; color: #15803d; }

.view-modal__doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.view-modal__doc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.view-modal__doc-item:last-child {
  border-bottom: none;
}

.view-modal__link {
  background: none;
  border: none;
  color: #6f42c1;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.view-modal__link:hover {
  background: rgba(111, 66, 193, 0.1);
  color: #5a32a8;
}

.view-modal__muted { color: #9ca3af; font-size: 0.9rem; margin: 0; }
.view-modal__muted--block {
  padding: 2rem;
  text-align: center;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-weight: 500;
}
.view-modal__error { color: #b91c1c; font-size: 0.85rem; margin: 0 0 0.5rem; }

.view-modal__error--top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
}

.view-modal__error-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0 0.25rem;
}

.view-modal__error-close:hover { opacity: 1; }

.view-modal__muted--small { font-size: 0.8125rem; margin: 0.5rem 0 0; }

.view-modal__btn {
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.view-modal__btn--primary {
  background: linear-gradient(135deg, #6f42c1 0%, #5a32a8 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(111, 66, 193, 0.3);
}

.view-modal__btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(111, 66, 193, 0.4);
}

.view-modal__btn--secondary {
  background: #fff;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.view-modal__btn--secondary:hover {
  background: #f9fafb;
  border-color: #6f42c1;
  color: #6f42c1;
}

.view-modal__btn--outline {
  background: #fff;
  color: #5a32a8;
  border: 2px solid #6f42c1;
}

.view-modal__btn--outline:hover {
  background: #f5f0fa;
  border-color: #5a32a8;
}

.view-modal__report-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}
</style>
