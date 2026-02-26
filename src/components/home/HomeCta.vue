<script setup>
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <section class="section-cta">
    <div class="home-container cta-container">
      <div class="cta-content">
        <span class="cta-badge">{{ t('home.ctaBadge') }}</span>
        <h2 class="cta-title">{{ t('home.ctaTitle') }}</h2>
        <p class="cta-text">{{ t('home.ctaText') }}</p>

        <div class="cta-features">
          <div class="cta-feature">
            <svg class="cta-feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('home.ctaFeature1') }}</span>
          </div>
          <div class="cta-feature">
            <svg class="cta-feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('home.ctaFeature2') }}</span>
          </div>
          <div class="cta-feature">
            <svg class="cta-feature__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ t('home.ctaFeature3') }}</span>
          </div>
        </div>

        <div class="cta-actions">
          <router-link to="/contacts" class="home-btn home-btn--light home-btn--large">
            {{ t('home.buttons.leaveRequest') }}
          </router-link>
          <a href="#" class="home-btn home-btn--outline-light home-btn--large">
            {{ t('home.ctaWatchPresentation') }}
          </a>
        </div>
      </div>

      <div class="cta-image-wrapper">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
          alt="Team meeting"
          class="cta-image"
        >
      </div>
    </div>
  </section>
</template>
