import { ref } from 'vue'

const API_BASE = 'http://localhost:3000/api/history'

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export function useHistory() {
    const historyList = ref([])

    const loadHistory = async () => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(API_BASE, { headers });
            if (res.status === 401) {
                localStorage.removeItem('token');
                // 可选：触发一个全局事件通知用户重新登录
                window.dispatchEvent(new CustomEvent('unauthorized'));
                historyList.value = [];
                return;
            }
            const data = await res.json();
            historyList.value = data.map(item => ({
                id: item.id,
                startName: item.start_name,
                endName: item.end_name,
                distance: item.distance,
                coordinates: item.coordinates,
                createdAt: item.created_at
            }));
        } catch (err) {
            console.error(err);
            historyList.value = [];
        }
    }

    const addHistoryItem = async (item) => {
        try {
            const payload = {
                start_name: item.startName,
                end_name: item.endName,
                distance: item.distance,
                coordinates: item.coordinates
            };
            const headers = {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            };
            const res = await fetch(API_BASE, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('保存失败');
            await loadHistory();
        } catch (err) {
            console.error('addHistoryItem error:', err);
        }
    }

    const deleteHistoryItem = async (id) => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error('删除失败');
            await loadHistory();
        } catch (err) {
            console.error('deleteHistoryItem error:', err);
        }
    }

    const clearAllHistory = async () => {
        for (const item of historyList.value) {
            await deleteHistoryItem(item.id);
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