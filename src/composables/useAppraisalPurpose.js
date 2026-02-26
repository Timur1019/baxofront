import { useI18n } from '../i18n/useI18n'

export function useAppraisalPurpose() {
  const { locale } = useI18n()

  const purposeName = (p) => {
    if (!p) return ''
    const lang = (locale.value || 'ru').toLowerCase()
    if (lang === 'uz') return p.nameUz || p.nameRu || p.nameEn || ''
    if (lang === 'en') return p.nameEn || p.nameRu || p.nameUz || ''
    return p.nameRu || p.nameUz || p.nameEn || ''
  }

  return { purposeName }
}
