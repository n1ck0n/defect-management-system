<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Регистрация</h2>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="fullName">ФИО:</label>
          <input
            id="fullName"
            v-model="form.full_name"
            type="text"
            required
            placeholder="Введите ваше полное имя"
            :disabled="authStore.isLoading"
          >
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Введите ваш email"
            :disabled="authStore.isLoading"
          >
        </div>

        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Введите пароль (минимум 6 символов)"
            minlength="6"
            :disabled="authStore.isLoading"
          >
        </div>

        <button 
          type="submit" 
          class="register-btn"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading">Регистрация...</span>
          <span v-else>Зарегистрироваться</span>
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>
      </form>

      <div class="login-link">
        <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  full_name: '',
  email: '',
  password: ''
});

const error = ref('');
const success = ref('');

const handleRegister = async () => {
  error.value = '';
  success.value = '';
  
  try {
    await authStore.register(form);
    success.value = 'Регистрация успешна! Перенаправляем...';
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка при регистрации';
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.register-btn {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.register-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.register-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 5px;
  color: #c33;
  text-align: center;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 5px;
  color: #363;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>