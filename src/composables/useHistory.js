import { ref } from 'vue'

const API_BASE = 'http://localhost:3000/api/history'

export function useHistory() {
  const historyList = ref([])

  const loadHistory = async () => {
    try {
      const res = await fetch(API_BASE)
      const data = await res.json()
      historyList.value = data.map(item => ({
        id: item.id,
        startName: item.start_name,
        endName: item.end_name,
        distance: item.distance,
        coordinates: item.coordinates,
        createdAt: item.created_at
      }))
    } catch (err) {
      console.error(err)
      historyList.value = []
    }
  }

  const saveHistory = () => { }

  const addHistoryItem = async (item) => {
    // item 结构示例：
    // {
    //   id: Date.now(),          // 原前端生成的临时 id，后端会用自增 id，所以这里可以不用传
    //   startName: '图书馆',     // 注意字段名
    //   endName: '教学楼',
    //   distance: 350.5,
    //   coordinates: [[...]]
    // }
    try {
      const payload = {
        start_name: item.startName,   // 映射到后端需要的字段名
        end_name: item.endName,
        distance: item.distance,
        coordinates: item.coordinates
      }
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('保存失败')
      // 保存成功后重新从后端加载最新列表（这样就能获得后端生成的真实 id）
      await loadHistory()
    } catch (err) {
      console.error('addHistoryItem error:', err)
      // 可选：降级到 localStorage 或提示用户
    }
  }

  const deleteHistoryItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
      // 删除成功后重新加载列表
      await loadHistory()
    } catch (err) {
      console.error('deleteHistoryItem error:', err)
    }
  }

  const clearAllHistory = async () => {
    for (const item of historyList.value) {
      await deleteHistoryItem(item.id)
    }
  }

  return {
    historyList,
    loadHistory,
    addHistoryItem,
    deleteHistoryItem,
    clearAllHistory
  }
}