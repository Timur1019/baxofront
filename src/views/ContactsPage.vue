<script setup>
import { ref } from 'vue'
import { useI18n } from '../i18n/useI18n'
import { submitContact } from '../api/contactApi'
import HomeFooter from '../components/home/HomeFooter.vue'

const { t } = useI18n()

const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const onSubmit = async () => {
  isSubmitting.value = true
  submitError.value = ''

  try {
    await submitContact({
      name: contactForm.value.name,
      email: contactForm.value.email,
      phone: contactForm.value.phone || null,
      subject: contactForm.value.subject || null,
      message: contactForm.value.message,
    })
    submitSuccess.value = true
    contactForm.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    }
    setTimeout(() => {
      submitSuccess.value = false
    }, 4000)
  } catch (e) {
    submitError.value = e.response?.data?.message || t('contacts.submitError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main>
    <!-- Hero секция для контактов -->
    <section class="contacts-hero">
      <div class="container">
        <h1 class="contacts-hero__title">{{ t('contacts.heroTitle') }}</h1>
        <p class="contacts-hero__subtitle">
          {{ t('contacts.heroSubtitle') }}
        </p>
      </div>
    </section>

    <!-- Контактная информация -->
    <section class="contacts-info">
      <div class="container">
        <div class="contacts-info__grid">
          <!-- Телефон -->
          <div class="contacts-info__card">
            <div class="contacts-info__icon-wrapper">
              <i class="bi bi-telephone-fill contacts-info__icon"></i>
            </div>
            <h3 class="contacts-info__title">{{ t('contacts.phone') }}</h3>
            <p class="contacts-info__text">+998 (71) 000-00-00</p>
            <p class="contacts-info__subtext">{{ t('contacts.phoneSub') }}</p>
            <a href="tel:+998710000000" class="contacts-info__link">{{ t('contacts.callNow') }}</a>
          </div>

          <!-- Email -->
          <div class="contacts-info__card">
            <div class="contacts-info__icon-wrapper">
              <i class="bi bi-envelope-fill contacts-info__icon"></i>
            </div>
            <h3 class="contacts-info__title">{{ t('contacts.email') }}</h3>
            <p class="contacts-info__text">support@baholash.uz</p>
            <p class="contacts-info__subtext">{{ t('contacts.emailSub') }}</p>
            <a href="mailto:support@baholash.uz" class="contacts-info__link">{{ t('contacts.writeUs') }}</a>
          </div>

          <!-- Офис -->
          <div class="contacts-info__card">
            <div class="contacts-info__icon-wrapper">
              <i class="bi bi-geo-alt-fill contacts-info__icon"></i>
            </div>
            <h3 class="contacts-info__title">{{ t('contacts.office') }}</h3>
            <p class="contacts-info__text">{{ t('contacts.officeAddress') }}</p>
            <p class="contacts-info__subtext">{{ t('contacts.officeSub') }}</p>
            <a href="https://maps.google.com" target="_blank" class="contacts-info__link">{{ t('contacts.openMap') }}</a>
          </div>

          <!-- Реквизиты -->
          <div class="contacts-info__card">
            <div class="contacts-info__icon-wrapper">
              <i class="bi bi-building contacts-info__icon"></i>
            </div>
            <h3 class="contacts-info__title">{{ t('contacts.requisites') }}</h3>
            <p class="contacts-info__text">{{ t('contacts.requisitesInn') }}</p>
            <p class="contacts-info__subtext">{{ t('contacts.requisitesOgrn') }}</p>
            <a href="#" class="contacts-info__link">{{ t('contacts.downloadRequisites') }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Форма обратной связи и карта -->
    <section class="contacts-main">
      <div class="container">
        <div class="contacts-main__grid">
          <!-- Форма -->
          <div class="contacts-form">
            <h2 class="contacts-form__title">{{ t('contacts.formTitle') }}</h2>
            <p class="contacts-form__subtitle">
              {{ t('contacts.formSubtitle') }}
            </p>

            <form class="contacts-form__body" @submit.prevent="onSubmit">
              <!-- Сообщение об успехе -->
              <transition name="slide">
                <div v-if="submitSuccess" class="contacts-form__success">
                  <i class="bi bi-check-circle-fill contacts-form__success-icon"></i>
                  <div>
                    {{ t('contacts.successMessage') }}
                  </div>
                </div>
              </transition>

              <!-- Ошибка отправки -->
              <transition name="slide">
                <div v-if="submitError" class="contacts-form__error">
                  {{ submitError }}
                </div>
              </transition>

              <!-- Поля формы -->
              <div class="contacts-form__row">
                <div class="contacts-form__field">
                  <label for="name" class="contacts-form__label">{{ t('contacts.formName') }}</label>
                  <input
                      id="name"
                      v-model="contactForm.name"
                      type="text"
                      class="contacts-form__input"
                      :placeholder="t('contacts.namePlaceholder')"
                      required
                  />
                </div>

                <div class="contacts-form__field">
                  <label for="email" class="contacts-form__label">{{ t('contacts.formEmail') }}</label>
                  <input
                      id="email"
                      v-model="contactForm.email"
                      type="email"
                      class="contacts-form__input"
                      :placeholder="t('contacts.emailPlaceholder')"
                      required
                  />
                </div>
              </div>

              <div class="contacts-form__row">
                <div class="contacts-form__field">
                  <label for="phone" class="contacts-form__label">{{ t('contacts.formPhone') }}</label>
                  <input
                      id="phone"
                      v-model="contactForm.phone"
                      type="tel"
                      class="contacts-form__input"
                      :placeholder="t('contacts.phonePlaceholder')"
                  />
                </div>

                <div class="contacts-form__field">
                  <label for="subject" class="contacts-form__label">{{ t('contacts.formSubject') }}</label>
                  <select id="subject" v-model="contactForm.subject" class="contacts-form__select">
                    <option value="" disabled selected>{{ t('contacts.subjectPlaceholder') }}</option>
                    <option value="general">{{ t('contacts.subjectGeneral') }}</option>
                    <option value="support">{{ t('contacts.subjectSupport') }}</option>
                    <option value="sales">{{ t('contacts.subjectSales') }}</option>
                    <option value="partnership">{{ t('contacts.subjectPartnership') }}</option>
                  </select>
                </div>
              </div>

              <div class="contacts-form__field">
                <label for="message" class="contacts-form__label">{{ t('contacts.formMessage') }}</label>
                <textarea
                    id="message"
                    v-model="contactForm.message"
                    class="contacts-form__textarea"
                    :placeholder="t('contacts.messagePlaceholder')"
                    rows="5"
                    required
                ></textarea>
              </div>

              <!-- Кнопка отправки -->
              <button
                  type="submit"
                  class="contacts-form__submit"
                  :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">{{ t('contacts.submit') }}</span>
                <span v-else class="contacts-form__submit-loading d-inline-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  {{ t('contacts.sending') }}
                </span>
              </button>

              <!-- Согласие на обработку -->
              <p class="contacts-form__agreement">
                {{ t('contacts.agreement') }}
                <a href="#" class="contacts-form__agreement-link">{{ t('contacts.privacyPolicy') }}</a>
              </p>
            </form>
          </div>

          <!-- Карта -->
          <div class="contacts-map">
            <div class="contacts-map__container">
              <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.112987459698!2d69.278724!3d41.311158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b2f0c8c8c8d%3A0x8c8c8c8c8c8c8c8c!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1234567890"
                  class="contacts-map__iframe"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <!-- Карточка с адресом -->
            <div class="contacts-map__card">
              <h3 class="contacts-map__card-title">{{ t('contacts.directions.title') }}</h3>
              <ul class="contacts-map__card-list">
                <li class="contacts-map__card-item">
                  <span class="contacts-map__card-icon">🚇</span>
                  <div>
                    <strong>{{ t('contacts.directions.metroLabel') }}</strong> {{ t('contacts.directions.metro') }}
                  </div>
                </li>
                <li class="contacts-map__card-item">
                  <span class="contacts-map__card-icon">🚌</span>
                  <div>
                    <strong>{{ t('contacts.directions.busLabel') }}</strong> {{ t('contacts.directions.bus') }}
                  </div>
                </li>
                <li class="contacts-map__card-item">
                  <i class="bi bi-geo-alt-fill contacts-map__card-icon"></i>
                  <div>
                    <strong>{{ t('contacts.directions.taxiLabel') }}</strong> {{ t('contacts.directions.taxi') }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Социальные сети -->
    <section class="contacts-social">
      <div class="container">
        <h2 class="contacts-social__title">{{ t('contacts.social.title') }}</h2>
        <p class="contacts-social__subtitle">{{ t('contacts.social.subtitle') }}</p>

        <div class="contacts-social__grid">
          <a href="#" class="contacts-social__link contacts-social__link--telegram">
            <span class="contacts-social__icon">📱</span>
            <span class="contacts-social__name">{{ t('contacts.social.telegram') }}</span>
            <span class="contacts-social__handle">@baholash_uz</span>
          </a>

          <a href="#" class="contacts-social__link contacts-social__link--instagram">
            <span class="contacts-social__icon">📷</span>
            <span class="contacts-social__name">{{ t('contacts.social.instagram') }}</span>
            <span class="contacts-social__handle">@baholash_official</span>
          </a>

          <a href="#" class="contacts-social__link contacts-social__link--facebook">
            <span class="contacts-social__icon">📘</span>
            <span class="contacts-social__name">{{ t('contacts.social.facebook') }}</span>
            <span class="contacts-social__handle">/baholash</span>
          </a>

          <a href="#" class="contacts-social__link contacts-social__link--youtube">
            <span class="contacts-social__icon">▶️</span>
            <span class="contacts-social__name">{{ t('contacts.social.youtube') }}</span>
            <span class="contacts-social__handle">@baholash_tv</span>
          </a>
        </div>
      </div>
    </section>

    <HomeFooter />
  </main>
</template>

<style scoped>
/* === Hero секция === */
.contacts-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  padding: 5rem 0;
  text-align: center;
}

.contacts-hero__title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.contacts-hero__subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* === Контактная информация === */
.contacts-info {
  padding: 5rem 0;
  background: var(--color-bg-card);
}

.contacts-info__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.contacts-info__card {
  background: var(--color-bg-muted);
  padding: 2rem;
  border-radius: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.contacts-info__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.contacts-info__card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

.contacts-info__card:hover::before {
  transform: scaleX(1);
}

.contacts-info__icon-wrapper {
  width: 70px;
  height: 70px;
  background: var(--color-primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.contacts-info__icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary);
}

.contacts-info__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.contacts-info__text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.contacts-info__subtext {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.contacts-info__link {
  display: inline-block;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.contacts-info__link:hover {
  transform: translateX(5px);
  color: var(--color-primary);
}

/* === Основная секция (форма + карта) === */
.contacts-main {
  padding: 5rem 0;
  background: var(--color-bg-muted);
}

.contacts-main__grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
}

/* Форма */
.contacts-form {
  background: var(--color-bg-card);
  padding: 3rem;
  border-radius: 2rem;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

.contacts-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.contacts-form__subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.contacts-form__success {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-success-bg);
  border: 1px solid var(--color-success);
  border-radius: 0.75rem;
  color: var(--color-success);
  margin-bottom: 1.5rem;
}

.contacts-form__success-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.contacts-form__error {
  padding: 1rem;
  background: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: 0.75rem;
  color: var(--color-error);
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

.contacts-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.contacts-form__field {
  margin-bottom: 1.5rem;
}

.contacts-form__label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.contacts-form__input,
.contacts-form__select,
.contacts-form__textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--color-bg-muted);
}

.contacts-form__input:focus,
.contacts-form__select:focus,
.contacts-form__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 4px var(--color-primary-light);
}

.contacts-form__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475669' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
}

.contacts-form__textarea {
  resize: vertical;
  min-height: 120px;
}

.contacts-form__submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1.5rem 0 1rem;
}

.contacts-form__submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px var(--color-primary-light);
}

.contacts-form__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.contacts-form__submit-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.contacts-form__spinner {
  width: 20px;
  height: 20px;
  animation: rotate 2s linear infinite;
}

.contacts-form__spinner-path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.contacts-form__agreement {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.contacts-form__agreement-link {
  color: var(--color-primary);
  text-decoration: none;
}

.contacts-form__agreement-link:hover {
  text-decoration: underline;
}

/* Карта */
.contacts-map {
  position: relative;
}

.contacts-map__container {
  height: 400px;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

.contacts-map__iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.contacts-map__card {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.contacts-map__card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.contacts-map__card-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contacts-map__card-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

.contacts-map__card-item:last-child {
  margin-bottom: 0;
}

.contacts-map__card-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* === Социальные сети === */
.contacts-social {
  padding: 5rem 0;
  background: var(--color-bg-card);
  text-align: center;
}

.contacts-social__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.contacts-social__subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 3rem;
}

.contacts-social__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.contacts-social__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: var(--color-bg-muted);
  border-radius: 1.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
}

.contacts-social__link:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

.contacts-social__link--telegram:hover {
  background: #0088cc;
  border-color: #0088cc;
}

.contacts-social__link--instagram:hover {
  background: linear-gradient(45deg, #f09433, #d62976, #962fbf);
  border-color: transparent;
}

.contacts-social__link--facebook:hover {
  background: #1877f2;
  border-color: #1877f2;
}

.contacts-social__link--youtube:hover {
  background: #ff0000;
  border-color: #ff0000;
}

.contacts-social__link:hover .contacts-social__name,
.contacts-social__link:hover .contacts-social__handle,
.contacts-social__link:hover .contacts-social__icon {
  color: white;
}

.contacts-social__icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.contacts-social__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.contacts-social__handle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition: color 0.3s ease;
}

/* === Анимации === */
@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* === Адаптивность === */
@media (max-width: 1024px) {
  .contacts-info__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .contacts-main__grid {
    grid-template-columns: 1fr;
  }

  .contacts-social__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .contacts-hero__title {
    font-size: 2.5rem;
  }

  .contacts-info__grid {
    grid-template-columns: 1fr;
  }

  .contacts-form__row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .contacts-map__card {
    position: static;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .contacts-hero {
    padding: 3rem 0;
  }

  .contacts-hero__title {
    font-size: 2rem;
  }

  .contacts-form {
    padding: 2rem;
  }

  .contacts-social__grid {
    grid-template-columns: 1fr;
  }
}
</style>