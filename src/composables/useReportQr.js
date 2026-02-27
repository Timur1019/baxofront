import { ref, watch, onUnmounted, unref } from 'vue'
import { getReportQrBlob } from '../api/evaluationApi'

/**
 * Загружает QR-код для просмотра PDF-отчёта и возвращает object URL для <img>.
 * Принимает ref/computed или примитив. Автоматически освобождает URL при размонтировании.
 */
export function useReportQr(requestIdRef) {
  const qrUrl = ref(null)
  const qrLoading = ref(false)
  const qrError = ref('')

  const getId = () => {
    const v = unref(requestIdRef)
    return typeof v === 'function' ? v() : v
  }

  const load = async () => {
    const id = getId()
    if (!id) {
      qrUrl.value = null
      return
    }
    qrLoading.value = true
    qrError.value = ''
    qrUrl.value = null
    try {
      const blob = await getReportQrBlob(id)
      qrUrl.value = URL.createObjectURL(blob)
    } catch {
      qrError.value = 'Не удалось загрузить QR-код'
    } finally {
      qrLoading.value = false
    }
  }

  const revoke = () => {
    if (qrUrl.value) {
      URL.revokeObjectURL(qrUrl.value)
      qrUrl.value = null
    }
  }

  watch(() => getId(), (id) => {
    revoke()
    if (id) load()
  }, { immediate: true })

  onUnmounted(revoke)

  return { qrUrl, qrLoading, qrError }
}
