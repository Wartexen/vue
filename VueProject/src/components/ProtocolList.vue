<template>
  <div class="protocol-list">
    <h2>Список протоколов</h2>
    
    <table class="protocols-table">
      <thead>
        <tr>

        </tr>
      </thead>
      <div>
        <tr v-for="protocol in protocols" :key="protocol.id">
          <td>{{ formatDate(protocol.createdAt) }}</td>
          <td>{{ getDirectionName(protocol.direction) }}</td>
          <td>
            <button @click="downloadProtocol(protocol)" class="download-btn">
              Скачать
            </button>
            <button @click="deleteProtocol(protocol.id)" class="delete-btn">
            Удалить
          </button>
          </td>
        </tr>
      </div>
    </table>
  </div>
</template>

<script>
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default {
  data() {
    return {
      protocols: []
    };
  },

  mounted() {
    this.loadProtocols();
  },
  
  methods: {
    deleteProtocol(id) {
      if (confirm('Вы уверены, что хотите удалить протокол?')) {
        this.protocols = this.protocols.filter(p => p.id !== id);
        localStorage.setItem('protocols', JSON.stringify(this.protocols));
      }
    },
    loadProtocols() {
      this.protocols = JSON.parse(localStorage.getItem('protocols')) || [];
    },
    getCommissionName(id) {
      const commissions = {
    
        1: 'Комиссия один',
        2: 'Комиссия два',
        3: 'Комиссия 3',
        4: 'Комиссия 4',
      };
      return commissions[id] || 'Неизвестно';
    },

    getInstituteName(id) {
      const institutes = {
        1: 'ИТИАД',
        2: 'ИДПО',
      };
      return institutes[id] || 'Неизвестно';
    },

    getGroupName(id) {
      const groups = {
      
        1: 'ИСТб-21-1',
        2: 'ИСТб-21-2',
      };
      return groups[id] || 'Неизвестно';
    },
    getDirectionName(id) {
      const directions = {
        1: 'Web-разработка',
        2: 'Дизайн'
      };
      return directions[id] || 'Неизвестно';
    },

    formatDate(isoString) {
      return new Date(isoString).toLocaleDateString('ru-RU');
    },

    async downloadProtocol(protocol) {
      console.log("Начало скачивания протокола:", protocol); 

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Протокол №${protocol.id}`,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Направление: ${this.getDirectionName(protocol.direction)}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Комиссия: ${this.getCommissionName(protocol.commission)}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Время защиты: ${this.formatDateTime(protocol.defenseTime)}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Институт: ${this.getInstituteName(protocol.institute)}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Группа: ${this.getGroupName(protocol.group)}`),
              ],
            }),
          ],
        }],
      });
      console.log("Документ сформирован:", doc); 

      const date = new Date(protocol.createdAt);
      const filename = `Протокол_${date.toISOString().slice(0,10)}_${protocol.id}.docx`;
      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    },

    formatDateTime(isoString) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(isoString).toLocaleString('ru-RU', options);
    }
  }
};
</script>

<style scoped>

.protocol-list {
  padding: 20px;
}
.protocols-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.protocols-table th,
.protocols-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: top;
}

.protocols-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.protocols-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.protocols-table tr:hover {
  background-color: #f1f1f1;
}
.delete-btn {
  background: #ff4444;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}.delete-btn:hover {background: #cc0000;}

h2 {
  color: #000;
  font-weight: 700;
}

h3 {
  color: #000;
  font-weight: 700;
  margin: 0; 
  align-self: center; 
}
.protocols-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  color: #000;
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.download-btn {
  padding: 6px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>