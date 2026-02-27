<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from '../../i18n/useI18n'
import { fetchUsers, createUser, updateUser, deleteUser } from '../../api/usersApi'

const { t } = useI18n()
// Состояния
const users = ref([])
const filteredUsers = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Пагинация
const currentPage = ref(0)
const pageSize = ref(10)
const totalElements = ref(0)
const totalPages = ref(0)

// Поиск и фильтры
const searchQuery = ref('')
const roleFilter = ref('ALL')
const statusFilter = ref('ALL')

// Модальное окно
const isModalOpen = ref(false)
const isSaving = ref(false)
const isEditMode = ref(false)
const editingUserId = ref(null)
const formUser = ref({
  login: '',
  email: '',
  fullName: '',
  role: 'COMPANY_EMPLOYEE',
  active: true,
  password: '',
  canEditEvaluationRequests: true,
  canDeleteEvaluationRequests: true,
})

// Роли для выбора (ровно те, что есть в бэкенде)
const roles = computed(() => [
  { value: 'ADMIN', label: t('admin.roleAdmin'), color: 'warning' },
  { value: 'COMPANY_EMPLOYEE', label: t('admin.roleCompany'), color: 'primary' },
  { value: 'CLIENT_EMPLOYEE', label: t('admin.roleClient'), color: 'success' },
])

// Загрузка пользователей
const loadUsers = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    console.log('Загружаем пользователей...')

    const response = await fetchUsers({
      page: currentPage.value,
      size: pageSize.value,
      search: searchQuery.value,
      role: roleFilter.value,
      active: statusFilter.value,
    })

    console.log('Ответ от API:', response)

    // Проверяем структуру ответа
    let content = []
    if (response?.content) {
      content = response.content
    } else if (Array.isArray(response)) {
      content = response
    } else if (response?.data) {
      content = response.data
    }

    users.value = content
    filteredUsers.value = content
    totalElements.value = response?.totalElements || content.length
    totalPages.value = response?.totalPages || Math.ceil(content.length / pageSize.value) || 1

    console.log('Обработанные пользователи:', users.value)
    console.log('Количество:', users.value.length)

  } catch (e) {
    console.error('Ошибка загрузки:', e)
    users.value = []
    filteredUsers.value = []
    totalElements.value = 0
    totalPages.value = 0
    errorMessage.value = e?.message || t('admin.usersLoadError')
  } finally {
    isLoading.value = false
  }
}

// Открытие модального окна для создания
const openCreateModal = () => {
  isEditMode.value = false
  editingUserId.value = null
  formUser.value = {
    login: '',
    email: '',
    fullName: '',
    role: 'COMPANY_EMPLOYEE',
    active: true,
    password: '',
    canEditEvaluationRequests: true,
    canDeleteEvaluationRequests: true,
  }
  isModalOpen.value = true
}

// Открытие модального окна для редактирования
const openEditModal = (user) => {
  isEditMode.value = true
  editingUserId.value = user.id
  formUser.value = {
    login: user.login,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    active: user.active,
    password: '',
    canEditEvaluationRequests: user.canEditEvaluationRequests !== false,
    canDeleteEvaluationRequests: user.canDeleteEvaluationRequests !== false,
  }
  isModalOpen.value = true
}

// Сохранение пользователя
const saveUser = async () => {
  if (isSaving.value) return

  if (!formUser.value.login || !formUser.value.email || !formUser.value.fullName) {
    errorMessage.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }

  if (!isEditMode.value && !formUser.value.password) {
    errorMessage.value = 'Пароль обязателен для нового пользователя'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    if (isEditMode.value && editingUserId.value) {
      await updateUser(editingUserId.value, {
        login: formUser.value.login,
        email: formUser.value.email,
        fullName: formUser.value.fullName,
        role: formUser.value.role,
        active: formUser.value.active,
        canEditEvaluationRequests: formUser.value.canEditEvaluationRequests,
        canDeleteEvaluationRequests: formUser.value.canDeleteEvaluationRequests,
      })
      successMessage.value = 'Пользователь успешно обновлен'
    } else {
      await createUser(formUser.value)
      successMessage.value = 'Пользователь успешно создан'
    }

    isModalOpen.value = false
    await loadUsers()

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e) {
    console.error('Ошибка сохранения:', e)
    errorMessage.value = isEditMode.value
        ? 'Не удалось обновить пользователя'
        : 'Не удалось создать пользователя'
  } finally {
    isSaving.value = false
  }
}

// Удаление пользователя
const removeUser = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
    return
  }

  try {
    await deleteUser(id)
    successMessage.value = 'Пользователь успешно удален'
    await loadUsers()

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e) {
    console.error('Ошибка удаления:', e)
    errorMessage.value = 'Не удалось удалить пользователя'
  }
}

// Сброс фильтров
const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = 'ALL'
  statusFilter.value = 'ALL'
  currentPage.value = 0
  loadUsers()
}

// Переключение статуса пользователя
const toggleUserStatus = async (user) => {
  try {
    await updateUser(user.id, {
      ...user,
      active: !user.active
    })
    successMessage.value = `Пользователь ${user.active ? 'деактивирован' : 'активирован'}`
    await loadUsers()

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e) {
    console.error('Ошибка изменения статуса:', e)
    errorMessage.value = 'Не удалось изменить статус пользователя'
  }
}

// Получение цвета для роли
const getRoleColor = (role) => {
  const roleObj = roles.value.find(r => r.value === role)
  return roleObj?.color || 'secondary'
}

// Получение инициалов пользователя
const getUserInitials = (fullName) => {
  if (!fullName) return '?'
  const names = fullName.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return fullName.substring(0, 2).toUpperCase()
}

// Форматирование даты регистрации (ISO или timestamp с бэкенда)
const formatDate = (value) => {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('ru-RU')
  } catch {
    return '—'
  }
}

// Навигация по страницам
const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    loadUsers()
  }
}

// Следим за изменениями фильтров
watch([searchQuery, roleFilter, statusFilter, currentPage], () => {
  loadUsers()
})

// Инициализация
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="users-page">
    <!-- Заголовок -->
    <div class="users-page__header">
      <div>
        <h1 class="users-page__title fs-4 fw-semibold">Управление пользователями</h1>
        <p class="users-page__subtitle small text-muted mb-0">
          Всего пользователей: <strong>{{ totalElements }}</strong>
        </p>
      </div>
      <button class="btn btn-primary d-inline-flex align-items-center gap-2" @click="openCreateModal">
        <i class="bi bi-plus-lg"></i>
        Добавить пользователя
      </button>
    </div>

    <!-- Сообщения об ошибках/успехе -->
    <transition name="slide">
      <div v-if="errorMessage" class="users-page__alert users-page__alert--error">
        <i class="bi bi-exclamation-circle-fill users-page__alert-icon"></i>
        {{ errorMessage }}
      </div>
    </transition>

    <transition name="slide">
      <div v-if="successMessage" class="users-page__alert users-page__alert--success">
        <i class="bi bi-check-circle-fill users-page__alert-icon"></i>
        {{ successMessage }}
      </div>
    </transition>

    <!-- Фильтры и поиск -->
    <div class="users-page__filters">
      <div class="users-page__search">
        <i class="bi bi-search users-page__search-icon"></i>
        <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Поиск по логину, email или имени"
        />
      </div>

      <div class="users-page__filter-group">
        <select v-model="roleFilter" class="form-select form-select-sm">
          <option value="ALL">Все роли</option>
          <option v-for="role in roles" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>

        <select v-model="statusFilter" class="form-select form-select-sm">
          <option value="ALL">Все статусы</option>
          <option value="ACTIVE">Активные</option>
          <option value="INACTIVE">Неактивные</option>
        </select>

        <button class="btn btn-outline-secondary btn-sm" @click="resetFilters" title="Сбросить фильтры">
          <i class="bi bi-arrow-repeat"></i>
        </button>
      </div>
    </div>

    <!-- Таблица пользователей -->
    <div class="users-page__table-container">
      <div class="table-responsive">
        <table class="table table-bordered table-hover">
          <thead>
          <tr>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Дата регистрации</th>
            <th class="table__cell--actions-head">Действия</th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="isLoading" class="table__row">
            <td colspan="6" class="table__loading-cell">
              <div class="users-page__loader"></div>
              <span>Загрузка пользователей...</span>
            </td>
          </tr>

          <tr v-else-if="!filteredUsers.length" class="table__row">
            <td colspan="6" class="table__empty-cell">
              <i class="bi bi-person-x users-page__empty-icon"></i>
              <p>Пользователи не найдены</p>
              <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">Сбросить фильтры</button>
            </td>
          </tr>

          <tr v-else v-for="user in filteredUsers" :key="user.id" class="table__row">
          <td>
            <div class="users-page__user-info">
              <div class="users-page__user-avatar" :style="{ backgroundColor: `var(--${getRoleColor(user.role)})` }">
                {{ getUserInitials(user.fullName) }}
              </div>
              <div>
                <div class="users-page__user-name">{{ user.fullName }}</div>
                <div class="users-page__user-login">@{{ user.login }}</div>
              </div>
            </div>
          </td>
          <td>
            <a :href="`mailto:${user.email}`" class="users-page__user-email">
              {{ user.email }}
            </a>
          </td>
          <td>
              <span class="users-page__role-badge" :class="`users-page__role-badge--${getRoleColor(user.role)}`">
                {{ roles.find(r => r.value === user.role)?.label || user.role }}
              </span>
          </td>
          <td>
            <button
                class="users-page__status-toggle"
                :class="{ 'users-page__status-toggle--active': user.active }"
                @click="toggleUserStatus(user)"
                :title="user.active ? 'Деактивировать' : 'Активировать'"
            >
              <span class="users-page__status-dot"></span>
              <span>{{ user.active ? 'Активен' : 'Неактивен' }}</span>
            </button>
          </td>
          <td>
              <span class="users-page__user-date">{{ formatDate(user.createdAt) }}</span>
          </td>
          <td>
            <div class="users-page__actions">
              <button
                  class="btn btn-sm btn-outline-primary"
                  @click="openEditModal(user)"
                  title="Редактировать"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                  class="btn btn-danger btn-sm"
                  @click="removeUser(user.id)"
                  title="Удалить"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
        </table>
      </div>
    </div>

<!--    &lt;!&ndash; ОТЛАДОЧНАЯ ИНФОРМАЦИЯ &ndash;&gt;-->
<!--    <div class="users-page__debug" style="margin: 20px 0; padding: 15px; background: #fff; border: 1px solid #ccc; border-radius: 8px;">-->
<!--      <h3 style="margin-bottom: 10px;">🔍 Отладочная информация:</h3>-->
<!--      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px;">-->
<!--        <div><strong>isLoading:</strong> {{ isLoading }}</div>-->
<!--        <div><strong>users.length:</strong> {{ users.length }}</div>-->
<!--        <div><strong>filteredUsers.length:</strong> {{ filteredUsers.length }}</div>-->
<!--        <div><strong>totalElements:</strong> {{ totalElements }}</div>-->
<!--        <div><strong>currentPage:</strong> {{ currentPage }}</div>-->
<!--        <div><strong>totalPages:</strong> {{ totalPages }}</div>-->
<!--      </div>-->
<!--      <div v-if="errorMessage" style="color: red; margin-bottom: 10px;">-->
<!--        <strong>Ошибка:</strong> {{ errorMessage }}-->
<!--      </div>-->
<!--      <details>-->
<!--        <summary style="cursor: pointer; color: var(&#45;&#45;primary);">📋 Показать данные пользователей ({{ users.length }})</summary>-->
<!--        <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px; overflow: auto; max-height: 300px;">{{ JSON.stringify(users, null, 2) }}</pre>-->
<!--      </details>-->
<!--    </div>-->

    <!-- Пагинация -->
    <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-4 mb-3" aria-label="Пагинация пользователей">
      <ul class="pagination pagination-lg">
        <li class="page-item" :class="{ disabled: currentPage === 0 }">
          <button type="button" class="page-link" :disabled="currentPage === 0" @click="goToPage(currentPage - 1)" aria-label="Назад">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page - 1 }">
          <button type="button" class="page-link" @click="goToPage(page - 1)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
          <button type="button" class="page-link" :disabled="currentPage === totalPages - 1" @click="goToPage(currentPage + 1)" aria-label="Вперёд">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Модальное окно создания/редактирования -->
    <transition name="modal">
      <div v-if="isModalOpen" class="users-page__modal-overlay" @click.self="isModalOpen = false">
        <div class="users-page__modal">
          <div class="users-page__modal-header">
            <h3 class="users-page__modal-title">
              {{ isEditMode ? 'Редактирование пользователя' : 'Создание нового пользователя' }}
            </h3>
            <button class="users-page__modal-close" @click="isModalOpen = false">×</button>
          </div>

          <form class="users-page__modal-form" @submit.prevent="saveUser">
            <div class="users-page__form-grid">
              <div class="users-page__form-group">
                <label class="form-label">
                  Логин <span class="text-danger">*</span>
                </label>
                <input
                    v-model="formUser.login"
                    type="text"
                    class="form-control"
                    placeholder="john_doe"
                    required
                />
              </div>

              <div class="users-page__form-group">
                <label class="form-label">
                  Email <span class="text-danger">*</span>
                </label>
                <input
                    v-model="formUser.email"
                    type="email"
                    class="form-control"
                    placeholder="john@example.com"
                    required
                />
              </div>

              <div class="users-page__form-group">
                <label class="form-label">
                  ФИО <span class="text-danger">*</span>
                </label>
                <input
                    v-model="formUser.fullName"
                    type="text"
                    class="form-control"
                    placeholder="Иванов Иван Иванович"
                    required
                />
              </div>

              <div class="users-page__form-group">
                <label class="form-label">Роль</label>
                <select v-model="formUser.role" class="form-select">
                  <option v-for="role in roles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
              </div>

              <div v-if="!isEditMode" class="users-page__form-group">
                <label class="form-label">
                  Пароль <span class="text-danger">*</span>
                </label>
                <input
                    v-model="formUser.password"
                    type="password"
                    class="form-control"
                    placeholder="Минимум 6 символов"
                    :required="!isEditMode"
                />
              </div>

              <div class="users-page__form-group users-page__form-group--checkbox">
                <label class="users-page__checkbox">
                  <input v-model="formUser.active" type="checkbox"/>
                  <span class="users-page__checkbox-custom"></span>
                  <span class="users-page__checkbox-label">Активен</span>
                </label>
              </div>

              <!-- Права доступа к заявкам — при создании и редактировании -->
              <div v-if="formUser.role !== 'ADMIN'" class="users-page__permissions-card">
                <div class="users-page__permissions-header">
                  <i class="bi bi-shield-lock users-page__permissions-icon"></i>
                  <span class="users-page__permissions-title">Права доступа к заявкам на оценку</span>
                </div>
                <p class="users-page__permissions-desc">Выберите, какие действия разрешены этому пользователю</p>
                <div class="users-page__permissions-list">
                  <label class="users-page__checkbox users-page__checkbox--permission">
                    <input v-model="formUser.canEditEvaluationRequests" type="checkbox"/>
                    <span class="users-page__checkbox-custom"></span>
                    <span class="users-page__checkbox-label">Редактировать заявки</span>
                    <i class="bi bi-pencil-square users-page__permission-icon" title="Редактирование"></i>
                  </label>
                  <label class="users-page__checkbox users-page__checkbox--permission">
                    <input v-model="formUser.canDeleteEvaluationRequests" type="checkbox"/>
                    <span class="users-page__checkbox-custom"></span>
                    <span class="users-page__checkbox-label">Удалять заявки</span>
                    <i class="bi bi-trash users-page__permission-icon" title="Удаление"></i>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="errorMessage" class="users-page__form-error">
              {{ errorMessage }}
            </div>

            <div class="users-page__modal-actions">
              <button
                  type="button"
                  class="btn btn-secondary"
                  @click="isModalOpen = false"
              >
                Отмена
              </button>
              <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSaving"
              >
                <span v-if="!isSaving">{{ isEditMode ? 'Сохранить' : 'Создать' }}</span>
                <span v-else class="users-page__modal-loading d-inline-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Сохранение...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* === Основные переменные === */
.users-page {
  --primary: var(--color-primary);
  --primary-dark: var(--color-primary-hover);
  --secondary: var(--color-primary-hover);
  --success: #48bb78;
  --warning: #ed8936;
  --danger: #f56565;
  --info: #4299e1;
  --dark: #1a202c;
  --gray: #718096;
  --light: #f7fafc;
  --white: #ffffff;

  padding: 2rem;
  background: var(--color-bg);
  min-height: 100vh;
}

/* === Заголовок === */
.users-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.users-page__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0;
  margin-bottom: 0.25rem;
}

.users-page__subtitle {
  color: var(--gray);
  font-size: 0.9rem;
  margin: 0;
}

.users-page__create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.users-page__create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

.users-page__create-icon {
  width: 20px;
  height: 20px;
}

/* === Уведомления === */
.users-page__alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease;
}

.users-page__alert--error {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.users-page__alert--success {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
}

.users-page__alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* === Фильтры === */
.users-page__filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.users-page__search {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.users-page__search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--gray);
}

.users-page__search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: var(--white);
}

.users-page__search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.users-page__filter-group {
  display: flex;
  gap: 0.5rem;
}

.users-page__filter-select {
  padding: 0.75rem 2rem 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: var(--white);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475669' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}

.users-page__filter-reset {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: var(--white);
  color: var(--gray);
  cursor: pointer;
  transition: all 0.3s ease;
}

.users-page__filter-reset:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.users-page__filter-reset svg {
  width: 18px;
  height: 18px;
}

.users-page__table-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin-bottom: 2rem;
}

/* === Информация о пользователе === */
.users-page__user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.users-page__user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.users-page__user-name {
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.users-page__user-login {
  font-size: 0.8rem;
  color: var(--gray);
}

.users-page__user-email {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.9rem;
}

.users-page__user-email:hover {
  text-decoration: underline;
}

.users-page__user-date {
  font-size: 0.9rem;
  color: var(--gray);
}

/* === Бейджи ролей === */
.users-page__role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-page__role-badge--primary {
  background: rgba(102, 126, 234, 0.2);
  color: var(--primary);
}

.users-page__role-badge--success {
  background: rgba(72, 187, 120, 0.2);
  color: var(--success);
}

.users-page__role-badge--warning {
  background: rgba(237, 137, 54, 0.2);
  color: var(--warning);
}

.users-page__role-badge--info {
  background: rgba(66, 153, 225, 0.2);
  color: var(--info);
}

.users-page__role-badge--secondary {
  background: rgba(113, 128, 150, 0.2);
  color: var(--gray);
}

/* === Переключатель статуса === */
.users-page__status-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: var(--white);
  color: var(--gray);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.users-page__status-toggle--active {
  background: rgba(72, 187, 120, 0.1);
  border-color: var(--success);
  color: var(--success);
}

.users-page__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  transition: all 0.3s ease;
}

/* === Действия === */
.users-page__actions {
  display: flex;
  gap: 0.5rem;
}

.users-page__action-btn {
  width: 35px;
  height: 35px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: var(--white);
  color: var(--gray);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.users-page__action-btn:hover {
  transform: translateY(-2px);
}

.users-page__action-btn svg {
  width: 18px;
  height: 18px;
}

.users-page__action-btn--edit:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.2);
}

.users-page__loader {
  width: 50px;
  height: 50px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.users-page__empty-icon {
  width: 60px;
  height: 60px;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.users-page__empty-reset {
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
}

/* === Модальное окно === */
.users-page__modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.users-page__modal {
  background: var(--color-bg-card);
  border-radius: 12px;
  width: 95%;
  max-width: 640px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border-light);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.users-page__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  background: linear-gradient(to bottom, #fff 0%, #f8fafc 100%);
}

.users-page__modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.users-page__modal-close {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  padding: 0;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.users-page__modal-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  border-color: var(--color-border);
}

/* === Форма === */
.users-page__modal-form {
  padding: 1.5rem;
}

.users-page__form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
}

.users-page__form-group {
  margin-bottom: 1rem;
}

.users-page__form-group--checkbox {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
}

.users-page__form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dark);
  margin-bottom: 0.5rem;
}

.text-danger {
  color: var(--danger);
}

.users-page__form-input,
.users-page__form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.users-page__form-input:focus,
.users-page__form-select:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* === Кастомный чекбокс === */
.users-page__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
}

.users-page__checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.users-page__checkbox-custom {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.users-page__checkbox input:checked ~ .users-page__checkbox-custom {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-color: transparent;
}

.users-page__checkbox-custom::after {
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

.users-page__checkbox input:checked ~ .users-page__checkbox-custom::after {
  display: block;
}

.users-page__checkbox-label {
  font-size: 0.95rem;
  color: var(--dark);
}

/* === Блок прав доступа (создание и редактирование) === */
.users-page__permissions-card {
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  border-left: 4px solid var(--primary, #667eea);
}

.users-page__permissions-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.users-page__permissions-icon {
  font-size: 1.125rem;
  color: var(--primary, #667eea);
}

.users-page__permissions-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
}

.users-page__permissions-desc {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0 0 1rem;
  line-height: 1.4;
}

.users-page__permissions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.users-page__checkbox--permission {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.users-page__checkbox--permission:hover {
  border-color: #cbd5e1;
}

.users-page__checkbox--permission input:checked ~ .users-page__checkbox-custom {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-color: transparent;
}

.users-page__checkbox--permission .users-page__checkbox-label {
  flex: 1;
  font-weight: 500;
}

.users-page__permission-icon {
  font-size: 1rem;
  color: #94a3b8;
}

/* === Ошибка формы === */
.users-page__form-error {
  padding: 1rem;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  color: #c53030;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* === Кнопки модального окна === */
.users-page__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.25rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border-light);
}

.users-page__modal-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.users-page__modal-btn--secondary {
  background: #e2e8f0;
  color: var(--dark);
}

.users-page__modal-btn--secondary:hover {
  background: #cbd5e0;
}

.users-page__modal-btn--primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.users-page__modal-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4);
}

.users-page__modal-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.users-page__modal-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.users-page__modal-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.users-page__modal-spinner-path {
  stroke: currentColor;
  stroke-linecap: round;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Адаптивность === */
@media (max-width: 1024px) {
  .users-page__filters {
    flex-direction: column;
  }

  .users-page__search {
    min-width: auto;
  }

  .users-page__filter-group {
    width: 100%;
  }

  .users-page__filter-select {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .users-page {
    padding: 1rem;
  }

  .users-page__header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .users-page__table-container .table th:nth-child(2),
  .users-page__table-container .table td:nth-child(2) {
    display: none;
  }

  .users-page__form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .users-page__filter-group {
    flex-wrap: wrap;
  }

  .users-page__filter-select {
    width: 100%;
  }

  .users-page__table-container .table th:nth-child(4),
  .users-page__table-container .table td:nth-child(4) {
    display: none;
  }

  .users-page__actions {
    flex-direction: column;
  }
}
</style>