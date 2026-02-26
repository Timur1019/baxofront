import { useI18n } from '../i18n/useI18n'

const STATUS_I18N_MAP = {
  NOT_REVIEWED: 'statusNotReviewed',
  ASSIGNED_TO_APPRAISER: 'statusAssignedToAppraiser',
  IN_APPRAISAL: 'statusInAppraisal',
  APPROVED: 'statusApproved',
  CANCELLED: 'statusCancelled',
  NOT_READY: 'statusNotReady',
  IN_IDENTIFICATION: 'statusInIdentification',
  SUBMITTED: 'statusSubmitted',
  IN_PROGRESS: 'statusInProgress',
  REPORT_READY: 'statusReportReady',
  COMPLETED: 'statusCompleted',
}

export function useStatusLabel(namespace = 'client') {
  const { t } = useI18n()
  const statusLabel = (s) => {
    const key = STATUS_I18N_MAP[s]
    return key ? t(`${namespace}.${key}`) : (s || '')
  }
  return { statusLabel }
}
