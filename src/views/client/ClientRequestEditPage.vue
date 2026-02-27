<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth } from '../../utils/auth'
import { useI18n } from '../../i18n/useI18n'
import { useStatusLabel } from '../../composables/useStatusLabel'
import { useFileDownload } from '../../composables/useFileDownload'
import {
  getEvaluationRequestById,
  updateEvaluationRequest,
  uploadDocument,
  downloadDocument,
  deleteEvaluationRequest,
} from '../../api/evaluationApi'
import { getRegions, getDistrictsByRegion } from '../../api/regionsApi'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { statusLabel } = useStatusLabel()
const { triggerDownload } = useFileDownload()
const id = computed(() => route.params.id)
const detail = ref(null)
const loading = ref(true)
const saving = ref(false)
const deletingRequest = ref(false)
const docLoading = ref(false)
const saveError = ref('')
const fileInputDoc = ref(null)

const regions = ref([])
const districts = ref([])

const editForm = ref({
  cadastralNumber: '',
  appraisalPurpose: '',
  ownerPhone: '',
  bankEmployeePhone: '',
  borrowerInn: '',
  regionId: '',
  districtId: '',
  vehicleType: '',
  techPassportNumber: '',
  licensePlate: '',
  propertyOwnerName: '',
  objectAddress: '',
})

const backRoute = computed(() => {
  const rt = detail.value?.requestType || 'REAL_ESTATE'
  if (rt === 'VEHICLE') return { name: 'client-vehicle-requests' }
  if (rt === 'FIXED_ASSETS') return { name: 'client-fixed-assets-requests' }
  return { name: 'client-requests' }
})

const clientDocuments = computed(() =>
  (detail.value?.documents ?? []).filter((d) => d.fromClient === true)
)

const canEdit = computed(() => getAuth().canEditEvaluationRequests !== false)
const canDelete = computed(() => getAuth().canDeleteEvaluationRequests !== false)

const load = async () => {
  loading.value = true
  try {
    detail.value = await getEvaluationRequestById(id.value)
    editForm.value = {
      cadastralNumber: detail.value.cadastralNumber ?? '',
      appraisalPurpose: detail.value.appraisalPurpose ?? '',
      ownerPhone: detail.value.ownerPhone ?? '',
      bankEmployeePhone: detail.value.bankEmployeePhone ?? '',
      borrowerInn: detail.value.borrowerInn ?? '',
      regionId: detail.value.regionId ?? '',
      districtId: detail.value.districtId ?? '',
      vehicleType: detail.value.vehicleType ?? '',
      techPassportNumber: detail.value.techPassportNumber ?? '',
      licensePlate: detail.value.licensePlate ?? '',
      propertyOwnerName: detail.value.propertyOwnerName ?? '',
      objectAddress: detail.value.objectAddress ?? '',
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

function buildClientPayload() {
  const rt = detail.value?.requestType || 'REAL_ESTATE'
  if (rt === 'REAL_ESTATE') {
    return {
      cadastralNumber: editForm.value.cadastralNumber?.trim() || null,
      appraisalPurpose: editForm.value.appraisalPurpose?.trim() || null,
      ownerPhone: editForm.value.ownerPhone?.trim() || null,
      bankEmployeePhone: editForm.value.bankEmployeePhone?.trim() || null,
      borrowerInn: editForm.value.borrowerInn?.trim() || null,
      regionId: editForm.value.regionId || null,
      districtId: editForm.value.districtId || null,
    }
  }
  if (rt === 'VEHICLE') {
    return {
      vehicleType: editForm.value.vehicleType?.trim() || null,
      techPassportNumber: editForm.value.techPassportNumber?.trim() || null,
      licensePlate: editForm.value.licensePlate?.trim() || null,
      borrowerInn: editForm.value.borrowerInn?.trim() || null,
      appraisalPurpose: editForm.value.appraisalPurpose?.trim() || null,
      ownerPhone: editForm.value.ownerPhone?.trim() || null,
      bankEmployeePhone: editForm.value.bankEmployeePhone?.trim() || null,
    }
  }
  if (rt === 'FIXED_ASSETS') {
    return {
      propertyOwnerName: editForm.value.propertyOwnerName?.trim() || null,
      objectAddress: editForm.value.objectAddress?.trim() || null,
      ownerPhone: editForm.value.ownerPhone?.trim() || null,
      bankEmployeePhone: editForm.value.bankEmployeePhone?.trim() || null,
      appraisalPurpose: editForm.value.appraisalPurpose?.trim() || null,
      borrowerInn: editForm.value.borrowerInn?.trim() || null,
    }
  }
  return {}
}

onMounted(async () => {
  try {
    regions.value = await getRegions()
  } catch {
    regions.value = []
  }
  await load()
})

const save = async () => {
  saving.value = true
  saveError.value = ''
  try {
    const payload = buildClientPayload()
    await updateEvaluationRequest(id.value, payload)
    await load()
  } catch (e) {
    saveError.value = e.response?.data?.message || t('client.formErrorSaveFailed') || 'Не удалось сохранить'
  } finally {
    saving.value = false
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
    saveError.value = err.response?.data?.message || t('client.uploadDoc') + ': ошибка'
  } finally {
    docLoading.value = false
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
  if (!confirm(t('client.deleteRequestConfirm') || 'Удалить заявку? Это действие нельзя отменить.')) return
  deletingRequest.value = true
  saveError.value = ''
  try {
    await deleteEvaluationRequest(id.value)
    router.push(backRoute.value)
  } catch (err) {
    saveError.value = err.response?.data?.message || t('client.deleteRequestError') || 'Не удалось удалить заявку'
  } finally {
    deletingRequest.value = false
  }
}
</script>

<template>
  <div class="client-edit">
    <div class="client-edit__nav">
      <router-link :to="backRoute" class="client-edit__back-link">
        <i class="bi bi-arrow-left client-edit__back-icon"></i>
        <span>{{ t('client.detailBack') }}</span>
      </router-link>
    </div>

    <header class="client-edit__header">
      <h1 class="client-edit__title">{{ t('client.editRequestTitle') || 'Редактирование заявки' }}</h1>
      <div v-if="detail" class="client-edit__status-badge" :class="`client-edit__status-badge--${detail.status?.toLowerCase()}`">
        {{ statusLabel(detail.status) }}
      </div>
    </header>

    <div v-if="loading" class="client-edit__state client-edit__state--loading">
      <div class="client-edit__spinner"></div>
      <p>{{ t('client.loading') }}</p>
    </div>

    <div v-else-if="!detail" class="client-edit__state client-edit__state--empty">
      <i class="bi bi-exclamation-circle"></i>
      <p>{{ t('client.notFound') }}</p>
    </div>

    <template v-else>
      <div class="client-edit__form">
        <section class="client-edit__section">
          <h2 class="client-edit__section-title">{{ t('client.detailData') }}</h2>

          <!-- REAL_ESTATE: поля, заполняемые клиентом при создании -->
          <template v-if="detail.requestType === 'REAL_ESTATE'">
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalCadastralNumber') }}</label>
              <input v-model="editForm.cadastralNumber" type="text" class="form-control" :placeholder="t('client.modalCadastralPlaceholder')" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalAppraisalPurpose') }}</label>
              <input v-model="editForm.appraisalPurpose" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalOwnerPhone') }}</label>
              <input v-model="editForm.ownerPhone" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalBankPhone') }}</label>
              <input v-model="editForm.bankEmployeePhone" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalBorrowerInn') }}</label>
              <input v-model="editForm.borrowerInn" type="text" class="form-control" />
            </div>
            <div class="client-edit__row">
              <div class="client-edit__field client-edit__field--half">
                <label class="client-edit__label">{{ t('company.region') }}</label>
                <select v-model="editForm.regionId" class="form-select">
                  <option value="">{{ t('client.selectOption') }}</option>
                  <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.nameUz || r.nameRu }}</option>
                </select>
              </div>
              <div class="client-edit__field client-edit__field--half">
                <label class="client-edit__label">{{ t('company.district') }}</label>
                <select v-model="editForm.districtId" class="form-select" :disabled="!editForm.regionId">
                  <option value="">{{ t('client.selectOption') }}</option>
                  <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.nameUz || d.nameRu }}</option>
                </select>
              </div>
            </div>
          </template>

          <!-- VEHICLE: поля, заполняемые клиентом при создании -->
          <template v-else-if="detail.requestType === 'VEHICLE'">
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.vehicleType') }}</label>
              <input v-model="editForm.vehicleType" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.techPassportNumber') }}</label>
              <input v-model="editForm.techPassportNumber" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.tableLicensePlate') }}</label>
              <input v-model="editForm.licensePlate" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalBorrowerInn') }}</label>
              <input v-model="editForm.borrowerInn" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalAppraisalPurpose') }}</label>
              <input v-model="editForm.appraisalPurpose" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalOwnerPhone') }}</label>
              <input v-model="editForm.ownerPhone" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalBankPhone') }}</label>
              <input v-model="editForm.bankEmployeePhone" type="text" class="form-control" />
            </div>
          </template>

          <!-- FIXED_ASSETS: поля, заполняемые клиентом при создании -->
          <template v-else-if="detail.requestType === 'FIXED_ASSETS'">
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.fixedAssets.propertyOwnerName') }}</label>
              <input v-model="editForm.propertyOwnerName" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.fixedAssets.objectAddress') }}</label>
              <input v-model="editForm.objectAddress" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalOwnerPhone') }}</label>
              <input v-model="editForm.ownerPhone" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalBankPhone') }}</label>
              <input v-model="editForm.bankEmployeePhone" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalAppraisalPurpose') }}</label>
              <input v-model="editForm.appraisalPurpose" type="text" class="form-control" />
            </div>
            <div class="client-edit__field">
              <label class="client-edit__label">{{ t('client.modalBorrowerInn') }}</label>
              <input v-model="editForm.borrowerInn" type="text" class="form-control" />
            </div>
          </template>

          <!-- Документы -->
          <div class="client-edit__field">
            <div class="client-edit__doc-header">
              <label class="client-edit__label">{{ t('company.attachedFiles') }}</label>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                :disabled="docLoading"
                @click="fileInputDoc?.click()"
              >
                <span v-if="docLoading" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-upload"></i>
                <span>{{ docLoading ? t('client.loading') : t('company.addDoc') }}</span>
              </button>
            </div>
            <input ref="fileInputDoc" type="file" class="client-edit__file-input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" @change="onDocFileChange" />
            <ul v-if="clientDocuments.length" class="client-edit__file-list">
              <li v-for="doc in clientDocuments" :key="doc.id" class="client-edit__file-item">
                <span class="client-edit__file-name">{{ doc.fileName }}</span>
                <button type="button" class="btn btn-link btn-sm p-0" @click="doDownloadDocument(doc.id)">{{ t('client.download') }}</button>
              </li>
            </ul>
          </div>

          <div v-if="saveError" class="client-edit__error">
            <i class="bi bi-exclamation-circle-fill"></i>
            {{ saveError }}
          </div>

          <div class="client-edit__actions">
            <button v-if="canEdit" type="button" class="btn btn-primary client-edit__btn-save" :disabled="saving" @click="save">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <span>{{ saving ? t('company.saving') : t('company.save') }}</span>
            </button>
            <button v-if="canDelete" type="button" class="btn btn-danger" :disabled="deletingRequest" @click="onDeleteRequest">
              <span v-if="deletingRequest" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-trash"></i>
              <span>{{ deletingRequest ? t('client.loading') : (t('client.deleteRequest') || 'Удалить заявку') }}</span>
            </button>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.client-edit {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  color: #1e293b;
  background: #f8fafc;
  min-height: 100vh;
}

.client-edit__nav {
  margin-bottom: 2rem;
}

.client-edit__back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9375rem;
}

.client-edit__back-link:hover {
  color: #334155;
}

.client-edit__back-icon {
  font-size: 1.125rem;
}

.client-edit__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.client-edit__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.client-edit__status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.client-edit__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 2rem;
  color: #64748b;
}

.client-edit__spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.client-edit__section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.client-edit__section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1.25rem;
}

.client-edit__field {
  margin-bottom: 1.25rem;
}

.client-edit__field--half {
  flex: 1;
  min-width: 0;
}

.client-edit__row {
  display: flex;
  gap: 1rem;
}

.client-edit__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.375rem;
}

.client-edit__input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.client-edit__input--with-suffix {
  border: none;
  border-radius: 0;
}

.client-edit__input-suffix {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  font-size: 0.875rem;
  color: #64748b;
}

.client-edit__doc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.client-edit__file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
}

.client-edit__file-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

.client-edit__file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.client-edit__file-name {
  color: #334155;
}

.client-edit__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.client-edit__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.client-edit__btn-save {
  flex: 1;
  min-width: 140px;
}
</style>
