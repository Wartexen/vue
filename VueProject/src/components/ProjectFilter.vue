<template>
  <div class="project-filter">
    <h2>Выбор параметров защиты</h2>
    
    <div class="filter-container">
      <!-- Направление подготовки -->
      <div class="filter-card">
        <div class="card-header">
          <div class="card-icon">🎓</div>
          <h3>Направление подготовки</h3>
        </div>
        <div class="card-content">
          <div v-if="loadingSpecializations" class="loading-indicator">
            <div class="loading-spinner"></div>
            <span>Загрузка направлений...</span>
          </div>
          <div v-else-if="errorSpecializations" class="error-message">
            <div class="error-icon">⚠️</div>
            <span>{{ errorSpecializations }}</span>
          </div>
          <div v-else class="select-container">
            <select 
              v-model="selectedSpecialization" 
              class="filter-select"
              @change="handleSpecializationChange"
            >
              <option value="" disabled>Выберите направление</option>
              <option 
                v-for="spec in specializations" 
                :key="spec.ID" 
                :value="spec.ID"
              >
                {{ spec.Name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Комиссия -->
      <div class="filter-card" :class="{ 'disabled': !selectedSpecialization }">
        <div class="card-header">
          <div class="card-icon">👥</div>
          <h3>Комиссия</h3>
        </div>
        <div class="card-content">
          <div v-if="loadingCommissions" class="loading-indicator">
            <div class="loading-spinner"></div>
            <span>Загрузка комиссий...</span>
          </div>
          <div v-else-if="errorCommissions" class="error-message">
            <div class="error-icon">⚠️</div>
            <span>{{ errorCommissions }}</span>
          </div>
          <div v-else class="select-container">
            <select 
              v-model="selectedCommission" 
              class="filter-select"
              :disabled="!selectedSpecialization"
              @change="handleCommissionChange"
            >
              <option value="" disabled>Выберите комиссию</option>
              <option 
                v-for="comm in commissions" 
                :key="comm.ID" 
                :value="comm.ID"
              >
                {{ comm.Name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Дата защиты -->
      <div class="filter-card" :class="{ 'disabled': !selectedCommission }">
        <div class="card-header">
          <div class="card-icon">🗓️</div>
          <h3>Дата защиты</h3>
        </div>
        <div class="card-content">
          <div v-if="loadingSchedules" class="loading-indicator">
            <div class="loading-spinner"></div>
            <span>Загрузка расписания...</span>
          </div>
          <div v-else-if="errorSchedules" class="error-message">
            <div class="error-icon">⚠️</div>
            <span>{{ errorSchedules }}</span>
          </div>
          <div v-else class="select-container">
            <select 
              v-model="selectedSchedule" 
              class="filter-select"
              :disabled="!selectedCommission"
              @change="handleScheduleChange"
            >
              <option value="" disabled>Выберите дату защиты</option>
              <option 
                v-for="schedule in schedules" 
                :key="schedule.ID" 
                :value="schedule.ID"
              >
                {{ formatDateTime(schedule.DateTime) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Выбранные параметры -->
    <div v-if="hasSelectedParams" class="selected-params">
      <div class="selected-params-header">
        <h3>Выбранные параметры</h3>
      </div>
      <div class="selected-params-content">
        <div class="param-item" v-if="selectedSpecializationName">
          <div class="param-label">Направление:</div>
          <div class="param-value">{{ selectedSpecializationName }}</div>
        </div>
        <div class="param-item" v-if="selectedCommissionName">
          <div class="param-label">Комиссия:</div>
          <div class="param-value">{{ selectedCommissionName }}</div>
        </div>
        <div class="param-item" v-if="selectedScheduleDateTime">
          <div class="param-label">Дата защиты:</div>
          <div class="param-value">{{ formatDateTime(selectedScheduleDateTime) }}</div>
        </div>
      </div>
    </div>

    <!-- Кнопка применения фильтров -->
    <div class="filter-actions">
      <button 
        @click="applyFilters"
        class="action-button apply-button"
        :disabled="!canApplyFilters"
      >
        <span class="button-icon">🔍</span>
        Показать проекты
      </button>
      <button 
        v-if="hasSelectedParams"
        @click="resetFilters"
        class="action-button reset-button"
      >
        <span class="button-icon">↺</span>
        Сбросить
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Выбранные значения
      selectedSpecialization: '',
      selectedCommission: '',
      selectedSchedule: '',
      
      // Данные для выбора
      specializations: [],
      commissions: [],
      schedules: [],
      
      // Состояния загрузки
      loadingSpecializations: false,
      loadingCommissions: false,
      loadingSchedules: false,
      
      // Ошибки
      errorSpecializations: null,
      errorCommissions: null,
      errorSchedules: null,
      
      // Кэшированные имена выбранных параметров
      selectedSpecializationName: '',
      selectedCommissionName: '',
      selectedScheduleDateTime: '',
    };
  },
  computed: {
    hasSelectedParams() {
      return this.selectedSpecialization || this.selectedCommission || this.selectedSchedule;
    },
    canApplyFilters() {
      return this.selectedSpecialization && this.selectedCommission && this.selectedSchedule;
    }
  },
  mounted() {
    this.loadSpecializations();
    // Восстановление сохраненных параметров из sessionStorage
    this.restoreFiltersFromStorage();
  },
  methods: {
    // Загрузка данных с сервера
    async loadSpecializations() {
      this.loadingSpecializations = true;
      this.errorSpecializations = null;
      
      try {
        const response = await axios.get('http://localhost:8000/audio/specializations/');
        this.specializations = response.data;
      } catch (error) {
        console.error('Ошибка загрузки направлений:', error);
        this.errorSpecializations = 'Не удалось загрузить направления подготовки';
      } finally {
        this.loadingSpecializations = false;
      }
    },
    
    async loadCommissions() {
      this.loadingCommissions = true;
      this.errorCommissions = null;
      
      try {
        const response = await axios.get('http://localhost:8000/audio/commissions/');
        this.commissions = response.data;
      } catch (error) {
        console.error('Ошибка загрузки комиссий:', error);
        this.errorCommissions = 'Не удалось загрузить комиссии';
      } finally {
        this.loadingCommissions = false;
      }
    },
    
    async loadSchedules() {
      this.loadingSchedules = true;
      this.errorSchedules = null;
      
      try {
        const response = await axios.get('http://localhost:8000/audio/defense_schedules/');
        this.schedules = response.data;
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        this.errorSchedules = 'Не удалось загрузить расписание защит';
      } finally {
        this.loadingSchedules = false;
      }
    },
    
    // Обработчики изменения выбора
    handleSpecializationChange() {
      // Сбрасываем зависимые поля
      this.selectedCommission = '';
      this.selectedSchedule = '';
      this.selectedCommissionName = '';
      this.selectedScheduleDateTime = '';
      
      // Сохраняем имя выбранного направления
      const selectedSpec = this.specializations.find(s => s.ID === this.selectedSpecialization);
      if (selectedSpec) {
        this.selectedSpecializationName = selectedSpec.Name;
      }
      
      // Загружаем комиссии
      this.loadCommissions();
      
      // Сохраняем выбор в sessionStorage
      this.saveFiltersToStorage();
    },
    
    handleCommissionChange() {
      // Сбрасываем зависимые поля
      this.selectedSchedule = '';
      this.selectedScheduleDateTime = '';
      
      // Сохраняем имя выбранной комиссии
      const selectedComm = this.commissions.find(c => c.ID === this.selectedCommission);
      if (selectedComm) {
        this.selectedCommissionName = selectedComm.Name;
      }
      
      // Загружаем расписание
      this.loadSchedules();
      
      // Сохраняем выбор в sessionStorage
      this.saveFiltersToStorage();
    },
    
    handleScheduleChange() {
      // Сохраняем дату выбранного расписания
      const selectedSched = this.schedules.find(s => s.ID === this.selectedSchedule);
      if (selectedSched) {
        this.selectedScheduleDateTime = selectedSched.DateTime;
      }
      
      // Сохраняем выбор в sessionStorage
      this.saveFiltersToStorage();
    },
    
    // Применение фильтров
    applyFilters() {
      if (!this.canApplyFilters) return;
      
      // Создаем объект с параметрами фильтрации
      const filterParams = {
        specializationId: this.selectedSpecialization,
        specializationName: this.selectedSpecializationName,
        commissionId: this.selectedCommission,
        commissionName: this.selectedCommissionName,
        scheduleId: this.selectedSchedule,
        scheduleDateTime: this.selectedScheduleDateTime
      };
      
      // Сохраняем параметры в sessionStorage
      this.saveFiltersToStorage();
      
      // Отправляем событие с параметрами фильтрации
      this.$emit('filter-applied', filterParams);
    },
    
    // Сброс фильтров
    resetFilters() {
      this.selectedSpecialization = '';
      this.selectedCommission = '';
      this.selectedSchedule = '';
      this.selectedSpecializationName = '';
      this.selectedCommissionName = '';
      this.selectedScheduleDateTime = '';
      
      // Очищаем sessionStorage
      sessionStorage.removeItem('projectFilterParams');
      
      // Отправляем событие сброса фильтров
      this.$emit('filters-reset');
    },
    
    // Сохранение и восстановление фильтров
    saveFiltersToStorage() {
      const filterParams = {
        specializationId: this.selectedSpecialization,
        specializationName: this.selectedSpecializationName,
        commissionId: this.selectedCommission,
        commissionName: this.selectedCommissionName,
        scheduleId: this.selectedSchedule,
        scheduleDateTime: this.selectedScheduleDateTime
      };
      
      sessionStorage.setItem('projectFilterParams', JSON.stringify(filterParams));
    },
    
    restoreFiltersFromStorage() {
      const savedParams = sessionStorage.getItem('projectFilterParams');
      if (!savedParams) return;
      
      try {
        const params = JSON.parse(savedParams);
        
        // Восстанавливаем значения
        this.selectedSpecialization = params.specializationId || '';
        this.selectedSpecializationName = params.specializationName || '';
        
        if (this.selectedSpecialization) {
          // Если есть выбранное направление, загружаем комиссии
          this.loadCommissions();
          
          this.selectedCommission = params.commissionId || '';
          this.selectedCommissionName = params.commissionName || '';
          
          if (this.selectedCommission) {
            // Если есть выбранная комиссия, загружаем расписание
            this.loadSchedules();
            
            this.selectedSchedule = params.scheduleId || '';
            this.selectedScheduleDateTime = params.scheduleDateTime || '';
          }
        }
      } catch (error) {
        console.error('Ошибка восстановления фильтров:', error);
        sessionStorage.removeItem('projectFilterParams');
      }
    },
    
    // Форматирование даты и времени
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      
      const date = new Date(dateTimeStr);
      
      // Форматирование даты
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      // Форматирование времени
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
  }
};
</script>

<style scoped>
.project-filter {
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
}

h2 {
  color: #1e293b;
  text-align: center;
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
  font-weight: 700;
}

h3 {
  color: #1e293b;
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-card {
  flex: 1;
  min-width: 250px;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: opacity 0.3s, box-shadow 0.3s;
}

.filter-card.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-icon {
  font-size: 1.25rem;
}

.card-content {
  padding: 1rem;
}

.select-container {
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #1e293b;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.1rem;
}

.selected-params {
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.selected-params-header {
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.selected-params-content {
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #f1f5f9;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.param-label {
  font-weight: 500;
  color: #64748b;
}

.param-value {
  color: #1e293b;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-button {
  background-color: #3b82f6;
  color: white;
}

.apply-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.apply-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.reset-button {
  background-color: #64748b;
  color: white;
}

.reset-button:hover {
  background-color: #475569;
}

.button-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
  }
  
  .filter-card {
    width: 100%;
  }
  
  .selected-params-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-actions {
    flex-direction: column;
  }
}
</style>