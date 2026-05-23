<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h3>创建用户</h3>
        <button class="close-btn" @click="close">✖</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入密码" />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="confirmPassword" type="password" placeholder="请再次输入密码" @keyup.enter="submit" />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
      </div>
      <div class="modal-footer">
        <button class="btn-submit" @click="submit" :disabled="loading">
          {{ loading ? '创建中...' : '创建用户' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['close', 'registered'])

const props = defineProps({
  visible: Boolean
})

const { register, error } = useAuth()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const successMsg = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    username.value = ''
    password.value = ''
    confirmPassword.value = ''
    error.value = ''
    successMsg.value = ''
  }
})

async function submit() {
  error.value = ''
  successMsg.value = ''

  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请填写用户名和密码'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }

  loading.value = true
  const ok = await register(username.value.trim(), password.value)
  loading.value = false
  if (ok) {
    emit('registered')
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-container {
  background: white;
  border-radius: 12px;
  width: 380px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 { margin: 0; border: none; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
.modal-body { padding: 20px; }
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 4px; font-size: 14px; color: #333; }
.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
.error-msg { color: #f44336; font-size: 13px; margin: 4px 0; }
.success-msg { color: #45ce22; font-size: 13px; margin: 4px 0; }
.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}
.btn-submit {
  flex: 1;
  padding: 8px;
  background: #45ce22;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.btn-submit:disabled { opacity: 0.6; cursor: default; }
.btn-submit:hover:not(:disabled) { background: #3bb11e; }
</style>
