<script setup>
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()

const partners = [
  'https://via.placeholder.com/150x50?text=Logo1',
  'https://via.placeholder.com/150x50?text=Logo2',
  'https://via.placeholder.com/150x50?text=Logo3',
  'https://via.placeholder.com/150x50?text=Logo4',
  'https://via.placeholder.com/150x50?text=Logo5',
]
</script>

<template>
  <section class="partners">
    <div class="partners__container">
      <p class="partners__title">{{ t('home.partnersTitle') }}</p>
      <div class="partners__grid">
        <div v-for="(partner, index) in partners" :key="index" class="partners__item">
          <img
              :src="partner"
              :alt="t('home.partnerLogo') + ' ' + (index + 1)"
              class="partners__logo"
              loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.partners {
  padding: 60px 0;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.partners__container {
  max-width: var(--content-max-width, 1570px);
  margin: 0 auto;
  padding: 0 40px;
}

.partners__title {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
  margin-bottom: 40px;
}

.partners__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 40px 60px;
}

.partners__item {
  transition: all 0.3s ease;
  opacity: 0.6;
  filter: grayscale(100%);
}

.partners__item:hover {
  opacity: 1;
  filter: grayscale(0%);
  transform: translateY(-2px);
}

.partners__logo {
  max-width: 150px;
  height: auto;
  display: block;
}

@media (max-width: 768px) {
  .partners {
    padding: 40px 0;
  }

  .partners__container {
    padding: 0 20px;
  }

  .partners__grid {
    gap: 30px;
  }

  .partners__logo {
    max-width: 120px;
  }
}

@media (max-width: 480px) {
  .partners__grid {
    gap: 20px;
  }

  .partners__logo {
    max-width: 100px;
  }
}
</style>