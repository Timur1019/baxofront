<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from '../../i18n/useI18n'
import { useStatusLabel } from '../../composables/useStatusLabel'
import { useFormatting } from '../../composables/useFormatting'
import { useFileDownload } from '../../composables/useFileDownload'
import { useAppraisalPurpose } from '../../composables/useAppraisalPurpose'
import { getMyEvaluationRequests, getStatuses, createEvaluationRequestWithDocument, downloadReport } from '../../api/evaluationApi'
import ClientRequestViewModal from '../../components/client/ClientRequestViewModal.vue'
import ReportQrTrigger from '../../components/shared/ReportQrTrigger.vue'
import { getAppraisalPurposes } from '../../api/appraisalPurposesApi'

const { t } = useI18n()
const { statusLabel } = useStatusLabel()
const { formatDate, formatSum } = useFormatting()
const { triggerDownload } = useFileDownload()
const { purposeName } = useAppraisalPurpose()

const list = ref([])
const loading = ref(true)
const totalElements = ref(0)
const currentPage = ref(0)
const pageSize = 20
const filterStatus = ref(null)
const filterSearch = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const statuses = ref([])
const appraisalPurposes = ref([])
const showAddModal = ref(false)
const showViewModal = ref(false)
const viewRequestId = ref(null)
const formLoading = ref(false)
const formError = ref('')

const form = ref({
  requestType: 'VEHICLE',
  vehicleType: '',
  techPassportNumber: '',
  licensePlate: '',
  borrowerInn: '',
  appraisalPurpose: '',
  ownerPhone: '',
  bankEmployeePhone: '',
})
const techPassportFile = ref(null)

const vehicleTypes = [
  { value: 'PASSENGER', labelKey: 'vehicleTypePassenger' },
  { value: 'TRUCK', labelKey: 'vehicleTypeTruck' },
  { value: 'SPECIAL', labelKey: 'vehicleTypeSpecial' },
  { value: 'OTHER', labelKey: 'vehicleTypeOther' },
]

async function loadFilters() {
  try {
    const [s, purposes] = await Promise.all([getStatuses(), getAppraisalPurposes()])
    statuses.value = s || []
    appraisalPurposes.value = purposes || []
  } catch {
    statuses.value = []
    appraisalPurposes.value = []
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getMyEvaluationRequests({
      page: currentPage.value,
      size: pageSize,
      requestType: 'VEHICLE',
      status: filterStatus.value || undefined,
      search: filterSearch.value?.trim() || undefined,
      dateFrom: filterDateFrom.value || undefined,
      dateTo: filterDateTo.value || undefined,
    })
    list.value = res.content ?? []
    totalElements.value = res.totalElements ?? 0
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFilters().then(load)
})

watch([currentPage, filterStatus, filterSearch, filterDateFrom, filterDateTo], () => {
  load()
})

function openAddModal() {
  form.value = {
    requestType: 'VEHICLE',
    vehicleType: '',
    techPassportNumber: '',
    licensePlate: '',
    borrowerInn: '',
    appraisalPurpose: '',
    ownerPhone: '',
    bankEmployeePhone: '',
  }
  techPassportFile.value = null
  formError.value = ''
  showAddModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeAddModal() {
  showAddModal.value = false
  document.body.style.overflow = ''
}

function onFileChange(e) {
  techPassportFile.value = e.target.files?.[0] || null
}

async function submitAdd() {
  if (!form.value.vehicleType?.trim() || !form.value.techPassportNumber?.trim() ||
      !form.value.licensePlate?.trim() || !form.value.appraisalPurpose?.trim() ||
      !form.value.ownerPhone?.trim() || !form.value.bankEmployeePhone?.trim()) {
    formError.value = t('client.formErrorFillRequired')
    return
  }
  if (!techPassportFile.value) {
    formError.value = t('client.formErrorUploadTechPassport')
    return
  }
  formLoading.value = true
  formError.value = ''
  try {
    const dto = {
      requestType: 'VEHICLE',
      vehicleType: form.value.vehicleType.trim(),
      techPassportNumber: form.value.techPassportNumber.trim(),
      licensePlate: form.value.licensePlate.trim(),
      borrowerInn: form.value.borrowerInn?.trim() || null,
      appraisalPurpose: form.value.appraisalPurpose || null,
      ownerPhone: form.value.ownerPhone.trim(),
      bankEmployeePhone: form.value.bankEmployeePhone.trim(),
    }
    await createEvaluationRequestWithDocument(dto, null, techPassportFile.value)
    closeAddModal()
    load()
  } catch (e) {
    formError.value = e.response?.data?.message || e.message || t('client.formErrorSaveFailed')
  } finally {
    formLoading.value = false
  }
}

function openViewModal(item) {
  viewRequestId.value = item.id
  showViewModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeViewModal() {
  showViewModal.value = false
  document.body.style.overflow = ''
}

function onRequestDeleted() {
  closeViewModal()
  load()
}

async function handleDownloadReport(item) {
  if (!item.hasReportFile) return
  try {
    const { blob, fileName } = await downloadReport(item.id)
    triggerDownload(blob, fileName)
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="client-requests-page">
    <div class="client-requests-page__toolbar">
      <div class="client-requests-page__filters">
        <div class="client-requests-page__filter client-requests-page__filter--search">
          <label class="form-label small text-muted mb-1">{{ t('client.filterSearch') }}</label>
          <div class="input-group">
            <input
                v-model="filterSearch"
                type="text"
                class="form-control"
                :placeholder="t('client.filterSearchPlaceholder')"
                @keydown.enter.prevent="load()"
            />
            <button type="button" class="btn btn-primary" @click="load()" :aria-label="t('client.filterSearch')">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div class="client-requests-page__filter">
          <label class="form-label small text-muted mb-1">{{ t('client.filterStatus') }}</label>
          <select v-model="filterStatus" class="form-select form-select-sm">
            <option :value="null">{{ t('client.allStatuses') }}</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
        </div>
        <div class="client-requests-page__filter">
          <label class="form-label small text-muted mb-1">{{ t('client.filterDateFrom') }}</label>
          <input v-model="filterDateFrom" type="date" class="form-control form-control-sm" />
        </div>
        <div class="client-requests-page__filter">
          <label class="form-label small text-muted mb-1">{{ t('client.filterDateTo') }}</label>
          <input v-model="filterDateTo" type="date" class="form-control form-control-sm" />
        </div>
      </div>
      <div class="client-requests-page__toolbar-actions">
        <button type="button" class="btn btn-primary" @click="openAddModal">
          {{ t('client.addButton') }}
        </button>
      </div>
    </div>

    <section class="client-requests-page__section">
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead>
          <tr>
            <th>{{ t('client.tableNo') }}</th>
            <th>{{ t('client.tableAppraisedObject') }}</th>
            <th>{{ t('client.tableBorrower') }}</th>
            <th>{{ t('client.tableStatusSource') }}</th>
            <th>{{ t('client.tableCreatedAt') }}</th>
            <th>{{ t('client.tableCompletedAt') }}</th>
            <th>{{ t('client.tableCostSum') }}</th>
            <th>{{ t('client.tableReport') }}</th>
            <th class="table__cell--actions-head"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="loading" class="table__row">
            <td colspan="9" class="table__loading-cell">{{ t('client.loading') }}</td>
          </tr>
          <tr v-else-if="list.length === 0" class="table__row">
            <td colspan="9" class="table__empty-cell">{{ t('client.noData') }}</td>
          </tr>
          <tr
              v-else
              v-for="(item, idx) in list"
              :key="item.id"
              class="table__row table__row--clickable"
              @click="openViewModal(item)"
          >
            <td>{{ (currentPage * pageSize) + idx + 1 }}</td>
            <td>{{ item.appraisedObjectName || '—' }}</td>
            <td>{{ item.borrowerName || '—' }}</td>
            <td>
              <span class="client-requests-page__badge" :data-status="item.status">{{ statusLabel(item.status) }}</span>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>{{ formatDate(item.completedAt) }}</td>
            <td>{{ formatSum(item.cost) }}</td>
            <td>
              <button
                  v-if="item.hasReportFile"
                  type="button"
                  class="client-requests-page__link"
                  @click.stop="handleDownloadReport(item)"
              >
                {{ t('client.downloadReportLink') }}
              </button>
              <span v-else>—</span>
            </td>
            <td>
              <div class="client-requests-page__actions">
                <ReportQrTrigger :request-id="item.id" />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary"
                  :title="t('client.view')"
                  @click.stop="openViewModal(item)"
                >
                  <i class="bi bi-eye"></i>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>

    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">
              <i class="bi bi-truck modal-title-icon"></i>
              {{ t('client.vehicleModalTitle') }}
            </h2>
            <button class="modal-close" @click="closeAddModal">×</button>
          </div>
          <form class="modal-form" @submit.prevent="submitAdd">
            <div class="modal-form__grid">
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.vehicleType') }} <span class="text-danger">*</span>
                </label>
                <select v-model="form.vehicleType" class="form-select" required>
                  <option value="">{{ t('client.vehicleTypePlaceholder') }}</option>
                  <option v-for="vt in vehicleTypes" :key="vt.value" :value="vt.value">{{ t('client.' + vt.labelKey) }}</option>
                </select>
              </div>
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.techPassportNumber') }} <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.techPassportNumber"
                    type="text"
                    class="form-control"
                    :placeholder="t('client.techPassportNumberPlaceholder')"
                    required
                />
              </div>
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.licensePlate') }} <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.licensePlate"
                    type="text"
                    class="form-control"
                    :placeholder="t('client.licensePlatePlaceholder')"
                    required
                />
              </div>
              <div class="modal-form__group">
                <label class="form-label">{{ t('client.modalBorrowerInn') }}</label>
                <input
                    v-model="form.borrowerInn"
                    type="text"
                    class="form-control"
                    :placeholder="t('client.modalBorrowerInnPlaceholder')"
                />
              </div>
              <div class="modal-form__group modal-form__group--full">
                <label class="form-label">
                  {{ t('client.techPassportDoc') }} <span class="text-danger">*</span>
                </label>
                <div class="modal-form__file-zone" @click="$refs.fileInput.click()">
                  <i class="bi bi-paperclip modal-form__file-icon"></i>
                  <div class="modal-form__file-text">
                    {{ techPassportFile ? techPassportFile.name : t('client.modalFileZone') }}
                  </div>
                  <div class="modal-form__file-hint" v-if="!techPassportFile">
                    {{ t('client.modalFileHint') }}
                  </div>
                </div>
                <input
                    ref="fileInput"
                    type="file"
                    class="modal-form__file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    @change="onFileChange"
                />
              </div>
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.modalAppraisalPurpose') }} <span class="text-danger">*</span>
                </label>
                <select v-model="form.appraisalPurpose" class="form-select" required>
                  <option value="">{{ t('client.selectOption') }}</option>
                  <option v-for="p in appraisalPurposes" :key="p.id" :value="p.code">{{ purposeName(p) }}</option>
                </select>
              </div>
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.modalOwnerPhone') }} <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.ownerPhone"
                    type="tel"
                    class="form-control"
                    placeholder="+998 (__) ___ ____"
                    required
                />
              </div>
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.modalBankPhone') }} <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.bankEmployeePhone"
                    type="tel"
                    class="form-control"
                    placeholder="+998 (__) ___ ____"
                    required
                />
              </div>
            </div>
            <div v-if="formError" class="modal-form__error">
              <i class="bi bi-exclamation-triangle-fill modal-form__error-icon"></i>
              {{ formError }}
            </div>
            <div class="modal-form__actions d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-secondary" @click="closeAddModal">
                {{ t('client.modalBack') }}
              </button>
              <button type="submit" class="btn btn-primary" :disabled="formLoading">
                <span v-if="!formLoading">{{ t('client.modalSave') }}</span>
                <span v-else class="modal-form__loading">
                  <span class="modal-form__spinner"></span>
                  {{ t('client.modalSubmitting') }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <ClientRequestViewModal
      :request-id="viewRequestId"
      :show="showViewModal"
      @close="closeViewModal"
      @deleted="onRequestDeleted"
    />
  </div>
</template>

<style scoped>
@import '../../styles/requests-list.css';
@import '../../styles/requests-modal.css';

.client-requests-page__th-icon { width: 52px; }
</style>
