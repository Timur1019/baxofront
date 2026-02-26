<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Импортируем изображения маркера (для Vite)
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Создаём кастомную иконку (обход проблем с путями)
const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ lat: null, lng: null, address: '' }),
  },
  readonly: { type: Boolean, default: false },
  height: { type: String, default: '320px' },
  hint: { type: String, default: 'Кликните на карте, чтобы поставить булавку' },
  loadingText: { type: String, default: 'Определение адреса…' },
})
const emit = defineEmits(['update:modelValue'])

const mapContainer = ref(null)
const addressLoading = ref(false)
const addressError = ref(false)
let map = null
let marker = null
let resizeObserver = null

const DEFAULT_CENTER = [41.2995, 69.2401] // Ташкент
const DEFAULT_ZOOM = 12

// Кеш адресов и управление частотой запросов
const addressCache = new Map()
let lastRequestTime = 0

const NOMINATIM_HEADERS = {
  'Accept-Language': 'ru,uz,en',
  'User-Agent': 'Baholash-AssetValuation/1.0 (contact@example.com)',
}

/**
 * Получение адреса по координатам с повторными попытками, кешированием и соблюдением политик Nominatim
 */
async function fetchAddress(lat, lng, retryCount = 0) {
  const cacheKey = `${lat},${lng}`
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000

  // Проверяем кеш
  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey)
  }

  // Ограничение: не более 1 запроса в секунду
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest))
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    lastRequestTime = Date.now()

    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: NOMINATIM_HEADERS,
          signal: controller.signal,
          cache: 'no-cache', // предотвращает 0-RTT
        }
    )

    clearTimeout(timeoutId)

    // 425 Too Early — повтор с увеличением задержки
    if (res.status === 425 && retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
      return fetchAddress(lat, lng, retryCount + 1)
    }

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`)
    }

    const data = await res.json()
    const address = data?.display_name ?? ''

    if (address) {
      addressCache.set(cacheKey, address)
    }
    return address

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Таймаут запроса к Nominatim')
    } else {
      console.error('Ошибка получения адреса:', error)
    }

    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
      return fetchAddress(lat, lng, retryCount + 1)
    }

    return ''
  }
}

// Установка маркера с кастомной иконкой
function setMarker(lat, lng) {
  if (!map) return
  if (marker) map.removeLayer(marker)
  marker = L.marker([lat, lng], {icon: customIcon}).addTo(map)
}

// Обработка клика по карте
async function onMapClick(e) {
  if (props.readonly) return
  const {lat, lng} = e.latlng
  const roundedLat = Math.round(lat * 1e6) / 1e6
  const roundedLng = Math.round(lng * 1e6) / 1e6

  setMarker(roundedLat, roundedLng)
  // Сначала обновляем только координаты, адрес позже
  emit('update:modelValue', {lat: roundedLat, lng: roundedLng, address: props.modelValue?.address ?? ''})

  addressLoading.value = true
  addressError.value = false
  try {
    const address = await fetchAddress(roundedLat, roundedLng)
    if (address) {
      emit('update:modelValue', {lat: roundedLat, lng: roundedLng, address})
    } else {
      addressError.value = true
    }
  } catch {
    addressError.value = true
  } finally {
    addressLoading.value = false
  }
}

// Инициализация карты
function initMap() {
  if (!mapContainer.value) return
  if (map) {
    map.remove()
    map = null
    marker = null
  }

  map = L.map(mapContainer.value, {
    tap: true,
    zoomControl: true,
    attributionControl: true,
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map)

  if (!props.readonly) {
    map.on('click', onMapClick)
  }

  const {lat, lng} = props.modelValue
  if (lat != null && lng != null) {
    setMarker(Number(lat), Number(lng))
    map.setView([Number(lat), Number(lng)], 14)
  }

  nextTick(() => {
    map.invalidateSize()
  })
}

// Отслеживание изменения размеров контейнера (например, при открытии модалки)
function observeResize() {
  if (!mapContainer.value) return
  resizeObserver = new ResizeObserver(() => {
    if (map) map.invalidateSize()
  })
  resizeObserver.observe(mapContainer.value)
}

// Жизненный цикл
onMounted(() => {
  setTimeout(() => {
    initMap()
    observeResize()
  }, 200)
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (map) {
    map.remove()
    map = null
  }
})

// Следим за изменением modelValue извне
watch(
    () => props.modelValue,
    (val) => {
      if (!map) return
      const {lat, lng} = val
      if (lat != null && lng != null) {
        setMarker(Number(lat), Number(lng))
        map.setView([Number(lat), Number(lng)], map.getZoom())
      } else if (marker) {
        map.removeLayer(marker)
        marker = null
      }
    },
    {deep: true}
)
</script>

<template>
  <div class="location-map-picker">
    <div v-if="!readonly" class="location-map-picker__hint" :class="{ error: addressError }">
      <span v-if="addressError">⚠️ Не удалось определить адрес. Координаты сохранены.</span>
      <span v-else>{{ hint }}</span>
    </div>
    <div v-if="addressLoading" class="location-map-picker__loading">
      <span class="spinner"/> {{ loadingText }}
    </div>
    <div ref="mapContainer" class="location-map-picker__map" :style="{ height }"/>
  </div>
</template>

<style scoped>
.location-map-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.location-map-picker__hint {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  padding: 0.5rem 0;
}

.location-map-picker__hint.error {
  color: #dc2626;
}

.location-map-picker__loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6f42c1;
  font-weight: 500;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #6f42c1;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.location-map-picker__map {
  width: 100%;
  min-height: 300px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  cursor: crosshair;
  background: #f1f5f9;
  transition: border-color 0.2s;
}

.location-map-picker__map:hover:not(.readonly) {
  border-color: #6f42c1;
}

.location-map-picker__map.readonly {
  cursor: default;
  border-color: #d1d5db;
}

:deep(.leaflet-container) {
  z-index: 1;
  width: 100%;
  height: 100%;
}

:deep(.leaflet-marker-icon) {
  z-index: 1000 !important;
}
</style>