```vue type="vue" project="Project Defense" file="ProjectDefense.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="project-defense-container">
    <ProjectFilter 
      v-if="!showProjects"
      @filter-applied="handleFilterApplied"
      @filters-reset="resetProjects"
    />
    
    <div v-if="showProjects" class="project-defense-wrapper">
      <div class="filter-summary">
        <div class="filter-info">
          <div class="filter-badge">
            <span class="filter-icon">🎓</span>
            <span>{{ activeFilters.specializationName }}</span>
          </div>
          <div class="filter-badge">
            <span class="filter-icon">👥</span>
            <span>{{ activeFilters.commissionName }}</span>
          </div>
          <div class="filter-badge">
            <span class="filter-icon">🗓️</span>
            <span>{{ formatDateTime(activeFilters.scheduleDateTime) }}</span>
          </div>
        </div>
        <div class="filter-actions">
          <button @click="backToFilters" class="back-button">
            <span class="button-icon">↩️</span>
            Изменить параметры
          </button>
          <button @click="openGradingModal" class="grade-button">
            <span class="button-icon">📊</span>
            Оценивание
          </button>
        </div>
      </div>
      
      <div class="project-defense">
        <h2>Защита проектов</h2>
        
        <div v-if="error" class="alert alert-error">
          <div class="alert-icon">⚠️</div>
          <div>{{ error }}</div>
        </div>

        <!-- Projects Table -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Загрузка проектов...</p>
        </div>
        
        <div v-else-if="projects.length > 0" class="projects-table-container">
          <table class="projects-table">
            <thead>
              <tr>
                <th>Название проекта</th>
                <th>Руководитель</th>
                <th>Статус</th>
                <th>Студенты</th>
                <th>Вопросы</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="project in projects" 
                :key="project.ID"
                @click="showProjectDetails(project)"
                class="clickable-row"
              >
                <td>{{ project.Title }}</td>
                <td>{{ project.Supervisor }}</td>
                <td>
                  <span :class="['status-badge', project.Status ? 'status-active' : 'status-completed']">
                    {{ project.Status ? 'Активен' : 'Завершено' }}
                  </span>
                </td>
                <td>
                  <div v-if="studentsLoading[project.ID]" class="loading-indicator">
                    <div class="loading-spinner-small"></div>
                  </div>
                  <div v-else-if="studentsError[project.ID]" class="error-text">
                    Ошибка загрузки
                  </div>
                  <div v-else class="students-list">
                    <div v-for="student in students[project.ID]" :key="student.ID" class="student-item">
                      {{ student.Surname }} {{ student.Name }} {{ student.Patronymic }}
                    </div>
                    <div v-if="!students[project.ID] || students[project.ID].length === 0" class="no-data">
                      Нет студентов
                    </div>
                  </div>
                </td>
                <td>
                  <button @click.stop="openQuestionsModal(project)" class="action-button questions-button">
                    <span class="icon">👁️</span>
                    <span class="button-text">Вопросы</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data-container">
          <div class="no-data-icon">📋</div>
          <p>Проекты не найдены</p>
        </div>

        <div v-if="selectedProject" class="modal-overlay" @click="closeModal">
          <div class="modal-content project-details-modal" @click.stop>
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon">🎓</div>
                <h3>Информация о проекте</h3>
              </div>
              <button class="close-button" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div class="project-details">
              <div class="project-title-card">
                <h4>{{ selectedProject.Title }}</h4>
                <h5>Руководитель: {{ selectedProject.Supervisor }}</h5>
                <span :class="['status-badge', selectedProject.Status ? 'status-active' : 'status-completed']">
                  {{ selectedProject.Status ? 'Активен' : 'Завершен' }}
                </span>
              </div>
              
              <div class="detail-card students-card">
                <div class="detail-card-header">
                  <div class="detail-card-icon">👨‍🎓</div>
                  <div class="detail-card-title">Студенты</div>
                </div>
                <div class="detail-card-content">
                  <div v-if="studentsLoading[selectedProject.ID]" class="loading-indicator">
                    <div class="loading-spinner-small"></div>
                  </div>
                  <ul v-else-if="students[selectedProject.ID] && students[selectedProject.ID].length > 0" class="students-detail-list">
                    <li v-for="student in students[selectedProject.ID]" :key="student.ID">
                      {{ student.Surname }} {{ student.Name }} {{ student.Patronymic }}
                    </li>
                  </ul>
                  <div v-else class="no-data">Нет студентов</div>
                </div>
              </div>
              
              <div class="audio-card">
                <div class="detail-card-header">
                  <div class="detail-card-icon">🎙️</div>
                  <div class="detail-card-title">Аудиозапись защиты</div>
                </div>
                <div class="audio-recorder">
                  <button 
                    v-if="!audioBlob"
                    @click="toggleRecording"
                    :class="['record-button', { recording: isRecording }]"
                  >
                    <span class="button-icon">{{ isRecording ? '⏹️' : '🎙️' }}</span>
                    {{ isRecording ? 'Остановить запись' : 'Начать запись' }}
                    <span v-if="isRecording" class="recording-indicator"></span>
                  </button>
                  
                  <div v-if="audioBlob" class="audio-preview">
                    <audio controls :src="audioUrl" class="audio-player"></audio>
                    <div class="button-group">
                      <button @click="uploadAudio" class="action-button upload-button">
                        <span class="button-icon">📤</span> Отправить запись
                      </button>
                      <button @click="cancelRecording" class="action-button cancel-button">
                        <span class="button-icon">❌</span> Отмена
                      </button>
                    </div>
                  </div>

                  <div v-if="uploadStatus" class="upload-status" :class="{ 'success': uploadStatus.includes('успешно') }">
                    {{ uploadStatus }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Modal -->
        <div v-if="questionsModalVisible" class="modal-overlay questions-modal-overlay" @click="closeQuestionsModal">
          <div class="modal-content questions-modal" @click.stop>
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon">❓</div>
                <h3>Вопросы</h3>
              </div>
              <button class="close-button" @click="closeQuestionsModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="project-title-card">
              <h4>{{ selectedProject.Title }}</h4>
            </div>

            <div class="add-question-form">
              <input 
                v-model="newQuestionText" 
                placeholder="Введите новый вопрос" 
                class="question-input"
              />
              <button @click="addQuestion" class="action-button add-button">
                <span class="button-icon">➕</span> Добавить
              </button>
            </div>

            <div class="questions-container">
              <div v-if="questions.length > 0" class="questions-list">
                <div v-for="question in questions" :key="question.ID" class="question-item">
                  <div class="question-content">
                    <input 
                      v-if="question.editing" 
                      v-model="question.Text" 
                      class="question-edit-input"
                      placeholder="Введите вопрос"
                      @keyup.enter="saveQuestion(question)"
                    />
                    <div v-else class="question-text">{{ question.Text }}</div>
                  </div>

                  <div class="question-actions">
                    <button v-if="!question.editing" @click="editQuestion(question)" class="icon-button edit-button" title="Редактировать">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button v-if="question.editing" @click="saveQuestion(question)" class="icon-button save-button" title="Сохранить">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                    </button>
                    <button @click="deleteQuestion(question.ID)" class="icon-button delete-button" title="Удалить">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-questions">
                <div class="no-data-icon">📝</div>
                <p>Нет вопросов для этого проекта</p>
                <p class="no-data-hint">Добавьте первый вопрос с помощью формы выше</p>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="gradingModalVisible" class="modal-overlay" @click="closeGradingModal">
          <div class="modal-content grading-modal" @click.stop>
            <div class="modal-header">
              <div class="modal-title">
                <div class="modal-icon">📊</div>
                <h3>Оценивание студентов</h3>
              </div>
              <button class="close-button" @click="closeGradingModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div class="grading-content">
              <div v-if="loadingAllStudents || loadingCommission" class="loading-container">
                <div class="loading-spinner"></div>
                <p>Загрузка данных...</p>
              </div>
              
              <div v-else-if="allStudents.length === 0" class="no-data-container">
                <div class="no-data-icon">👨‍🎓</div>
                <p>Нет студентов для оценивания</p>
              </div>
              
              <div v-else class="students-grading-list">
                <div v-for="student in allStudents" :key="student.ID" class="student-grading-item">
                  <div class="student-info">
                    <div class="student-name">
                      {{ student.Surname }} {{ student.Name }} {{ student.Patronymic }}
                    </div>
                    <div class="project-title">
                      Проект: {{ student.projectTitle }}
                    </div>
                  </div>
                  
                  <div class="grade-selector">
                    <label :for="`grade-select-${student.ID}`" class="grade-label">Оценка:</label>
                    <select 
                      v-model="student.grade" 
                      class="grade-select"
                      :id="`grade-select-${student.ID}`"
                    >
                      <option value="" disabled>Выберите оценку</option>
                      <option value="5">Отлично (5)</option>
                      <option value="4">Хорошо (4)</option>
                      <option value="3">Удовлетворительно (3)</option>
                      <option value="2">Неудовлетворительно (2)</option>
                    </select>
                  </div>
                 
                  <div class="protocol-actions">
                    <button 
                      @click="generateProtocol(student, 'docx')" 
                      class="action-button protocol-button docx-button"
                      :disabled="!student.grade"
                    >
                      <span class="button-icon">📄</span>
                      DOCX
                    </button>
                    <!-- <button 
                      @click="generateProtocol(student, 'pdf')" 
                      class="action-button protocol-button pdf-button"
                      :disabled="!student.grade"
                    >
                      <span class="button-icon">📑</span>
                      PDF
                    </button> -->
                  </div> 
                </div>
              </div>
              
              <div class="grading-actions">
                <button @click="generateAllProtocols" class="action-button generate-all-button" :disabled="!canGenerateProtocols">
                  <span class="button-icon">📋</span>
                  Закончить оценивание
                </button>
              </div>
              
              <div v-if="generationStatus" class="generation-status">
                {{ generationStatus }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import ProjectFilter from './ProjectFilter.vue';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib';

export default {
  components: {
    ProjectFilter
  },
  data() {
    return {
      showProjects: false,
      activeFilters: null,
      loading: true,
      error: null,
      projects: [],
      students: {},
      studentsLoading: {},
      studentsError: {},
      selectedProject: null,
      questionsModalVisible: false,
      questions: [],
      newQuestionText: '',
      isRecording: false,
      mediaRecorder: null,
      audioBlob: null,
      audioUrl: null,
      uploadStatus: '',
      audioChunks: [],
      
      // Переменные для оценивания и генерации протоколов
      gradingModalVisible: false,
      allStudents: [],
      loadingAllStudents: false,
      generationStatus: '',
      commissionMembers: [],
      loadingCommission: false
    };
  },
  computed: {
    canGenerateProtocols() {
      return this.allStudents.length > 0 && this.allStudents.every(student => student.grade);
    }
  },

  methods: {
    handleFilterApplied(filterParams) {
      this.activeFilters = filterParams;
      this.showProjects = true;
      this.loadProjects();
    },
    
    backToFilters() {
      this.showProjects = false;
    },
    
    resetProjects() {
      this.showProjects = false;
      this.activeFilters = null;
      this.projects = [];
    },
    
    async loadProjects() {
      this.loading = true;
      this.error = null;
      
      try {
        if (this.activeFilters) {
          const response = await axios.get('http://localhost:8000/audio/projects/');
          this.projects = response.data;
        } 
        this.projects.forEach(project => {
          this.loadStudentsForProject(project.ID);
        });
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    
    async loadStudentsForProject(projectId) {
      this.studentsLoading[projectId] = true;
      this.studentsError[projectId] = false;
      
      try {
        const response = await axios.get('http://localhost:8000/audio/students_by_project/', {
          params: { project_id: projectId }
        });
        this.students[projectId] = response.data;
      } catch (err) {
        this.studentsError[projectId] = true;
        console.error(err);
      } finally {
        this.studentsLoading[projectId] = false;
      }
    },
    
    showProjectDetails(project) {
      this.selectedProject = project;
    },
    
    closeModal(event) {
      if (event && event.target.classList.contains('modal-overlay')) {
        this.selectedProject = null;
      } else if (!event) {
        this.selectedProject = null;
      }
    },
    
    async openQuestionsModal(project) {
      this.selectedProject = project;
      this.questionsModalVisible = true;
      await this.loadQuestions();
    },
    
    async loadQuestions() {
      try {
        const response = await axios.get('http://localhost:8000/projects/questions_by_project/', {
          params: { project_id: this.selectedProject.ID }
        });
        this.questions = response.data.map(q => ({...q, editing: false}));
      } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
      }
    },
    
    async addQuestion() {
      if (!this.newQuestionText.trim()) return;
      
      try {
        await axios.post('http://localhost:8000/audio/create_question/', {
          text: this.newQuestionText,
          project_id: this.selectedProject.ID
        });
        this.newQuestionText = '';
        await this.loadQuestions();
      } catch (error) {
        console.error('Ошибка добавления вопроса:', error);
      }
    },
    
    editQuestion(question) {
      question.editing = true;
    },
    
    async saveQuestion(question) {
      if (!question.Text.trim()) {
        alert('Вопрос не может быть пустым');
        return;
      }
      try {
        const response = await axios.put(
          `http://localhost:8000/projects/questions/${question.ID}/`,
          { Text: question.Text } 
        );
        
        if (response.data.error) {
          alert(response.data.error);
          return;
        }
        
        question.editing = false;
        await this.loadQuestions();
      } catch (error) {
        console.error('Ошибка сохранения:', error.response?.data);
        alert(`Ошибка сохранения: ${error.response?.data?.error || error.message}`);
      }
    },
    
    async deleteQuestion(questionId) {
      try {
        if (!questionId || typeof questionId !== 'number') {
          console.error('Invalid question ID:', questionId);
          alert('Ошибка: Некорректный ID вопроса');
          return;
        }
        if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;

        const formData = new FormData();
        formData.append('question_id', questionId);

        const response = await axios.delete(
          'http://localhost:8000/audio/delete_question/',
          {
            data: formData, 
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.status === 200 || response.status === 204) {
          this.questions = this.questions.filter(q => q.ID !== questionId);
          alert('Вопрос успешно удален!');
        }
        
      } catch (error) {
        const errorMessage = error.response?.data?.error 
          || error.message 
          || 'Неизвестная ошибка при удалении';
          
        console.error('Delete Error Details:', {
          status: error.response?.status,
          data: error.response?.data,
          questionId
        });
        
        alert(`Ошибка удаления: ${errorMessage}`);
      }
    },
    
    closeQuestionsModal(event) {
      if (event && event.target.classList.contains('questions-modal-overlay')) {
        this.questionsModalVisible = false;
        this.selectedProject = null;
        this.questions = [];
      } else if (!event) {
        this.questionsModalVisible = false;
        this.selectedProject = null;
        this.questions = [];
      }
    },
    
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(this.audioBlob);
          this.audioChunks = [];
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        
      } catch (err) {
        console.error('Ошибка доступа к микрофону:', err);
        this.uploadStatus = 'Не удалось получить доступ к микрофону';
      }
    },

    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      }
    },

    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },

    cancelRecording() {
      this.audioBlob = null;
      this.audioUrl = null;
      this.audioChunks = [];
      this.uploadStatus = '';
    },

    async uploadAudio() {
      if (!this.audioBlob) return;

      try {
        this.uploadStatus = 'Отправка аудиозаписи...';
        
        const formData = new FormData();
        formData.append('audio', this.audioBlob, `recording_${Date.now()}.mp3`);
        formData.append('project_id', this.selectedProject.ID.toString());

        const response = await axios.post(
          'http://localhost:8000/audio/upload/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.status === 201) {
          this.uploadStatus = 'Запись успешно отправлена!';
          setTimeout(() => {
            this.cancelRecording();
          }, 2000);
        }
      } catch (err) {
        console.error('Ошибка загрузки аудио:', err);
        this.uploadStatus = 'Ошибка при отправке записи';
      }
    },
    
    async openGradingModal() {
      this.gradingModalVisible = true;
      this.loadAllStudents();
      this.loadCommissionMembers();
    },
    
    closeGradingModal(event) {
      if (event && event.target.classList.contains('modal-overlay')) {
        this.gradingModalVisible = false;
        this.generationStatus = '';
      } else if (!event) {
        this.gradingModalVisible = false;
        this.generationStatus = '';
      }
    },
    
    async loadAllStudents() {
      this.loadingAllStudents = true;
      this.allStudents = [];
      
      try {
        for (const project of this.projects) {
          if (this.students[project.ID] && this.students[project.ID].length > 0) {
            const projectStudents = this.students[project.ID].map(student => ({
              ...student,
              projectTitle: project.Title,
              projectId: project.ID,
              supervisor: project.Supervisor,
              grade: '' 
            }));
            
            this.allStudents.push(...projectStudents);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки студентов для оценивания:', error);
      } finally {
        this.loadingAllStudents = false;
      }
    },
    
    async loadCommissionMembers() {
      this.loadingCommission = true;
        try {
            if (this.activeFilters?.commissionId) {
                const formData = new FormData();
                formData.append('id_commission', this.activeFilters.commissionId);

                const response = await axios.post(
                    'http://localhost:8000/audio/get_commission_composition/',
                    formData, 
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data' 
                        }
                    }
                );

                this.commissionMembers = response.data;
                console.log('Комиссия загружена:', {
                    params: this.activeFilters.commissionId,
                    response: response.data
                });
            } else {
                console.error('Commission ID не найден в activeFilters:', this.activeFilters);
            }
        } catch (error) {
            console.error('Ошибка загрузки комиссии:', {
                error: error.response?.data || error.message,
                commissionId: this.activeFilters?.commissionId
            });
        } finally {
            this.loadingCommission = false;
        }
    },
    async generateProtocol(student, format) {

      
      try {
        let chairman = []
        const secretary = 'Попова И.К.'
        const now = new Date();
        const defenseDate = now.toLocaleDateString('ru-RU');
        const defenseTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        let  members = []
        const gradeMap = {
          '5': 'Отлично',
          '4': 'Хорошо',
          '3': 'Удовлетворительно',
          '2': 'Неудовлетворительно',
          '': 'Не оценено'
        };
        const gradeText = gradeMap[student.grade] || 'Неизвестная оценка';
        this.commissionMembers.forEach(member => {
          if (member?.Role === 'Председатель') {
            chairman = `${member.Surname} ${member.Name} ${member.Patronymic}`;
          } else {
            members.push(`${member.Surname} ${member.Name} ${member.Patronymic}`);
          }
        });
        
        console.log(members)

        const data = {
          defenseDate,
          defenseTime,
          members: members,
          chairman,
          student: `${student.Surname} ${student.Name} ${student.Patronymic}`,
          direction: this.activeFilters.specializationName,
          project: student.projectTitle, 
          supervisor: student.supervisor,
          gradeText,
          secretary
        };
        
        const response = await fetch('/templates/test.docx');
        const templateContent = await response.arrayBuffer();
     
        const zip = new PizZip(templateContent);
        const doc = new Docxtemplater().loadZip(zip);
        doc.setOptions({
          linebreaks: true
        });
                
        doc.setData(data);
        doc.render();
        
        const generatedDoc = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        const fileName = `Протокол_${student.Surname}_${student.Name}_${now.getTime()}`;
        
        if (format === 'docx') {
          saveAs(generatedDoc, `${fileName}.docx`);
          this.generationStatus = `Протокол для ${student.Surname} ${student.Name} успешно сгенерирован`;
        } else if (format === 'pdf') {

          const formData = new FormData();
          formData.append('docx', generatedDoc, `${fileName}.docx`);
          
          const pdfResponse = await axios.post('http://localhost:8000/convert/docx-to-pdf/', formData, {
            responseType: 'blob'
          });
          
          saveAs(pdfResponse.data, `${fileName}.pdf`);
          this.generationStatus = `Протокол для ${student.Surname} ${student.Name} успешно сгенерирован`;
        }
      } catch (error) {
        console.error('Ошибка генерации протокола:', error);
        this.generationStatus = 'Ошибка при генерации протокола';
      }
    },
    
    async generateAllProtocols() {
      this.generationStatus = 'Генерация протоколов...';
      
      try {
        const zip = new PizZip();

        let chairman = []
        const secretary = 'Попова И.К.'
        const now = new Date();
        const defenseDate = now.toLocaleDateString('ru-RU');
        const defenseTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        let  members = []
        const gradeMap = {
          '5': 'Отлично',
          '4': 'Хорошо',
          '3': 'Удовлетворительно',
          '2': 'Неудовлетворительно',
          '': 'Не оценено'
        };
        
        this.commissionMembers.forEach(member => {
          if (member?.Role === 'Председатель') {
            chairman = `${member.Surname} ${member.Name} ${member.Patronymic}`;
          } else {
            members.push(`${member.Surname} ${member.Name} ${member.Patronymic}`);
          }
        });

        const response = await fetch('/templates/test.docx');
        const templateContent = await response.arrayBuffer();
        
  
        for (const student of this.allStudents) {
          const gradeText = gradeMap[student.grade] || 'Неизвестная оценка';
          const data = {
            defenseDate,
            defenseTime,
            chairman,
            members,
            student: `${student.Surname} ${student.Name} ${student.Patronymic}`,
            direction: this.activeFilters.specializationName,
            project: student.projectTitle,
            supervisor: student.supervisor,
            gradeText,
            secretary
          };
          
          const docZip = new PizZip(templateContent);
          const doc = new Docxtemplater().loadZip(docZip);
          doc.setOptions({
            linebreaks: true
          });
          
          doc.setData(data);
          doc.render();
          
          const generatedDoc = doc.getZip().generate({ type: 'uint8array' });
          
          const fileName = `Протокол_${student.Surname}_${student.Name}.docx`;
          
          zip.file(fileName, generatedDoc);
        }
        
        const zipContent = zip.generate({ type: 'blob' });
        saveAs(zipContent, `Протоколы_${defenseDate.replace(/\./g, '-')}.zip`);
        
        this.generationStatus = 'Все протоколы успешно сгенерированы и скачаны';
      } catch (error) {
        console.error('Ошибка генерации протоколов:', error);
        this.generationStatus = 'Ошибка при генерации протоколов';
      }
    },
    
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';
      
      const date = new Date(dateTimeStr);
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
  }
};
</script>

<style scoped>
.project-defense-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-defense-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.filter-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1rem;
}

.filter-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #f1f5f9;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  color: #1e293b;
}

.filter-icon {
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #e2e8f0;
  color: #1e293b;
}

.back-button:hover {
  background-color: #cbd5e1;
}

.grade-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #4892b4;
  color: white;
}

.grade-button:hover {
  background-color: #3a7a9a;
}

.button-icon {
  font-size: 1rem;
}

/* Основные стили */
.project-defense {
  padding: 15px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h2 {
  color: #1e293b;
  text-align: center;
  margin-bottom: 1.25rem;
  font-size: 1.8rem;
  font-weight: 700;
}

h3 {
  color: #1e293b;
  font-weight: 700;
  margin: 0;
}

h4 {
  color: #1e293b;
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
}

h5 {
  color: #475569;
  font-weight: 500;
  margin: 0.5rem 0;
  font-size: 1rem;
}

/* Таблица проектов */
.projects-table-container {
  flex: 1;
  border: 1px solid #444444;
  border-radius: 8px;
  overflow: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  background-color: white;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.projects-table th, 
.projects-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #868686d7;
  color: #1e293b;
}

.projects-table th {
  background-color: #f8fafc;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
  color: #1e293b;
}

.projects-table th:nth-child(4) { 
  min-width: 300px;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f1f5f9;
}

/* Статусы */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background-color: #fef9c3;
  color: #854d0e;
}

.status-completed {
  background-color: #dcfce7;
  color: #166534;
}

/* Список студентов */
.students-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.student-item {
  font-size: 0.875rem;
  padding: 0.25rem 0;
  border-bottom: 1px dashed #e2e8f0;
  color: #1e293b;
}

.student-item:last-child {
  border-bottom: none;
}

/* Кнопки */
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.questions-button {
  background-color: #eff6ff;
  color: #2563eb;
}

.questions-button:hover {
  background-color: #dbeafe;
}

.icon {
  font-size: 1rem;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: #f1f5f9;
}

.edit-button:hover {
  color: #2563eb;
}

.save-button:hover {
  color: #16a34a;
}

.delete-button:hover {
  color: #dc2626;
}

/* Модальные окна */
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
  animation: fadeIn 0.3s ease;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: scroll
}

.questions-modal-overlay {
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  position: relative;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  margin: 0 auto;
}

.questions-modal {
  max-width: 700px;
  overflow-y: visible;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.project-details-modal, .grading-modal {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.close-button:hover {
  color: #dc2626;
  background-color: #fee2e2;
}

/* Детали проекта */
.project-details {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-title-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.project-title-card .status-badge {
  margin-top: 0.5rem;
  align-self: flex-start;
}

.detail-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detail-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.detail-card-icon {
  font-size: 1.25rem;
}

.detail-card-title {
  font-weight: 600;
  color: #1e293b;
}

.detail-card-content {
  padding: 1rem;
  color: #1e293b;
  line-height: 1.5;
}

.students-card {
  width: 100%;
  margin-bottom: 1.5rem;
}

.students-card .detail-card-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 0;
}

.students-detail-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.5rem;
  padding: 0.5rem;
}

.students-detail-list li {
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 0.25rem;
  transition: all 0.2s;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.students-detail-list li:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.audio-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.audio-recorder {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Аудиозапись */
.record-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  background-color: #4ade80;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 200px;
}

.record-button:hover {
  background-color: #22c55e;
}

.record-button.recording {
  background-color: #ef4444;
}

.record-button.recording:hover {
  background-color: #dc2626;
}

.recording-indicator {
  width: 0.75rem;
  height: 0.75rem;
  background-color: white;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 1; }
}

.audio-preview {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.audio-player {
  width: 100%;
  margin-bottom: 0.5rem;
  border-radius: 0.375rem;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.upload-button {
  background-color: #3b82f6;
  color: white;
}

.upload-button:hover {
  background-color: #2563eb;
}

.cancel-button {
  background-color: #64748b;
  color: white;
}

.cancel-button:hover {
  background-color: #475569;
}

.upload-status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background-color: #f1f5f9;
  color: #1e293b;
  text-align: center;
}

.upload-status.success {
  background-color: #dcfce7;
  color: #166534;
}

/* Вопросы */
.questions-container {
  max-height: 400px;
  overflow-y: auto;
  margin: 0 1rem;
}

.questions-list {
  margin: 1.5rem 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.question-item:hover {
  background-color: #f8fafc;
}

.question-item:last-child {
  border-bottom: none;
}

.question-content {
  flex: 1;
  margin-right: 1rem;
}

.question-text {
  color: #1e293b;
  line-height: 1.5;
  word-break: break-word;
}

.question-edit-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #1e293b;
}

.question-actions {
  display: flex;
  gap: 0.25rem;
}

.add-question-form {
  display: flex;
  gap: 0.75rem;
  margin: 1.5rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.question-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #1e293b;
}

.add-button {
  background-color: #4ade80;
  color: white;
}

.add-button:hover {
  background-color: #22c55e;
}

.no-questions {
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.no-data-hint {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Оценивание */
.grading-content {
  padding: 1.5rem;
}

.students-grading-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.student-grading-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.student-grading-item:hover {
  background-color: #f1f5f9;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.project-title {
  font-size: 0.875rem;
  color: #64748b;
}

.grade-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-right: 1rem;
}

.grade-label {
  font-weight: 500;
  color: #1e293b;
}

.grade-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #1e293b;
  min-width: 150px;
}

.protocol-actions {
  display: flex;
  gap: 0.5rem;
}

.protocol-button {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.protocol-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.docx-button {
  background-color: #3b82f6;
  color: white;
}

.docx-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.pdf-button {
  background-color: #ef4444;
  color: white;
}

.pdf-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.grading-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.generate-all-button {
  background-color: #4ade80;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.generate-all-button:hover:not(:disabled) {
  background-color: #22c55e;
}

.generate-all-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.generation-status {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f1f5f9;
  color: #1e293b;
  text-align: center;
  border-radius: 0.375rem;
  font-weight: 500;
}

/* Состояния загрузки и ошибки */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fee2e2;
  color: #b91c1c;
}

.alert-icon {
  font-size: 1.25rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
}

.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #64748b;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #94a3b8;
}

.no-data {
  color: #94a3b8;
  font-style: italic;
}

/* Адаптивность */
@media (max-width: 768px) {
  .project-defense {
    padding: 0.75rem;
  }
  
  .filter-summary {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .filter-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .back-button, .grade-button {
    width: 100%;
  }
  
  .button-text {
    display: none;
  }
  
  .action-button {
    padding: 0.5rem;
  }
  
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }
  
  .add-question-form {
    flex-direction: column;
  }
  
  .add-button {
    width: 100%;
  }
  
  .student-grading-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .grade-selector {
    width: 100%;
    justify-content: space-between;
  }
  
  .grade-select {
    flex: 1;
  }
  
  .protocol-actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
  
  .protocol-button {
    flex: 1;
  }
}
</style>