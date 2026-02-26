import { ref, computed } from 'vue'
import ru from './locales/ru.js'
import uz from './locales/uz.js'
import en from './locales/en.js'

const supportedLocales = ['ru', 'uz', 'en']
const currentLocale = ref(localStorage.getItem('baholash_locale') || 'uz')
const messages = { ru, uz, en }

export function useI18n() {
  const locale = computed({
    get: () => currentLocale.value,
    set: (value) => {
      if (!supportedLocales.includes(value)) return
      currentLocale.value = value
      localStorage.setItem('baholash_locale', value)
    },
  })

  const t = (key) => {
    const parts = key.split('.')
    let current = messages[currentLocale.value] || messages.ru
    for (const part of parts) {
      current = current?.[part]
      if (current == null) {
        return key
      }
    }
    return current
  }

  return {
    locale,
    t,
  }
}

