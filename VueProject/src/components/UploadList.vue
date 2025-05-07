<template>
    <div class="downloadlist">
      <h2>Загрузка списка студентов</h2>
      
      
      <div class="upload-container" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop="onDrop">
        <input 
          type="file" 
          ref="fileInput" 
          accept=".xlsx, .xls" 
          @change="handleFileSelect"
          hidden
        >
        
        <div 
          class="drop-zone" 
          :class="{ 'drag-over': dragOver }"
          @click="$refs.fileInput.click()"
        >
          <div v-if="!selectedFile" class="upload-prompt">
            <span class="icon">📁</span>
            <p class="formats">Перетащите Excel-файл сюда или кликните для выбора</p>
            <p class="formats">Поддерживаемые форматы: .xlsx, .xls</p>
          </div>
          
          <div v-else class="file-info">
            <p>Выбран файл: {{ selectedFile.name }}</p>
            <button @click.stop="uploadFile" :disabled="uploading">
              {{ uploading ? 'Загрузка...' : 'Начать загрузку' }}
            </button>
          </div>
        </div>
      </div>
  
    
      <div v-if="uploading" class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
  
     
      <div v-if="errorMessage" class="alert error">
        {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="alert success">
        {{ successMessage }}
      </div>
    </div>
  </template>
  


  <script>
  import axios from 'axios'; 
  
  export default {
    data() {
      return {
        dragOver: false,
        selectedFile: null,
        uploading: false,
        progress: 0,
        errorMessage: '',
        successMessage: ''
      }
    },
    methods: {
      handleFileSelect(e) {
        const files = e.target.files || e.dataTransfer.files;
        if (files.length) {
          this.validateFile(files[0]);
        }
      },
  
      onDrop(e) {
        this.dragOver = false;
        this.handleFileSelect(e);
      },
  
      validateFile(file) {
        const validTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];
        
        if (!validTypes.includes(file.type)) {
          this.errorMessage = 'Неверный формат файла!';
          this.selectedFile = null;
          return;
        }
  
        if (file.size > 5 * 1024 * 1024) { 
          this.errorMessage = 'Файл слишком большой! Максимальный размер 5MB';
          this.selectedFile = null;
          return;
        }
  
        this.errorMessage = '';
        this.selectedFile = file;
      },
  
      async uploadFile() {
        if (!this.selectedFile) return;
  
        const formData = new FormData();
        formData.append('students', this.selectedFile);
  
        try {
          this.uploading = true;
          this.progress = 0;
          
          const response = await axios.post('АПИ12312', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              this.progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            }
          });
  
          this.successMessage = `Успешно загружено ${response.data.count} студентов`;
          this.selectedFile = null;
          
        } catch (error) {
          this.errorMessage = 'Ошибка загрузки: ' + 
            (error.response?.data?.message || error.message);
        } finally {
          this.uploading = false;
        }
      }
    }
  }
  </script>
  
  <style scoped>
  h2 {
    color: black;
  }
  .downloadlist {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;         
  flex-direction: column; 
  align-items: center;    
}
  
  .upload-container {
    margin: 30px 0;
  }
  
  .drop-zone {
    border: 2px dashed #ccc;
    border-radius: 10px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .drag-over {
    border-color: #42b983;
    background-color: rgba(66, 185, 131, 0.1);
  }
  
  .upload-prompt .icon {
    font-size: 40px;
    display: block;
    margin-bottom: 15px;
  }
  
  .formats {
    color: #666;
    font-size: 0.9em;
    margin-top: 10px;
  }
  
  .file-info {
    color: #2c3e50;
  }
  
  button {
    margin-top: 15px;
    padding: 10px 20px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .progress-bar {
    height: 10px;
    background: #eee;
    border-radius: 5px;
    margin: 20px 0;
  }
  
  .progress {
    height: 100%;
    background: #42b983;
    border-radius: 5px;
    transition: width 0.3s;
  }
  
  .alert {
    padding: 15px;
    border-radius: 5px;
    margin: 20px 0;
  }
  
  .error {
    background: #ffe6e6;
    color: #cc0000;
    border: 1px solid #cc0000;
  }
  
  .success {
    background: #e6ffe6;
    color: #009900;
    border: 1px solid #009900;
  }
  </style>