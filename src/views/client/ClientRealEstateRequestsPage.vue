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
import { getRegions, getDistrictsByRegion } from '../../api/regionsApi'
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
const filterRegionId = ref(null)
const filterDistrictId = ref(null)
const filterSearch = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')
const statuses = ref([])
const regions = ref([])
const districts = ref([])
const appraisalPurposes = ref([])
const showAddModal = ref(false)
const showViewModal = ref(false)
const viewRequestId = ref(null)
const formLoading = ref(false)
const formError = ref('')

const form = ref({
  requestType: 'REAL_ESTATE',
  cadastralNumber: '',
  appraisalPurpose: '',
  ownerPhone: '',
  bankEmployeePhone: '',
  borrowerInn: '',
  regionId: '',
  districtId: '',
})
const cadastralFile = ref(null)

async function loadFilters() {
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
}

watch(filterRegionId, async (id) => {
  filterDistrictId.value = null
  if (!id) {
    districts.value = []
    return
  }
  try {
    districts.value = await getDistrictsByRegion(id)
  } catch {
    districts.value = []
  }
})

async function load() {
  loading.value = true
  try {
    const res = await getMyEvaluationRequests({
      page: currentPage.value,
      size: pageSize,
      requestType: 'REAL_ESTATE',
      status: filterStatus.value || undefined,
      regionId: filterRegionId.value || undefined,
      districtId: filterDistrictId.value || undefined,
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

watch([currentPage, filterStatus, filterRegionId, filterDistrictId, filterSearch, filterDateFrom, filterDateTo], () => {
  load()
})

function openAddModal() {
  form.value = {
    requestType: 'REAL_ESTATE',
    cadastralNumber: '',
    appraisalPurpose: '',
    ownerPhone: '',
    bankEmployeePhone: '',
    borrowerInn: '',
    regionId: '',
    districtId: '',
  }
  cadastralFile.value = null
  formError.value = ''
  showAddModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeAddModal() {
  showAddModal.value = false
  document.body.style.overflow = ''
}

function onFileChange(e) {
  cadastralFile.value = e.target.files?.[0] || null
}

async function submitAdd() {
  if (!form.value.cadastralNumber?.trim() || !form.value.appraisalPurpose?.trim() ||
      !form.value.ownerPhone?.trim() || !form.value.bankEmployeePhone?.trim() ||
      !form.value.borrowerInn?.trim()) {
    formError.value = t('client.formErrorFillRequired')
    return
  }
  if (!cadastralFile.value) {
    formError.value = t('client.formErrorUploadCadastral')
    return
  }
  formLoading.value = true
  formError.value = ''
  try {
    const dto = {
      requestType: 'REAL_ESTATE',
      cadastralNumber: form.value.cadastralNumber.trim(),
      appraisalPurpose: form.value.appraisalPurpose || null,
      ownerPhone: form.value.ownerPhone.trim(),
      bankEmployeePhone: form.value.bankEmployeePhone.trim(),
      borrowerInn: form.value.borrowerInn.trim(),
      regionId: form.value.regionId || null,
      districtId: form.value.districtId || null,
    }
    await createEvaluationRequestWithDocument(dto, cadastralFile.value, null)
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
          <label class="form-label small text-muted mb-1">{{ t('client.filterRegion') }}</label>
          <select v-model="filterRegionId" class="form-select form-select-sm">
            <option value="">{{ t('client.selectOption') }}</option>
            <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.nameUz }}</option>
          </select>
        </div>
        <div class="client-requests-page__filter">
          <label class="form-label small text-muted mb-1">{{ t('client.filterDistrict') }}</label>
          <select v-model="filterDistrictId" class="form-select form-select-sm" :disabled="!filterRegionId">
            <option value="">{{ t('client.selectOption') }}</option>
            <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.nameUz }}</option>
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
              <i class="bi bi-clipboard modal-title-icon"></i>
              {{ t('client.modalNewRequest') }}
            </h2>
            <button class="modal-close" @click="closeAddModal">×</button>
          </div>
          <form class="modal-form" @submit.prevent="submitAdd">
            <div class="modal-form__grid">
              <div class="modal-form__group modal-form__group--full">
                <label class="form-label">
                  {{ t('client.modalCadastralNumber') }} <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.cadastralNumber"
                    type="text"
                    class="form-control"
                    :placeholder="t('client.modalCadastralPlaceholder')"
                    required
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
              <div class="modal-form__group">
                <label class="form-label">
                  {{ t('client.modalBorrowerInn') }} <span class="text-danger">*</span>
                </label>
                <input
                    v-model="form.borrowerInn"
                    type="text"
                    class="form-control"
                    :placeholder="t('client.modalBorrowerInnPlaceholder')"
                    required
                />
              </div>
              <div class="modal-form__group modal-form__group--full">
                <label class="form-label">
                  {{ t('client.modalCadastralDoc') }} <span class="text-danger">*</span>
                </label>
                <div class="modal-form__file-zone" @click="$refs.fileInput.click()">
                  <i class="bi bi-paperclip modal-form__file-icon"></i>
                  <div class="modal-form__file-text">
                    {{ cadastralFile ? cadastralFile.name : t('client.modalFileZone') }}
                  </div>
                  <div class="modal-form__file-hint" v-if="!cadastralFile">
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
            </div>
            <div v-if="formError" class="modal-form__error">
              <i class="bi bi-exclamation-triangle-fill modal-form__error-icon"></i>
              {{ formError }}
            </div>
            <div class="modal-form__actions d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-secondary" @click="closeAddModal">
                {{ t('client.modalCancel') }}
              </button>
              <button type="submit" class="btn btn-primary" :disabled="formLoading">
                <span v-if="!formLoading">{{ t('client.modalSubmit') }}</span>
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
.client-requests-page__view-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.client-requests-page__view-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  border-color: var(--color-text-muted);
}
.client-requests-page__view-btn svg {
  width: 20px;
  height: 20px;
}
</style>
