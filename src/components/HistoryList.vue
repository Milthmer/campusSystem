<template>
  <div class="history-list">
    <h3>📜 历史路径</h3>
    <ul>
      <li v-if="historyList.length === 0" style="color:#666; padding:10px; text-align:center;">暂无历史路径</li>
      <li
        v-for="item in sortedHistory"
        :key="item.id"
        :class="{ active: activeId === item.id }"
        class="history-item"
        @click="$emit('select', item)"
      >
        <span class="history-text">{{ item.startName }} → {{ item.endName }} ({{ (item.distance/1000).toFixed(2) }}km)</span>
        <button class="delete-btn" @click.stop="$emit('delete', item.id)">🗑️</button>
      </li>
    </ul>
    <button class="clear-btn" @click="$emit('clear')">🗑️ 清空全部历史</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  historyList: Array,
  activeId: String
})
defineEmits(['select', 'delete', 'clear'])

const sortedHistory = computed(() => {
  return [...props.historyList].sort((a, b) => b.timestamp - a.timestamp)
})
</script>

<style scoped>
.history-list ul {
  list-style: none;
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
  border-top: 1px solid #45ce22;
  border-bottom: 1px solid #45ce22;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
}
.history-item {
  padding: 8px 10px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.history-item:hover {
  background: rgba(255,255,255,0.6);
}
.history-item.active {
  background: #cfe9dc;
  font-weight: bold;
}
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0 5px;
  margin-left: 5px;
}
.delete-btn:hover {
  opacity: 0.7;
}
.clear-btn {
  margin: 10px 0 20px;
  padding: 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
}
.clear-btn:hover {
  background: #d32f2f;
}
</style>