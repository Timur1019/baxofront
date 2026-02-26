<script setup>
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <footer class="home-footer">
    <div class="home-container home-footer__container">
      <div class="home-footer__info">
        <h3 class="home-footer__logo">Baholash</h3>
        <p class="home-footer__description">
          {{ t('footer.description') }}
        </p>
        <div class="home-footer__social">
          <a href="#" class="home-footer__social-link" aria-label="Facebook">📘</a>
          <a href="#" class="home-footer__social-link" aria-label="Telegram">📱</a>
          <a href="#" class="home-footer__social-link" aria-label="Chat">💬</a>
        </div>
      </div>

      <div class="home-footer__links">
        <div class="home-footer__links-column">
          <h4 class="home-footer__links-title">{{ t('footer.product') }}</h4>
          <ul class="home-footer__links-list">
            <li><router-link to="/features">{{ t('footer.possibilities') }}</router-link></li>
            <li><router-link to="/pricing">{{ t('footer.pricing') }}</router-link></li>
            <li><router-link to="/demo">{{ t('footer.demo') }}</router-link></li>
          </ul>
        </div>

        <div class="home-footer__links-column">
          <h4 class="home-footer__links-title">{{ t('footer.company') }}</h4>
          <ul class="home-footer__links-list">
            <li><router-link to="/about">{{ t('footer.about') }}</router-link></li>
            <li><router-link to="/blog">{{ t('footer.blog') }}</router-link></li>
            <li><router-link to="/careers">{{ t('footer.careers') }}</router-link></li>
          </ul>
        </div>

        <div class="home-footer__links-column">
          <h4 class="home-footer__links-title">{{ t('footer.support') }}</h4>
          <ul class="home-footer__links-list">
            <li><router-link to="/help">{{ t('footer.help') }}</router-link></li>
            <li><router-link to="/contacts">{{ t('footer.contacts') }}</router-link></li>
            <li><router-link to="/docs">{{ t('footer.docs') }}</router-link></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="home-container home-footer__bottom">
      <p class="home-footer__copyright">{{ t('footer.copyright') }}</p>
      <div class="home-footer__legal">
        <router-link to="/privacy">{{ t('footer.privacy') }}</router-link>
        <router-link to="/terms">{{ t('footer.terms') }}</router-link>
      </div>
    </div>
  </footer>
</template>
