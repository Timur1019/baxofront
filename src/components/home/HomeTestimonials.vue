<script setup>
import { computed } from 'vue'
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()

const testimonials = computed(() => [
  {
    name: t('home.testimonial1Name'),
    position: t('home.testimonial1Position'),
    text: t('home.testimonial1Text'),
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: t('home.testimonial2Name'),
    position: t('home.testimonial2Position'),
    text: t('home.testimonial2Text'),
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    name: t('home.testimonial3Name'),
    position: t('home.testimonial3Position'),
    text: t('home.testimonial3Text'),
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
])
</script>

<template>
  <section class="home-section home-section--muted">
    <div class="home-container">
      <div class="home-section__header">
        <span class="home-section__badge">{{ t('home.testimonialsBadge') }}</span>
        <h2 class="home-section__title">{{ t('home.testimonialsTitle') }}</h2>
        <p class="home-section__subtitle">{{ t('home.testimonialsSubtitle') }}</p>
      </div>

      <div class="testimonials-grid">
        <div v-for="testimonial in testimonials" :key="testimonial.name" class="testimonial-card">
          <div class="testimonial-card__quote">"</div>
          <p class="testimonial-card__text">{{ testimonial.text }}</p>
          <div class="testimonial-card__author">
            <img :src="testimonial.avatar" :alt="testimonial.name" class="testimonial-card__avatar">
            <div class="testimonial-card__info">
              <h4 class="testimonial-card__name">{{ testimonial.name }}</h4>
              <p class="testimonial-card__position">{{ testimonial.position }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
