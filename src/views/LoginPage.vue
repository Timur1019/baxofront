<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../i18n/useI18n'
import { loginApi } from '../api/authApi'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const isSubmitting = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const form = ref({
  username: '',
  password: '',
  remember: false,
})

const onSubmit = async () => {
  if (!form.value.username || !form.value.password || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const data = await loginApi({
      login: form.value.username,
      password: form.value.password,
    })

    const authData = {
      token: data.token,
      fullName: data.fullName,
      role: data.role,
      canEditEvaluationRequests: data.canEditEvaluationRequests !== false,
      canDeleteEvaluationRequests: data.canDeleteEvaluationRequests !== false,
    }

    if (form.value.remember) {
      localStorage.setItem('baholash_auth', JSON.stringify(authData))
    } else {
      sessionStorage.setItem('baholash_auth', JSON.stringify(authData))
    }

    let redirectPath = route.query.redirect
    if (!redirectPath) {
      const role = data.role || ''
      if (role === 'ADMIN') redirectPath = '/admin'
      else if (role === 'CLIENT_EMPLOYEE') redirectPath = '/client'
      else if (role === 'COMPANY_EMPLOYEE') redirectPath = '/company/requests'
      else redirectPath = '/admin'
    }
    await router.push(redirectPath)
  } catch (e) {
    errorMessage.value = t('login.errorInvalid')
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div class="login-page">
    <!-- Левая колонка с брендом и информацией -->
    <div class="login-brand">
      <div class="login-brand__content">
        <router-link to="/" class="login-brand__logo">
          <span class="login-brand__logo-text">Baholash</span>
        </router-link>

        <h1 class="login-brand__title">
          {{ t('login.welcome') }}
        </h1>

        <p class="login-brand__subtitle">
          {{ t('login.subtitle') }}
        </p>

        <div class="login-brand__features">
          <div class="login-brand__feature">
            <span class="login-brand__feature-icon">✓</span>
            <span>{{ t('login.feature1') }}</span>
          </div>
          <div class="login-brand__feature">
            <span class="login-brand__feature-icon">✓</span>
            <span>{{ t('login.feature2') }}</span>
          </div>
          <div class="login-brand__feature">
            <span class="login-brand__feature-icon">✓</span>
            <span>{{ t('login.feature3') }}</span>
          </div>
          <div class="login-brand__feature">
            <span class="login-brand__feature-icon">✓</span>
            <span>{{ t('login.feature4') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Правая колонка с формой входа -->
    <div class="login-form">
      <div class="login-form__container">
        <div class="login-form__header">
          <h2 class="login-form__title">{{ t('login.formTitle') }}</h2>
          <p class="login-form__subtitle">
            {{ t('login.formSubtitle') }}
          </p>
        </div>

        <form class="login-form__body" @submit.prevent="onSubmit">
          <!-- Сообщение об ошибке -->
          <transition name="shake">
            <div v-if="errorMessage" class="login-form__error">
              <i class="bi bi-exclamation-circle-fill login-form__error-icon"></i>
              {{ errorMessage }}
            </div>
          </transition>

          <!-- Поле логина -->
          <div class="login-form__field">
            <label for="username" class="login-form__label">
              <i class="bi bi-person login-form__label-icon"></i>
              {{ t('login.loginLabel') }}
            </label>
            <div class="login-form__input-wrapper">
              <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errorMessage }"
                  placeholder="admin"
                  required
              />
            </div>
          </div>

          <!-- Поле пароля -->
          <div class="login-form__field">
            <label for="password" class="login-form__label">
              <i class="bi bi-lock login-form__label-icon"></i>
              {{ t('login.passwordLabel') }}
            </label>
            <div class="login-form__input-wrapper">
              <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="{ 'is-invalid': errorMessage }"
                  :placeholder="t('login.passwordPlaceholder')"
                  required
              />
              <button
                  type="button"
                  class="login-form__password-toggle"
                  @click="showPassword = !showPassword"
                  :title="showPassword ? t('login.hidePassword') : t('login.showPassword')"
              >
                <i v-if="!showPassword" class="bi bi-eye"></i>
                <i v-else class="bi bi-eye-slash"></i>
              </button>
            </div>
          </div>

          <!-- Дополнительные опции -->
          <div class="login-form__options">
            <label class="login-form__checkbox">
              <input type="checkbox" v-model="form.remember" />
              <span class="login-form__checkbox-custom"></span>
              <span class="login-form__checkbox-label">{{ t('login.remember') }}</span>
            </label>
          </div>

          <!-- Кнопка входа -->
          <button
              type="submit"
              class="login-form__submit"
              :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">{{ t('login.submit') }}</span>
            <span v-else class="login-form__submit-loading d-inline-flex align-items-center gap-2">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {{ t('login.submitting') }}
            </span>
          </button>

          <!-- Ссылка на регистрацию -->
          <div class="login-form__footer">
            {{ t('login.noAccount') }}
            <router-link to="/contacts" class="login-form__footer-link">
              {{ t('login.contactUs') }}
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === Основные переменные === */
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
}

/* === Левая колонка с брендом === */
.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30 0 L60 30 L30 60 L0 30 Z" fill="rgba(255,255,255,0.03)"/></svg>');
  opacity: 0.1;
}

.login-brand__content {
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-brand__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
  margin-bottom: 2rem;
}

.login-brand__logo-icon {
  font-size: 2rem;
}

.login-brand__logo-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.login-brand__title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.login-brand__subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.login-brand__features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.login-brand__feature {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
}

.login-brand__feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
}

.login-brand__stats {
  display: flex;
  gap: 2rem;
}

.login-brand__stat {
  display: flex;
  flex-direction: column;
}

.login-brand__stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.login-brand__stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* === Правая колонка с формой === */
.login-form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 2rem 0 0 2rem;
  box-shadow: -20px 0 40px rgba(0, 0, 0, 0.1);
}

.login-form__container {
  width: 100%;
  max-width: 400px;
}

.login-form__header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-form__title {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.login-form__subtitle {
  color: #64748b;
  font-size: 0.875rem;
}

/* === Ошибка === */
.login-form__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 0.75rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.login-form__error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.shake-enter-active {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

/* === Поля формы === */
.login-form__field {
  margin-bottom: 1.5rem;
}

.login-form__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.login-form__label-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.login-form__input-wrapper {
  position: relative;
}

.login-form__input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.login-form__input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.login-form__input--error {
  border-color: #dc2626;
  background: #fef2f2;
}

.login-form__input--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

/* === Переключатель видимости пароля === */
.login-form__password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.login-form__password-toggle:hover {
  color: #0f172a;
}

.login-form__password-toggle svg {
  width: 20px;
  height: 20px;
}

/* === Дополнительные опции === */
.login-form__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.login-form__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
}

.login-form__checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.login-form__checkbox-custom {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.login-form__checkbox input:checked ~ .login-form__checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.login-form__checkbox-custom::after {
  content: '';
  position: absolute;
  display: none;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.login-form__checkbox input:checked ~ .login-form__checkbox-custom::after {
  display: block;
}

.login-form__checkbox-label {
  font-size: 0.875rem;
  color: #64748b;
}

.login-form__forgot {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-form__forgot:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* === Кнопка входа === */
.login-form__submit {
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
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.login-form__submit::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.5s, height 0.5s;
}

.login-form__submit:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.login-form__submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.4);
}

.login-form__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-form__submit-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* === Спиннер загрузки === */
.login-form__spinner {
  width: 20px;
  height: 20px;
  animation: rotate 2s linear infinite;
}

.login-form__spinner-path {
  stroke: white;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

/* === Демо-блок === */
.login-form__demo {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.login-form__demo-text {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.login-form__demo-button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.login-form__demo-button:hover {
  color: var(--color-primary);
}

/* === Футер формы === */
.login-form__footer {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.login-form__footer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.25rem;
}

.login-form__footer-link:hover {
  text-decoration: underline;
}

/* === Адаптивность === */
@media (max-width: 1024px) {
  .login-brand__title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-brand {
    display: none;
  }

  .login-form {
    border-radius: 0;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 4rem;
  }
}

@media (max-width: 480px) {
  .login-form {
    padding: 1.5rem;
  }

  .login-form__title {
    font-size: 1.75rem;
  }

  .login-form__options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

/* Анимации */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form__container {
  animation: fadeInUp 0.6s ease-out;
}
</style>