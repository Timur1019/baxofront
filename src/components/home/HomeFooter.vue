<script setup>
import { useI18n } from '../../i18n/useI18n'

const { t } = useI18n()
</script>

<template>
  <footer class="home-footer">
    <div class="container home-footer__container">
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
            <li><a href="#">{{ t('footer.possibilities') }}</a></li>
            <li><a href="#">{{ t('footer.pricing') }}</a></li>
            <li><a href="#">{{ t('footer.demo') }}</a></li>
          </ul>
        </div>

        <div class="home-footer__links-column">
          <h4 class="home-footer__links-title">{{ t('footer.company') }}</h4>
          <ul class="home-footer__links-list">
            <li><a href="#">{{ t('footer.about') }}</a></li>
            <li><a href="#">{{ t('footer.blog') }}</a></li>
            <li><a href="#">{{ t('footer.careers') }}</a></li>
          </ul>
        </div>

        <div class="home-footer__links-column">
          <h4 class="home-footer__links-title">{{ t('footer.support') }}</h4>
          <ul class="home-footer__links-list">
            <li><a href="#">{{ t('footer.help') }}</a></li>
            <li><a href="#">{{ t('footer.contacts') }}</a></li>
            <li><a href="#">{{ t('footer.docs') }}</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="container home-footer__bottom">
      <p class="home-footer__copyright">{{ t('footer.copyright') }}</p>
      <div class="home-footer__legal">
        <a href="#">{{ t('footer.privacy') }}</a>
        <a href="#">{{ t('footer.terms') }}</a>
      </div>
    </div>
  </footer>
</template>
