<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Вход в систему</h2>
      <p class="login-description"> </p>
      
      <div class="login-methods">
        <button @click="loginCampus" class="campus-login-btn">
          <span class="btn-icon"></span>
          Войти
        </button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  name: 'Login',
  data() {
    return {
      isLoading: false,
      error: null
    };
  },
  methods: {
    loginCampus() {
      try {
        const authUrl = authService.getAuthUrl();
        window.location.href = authUrl;
      } catch (error) {
        this.error = 'Ошибка при перенаправлении на страницу авторизации';
        console.error('Ошибка авторизации:', error);
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1rem;
}

.login-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

h2 {
  color: #1e293b;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.login-description {
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
}

.login-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.campus-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: #4892b4;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.campus-login-btn:hover {
  background-color: #3a7a9a;
}

.btn-icon {
  font-size: 1.25rem;
}

.error-message {
  margin-top: 1.5rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>