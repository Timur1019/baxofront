<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../../i18n/useI18n'
import { createEvaluationRequest } from '../../api/evaluationApi'

const { t } = useI18n()
const router = useRouter()
const form = ref({ objectDescription: '' })
const loading = ref(false)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await createEvaluationRequest({ objectDescription: form.value.objectDescription || null })
    router.push({ name: 'client-requests' })
  } catch (e) {
    error.value = e.response?.data?.message || e.message || t('client.createError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="client-create-page">
    <h1 class="client-create-page__title">{{ t('client.createTitle') }}</h1>
    <p class="client-create-page__desc">{{ t('client.createDesc') }}</p>

    <form class="client-create-page__form" @submit.prevent="submit">
      <label class="client-create-page__label">{{ t('client.objectDescription') }}</label>
      <textarea
        v-model="form.objectDescription"
        class="client-create-page__textarea"
        rows="4"
        :placeholder="t('client.objectDescription')"
      />
      <p v-if="error" class="client-create-page__error">{{ error }}</p>
      <div class="client-create-page__actions">
        <router-link :to="{ name: 'client-requests' }" class="client-create-page__btn client-create-page__btn--secondary">
          {{ t('client.cancel') }}
        </router-link>
        <button type="submit" class="client-create-page__btn client-create-page__btn--primary" :disabled="loading">
          {{ loading ? t('client.loading') : t('client.createSubmit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.client-create-page__title { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; margin-bottom: 0.5rem; }
.client-create-page__desc { color: #666; margin-bottom: 1.5rem; }
.client-create-page__form { max-width: 560px; background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.client-create-page__label { display: block; font-weight: 500; color: #333; margin-bottom: 0.5rem; }
.client-create-page__textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
}
.client-create-page__error { color: #b91c1c; font-size: 0.9rem; margin-top: 0.5rem; }
.client-create-page__actions { display: flex; gap: 1rem; margin-top: 1.25rem; }
.client-create-page__btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: none;
  font-size: 0.95rem;
}
.client-create-page__btn--primary { background: #0f0d14; color: #fff; }
.client-create-page__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
.client-create-page__btn--secondary { background: #e5e7eb; color: #374151; }
</style>
