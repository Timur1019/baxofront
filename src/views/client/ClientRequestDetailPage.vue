<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'
import { useStatusLabel } from '../../composables/useStatusLabel'
import { useFileDownload } from '../../composables/useFileDownload'
import {
  getEvaluationRequestById,
  uploadDocument,
  downloadReport,
  downloadDocument,
} from '../../api/evaluationApi'
import LocationMapView from '../../components/shared/LocationMapView.vue'

const { t } = useI18n()
const route = useRoute()
const { statusLabel } = useStatusLabel()
const { triggerDownload } = useFileDownload()
const id = computed(() => route.params.id)
const detail = ref(null)
const loading = ref(true)
const uploadLoading = ref(false)
const uploadError = ref('')
const downloadError = ref('')
const fileInput = ref(null)
const showLocation = ref(false)

const load = async () => {
  loading.value = true
  try {
    detail.value = await getEvaluationRequestById(id.value)
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)

const onFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploadError.value = ''
  uploadLoading.value = true
  try {
    await uploadDocument(id.value, file)
    await load()
    if (fileInput.value) fileInput.value.value = ''
  } catch (err) {
    uploadError.value = err.response?.data?.message || 'Не удалось загрузить файл'
  } finally {
    uploadLoading.value = false
  }
}

const doDownloadReport = async () => {
  downloadError.value = ''
  try {
    const { blob, fileName } = await downloadReport(id.value)
    triggerDownload(blob, fileName)
  } catch {
    downloadError.value = t('client.downloadReport') + ': ' + (t('client.formErrorSaveFailed') || 'Ошибка')
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

const hasLocation = computed(() => {
  const d = detail.value
  return d && d.latitude != null && d.longitude != null
})
</script>

<template>
  <div class="client-detail-page">
    <router-link :to="{ name: 'client-requests' }" class="client-detail-page__back">← {{ t('client.detailBack') }}</router-link>

    <div v-if="loading" class="client-detail-page__loading">{{ t('client.loading') }}</div>
    <template v-else-if="detail">
      <h1 class="client-detail-page__title">{{ t('client.detailTitle') }}</h1>
      <div class="client-detail-page__card">
        <div class="client-detail-page__row">
          <span class="client-detail-page__label">{{ t('client.detailStatus') }}</span>
          <span class="client-detail-page__status" :data-status="detail.status">
            {{ statusLabel(detail.status) }}
          </span>
        </div>
        <div v-if="detail.cost != null" class="client-detail-page__row">
          <span class="client-detail-page__label">{{ t('client.detailCost') }}</span>
          <span class="client-detail-page__value">{{ Number(detail.cost).toLocaleString('ru-RU') }} сум</span>
        </div>
        <div class="client-detail-page__row">
          <span class="client-detail-page__label">{{ t('client.detailDescription') }}</span>
          <p class="client-detail-page__desc">{{ detail.objectDescription || '—' }}</p>
        </div>

        <div class="client-detail-page__section">
          <h3 class="client-detail-page__section-title">{{ t('client.documents') }}</h3>
          <input
            ref="fileInput"
            type="file"
            class="client-detail-page__file-input"
            @change="onFileChange"
            :disabled="uploadLoading"
          />
          <button
            type="button"
            class="client-detail-page__btn client-detail-page__btn--secondary"
            :disabled="uploadLoading"
            @click="fileInput?.click()"
          >
            {{ uploadLoading ? t('client.loading') : t('client.uploadDoc') }}
          </button>
          <p v-if="uploadError" class="client-detail-page__error">{{ uploadError }}</p>
          <ul v-if="detail.documents?.length" class="client-detail-page__doc-list">
            <li v-for="doc in detail.documents" :key="doc.id" class="client-detail-page__doc-item">
              <span>{{ doc.fileName }}</span>
              <button type="button" class="client-detail-page__link" @click="doDownloadDocument(doc.id)">
                {{ t('client.download') }}
              </button>
            </li>
          </ul>
          <p v-else class="client-detail-page__muted">{{ t('client.noDocuments') }}</p>
        </div>

        <div v-if="detail.hasReportFile" class="client-detail-page__section">
          <h3 class="client-detail-page__section-title">{{ t('client.reportTitle') }}</h3>
          <p v-if="downloadError" class="client-detail-page__error">{{ downloadError }}</p>
          <button type="button" class="client-detail-page__btn client-detail-page__btn--primary" @click="doDownloadReport">
            {{ t('client.downloadReport') }}
          </button>
        </div>

        <div v-if="hasLocation" class="client-detail-page__section">
          <h3 class="client-detail-page__section-title">{{ t('client.location') }}</h3>
          <button
            v-if="!showLocation"
            type="button"
            class="client-detail-page__btn client-detail-page__btn--secondary"
            @click="showLocation = true"
          >
            {{ t('client.showLocation') }}
          </button>
          <template v-else>
            <LocationMapView
              :lat="Number(detail.latitude)"
              :lng="Number(detail.longitude)"
              :address="detail.locationAddress || ''"
              height="320px"
            />
          </template>
        </div>
      </div>
    </template>
    <div v-else class="client-detail-page__empty">{{ t('client.notFound') }}</div>
  </div>
</template>

<style scoped>
.client-detail-page__back { display: inline-block; color: #4f46e5; text-decoration: none; margin-bottom: 1rem; font-size: 0.9rem; }
.client-detail-page__back:hover { text-decoration: underline; }
.client-detail-page__loading,
.client-detail-page__empty { padding: 2rem; text-align: center; color: #666; }
.client-detail-page__title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 1rem; }
.client-detail-page__card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); max-width: 640px; }
.client-detail-page__row { margin-bottom: 1rem; }
.client-detail-page__label { display: block; font-size: 0.8rem; color: #666; margin-bottom: 0.25rem; }
.client-detail-page__value,
.client-detail-page__desc { margin: 0; color: #333; }
.client-detail-page__status {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
}
.client-detail-page__status[data-status="CANCELLED"] { background: #fee2e2; color: #b91c1c; }
.client-detail-page__status[data-status="SUBMITTED"],
.client-detail-page__status[data-status="IN_PROGRESS"] { background: #ffedd5; color: #c2410c; }
.client-detail-page__status[data-status="REPORT_READY"],
.client-detail-page__status[data-status="COMPLETED"] { background: #dcfce7; color: #15803d; }
.client-detail-page__section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
.client-detail-page__section-title { font-size: 1rem; font-weight: 600; color: #1a1a2e; margin-bottom: 0.75rem; }
.client-detail-page__file-input { display: none; }
.client-detail-page__btn { padding: 0.5rem 1rem; border-radius: 8px; font-weight: 500; cursor: pointer; border: none; font-size: 0.9rem; margin-right: 0.5rem; margin-bottom: 0.5rem; }
.client-detail-page__btn--primary { background: #0f0d14; color: #fff; }
.client-detail-page__btn--secondary { background: #e5e7eb; color: #374151; }
.client-detail-page__error { color: #b91c1c; font-size: 0.85rem; margin-top: 0.5rem; }
.client-detail-page__doc-list { list-style: none; padding: 0; margin: 0.5rem 0 0; }
.client-detail-page__doc-item { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid #f0f0f0; }
.client-detail-page__link { background: none; border: none; color: #4f46e5; cursor: pointer; font-size: 0.85rem; }
.client-detail-page__muted { color: #999; font-size: 0.9rem; margin: 0.5rem 0 0; }
</style>
