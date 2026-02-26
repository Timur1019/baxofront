<script setup>
import { computed } from 'vue'
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()

const faqs = computed(() => [
  { question: t('home.faq1Question'), answer: t('home.faq1Answer') },
  { question: t('home.faq2Question'), answer: t('home.faq2Answer') },
  { question: t('home.faq3Question'), answer: t('home.faq3Answer') },
])
</script>

<template>
  <section class="home-section">
    <div class="home-container">
      <div class="home-section__header">
        <span class="home-section__badge">{{ t('home.faqBadge') }}</span>
        <h2 class="home-section__title">{{ t('home.faqTitle') }}</h2>
        <p class="home-section__subtitle">{{ t('home.faqSubtitle') }}</p>
      </div>

      <div class="faq-grid">
        <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
          <h3 class="faq-item__question">{{ faq.question }}</h3>
          <p class="faq-item__answer">{{ faq.answer }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
