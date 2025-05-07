<template>
  <div class="commission-form">
    <h2>Формирование комиссии</h2>

    <div class="form-container">
      <div class="left-column">
        <div class="form-card direction-card">
          <div class="card-header">
            <div class="card-icon">🎓</div>
            <h3>Направление подготовки</h3>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label for="direction">Направление:</label>
              <select 
                id="direction"
                v-model="selectedDirection" 
                class="form-select"
              >
                <option value="" disabled selected>Выберите направление</option>
                <option v-for="dir in specializations" :key="dir.ID" :value="dir.ID">
                  {{ dir.Name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-card main-members-card">
          <div class="card-header">
            <div class="card-icon">👑</div>
            <h3>Руководство комиссии</h3>
          </div>
          <div class="card-content">
            <div class="form-group">
              <label for="chairman">Председатель комиссии:</label>
              <select 
                id="chairman"
                v-model="selectedChairman" 
                class="form-select"
              >
                <option value="" disabled selected>Выберите председателя</option>
                <option 
                  v-for="member in commissionMembersList" 
                  :key="member.ID" 
                  :value="member.ID"
                >
                  {{ fullName(member) }}
                </option>
              </select>
            </div>

          </div>
        </div>
        
        <div class="form-actions">
          <button 
            @click="createCommission"
            class="action-button submit-button"
          >
            <span class="button-icon">✓</span>
            Сформировать комиссию
          </button>
        </div>
      </div>

      <div class="right-column">
        <div class="form-card members-card">
          <div class="card-header">
            <div class="card-icon">👥</div>
            <h3>Члены комиссии</h3>
            <button 
              @click="addMember"
              class="action-button add-button small-button"
              title="Добавить члена комиссии"
            >
              <span>+</span>
            </button>
          </div>
          <div class="card-content">
            <div class="members-list">
              <div
                v-for="(memberId, index) in selectedMembers"
                :key="`member-${index}`"
                class="member-item"
              >
                <div class="form-group member-select">
                  <label>Член комиссии {{ index + 1 }}:</label>
                  <div class="select-with-action">
                    <select
                      v-model="selectedMembers[index]"
                      class="form-select"
                    >
                      <option value="" disabled selected>Выберите члена комиссии</option>
                      <option 
                        v-for="member in availableMembers(index)"
                        :key="member.ID"
                        :value="member.ID"
                      >
                        {{ fullName(member) }}
                      </option>
                    </select>
                    <button 
                      @click="removeMember(index)" 
                      class="remove-button"
                      title="Удалить члена комиссии"
                    >
                      <span>✕</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedDirection: '',
      selectedChairman: '',
      selectedViceChairman: '',
      selectedMembers: ['', '', ''],
      
      specializations: [],
      commissionMembersList: [],
      loading: false,
    };
  },
  async mounted() {
    try {
      this.loading = true;
      const [specializationsRes, membersRes] = await Promise.all([
        axios.get('http://localhost:8000/audio/specializations/'),
        axios.get('http://localhost:8000/audio/commission-members/') 
      ]);

      this.specializations = specializationsRes.data;
      this.commissionMembersList = membersRes.data;
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      this.loading = false;
    }
  },
  
  computed: {
    filteredMembers() {
      return this.commissionMembersList.filter(m => 
        m.ID !== this.selectedChairman
      );
    }
  },
  methods: {
    fullName(member) {
      return `${member.Surname} ${member.Name} ${member.Patronymic}`;
    },

    availableMembers(index) {
      const selectedIds = [
        this.selectedChairman, 
        this.selectedViceChairman,
        ...this.selectedMembers.filter((_, i) => i !== index)
      ].filter(id => id); 
      return this.commissionMembersList.filter(m => 
        !selectedIds.includes(m.ID)
      );
    },

    addMember() {
      this.selectedMembers.push('');
    },
    
    removeMember(index) {
      if (this.selectedMembers.length > 1) {
        this.selectedMembers.splice(index, 1);
      }
    },
    
    createCommission() {
      console.log('Формирование комиссии...');
      console.log({
        direction: this.selectedDirection,
        chairman: this.selectedChairman,
        viceChairman: this.selectedViceChairman,
        members: this.selectedMembers.filter(id => id)
      });
      
      alert('Комиссия успешно сформирована!');
    }
  }
};
</script>

<style scoped>
.commission-form {
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
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
}

.form-container {
  display: flex;
  gap: 1.5rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 40%;
  min-width: 350px;
}

.right-column {
  flex: 1;
  min-width: 350px;
}

.form-card {
  border: 1px solid #adafb3;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.direction-card, .main-members-card {
  width: 100%;
}

.members-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-icon {
  font-size: 1.5rem;
}

.card-content {
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.mb-0 {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 500;
  color: #1e293b;
  font-size: 0.95rem;
}

.form-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #1e293b;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.member-item {
  width: 100%;
}

.select-with-action {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.select-with-action .form-select {
  flex: 1;
}

.remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.375rem;
  background-color: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.remove-button:hover {
  background-color: #fecaca;
}

.small-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin-left: auto;
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

.add-button {
  background-color: #4ade80;
  color: white;
}

.add-button:hover {
  background-color: #22c55e;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.submit-button {
  background-color: #3b82f6;
  color: white;
  font-size: 1.1rem;
  padding: 0.75rem 1.75rem;
  width: 100%;
}

.submit-button:hover {
  background-color: #2563eb;
}

.button-icon {
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .form-container {
    flex-direction: column;
  }
  
  .left-column, .right-column {
    width: 100%;
  }
  
  .members-list {
    max-height: 50vh;
  }
}

@media (max-width: 768px) {
  .commission-form {
    padding: 0.75rem;
  }
  
  .card-content {
    padding: 1rem;
  }
}
</style>