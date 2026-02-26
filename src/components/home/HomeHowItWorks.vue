<script setup>
import { computed } from 'vue'
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()

const steps = computed(() => [
  {
    label: '01',
    title: t('home.steps.step1Title'),
    text: t('home.steps.step1Text'),
  },
  {
    label: '02',
    title: t('home.steps.step2Title'),
    text: t('home.steps.step2Text'),
  },
  {
    label: '03',
    title: t('home.steps.step3Title'),
    text: t('home.steps.step3Text'),
  },
])
</script>

<template>
  <section class="process">
    <div class="process__container">
      <!-- Заголовок секции -->
      <div class="process__header">
        <span class="process__badge">{{ t('home.flowBadge') }}</span>
        <h2 class="process__title">{{ t('home.flowTitle') }}</h2>
        <p class="process__subtitle">{{ t('home.flowText') }}</p>
      </div>

      <!-- Контент -->
      <div class="process__content">
        <!-- Левая часть с шагами -->
        <div class="process__steps">
          <div
              v-for="(step, index) in steps"
              :key="step.label"
              class="process-step"
              :class="{ 'process-step--last': index === steps.length - 1 }"
          >
            <!-- Номер шага -->
            <div class="process-step__number">
              <span class="process-step__digit">{{ step.label }}</span>
              <div class="process-step__line" v-if="index < steps.length - 1"></div>
            </div>

            <!-- Контент шага -->
            <div class="process-step__content">
              <h3 class="process-step__title">{{ step.title }}</h3>
              <p class="process-step__text">{{ step.text }}</p>
            </div>
          </div>
        </div>

        <!-- Правая часть с изображением -->
        <div class="process__image-wrapper">
          <div class="process__image-container">
            <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80"
                alt="Process visualization"
                class="process__image"
                loading="lazy"
            />

            <!-- Декоративные элементы -->
            <div class="process__image-decoration process__image-decoration--1"></div>
            <div class="process__image-decoration process__image-decoration--2"></div>

            <!-- Карточка с статистикой -->
            <div class="process__stats-card">
              <span class="process__stats-number">98%</span>
              <span class="process__stats-text">{{ t('home.imageCardSatisfied') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.process {
  padding: 100px 0;
  background: white;
}

.process__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
}

/* Заголовок секции */
.process__header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px;
}

.process__badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.process__title {
  font-size: 42px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 16px;
  line-height: 1.2;
}

.process__subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
}

/* Основной контент */
.process__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

/* Левая часть с шагами */
.process__steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.process-step {
  display: flex;
  gap: 24px;
  position: relative;
}

/* Номер шага */
.process-step__number {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.process-step__digit {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  position: relative;
  z-index: 2;
}

.process-step__line {
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  margin: 8px 0;
  opacity: 0.3;
}

.process-step--last .process-step__line {
  display: none;
}

/* Контент шага */
.process-step__content {
  padding-top: 8px;
  flex: 1;
}

.process-step__title {
  font-size: 22px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 8px;
}

.process-step__text {
  font-size: 16px;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
}

/* Правая часть с изображением */
.process__image-wrapper {
  position: relative;
}

.process__image-container {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.process__image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.6s ease;
}

.process__image-container:hover .process__image {
  transform: scale(1.05);
}

/* Декоративные элементы */
.process__image-decoration {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
  z-index: 1;
}

.process__image-decoration--1 {
  top: -30px;
  right: -30px;
}

.process__image-decoration--2 {
  bottom: -30px;
  left: -30px;
  width: 200px;
  height: 200px;
}

/* Карточка со статистикой */
.process__stats-card {
  position: absolute;
  bottom: 30px;
  left: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

.process__stats-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
  margin-bottom: 4px;
}

.process__stats-text {
  font-size: 14px;
  color: #64748b;
}

/* Анимации */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .process__content {
    gap: 40px;
  }

  .process__title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .process {
    padding: 60px 0;
  }

  .process__container {
    padding: 0 20px;
  }

  .process__title {
    font-size: 32px;
  }

  .process__subtitle {
    font-size: 16px;
  }

  .process__content {
    grid-template-columns: 1fr;
    gap: 50px;
  }

  .process__steps {
    max-width: 500px;
    margin: 0 auto;
  }

  .process__image-wrapper {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .process-step {
    gap: 16px;
  }

  .process-step__digit {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .process-step__line {
    height: 60px;
  }

  .process-step__title {
    font-size: 20px;
  }

  .process-step__text {
    font-size: 14px;
  }

  .process__stats-card {
    padding: 15px 20px;
    bottom: 20px;
    left: 20px;
  }

  .process__stats-number {
    font-size: 28px;
  }
}
</style>