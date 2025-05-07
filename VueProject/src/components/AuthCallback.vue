<template>
  <div class="auth-callback">
    <div class="loading-container" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p>Выполняется авторизация...</p>
    </div>
    
    <div class="error-container" v-if="error">
      <div class="error-icon">⚠️</div>
      <h3>Ошибка авторизации</h3>
      <p>{{ error }}</p>
      <button @click="goToLogin" class="back-button">Вернуться на страницу входа</button>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  name: 'AuthCallback',
  data() {
    return {
      isLoading: true,
      error: null
    };
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      this.handleAuthCode(code);
    } else {
      this.error = 'Код авторизации не получен';
      this.isLoading = false;
    }
  },
  methods: {
    async handleAuthCode(code) {
      try {
        const tokenData = await authService.exchangeCodeForToken(code);
        
        const userData = await authService.getUserData(tokenData.access_token);
        
        const fullName = `${userData.LAST_NAME} ${userData.NAME} ${userData.SECOND_NAME || ''}`.trim();
        
        localStorage.setItem('token', tokenData.access_token);
        localStorage.setItem('userId', userData.ID);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('email', userData.EMAIL);
        localStorage.setItem('isLoggedIn', 'true');
        
        if (userData.WORK_POSITION === 'Преподаватель') {
          const secretaryId = await authService.getSecretaryId(fullName);
          if (secretaryId) {
            localStorage.setItem('secretaryId', secretaryId);
          }
        }
        
        this.$router.push('/homepage');
      } catch (err) {
        console.error('Ошибка обработки кода авторизации:', err);
        this.error = err.message || 'Ошибка авторизации';
      } finally {
        this.isLoading = false;
      }
    },
    
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(72, 146, 180, 0.2);
  border-top-color: #4892b4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 3rem;
}

h3 {
  color: #1e293b;
  margin: 0;
}

p {
  color: #64748b;
  margin: 0;
}

.back-button {
  margin-top: 1rem;
  background-color: #4892b4;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #3a7a9a;
}
</style>