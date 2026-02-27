<script setup>
import { computed } from 'vue'
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()

const featureCards = computed(() => [
  {
    title: t('home.features.transparentTitle'),
    text: t('home.features.transparentText'),
    icon: 'https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/outline/scale.svg',
    color: '#667eea'
  },
  {
    title: t('home.features.accessTitle'),
    text: t('home.features.accessText'),
    icon: 'https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/outline/shield-lock.svg',
    color: '#48bb78'
  },
  {
    title: t('home.features.reportsTitle'),
    text: t('home.features.reportsText'),
    icon: 'https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/outline/chart-bar.svg',
    color: '#ed8936'
  },
])
</script>

<template>
  <section class="features">
    <div class="features__container">
      <!-- Заголовок секции -->
      <div class="features__header">
        <span class="features__badge">{{ t('home.whyUsBadge') }}</span>
        <h2 class="features__title">
          {{ t('home.whyTitle') }}
        </h2>
        <p class="features__subtitle">
          {{ t('home.whyText') }}
        </p>
      </div>

      <!-- Сетка карточек -->
      <div class="features__grid">
        <article
            v-for="(card, index) in featureCards"
            :key="index"
            class="feature-card"
            :style="{ '--card-color': card.color }"
        >
          <div class="feature-card__icon-wrapper">
            <img
                :src="card.icon"
                :alt="card.title"
                class="feature-card__icon"
                loading="lazy"
            />
          </div>

          <h3 class="feature-card__title">{{ card.title }}</h3>
          <p class="feature-card__text">{{ card.text }}</p>

          <a href="#" class="feature-card__link">
            <span>{{ t('home.learnMore') }}</span>
            <svg class="feature-card__link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 100px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.features__container {
  max-width: var(--content-max-width, 1570px);
  margin: 0 auto;
  padding: 0 40px;
}

/* Заголовок секции */
.features__header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px;
}

.features__badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.features__title {
  font-size: 42px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px;
  line-height: 1.2;
}

.features__subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
}

/* Сетка карточек */
.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

/* Карточка */
.feature-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
  opacity: 1;
}

/* Иконка */
.feature-card__icon-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-card__icon-wrapper {
  background: var(--card-color);
}

.feature-card__icon {
  width: 35px;
  height: 35px;
  transition: all 0.3s ease;
  filter: brightness(0) saturate(100%) invert(40%) sepia(50%) saturate(1000%) hue-rotate(200deg);
}

.feature-card:hover .feature-card__icon {
  filter: brightness(0) invert(1);
}

/* Текст */
.feature-card__title {
  font-size: 22px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px;
}

.feature-card__text {
  font-size: 16px;
  line-height: 1.6;
  color: #64748b;
  margin: 0 0 24px;
}

/* Ссылка */
.feature-card__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--card-color);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.feature-card__link:hover {
  gap: 12px;
}

.feature-card__link-icon {
  width: 18px;
  height: 18px;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .features__grid {
    gap: 20px;
  }

  .feature-card {
    padding: 30px 20px;
  }
}

@media (max-width: 768px) {
  .features {
    padding: 60px 0;
  }

  .features__container {
    padding: 0 20px;
  }

  .features__title {
    font-size: 32px;
  }

  .features__subtitle {
    font-size: 16px;
  }

  .features__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .features__grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>