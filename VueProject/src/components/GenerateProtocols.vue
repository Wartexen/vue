<template>
  <div class="protocol-generator">
    <h2>Формирование протоколов</h2>
    
    <div class="form-container">
      <div class="left-column">
        <div class="tabs">
          <button 
            :class="['tab-button', { active: activeTab === 'main' }]" 
            @click="activeTab = 'main'"
          >
            Основные параметры
          </button>

        </div>
        
        <div class="tab-content">
          <div v-if="activeTab === 'main'" class="tab-pane">
            <div class="form-card compact">
              <div class="card-header">
                <div class="card-icon">📚</div>
                <h3>Направление подготовки</h3>
              </div>
              <div class="card-content">
                <div class="form-group">
                  <label for="direction">ДПП-ПП:</label>
                  <select 
                    id="direction"
                    v-model="selectedDirection" 
                    class="form-select"
                  >
                    <option value="" disabled selected>Выберите направление</option>
                    <option v-for="dir in directions" :key="dir.id" :value="dir.id">
                      {{ dir.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-card compact">
              <div class="card-header">
                <div class="card-icon">🕒</div>
                <h3>Время защиты</h3>
              </div>
              <div class="card-content">
                <div class="form-group">
                  <label for="defense-time">Дата и время защиты:</label>
                  <input 
                    id="defense-time"
                    type="datetime-local" 
                    v-model="defenseTime"
                    class="form-select date-picker"
                  >
                </div>
              </div>
            </div>
          </div>
          

            <div class="form-card">
              <div class="card-header">
                <div class="card-icon">👥</div>
                <h3>Комиссия</h3>
              </div>
              <div class="card-content">
                <div class="form-group">
                  <label for="commission">Выберите комиссию:</label>
                  <select 
                    id="commission"
                    v-model="selectedCommission" 
                    class="form-select"
                  >
                    <option value="" disabled selected>Выберите комиссию</option>
                    <option v-for="com in commissions" :key="com.id" :value="com.id">
                      {{ com.name }}
                    </option>
                  </select>
                </div>
                
                <div v-if="selectedCommissionDetails" class="commission-details">
                  <div class="detail-item">
                    <span class="detail-label">Председатель:</span>
                    <span class="detail-value">{{ selectedCommissionDetails.chairman }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Секретарь:</span>
                    <span class="detail-value">{{ selectedCommissionDetails.secretary }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Члены комиссии:</span>
                    <ul class="members-list">
                      <li v-for="(member, index) in selectedCommissionDetails.members" :key="index">
                        {{ member }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
         
        </div>
      </div>
      
      <div class="right-column">
        <div class="form-card preview-card">
          <div class="card-header">
            <div class="card-icon">📄</div>
            <h3>Предпросмотр протокола</h3>
          </div>
          <div class="card-content">
            <div v-if="!selectedDirection || !selectedCommission || !defenseTime" class="empty-preview">
              <div class="empty-icon">📋</div>
              <p>Заполните все поля для предпросмотра протокола</p>
            </div>
            <div v-else class="protocol-preview">
              <h4>Данные для протокола:</h4>
              
              <div class="preview-grid">
                <div class="preview-item">
                  <span class="preview-label">Направление:</span>
                  <span class="preview-value">{{ selectedDirectionName }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Комиссия:</span>
                  <span class="preview-value">{{ selectedCommissionName }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Председатель:</span>
                  <span class="preview-value">{{ selectedCommissionDetails?.chairman || '' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Дата защиты:</span>
                  <span class="preview-value">{{ formattedDefenseDate }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Время защиты:</span>
                  <span class="preview-value">{{ formattedDefenseTime }}</span>
                </div>
              </div>
              
              <div class="template-info">
                <div class="info-icon">ℹ️</div>
                <p>Протокол будет сформирован на основе шаблона с подстановкой указанных данных</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button 
        v-if="!generatedDocUrl"
        @click="generateDoc"
        class="action-button generate-button"
        :disabled="!canGenerate || generating"
      >
        <span class="button-icon">{{ generating ? '⏳' : '📄' }}</span>
        {{ generating ? 'Формирование...' : 'Сформировать протокол' }}
      </button>
      
      <div v-if="generatedDocUrl" class="download-section">
        <a 
          :href="generatedDocUrl" 
          download="protocol.docx" 
          class="action-button download-button"
        >
          <span class="button-icon">📥</span>
          Скачать
        </a>
        <button 
          @click="previewDocument" 
          class="action-button preview-button"
        >
          <span class="button-icon">👁️</span>
          Просмотреть
        </button>
      </div>
    </div>
    
    <div class="messages-container">
      <div v-if="successMessage" class="success-message">
        <div class="message-icon">✅</div>
        <div class="message-text">{{ successMessage }}</div>
      </div>
      <div v-if="errorMessage" class="error-message">
        <div class="message-icon">❌</div>
        <div class="message-text">{{ errorMessage }}</div>
      </div>
    </div>
    
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Предпросмотр протокола</h3>
          <button class="close-button" @click="closePreviewModal">✕</button>
        </div>
        <div class="modal-body">
          <iframe v-if="previewUrl" :src="previewUrl" class="preview-frame"></iframe>
          <div v-else class="preview-loading">
            <div class="loading-icon">⏳</div>
            <p>Загрузка предпросмотра...</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closePreviewModal" class="action-button cancel-button">
            Закрыть
          </button>
          <a 
            :href="generatedDocUrl" 
            download="protocol.docx" 
            class="action-button download-button"
          >
            <span class="button-icon">📥</span>
            Скачать
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';

export default {
  data() {
    return {
      selectedDirection: '',
      selectedCommission: '',
      defenseTime: null,
      activeTab: 'main',
      
      directions: [
        { id: 1, name: 'Web-разработка' },
        { id: 2, name: 'Продвижение и дизайн web-ресурсов' }
      ],
      commissions: [
        { 
          id: 1, 
          name: 'Комиссия 1',
          chairman: 'Иванов Иван Иванович',
          members: ['Петров Петр Петрович', 'Сидоров Сидор Сидорович'],
          secretary: 'Смирнова Светлана Сергеевна'
        },
        { 
          id: 2, 
          name: 'Комиссия 2',
          chairman: 'Александров Александр Александрович',
          members: ['Николаев Николай Николаевич', 'Михайлов Михаил Михайлович'],
          secretary: 'Васильева Василиса Васильевна'
        },
        { 
          id: 3, 
          name: 'Комиссия 3',
          chairman: 'Федоров Федор Федорович',
          members: ['Андреев Андрей Андреевич', 'Дмитриев Дмитрий Дмитриевич'],
          secretary: 'Ольгина Ольга Олеговна'
        },
      ],
      
      generating: false,
      successMessage: '',
      errorMessage: '',
      
      generatedDocUrl: null,
      showPreviewModal: false,
      previewUrl: null
    };
  },
  computed: {
    selectedDirectionName() {
      const direction = this.directions.find(d => d.id === this.selectedDirection);
      return direction ? direction.name : '';
    },
    selectedCommissionName() {
      const commission = this.commissions.find(c => c.id === this.selectedCommission);
      return commission ? commission.name : '';
    },
    selectedCommissionDetails() {
      return this.commissions.find(c => c.id === this.selectedCommission);
    },
    formattedDefenseDate() {
      if (!this.defenseTime) return '';
      return this.formatDate(this.defenseTime);
    },
    formattedDefenseTime() {
      if (!this.defenseTime) return '';
      const date = new Date(this.defenseTime);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    canGenerate() {
      return this.selectedDirection && this.selectedCommission && this.defenseTime;
    }
  },
  methods: {
    async loadTemplate() {
      try {
        const response = await fetch('/templates/test.docx');
        if (!response.ok) throw new Error('Шаблон не найден');
        return await response.arrayBuffer();
      } catch (error) {
        console.error('Ошибка загрузки шаблона:', error);
        this.errorMessage = 'Ошибка загрузки шаблона';
        throw error;
      }
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },

    async generateDoc() {
      if (!this.canGenerate) {
        this.errorMessage = 'Заполните все обязательные поля';
        return;
      }

      try {
        this.generating = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.generatedDocUrl = null;
        
        
        const template = await this.loadTemplate();
        
        const zip = new PizZip(template);
            
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        
        const selectedCommission = this.commissions.find(c => c.id === this.selectedCommission);
        const selectedDirection = this.directions.find(d => d.id === this.selectedDirection);
        
       
        const data = {
          defenseDate: this.formatDate(this.defenseTime),
          defenseTime: new Date(this.defenseTime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          direction: selectedDirection.name,
          commissionName: selectedCommission.name,
          chairman: selectedCommission.chairman,
          secretary: selectedCommission.secretary,
          members: selectedCommission.members,
          student: "Грачев Роман Сергеевич" 
        };

        doc.setData(data);
        try {
          doc.render();
        } catch (error) {
          console.error('Ошибка в шаблоне документа:', error);
          this.errorMessage = 'Ошибка в шаблоне документа';
          return;
        }

        
        const out = doc.getZip().generate({ type: 'blob' });
        this.generatedDocUrl = URL.createObjectURL(out);
        this.successMessage = 'Документ успешно сформирован';

      } catch (error) {
        console.error('Ошибка при генерации:', error);
        this.errorMessage = 'Ошибка при генерации документа';
      } finally {
        this.generating = false;
      }
    },
    
    previewDocument() {
      if (!this.generatedDocUrl) return;
      
      this.showPreviewModal = true;
      this.previewUrl = null;
      
      
      setTimeout(() => {
        this.previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(this.generatedDocUrl)}`;
      }, 1000);
    },
    
    closePreviewModal() {
      this.showPreviewModal = false;
    }
  }
};
</script>

<style scoped>
.protocol-generator {
  padding: 10px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-height: calc(100vh - 20px);
}

h2 {
  color: #1e293b;
  text-align: center;
  margin-bottom: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
}

h3 {
  color: #1e293b;
  font-weight: 600;
  margin: 0;
  font-size: 1.1rem;
}

h4 {
  color: #1e293b;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.form-container {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
}

.left-column {
  display: flex;
  flex-direction: column;
  width: 40%;
  min-width: 300px;
  overflow: hidden;
}

.right-column {
  flex: 1;
  min-width: 300px;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.75rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  flex: 1;
  overflow: auto;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-card.compact .card-header {
  padding: 0.5rem 1rem;
}

.form-card.compact .card-content {
  padding: 0.75rem;
}

.preview-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-icon {
  font-size: 1.25rem;
}

.card-content {
  padding: 0.75rem;
  overflow: auto;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.9rem;
}

.form-select, .date-picker {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #1e293b;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus, .date-picker:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.commission-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.detail-item {
  margin-bottom: 0.4rem;
}

.detail-label {
  font-weight: 500;
  color: #64748b;
  margin-right: 0.4rem;
}

.detail-value {
  color: #1e293b;
}

.members-list {
  margin: 0.4rem 0 0 1.25rem;
  padding: 0;
}

.members-list li {
  margin-bottom: 0.2rem;
  color: #1e293b;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #64748b;
  text-align: center;
  height: 100%;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  color: #94a3b8;
}

.protocol-preview {
  display: flex;
  flex-direction: column;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.preview-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preview-label {
  font-weight: 500;
  color: #64748b;
  min-width: 120px;
}

.preview-value {
  color: #1e293b;
  flex: 1;
}

.template-info {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #eff6ff;
  border-radius: 0.375rem;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  font-size: 0.85rem;
}

.info-icon {
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  font-size: 0.9rem;
}

.generate-button {
  background-color: #3b82f6;
  color: white;
}

.generate-button:hover {
  background-color: #2563eb;
}

.generate-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.download-section {
  display: flex;
  gap: 0.5rem;
}

.download-button {
  background-color: #10b981;
  color: white;
}

.download-button:hover {
  background-color: #059669;
}

.preview-button {
  background-color: #6366f1;
  color: white;
}

.preview-button:hover {
  background-color: #4f46e5;
}

.cancel-button {
  background-color: #64748b;
  color: white;
}

.cancel-button:hover {
  background-color: #475569;
}

.button-icon {
  font-size: 1rem;
}

.messages-container {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.success-message, .error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.success-message {
  background-color: #dcfce7;
  color: #166534;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
}

.message-icon {
  font-size: 1.1rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}

.close-button:hover {
  color: #dc2626;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.loading-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 900px) {
  .form-container {
    flex-direction: column;
  }
  
  .left-column, .right-column {
    width: 100%;
  }
  
  .preview-card {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .protocol-generator {
    padding: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .download-section {
    flex-direction: column;
  }
}
</style>