import { ref } from 'vue'

const API_BASE = 'http://localhost:3000/api/auth'

const token = ref(localStorage.getItem('token') || '')
const username = ref(localStorage.getItem('username') || '')
const error = ref('')

export function useAuth() {
  const isLoggedIn = () => !!token.value

  const register = async (name, password) => {
    error.value = ''
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password })
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || '注册失败'
        return false
      }
      return true
    } catch (e) {
      error.value = '网络错误'
      return false
    }
  }

  const login = async (name, password) => {
    error.value = ''
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, password })
      })
      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || '登录失败'
        return false
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.user.username)
      token.value = data.token
      username.value = data.user.username
      return true
    } catch (e) {
      error.value = '网络错误'
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    token.value = ''
    username.value = ''
  }

  return {
    token,
    username,
    error,
    isLoggedIn,
    register,
    login,
    logout
  }
}
