<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'

const router = useRouter()
const { t } = useI18n()

const goToOpportunities = () => router.push('/about')
const goToContacts = () => router.push('/contacts')
</script>

<template>
  <section class="hero">
    <div class="hero__container">
      <!-- Левая часть с текстом -->
      <div class="hero__content">
        <h1 class="hero__title">
          <span class="hero__title-small">{{ t('home.heroBrand') }}</span>
          <span class="hero__title-large">{{ t('home.heroTagline') }}</span>
        </h1>

        <p class="hero__description">
          {{ t('home.heroSubtitle') }}
        </p>

        <div class="hero__actions">
          <button type="button" class="hero__btn hero__btn--primary" @click="goToOpportunities">
            {{ t('home.buttons.learnMore') }}
          </button>
          <button type="button" class="hero__btn hero__btn--outline" @click="goToContacts">
            {{ t('home.buttons.contacts') }}
          </button>
        </div>
      </div>

      <!-- Правая часть с изображением/декором -->
      <div class="hero__visual">
        <div class="hero__stats">
          <div class="hero__stat-item">
            <span class="hero__stat-number">98%</span>
            <span class="hero__stat-label">{{ t('home.heroStatSatisfied') }}</span>
          </div>
          <div class="hero__stat-item">
            <span class="hero__stat-number">50+</span>
            <span class="hero__stat-label">{{ t('home.heroStatPartners') }}</span>
          </div>
          <div class="hero__stat-item">
            <span class="hero__stat-number">24/7</span>
            <span class="hero__stat-label">{{ t('home.heroStatSupport') }}</span>
          </div>
        </div>

        <div class="hero__graphic">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
            <path d="M100 20 L100 180 M20 100 L180 100" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero__container {
  max-width: var(--content-max-width, 1570px);
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Левая часть */
.hero__content {
  max-width: 540px;
}

.hero__title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.hero__title-small {
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.9);
}

.hero__title-large {
  font-size: 52px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero__description {
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  max-width: 480px;
}

.hero__actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero__btn {
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: transparent;
  color: white;
}

.hero__btn--primary {
  background: white;
  color: var(--color-primary);
}

.hero__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.hero__btn--outline {
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
}

.hero__btn--outline:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Правая часть */
.hero__visual {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__stats {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

.hero__stat-item {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.hero__stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.hero__stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
}

.hero__stat-label {
  font-size: 14px;
  opacity: 0.8;
  line-height: 1.4;
}

.hero__graphic {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  opacity: 0.5;
  z-index: 1;
}

.hero__graphic svg {
  width: 100%;
  height: 100%;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .hero__title-large {
    font-size: 44px;
  }

  .hero__visual {
    height: 350px;
  }

  .hero__stat-number {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 0;
  }

  .hero__container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 40px;
  }

  .hero__content {
    max-width: 100%;
  }

  .hero__description {
    margin-left: auto;
    margin-right: auto;
  }

  .hero__actions {
    justify-content: center;
  }

  .hero__visual {
    height: 300px;
  }

  .hero__stats {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .hero__container {
    padding: 0 20px;
  }

  .hero__title-large {
    font-size: 32px;
  }

  .hero__description {
    font-size: 16px;
  }

  .hero__actions {
    flex-direction: column;
  }

  .hero__btn {
    width: 100%;
  }

  .hero__stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .hero__stat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
  }

  .hero__stat-number {
    margin-bottom: 0;
  }
}
</style>