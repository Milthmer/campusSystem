<template>
  <div class="history-list">
    <template v-if="username">
      <div class="user-header">
        <span class="user-label">当前用户: {{ username }}</span>
        <button class="logout-btn" @click="$emit('logout')">登出</button>
      </div>
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
    </template>
    <template v-else>
      <div class="auth-prompt">
        <p>请注册或登录以查看历史路径</p>
        <div class="auth-buttons">
          <button class="auth-btn" @click="$emit('register')">注册</button>
          <button class="auth-btn login" @click="$emit('login')">登录</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  historyList: Array,
  activeId: String,
  username: String
})
defineEmits(['select', 'delete', 'clear', 'register', 'login', 'logout'])

const sortedHistory = computed(() => {
  return [...props.historyList].sort((a, b) => b.id - a.id)
})
</script>

<style scoped>
.history-list ul {
  list-style: none;
  padding: 0;
  max-height: 160px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.15) transparent;
  border-top: 1px solid #45ce22;
  border-bottom: 1px solid #45ce22;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
}
.history-list ul::-webkit-scrollbar {
  width: 4px;
}
.history-list ul::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
}
.history-list ul::-webkit-scrollbar-track {
  background: transparent;
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

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #45ce22;
}
.user-label {
  font-size: 14px;
  color: #333;
  font-weight: bold;
}
.logout-btn {
  background: none;
  border: 1px solid #999;
  color: #666;
  padding: 2px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #f0f0f0;
}

.auth-prompt {
  text-align: center;
  padding: 20px 10px;
  background: rgba(255,255,255,0.5);
  border-radius: 8px;
}
.auth-prompt p {
  color: #555;
  font-size: 14px;
  margin-bottom: 16px;
}
.auth-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.auth-btn {
  flex: 1;
  max-width: 100px;
  padding: 8px 16px;
  border: 1px solid #45ce22;
  background: white;
  color: #45ce22;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.auth-btn:hover {
  background: #45ce22;
  color: white;
}
.auth-btn.login {
  background: #45ce22;
  color: white;
}
.auth-btn.login:hover {
  background: #3bb11e;
}
</style>
