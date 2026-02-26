export function useFormatting() {
  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatSum = (n) => {
    if (n == null) return ''
    return Number(n).toLocaleString('uz-UZ')
  }

  return { formatDate, formatSum }
}
