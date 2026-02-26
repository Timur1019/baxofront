<script setup>
import { computed } from 'vue'

const props = defineProps({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  address: { type: String, default: '' },
  height: { type: String, default: '320px' },
})

const DEFAULT_CENTER = { lat: 41.2995, lng: 69.2401 } // Ташкент

const mapSrc = computed(() => {
  const lat = props.lat ?? DEFAULT_CENTER.lat
  const lng = props.lng ?? DEFAULT_CENTER.lng
  const query = encodeURIComponent(`${lat},${lng}`)
  // Используем стандартный embed без API key
  return `https://www.google.com/maps?q=${query}&hl=ru&z=15&output=embed`
})
</script>

<template>
  <div class="location-map-view">
    <div class="location-map-view__map" :style="{ height }">
      <iframe
        class="location-map-view__iframe"
        :src="mapSrc"
        style="border: 0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
      />
    </div>
    <p v-if="address" class="location-map-view__address">{{ address }}</p>
  </div>
</template>

<style scoped>
.location-map-view__map {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
  background: #f8fafc;
}

.location-map-view__iframe {
  width: 100%;
  height: 100%;
  display: block;
}

.location-map-view__address {
  margin: 0.9rem 0 0;
  padding: 0.9rem 1.1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}
</style>
