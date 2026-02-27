<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAuth } from '../../utils/auth'
import { useI18n } from '../../i18n/useI18n'
import { useStatusLabel } from '../../composables/useStatusLabel'
import { useFileDownload } from '../../composables/useFileDownload'
import {
  getEvaluationRequestById,
  updateEvaluationRequest,
  uploadReport,
  uploadDocument,
  confirmCompletion,
  downloadReport,
  downloadDocument,
  deleteReport,
  deleteEvaluationRequest,
  getStatuses,
} from '../../api/evaluationApi'
import { getRegions, getDistrictsByRegion } from '../../api/regionsApi'
import { getAppraisalPurposes } from '../../api/appraisalPurposesApi'
import { useAppraisalPurpose } from '../../composables/useAppraisalPurpose'
import LocationMapPicker from '../../components/shared/LocationMapPicker.vue'
import { useReportQr } from '../../composables/useReportQr'

const { t } = useI18n()
const { purposeName } = useAppraisalPurpose()
const route = useRoute()
const { statusLabel } = useStatusLabel()
const { triggerDownload } = useFileDownload()
const id = computed(() => route.params.id)
const { qrUrl, qrLoading: qrLoadingState } = useReportQr(id)
const detail = ref(null)
const statuses = ref([])
const loading = ref(true)
const saving = ref(false)
const reportLoading = ref(false)
const deletingReport = ref(false)
const deletingRequest = ref(false)
const docLoading = ref(false)
const saveError = ref('')
const fileInputReport = ref(null)
const fileInputDoc = ref(null)

const regions = ref([])
const districts = ref([])
const appraisalPurposes = ref([])

const editForm = ref({
  status: '',
  objectDescription: '',
  appraisedObjectName: '',
  borrowerName: '',
  cost: null,
  regionId: '',
  districtId: '',
  location: { lat: null, lng: null, address: '' },
})

const load = async () => {
  loading.value = true
  try {
    detail.value = await getEvaluationRequestById(id.value)
    editForm.value = {
      status: detail.value.status,
      objectDescription: detail.value.objectDescription ?? '',
      appraisedObjectName: detail.value.appraisedObjectName ?? '',
      borrowerName: detail.value.borrowerName ?? '',
      cost: detail.value.cost,
      regionId: detail.value.regionId ?? '',
      districtId: detail.value.districtId ?? '',
      location: {
        lat: detail.value.latitude != null ? Number(detail.value.latitude) : null,
        lng: detail.value.longitude != null ? Number(detail.value.longitude) : null,
        address: detail.value.locationAddress ?? '',
      },
    }
    if (detail.value.regionId) {
      try {
        districts.value = await getDistrictsByRegion(detail.value.regionId)
      } catch {
        districts.value = []
      }
    } else {
      districts.value = []
    }
  } catch (e) {
    detail.value = null
  } finally {
    loading.value = false
  }
}

watch(
    () => editForm.value.regionId,
    async (regionId) => {
      editForm.value.districtId = ''
      if (!regionId) {
        districts.value = []
        return
      }
      try {
        districts.value = await getDistrictsByRegion(regionId)
      } catch {
        districts.value = []
      }
    }
)

const appraisalPurposeLabel = (code) => {
  if (!code) return ''
  const p = appraisalPurposes.value?.find((x) => x.code === code)
  return p ? purposeName(p) : code
}

const clientDocuments = computed(() =>
    (detail.value?.documents ?? []).filter((d) => d.fromClient === true)
)
const companyDocuments = computed(() =>
    (detail.value?.documents ?? []).filter((d) => d.fromClient !== true)
)

/** Может редактировать: админ — всегда; сотрудник компании — если админ дал право */
const canEdit = computed(() => {
  const auth = getAuth()
  if (auth.role === 'ADMIN') return true
  if (auth.role === 'COMPANY_EMPLOYEE') return auth.canEditEvaluationRequests !== false
  return false
})

/** Может удалять: админ — всегда; сотрудник компании — если админ дал право */
const canDelete = computed(() => {
  const auth = getAuth()
  if (auth.role === 'ADMIN') return true
  if (auth.role === 'COMPANY_EMPLOYEE') return auth.canDeleteEvaluationRequests !== false
  return false
})

onMounted(async () => {
  try {
    const [s, r, purposes] = await Promise.all([getStatuses(), getRegions(), getAppraisalPurposes()])
    statuses.value = s || []
    regions.value = r || []
    appraisalPurposes.value = purposes || []
  } catch {
    statuses.value = []
    regions.value = []
    appraisalPurposes.value = []
  }
  await load()
})

const save = async () => {
  saving.value = true
  saveError.value = ''
  try {
    await updateEvaluationRequest(id.value, {
      status: editForm.value.status,
      objectDescription: editForm.value.objectDescription || null,
      appraisedObjectName: editForm.value.appraisedObjectName?.trim() || null,
      borrowerName: editForm.value.borrowerName?.trim() || null,
      cost: editForm.value.cost != null && editForm.value.cost !== '' ? Number(editForm.value.cost) : null,
      latitude: editForm.value.location?.lat != null ? editForm.value.location.lat : null,
      longitude: editForm.value.location?.lng != null ? editForm.value.location.lng : null,
      locationAddress: editForm.value.location?.address?.trim() || null,
      regionId: editForm.value.regionId,
      districtId: editForm.value.districtId,
    })
    await load()
  } catch (e) {
    saveError.value = e.response?.data?.message || t('client.formErrorSaveFailed') || 'Не удалось сохранить'
  } finally {
    saving.value = false
  }
}

const onReportFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  reportLoading.value = true
  saveError.value = ''
  try {
    await uploadReport(id.value, file)
    await load()
    if (fileInputReport.value) fileInputReport.value.value = ''
  } catch (err) {
    saveError.value = err.response?.data?.message || t('company.uploadReport') + ': ошибка'
  } finally {
    reportLoading.value = false
  }
}

const onDeleteReport = async () => {
  if (!detail.value?.hasReportFile) return
  if (!confirm(t('company.deleteReportConfirm') || 'Удалить отчёт?')) return
  deletingReport.value = true
  saveError.value = ''
  try {
    await deleteReport(id.value)
    await load()
  } catch (err) {
    saveError.value = err.response?.data?.message || t('company.deleteReportError') || 'Не удалось удалить отчёт'
  } finally {
    deletingReport.value = false
  }
}

const onDocFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  docLoading.value = true
  saveError.value = ''
  try {
    await uploadDocument(id.value, file)
    await load()
    if (fileInputDoc.value) fileInputDoc.value.value = ''
  } catch (err) {
    saveError.value = err.response?.data?.message || t('company.addDoc') + ': ошибка'
  } finally {
    docLoading.value = false
  }
}

const confirmComplete = async () => {
  if (!confirm(t('company.confirmCompletionConfirm'))) return
  saveError.value = ''
  try {
    await confirmCompletion(id.value)
    await load()
  } catch (e) {
    saveError.value = e.response?.data?.message || 'Ошибка'
  }
}

const doDownloadReport = async () => {
  try {
    const { blob, fileName } = await downloadReport(id.value)
    triggerDownload(blob, fileName)
  } catch {
    saveError.value = t('company.downloadReport') + ': ошибка'
  }
}

const doDownloadDocument = async (docId) => {
  try {
    const { blob, fileName } = await downloadDocument(docId)
    triggerDownload(blob, fileName)
  } catch {
    saveError.value = t('client.download') + ': ошибка'
  }
}

const onDeleteRequest = async () => {
  if (!confirm(t('company.deleteRequestConfirm') || 'Удалить заявку? Это действие нельзя отменить.')) return
  deletingRequest.value = true
  saveError.value = ''
  try {
    await deleteEvaluationRequest(id.value)
    window.location.href = '/company/requests'
  } catch (err) {
    saveError.value = err.response?.data?.message || t('company.deleteRequestError') || 'Не удалось удалить заявку'
  } finally {
    deletingRequest.value = false
  }
}
</script>

<template>
  <div class="request-detail">
    <!-- Навигация -->
    <div class="request-detail__nav">
      <router-link :to="{ name: 'company-requests' }" class="request-detail__back-link">
        <i class="bi bi-arrow-left request-detail__back-icon"></i>
        <span>{{ t('company.detailBack') }}</span>
      </router-link>
    </div>

    <!-- Заголовок -->
    <header class="request-detail__header">
      <h1 class="request-detail__title">{{ t('company.detailTitle') }}</h1>
      <div v-if="detail" class="request-detail__status-badge" :class="`request-detail__status-badge--${detail.status?.toLowerCase()}`">
        {{ statusLabel(detail.status) }}
      </div>
    </header>

    <!-- Состояния загрузки/ошибки -->
    <div v-if="loading" class="request-detail__state request-detail__state--loading">
      <div class="request-detail__spinner"></div>
      <p>{{ t('company.loading') }}</p>
    </div>

    <div v-else-if="!detail" class="request-detail__state request-detail__state--empty">
      <i class="bi bi-exclamation-circle" style="font-size: 3rem;"></i>
      <p>{{ t('client.notFound') }}</p>
    </div>

    <template v-else>
      <!-- Основной контент - сетка из двух колонок -->
      <div class="request-detail__grid">
        <!-- Левая колонка: редактирование -->
        <div class="request-detail__main">
          <section class="request-detail__section">
            <h2 class="request-detail__section-title">
              <i class="bi bi-person"></i>
              {{ t('company.detailData') }}
            </h2>

            <div v-if="!canEdit" class="request-detail__no-access">
              <i class="bi bi-shield-lock request-detail__no-access-icon"></i>
              <p class="request-detail__no-access-text">{{ t('company.noEditAccess') || 'У вас нет прав на редактирование заявок.' }}</p>
              <p class="request-detail__no-access-hint">{{ t('company.noEditAccessHint') || 'Обратитесь к администратору для получения доступа.' }}</p>
            </div>

            <div v-else class="request-detail__form">
              <!-- Статус -->
              <div class="request-detail__field">
                <label class="request-detail__label">{{ t('company.detailStatus') }}</label>
                <select v-model="editForm.status" class="form-select">
                  <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
                </select>
              </div>

              <!-- Название объекта -->
              <div class="request-detail__field">
                <label class="request-detail__label">{{ t('company.detailAppraisedObjectName') }}</label>
                <input
                    v-model="editForm.appraisedObjectName"
                    type="text"
                    class="form-control"
                    :placeholder="t('company.detailAppraisedObjectNamePlaceholder')"
                />
              </div>

              <!-- Заемщик -->
              <div class="request-detail__field">
                <label class="request-detail__label">{{ t('company.detailBorrowerName') }}</label>
                <input
                    v-model="editForm.borrowerName"
                    type="text"
                    class="form-control"
                    :placeholder="t('company.detailBorrowerNamePlaceholder')"
                />
              </div>

              <!-- Описание -->
              <div class="request-detail__field">
                <label class="request-detail__label">{{ t('company.detailDescription') }}</label>
                <textarea
                    v-model="editForm.objectDescription"
                    class="form-control"
                    rows="3"
                    :placeholder="t('company.detailDescriptionPlaceholder')"
                />
              </div>

              <!-- Стоимость -->
              <div class="request-detail__field">
                <label class="request-detail__label">{{ t('company.detailCostLabel') }}</label>
                <div class="request-detail__input-wrapper">
                  <input
                      v-model="editForm.cost"
                      type="number"
                      min="0"
                      step="1"
                      class="form-control request-detail__input--with-suffix"
                      :placeholder="t('company.detailCostLabel')"
                  />
                  <span class="request-detail__input-suffix">сум</span>
                </div>
              </div>

              <!-- Регион и район -->
              <div class="request-detail__row">
                <div class="request-detail__field request-detail__field--half">
                  <label class="request-detail__label">{{ t('company.region') }}</label>
                  <select v-model="editForm.regionId" class="form-select">
                    <option value="">{{ t('client.allStatuses') }}</option>
                    <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.nameUz || r.nameRu }}</option>
                  </select>
                </div>
                <div class="request-detail__field request-detail__field--half">
                  <label class="request-detail__label">{{ t('company.district') }}</label>
                  <select v-model="editForm.districtId" class="form-select" :disabled="!editForm.regionId">
                    <option value="">{{ t('client.allStatuses') }}</option>
                    <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.nameUz || d.nameRu }}</option>
                  </select>
                </div>
              </div>

              <!-- Местоположение на карте -->
              <div class="request-detail__field">
                <label class="request-detail__label">{{ t('company.locationLabel') }}</label>
                <div class="request-detail__map-container">
                  <LocationMapPicker
                      v-model="editForm.location"
                      :readonly="false"
                      height="280px"
                      :hint="t('company.locationPickHint')"
                      :loading-text="t('company.locationLoadingAddress')"
                  />
                  <input
                      v-model="editForm.location.address"
                      type="text"
                      class="form-control request-detail__input--map-address"
                      :placeholder="t('company.locationAddressPlaceholder')"
                  />
                </div>
              </div>

              <!-- Отчёт об оценке -->
              <div class="request-detail__field request-detail__field--report">
                <div class="request-detail__report-header">
                  <label class="request-detail__label">{{ t('company.reportTitle') }}</label>
                  <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      :disabled="reportLoading"
                      @click="fileInputReport?.click()"
                  >
                    <span v-if="reportLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    <i v-else class="bi bi-upload"></i>
                    <span>{{ reportLoading ? t('company.loading') : t('company.uploadReport') }}</span>
                  </button>
                </div>
                <input
                    ref="fileInputReport"
                    type="file"
                    class="request-detail__file-input"
                    @change="onReportFileChange"
                    :disabled="reportLoading"
                />
                <div v-if="detail.hasReportFile" class="request-detail__report-info">
                  <div class="request-detail__report-main">
                    <i class="bi bi-file-earmark-text"></i>
                    <div class="request-detail__report-text">
                      <span class="request-detail__report-name">
                        {{ detail.reportFileName || t('company.reportUploadedHint') }}
                      </span>
                      <button
                          type="button"
                          class="btn btn-link btn-sm p-0"
                          @click="doDownloadReport"
                      >
                        {{ t('company.downloadReport') }}
                      </button>
                    </div>
                  </div>
                  <button
                      type="button"
                      class="btn btn-danger btn-sm"
                      :disabled="deletingReport"
                      @click="onDeleteReport"
                      title="Удалить отчёт"
                  >
                    <span v-if="deletingReport" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <!-- Сообщение об ошибке -->
              <div v-if="saveError" class="request-detail__error">
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ saveError }}
              </div>

              <!-- Кнопки сохранения и удаления -->
              <div class="request-detail__form-actions">
                <button
                    type="button"
                    class="btn btn-primary request-detail__btn-save"
                    :disabled="saving"
                    @click="save"
                >
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <span>{{ saving ? t('company.saving') : t('company.save') }}</span>
                </button>
                <button
                    v-if="canDelete"
                    type="button"
                    class="btn btn-danger"
                    :disabled="deletingRequest"
                    @click="onDeleteRequest"
                >
                  <span v-if="deletingRequest" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-trash"></i>
                  <span>{{ deletingRequest ? t('company.loading') : (t('company.deleteRequest') || 'Удалить заявку') }}</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- Правая колонка: информация о клиенте и документы -->
        <div class="request-detail__sidebar">
          <!-- Информация о клиенте -->
          <section class="request-detail__section request-detail__section--compact">
            <h2 class="request-detail__section-title">
              <i class="bi bi-person"></i>
              {{ t('company.detailClient') }}
            </h2>

            <div class="request-detail__info-list">
              <div class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('company.detailClient') }}</span>
                <span class="request-detail__info-value">{{ detail.clientFullName }}</span>
                <span class="request-detail__info-sub">{{ detail.clientEmail }}</span>
              </div>

              <div v-if="detail.cadastralNumber" class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('client.modalCadastralNumber') }}</span>
                <span class="request-detail__info-value">{{ detail.cadastralNumber }}</span>
              </div>

              <div v-if="detail.appraisalPurpose" class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('client.modalAppraisalPurpose') }}</span>
                <span class="request-detail__info-value">{{ appraisalPurposeLabel(detail.appraisalPurpose) }}</span>
              </div>

              <div v-if="detail.ownerPhone" class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('client.modalOwnerPhone') }}</span>
                <span class="request-detail__info-value">{{ detail.ownerPhone }}</span>
              </div>

              <div v-if="detail.bankEmployeePhone" class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('client.modalBankPhone') }}</span>
                <span class="request-detail__info-value">{{ detail.bankEmployeePhone }}</span>
              </div>

              <div v-if="detail.borrowerInn" class="request-detail__info-item">
                <span class="request-detail__info-label">{{ t('client.modalBorrowerInn') }}</span>
                <span class="request-detail__info-value">{{ detail.borrowerInn }}</span>
              </div>
            </div>
          </section>

          <!-- QR-код для просмотра PDF-отчёта -->
          <section class="request-detail__section request-detail__section--compact request-detail__section--qr">
            <h2 class="request-detail__section-title">
              <i class="bi bi-qr-code"></i>
              {{ t('company.qrReportTitle') || 'QR-код для просмотра отчёта' }}
            </h2>
            <div v-if="qrLoadingState" class="request-detail__qr-loading">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              <span>{{ t('company.loading') }}</span>
            </div>
            <div v-else-if="qrUrl" class="request-detail__qr-block">
              <img :src="qrUrl" alt="QR-код" class="request-detail__qr-image" />
              <p class="request-detail__qr-hint">{{ t('company.qrReportHint') || 'Сканируйте камерой для просмотра PDF на телефоне или планшете' }}</p>
            </div>
          </section>

          <!-- Документы клиента -->
          <section v-if="clientDocuments.length" class="request-detail__section request-detail__section--compact">
            <h2 class="request-detail__section-title">
              <i class="bi bi-folder2-open"></i>
              {{ t('company.attachedFiles') }}
            </h2>

            <ul class="request-detail__file-list">
              <li v-for="doc in clientDocuments" :key="doc.id" class="request-detail__file-item">
                <div class="request-detail__file-info">
                  <i class="bi bi-file-earmark"></i>
                  <span class="request-detail__file-name">{{ doc.fileName }}</span>
                </div>
                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    @click="doDownloadDocument(doc.id)"
                    title="Скачать"
                >
                  <i class="bi bi-download"></i>
                </button>
              </li>
            </ul>
          </section>

          <!-- Завершение заявки (только при наличии прав) -->
          <section v-if="canEdit && (detail.status === 'REPORT_READY' || detail.status === 'COMPLETED')" class="request-detail__section request-detail__section--compact">
            <div v-if="detail.status !== 'COMPLETED'" class="request-detail__completion">
              <p class="request-detail__completion-text">{{ t('company.completionHint') }}</p>
              <button
                  type="button"
                  class="btn btn-success w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  @click="confirmComplete"
              >
                <i class="bi bi-check-circle"></i>
                {{ t('company.confirmCompletion') }}
              </button>
            </div>
            <div v-else class="request-detail__completed">
              <i class="bi bi-check-circle-fill"></i>
              <span>{{ t('company.completed') }}</span>
            </div>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.request-detail {
  max-width: var(--content-max-width, 1570px);
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  color: #1e293b;
  background: #f8fafc;
  min-height: 100vh;
}

/* Навигация */
.request-detail__nav {
  margin-bottom: 2rem;
}

.request-detail__back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.request-detail__back-link:hover {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.request-detail__back-icon {
  transition: transform 0.2s;
}

.request-detail__back-link:hover .request-detail__back-icon {
  transform: translateX(-4px);
}

/* Заголовок */
.request-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.request-detail__title {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f172a;
  margin: 0;
}

.request-detail__status-badge {
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.request-detail__status-badge--new { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
.request-detail__status-badge--assigned { background: #fef9c3; color: #854d0e; border-color: #fde047; }
.request-detail__status-badge--in_progress { background: #e0f2fe; color: #075985; border-color: #bae6fd; }
.request-detail__status-badge--report_ready { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.request-detail__status-badge--completed { background: #f1f5f9; color: #334155; border-color: #e2e8f0; }
.request-detail__status-badge--cancelled { background: #fee2e2; color: #991b1b; border-color: #fecaca; }

/* Состояния */
.request-detail__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.request-detail__state svg {
  margin-bottom: 1rem;
  color: #94a3b8;
}

.request-detail__state p {
  margin: 0;
  font-size: 1rem;
}

.request-detail__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Сетка */
.request-detail__grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
}

/* Секции */
.request-detail__section {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);
  transition: box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}

.request-detail__section:hover {
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);
}

.request-detail__section--compact {
  padding: 1.25rem;
}

.request-detail__section + .request-detail__section {
  margin-top: 1.5rem;
}

/* Нет прав на редактирование */
.request-detail__no-access {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  border-left: 4px solid #64748b;
}

.request-detail__no-access-icon {
  font-size: 2.5rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.request-detail__no-access-text {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
}

.request-detail__no-access-hint {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.request-detail__section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.request-detail__section-title svg {
  color: var(--color-primary);
}

/* Форма */
.request-detail__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.request-detail__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.request-detail__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.request-detail__field--half {
  width: 100%;
}

.request-detail__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.request-detail__input,
.request-detail__select,
.request-detail__textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #1e293b;
  background: #ffffff;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.request-detail__input:hover,
.request-detail__select:hover,
.request-detail__textarea:hover {
  border-color: #cbd5e1;
}

.request-detail__input:focus,
.request-detail__select:focus,
.request-detail__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.request-detail__textarea {
  resize: vertical;
  min-height: 80px;
}

.request-detail__select:disabled {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Поле с суффиксом */
.request-detail__input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.request-detail__input--with-suffix {
  padding-right: 4rem;
}

.request-detail__input-suffix {
  position: absolute;
  right: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
  pointer-events: none;
  background: #ffffff;
  padding-left: 0.5rem;
}

/* Карта */
.request-detail__map-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 1rem;
  background: #f8fafc;
}

.request-detail__input--map-address {
  background: #ffffff;
}

/* Отчёт */
.request-detail__field--report {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.request-detail__report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.request-detail__report-header .request-detail__label {
  margin: 0;
}

.request-detail__file-input {
  display: none;
}

.request-detail__report-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #475569;
  border: 1px solid #e2e8f0;
}

/* Кнопки */
.request-detail__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #334155;
  white-space: nowrap;
}

.request-detail__btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.request-detail__btn:active {
  transform: translateY(0);
}

.request-detail__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.request-detail__btn--primary {
  background: #0f172a;
  color: #ffffff;
}

.request-detail__btn--primary:hover {
  background: #1e293b;
  box-shadow: 0 4px 6px -1px rgba(15,23,42,0.1);
}

.request-detail__btn--success {
  background: #10b981;
  color: #ffffff;
}

.request-detail__btn--success:hover {
  background: #059669;
  box-shadow: 0 4px 6px -1px rgba(16,185,129,0.1);
}

.request-detail__btn--outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.request-detail__btn--outline:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.request-detail__btn--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.813rem;
}

.request-detail__btn--icon {
  padding: 0.5rem;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
}

.request-detail__btn--icon:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.request-detail__btn--full {
  width: 100%;
}

/* Информация в сайдбаре */
.request-detail__info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-detail__info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.request-detail__info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.request-detail__info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.request-detail__info-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f172a;
}

.request-detail__info-sub {
  font-size: 0.813rem;
  color: #64748b;
}

/* Список файлов */
.request-detail__file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.request-detail__file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.request-detail__file-item:hover {
  background: #ffffff;
  border-color: #e2e8f0;
}

.request-detail__file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.request-detail__file-info svg {
  flex-shrink: 0;
  color: #94a3b8;
}

.request-detail__file-name {
  font-size: 0.875rem;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Завершение */
.request-detail__completion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-detail__qr-loading {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.request-detail__qr-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.request-detail__qr-image {
  width: 256px;
  height: 256px;
  object-fit: contain;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.request-detail__qr-hint {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  line-height: 1.4;
}

.request-detail__form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.request-detail__btn-save {
  flex: 1;
  min-width: 140px;
}

.request-detail__completion-text {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

.request-detail__completed {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0fdf4;
  color: #166534;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Ошибка */
.request-detail__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 12px;
  font-size: 0.875rem;
  border: 1px solid #fee2e2;
}

/* Спиннер маленький */
.request-detail__spinner--small {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .request-detail__grid {
    grid-template-columns: 1fr;
  }

  .request-detail {
    padding: 1rem;
  }

  .request-detail__title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .request-detail__row {
    grid-template-columns: 1fr;
  }

  .request-detail__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .request-detail__section {
    padding: 1.25rem;
  }
}
</style>