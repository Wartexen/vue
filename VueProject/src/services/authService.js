import axios from 'axios';
import config from '@/config';

const authService = {

  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
  },
  
 
  getToken() {
    return localStorage.getItem('token');
  },
  

  getUserInfo() {
    return {
      fullName: localStorage.getItem('fullName'),
      email: localStorage.getItem('email'),
      userId: localStorage.getItem('userId'),
      secretaryId: localStorage.getItem('secretaryId')
    };
  },
  

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('secretaryId');
  },
  

  getAuthUrl() {
    return `${config.AUTH_URL}` +
      `?client_id=${config.CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(config.REDIRECT_URI)}`;
  },
  

  async exchangeCodeForToken(code) {
    try {
      const formData = new FormData();
      formData.append('grant_type', 'authorization_code');
      formData.append('client_id', config.CLIENT_ID);
      formData.append('client_secret', config.CLIENT_SECRET);
      formData.append('code', code);
      formData.append('redirect_uri', config.REDIRECT_URI);
      
      // Отправляем запрос на получение токена
      const tokenResponse = await axios.post(config.TOKEN_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (tokenResponse.data.error) {
        throw new Error(tokenResponse.data.error_description || 'Ошибка получения токена');
      }
      
      return tokenResponse.data;
    } catch (error) {
      console.error('Ошибка обмена кода на токен:', error);
      throw error;
    }
  },
  

  async getUserData(accessToken) {
    try {
      const userResponse = await axios.get(config.USER_INFO_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (userResponse.data.error) {
        throw new Error('Ошибка получения данных пользователя');
      }
      
      return userResponse.data.result;
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      throw error;
    }
  },
  

  async getSecretaryId(fullName) {
    try {
      // Разбиваем полное имя на части
      const nameParts = fullName.split(' ');
      if (nameParts.length < 3) {
        console.error('Неполное ФИО:', fullName);
        return null;
      }
      
      const surname = nameParts[0];
      const name = nameParts[1];
      const patronymic = nameParts[2];
      
      const response = await axios.post(`${config.API_URL}/api/users/authorize_member/`, {
        surname,
        name,
        patronymic
      });
      
      if (response.data && response.data.id) {
        return response.data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка получения ID секретаря:', error);
      return null;
    }
  },
  

  setupAxiosInterceptors() {
    axios.defaults.baseURL = config.API_URL;
    
    axios.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
};

export default authService;