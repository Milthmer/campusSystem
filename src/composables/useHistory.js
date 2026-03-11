import { ref } from 'vue'

const STORAGE_KEY = 'smartcampus_history'

export function useHistory() {
  const historyList = ref([])

  const loadHistory = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        historyList.value = JSON.parse(saved)
      } catch {
        historyList.value = []
      }
    }
  }

  const saveHistory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyList.value))
  }

  const addHistoryItem = (item) => {
    historyList.value.push(item)
    if (historyList.value.length > 50) historyList.value.shift()
    saveHistory()
  }

  const deleteHistoryItem = (id) => {
    historyList.value = historyList.value.filter(item => item.id !== id)
    saveHistory()
  }

  const clearAllHistory = () => {
    historyList.value = []
    saveHistory()
  }

  return {
    historyList,
    loadHistory,
    addHistoryItem,
    deleteHistoryItem,
    clearAllHistory
  }
}