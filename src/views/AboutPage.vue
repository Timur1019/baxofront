<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n/useI18n'
import HomeFooter from '../components/home/HomeFooter.vue'

const { t } = useI18n()

const stats = computed(() => [
  { number: '98%', label: t('about.stats.satisfaction') },
  { number: '50+', label: t('about.stats.partners') },
  { number: '24/7', label: t('about.stats.support') },
  { number: '10k+', label: t('about.stats.users') },
])

const values = computed(() => [
  {
    id: 'innovation',
    title: t('about.values.innovation'),
    text: t('about.values.innovationText'),
    icon: '🚀',
  },
  {
    id: 'quality',
    title: t('about.values.quality'),
    text: t('about.values.qualityText'),
    icon: '⭐',
  },
  {
    id: 'security',
    title: t('about.values.security'),
    text: t('about.values.securityText'),
    icon: '🔒',
  },
  {
    id: 'support',
    title: t('about.values.support'),
    text: t('about.values.supportText'),
    icon: '🤝',
  },
])
</script>

<template>
  <main class="about">
    <!-- Hero секция -->
    <section class="about__hero">
      <div class="about__container">
        <h1 class="about__title">{{ t('about.title') }}</h1>
        <p class="about__subtitle">{{ t('about.intro') }}</p>

        <!-- Статистика -->
        <div class="about__stats">
          <div v-for="(stat, i) in stats" :key="i" class="about__stat-item">
            <span class="about__stat-number">{{ stat.number }}</span>
            <span class="about__stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Миссия и ценности -->
    <section class="about__mission">
      <div class="about__container">
        <div class="about__mission-content">
          <h2 class="about__section-title">{{ t('about.mission') }}</h2>
          <p class="about__mission-text">{{ t('about.missionText') }}</p>
        </div>
      </div>
    </section>

    <!-- Основные преимущества -->
    <section class="about__features">
      <div class="about__container">
        <h2 class="about__section-title">{{ t('about.whyChooseUs') }}</h2>

        <div class="about__features-grid">
          <div class="about__feature-card">
            <h3 class="about__feature-title">{{ t('about.reliability') }}</h3>
            <p class="about__feature-text">{{ t('about.reliabilityText') }}</p>
          </div>

          <div class="about__feature-card">
            <h3 class="about__feature-title">{{ t('about.convenience') }}</h3>
            <p class="about__feature-text">{{ t('about.convenienceText') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Ценности компании -->
    <section class="about__values">
      <div class="about__container">
        <h2 class="about__section-title">{{ t('about.values.title') }}</h2>

        <div class="about__values-grid">
          <div v-for="value in values" :key="value.id" class="about__value-card">
            <div class="about__value-icon">{{ value.icon }}</div>
            <h3 class="about__value-title">{{ value.title }}</h3>
            <p class="about__value-text">{{ value.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Призыв к действию -->
    <section class="about__cta">
      <div class="about__container">
        <h2 class="about__cta-title">{{ t('about.cta.title') }}</h2>
        <p class="about__cta-text">{{ t('about.cta.text') }}</p>

        <div class="about__cta-buttons">
          <router-link to="/contacts" class="about__btn about__btn--primary">
            {{ t('about.cta.contact') }}
          </router-link>
          <router-link to="/" class="about__btn about__btn--outline">
            {{ t('about.cta.learnMore') }}
          </router-link>
        </div>
      </div>
    </section>

    <HomeFooter />
  </main>
</template>

<style scoped>
.about {
  overflow-x: hidden;
}

/* Общие стили */
.about__container {
  max-width: var(--content-max-width, 1570px);
  margin: 0 auto;
  padding: 0 40px;
}

.about__section-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin: 0 0 20px;
  line-height: 1.2;
}

/* Hero секция */
.about__hero {
  padding: 6rem 0 5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.about__hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.about__hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.about__title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 20px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.about__subtitle {
  font-size: 20px;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto 50px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

/* Статистика */
.about__stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.about__stat-item {
  text-align: center;
}

.about__stat-number {
  display: block;
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about__stat-label {
  font-size: 16px;
  opacity: 0.9;
}

/* Миссия */
.about__mission {
  padding: 5rem 0;
  background: var(--color-bg-card);
}

.about__mission-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about__mission-text {
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

/* Основные преимущества */
.about__features {
  padding: 5rem 0;
  background: var(--color-bg-muted);
}

.about__features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 900px;
  margin: 40px auto 0;
}

.about__feature-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-align: center;
}

.about__feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 35px -8px var(--color-primary-light);
}

.about__feature-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px;
}

.about__feature-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0;
}

/* Ценности */
.about__values {
  padding: 5rem 0;
  background: var(--color-bg-card);
}

.about__values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.about__value-card {
  text-align: center;
  padding: 30px 20px;
  background: var(--color-bg-muted);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.about__value-card:hover {
  transform: translateY(-5px);
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.about__value-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.about__value-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.about__value-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin: 0;
}

/* CTA секция */
.about__cta {
  padding: 5rem 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.about__cta::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.about__cta-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 20px;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

.about__cta-text {
  font-size: 18px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto 40px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.about__cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.about__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.about__btn--primary {
  background: white;
  color: var(--color-primary);
}

.about__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.about__btn--outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.about__btn--outline:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .about__title {
    font-size: 48px;
  }

  .about__values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .about__hero {
    padding: 4rem 0 3rem;
  }

  .about__title {
    font-size: 36px;
  }

  .about__subtitle {
    font-size: 18px;
  }

  .about__stats {
    gap: 30px;
  }

  .about__stat-number {
    font-size: 36px;
  }

  .about__section-title {
    font-size: 30px;
  }

  .about__features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .about__cta-title {
    font-size: 30px;
  }

  .about__cta-buttons {
    flex-direction: column;
    max-width: 300px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .about__container {
    padding: 0 20px;
  }

  .about__title {
    font-size: 28px;
  }

  .about__subtitle {
    font-size: 16px;
  }

  .about__stats {
    gap: 20px;
  }

  .about__stat-number {
    font-size: 28px;
  }

  .about__stat-label {
    font-size: 14px;
  }

  .about__values-grid {
    grid-template-columns: 1fr;
  }

  .about__cta-title {
    font-size: 24px;
  }

  .about__cta-text {
    font-size: 16px;
  }
}
</style>