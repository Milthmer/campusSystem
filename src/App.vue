<template>
  <header>
    <h1>智慧校园地图</h1>
    <div class="nav-links">
      <a href="#" @click.prevent="showMessage('campus')">校园简介</a>
      <a href="#" @click.prevent="showMessage('guide')">使用指南</a>
      <a href="#" @click.prevent="showMessage('contact')">联系我们</a>
    </div>
  </header>

  <div class="sidebar">
    <BuildingSearch :buildings="buildings" :selectedIndex="selectedBuildingIndex" @select="onBuildingSelect" />
    <HistoryList :historyList="historyList" :activeId="activeHistoryId" :username="username"
      @select="onHistorySelect" @delete="deleteHistoryItem" @clear="clearAllHistory"
      @register="doRegister" @login="doLogin" @logout="doLogout" />
  </div>

  <div class="map-wrapper">
    <MapContainer ref="mapContainer" :buildings="buildings" :routeCoords="currentRouteCoords"
      :highlightedFeature="highlightedFeature" @map-click="onMapClick" />
  </div>

  <div id="info-panel">
    <span>{{ statusText }}</span> | 距离: <span>{{ distanceText }}</span>
  </div>

  <AuthModal :visible="showLoginModal"
    @close="showLoginModal = false" @logged-in="onLoggedIn" />
  <RegisterModal :visible="showRegisterModal"
    @close="showRegisterModal = false" @registered="onRegistered" />

  <!-- 弹窗遮罩层 -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="close-btn" @click="closeModal">✖</button>
      </div>
      <div class="modal-body">
        <p style="white-space: pre-line;">{{ modalContent }}</p>
      </div>
      <div class="modal-footer">
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BuildingSearch from './components/BuildingSearch.vue'
import HistoryList from './components/HistoryList.vue'
import MapContainer from './components/MapContainer.vue'
import AuthModal from './components/AuthModal.vue'
import RegisterModal from './components/RegisterModal.vue'
import { useHistory } from './composables/useHistory'
import { useAuth } from './composables/useAuth'
import { fromLonLat, toLonLat } from 'ol/proj'
import { buildings } from './data/buildings'

const showModal = ref(false)
const modalTitle = ref('')
const modalContent = ref('')

const statusText = ref('点击建筑选择起点')
const distanceText = ref('--')
const selectedBuildingIndex = ref(-1)
const highlightedFeature = ref(null)
const currentRouteCoords = ref(null)
const activeHistoryId = ref(null)

const startFeature = ref(null)
const endFeature = ref(null)
let startCoord = null
let endCoord = null
const isCalculating = ref(false)

const { historyList, loadHistory, addHistoryItem, deleteHistoryItem, clearAllHistory } = useHistory()
const { username, logout } = useAuth()
const mapContainer = ref(null)

const showLoginModal = ref(false)
const showRegisterModal = ref(false)

function showMessage(type) {
  if (type === 'campus') {
    modalTitle.value = '🏫 校园简介'
    modalContent.value = '湖南农业大学校园占地约3400亩，环境优美，拥有图书馆、教学楼、食堂、体育馆等完善设施。'
  } else if (type === 'guide') {
    modalTitle.value = '📖 使用指南'
    modalContent.value = '1. 点击地图上的建筑标记可查看详情；\n2. 依次点击两个不同建筑，可计算步行路径；\n3. 历史路径会保存在侧边栏，可随时查看。'
  } else if (type === 'contact') {
    modalTitle.value = '📞 联系我们'
    modalContent.value = '如有任何问题或建议，请联系：campus@example.com'
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

const onBuildingSelect = (building, index) => {
  selectedBuildingIndex.value = index
  const features = mapContainer.value?.features
  if (features && features[index]) {
    const feature = features[index]
    const coords = feature.getGeometry().getCoordinates()
    highlightedFeature.value = feature
    mapContainer.value.map.getView().animate({
      center: coords,
      zoom: 18,
      duration: 500
    })
  }
}

const calculateAndDrawRoute = async () => {
  //检查是否在计算路径
  if (isCalculating.value) return
  isCalculating.value = true
  statusText.value = '⏳ 正在计算路径...'

  //尝试计算路径
  try {
    const startLonLat = toLonLat(startCoord)
    const endLonLat = toLonLat(endCoord)
    const url = `https://router.project-osrm.org/route/v1/foot/${startLonLat[0]},${startLonLat[1]};${endLonLat[0]},${endLonLat[1]}?overview=full&geometries=geojson`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (data.code !== 'Ok') throw new Error(data.message || '路径规划失败')
    const routeCoordsLonLat = data.routes[0].geometry.coordinates
    const routeCoords3857 = routeCoordsLonLat.map(coord => fromLonLat(coord))
    const distance = data.routes[0].distance

    //更新路径和距离信息
    currentRouteCoords.value = routeCoords3857
    distanceText.value = (distance / 1000).toFixed(2) + ' km'
    statusText.value = `✅ 路径: ${startFeature.value.get('name')} → ${endFeature.value.get('name')}`

    //添加历史记录
    await addHistoryItem({
      startName: startFeature.value.get('name'),
      endName: endFeature.value.get('name'),
      distance: distance,
      coordinates: routeCoords3857
    })

    //重置起点和终点信息
    startFeature.value = null
    endFeature.value = null
    startCoord = null
    endCoord = null
  } catch (error) {
    console.error(error)
    statusText.value = `❌ 路径计算失败：${error.message}`
    setTimeout(() => {
      if (statusText.value.startsWith('❌')) statusText.value = '点击建筑选择起点'
    }, 3000)
  } finally {
    isCalculating.value = false
  }
}

const onMapClick = (feature) => {
  if (!feature) {
    statusText.value = '请点击建筑标记'
    return
  }

  const coord = feature.getGeometry().getCoordinates()
  const name = feature.get('name')

  if (!startFeature.value) {
    startFeature.value = feature
    startCoord = coord
    statusText.value = `起点: ${name}，请点击终点`
  } else if (!endFeature.value && feature !== startFeature.value) {
    endFeature.value = feature
    endCoord = coord
    statusText.value = `终点: ${name}，计算路径中...`
    calculateAndDrawRoute()
  } else if (feature === startFeature.value) {
    statusText.value = '起点和终点不能相同，请重新选择终点'
  }

  const index = buildings.findIndex(b => b.name === name)
  if (index !== -1) {
    selectedBuildingIndex.value = index
  }
}

const onHistorySelect = (item) => {
  activeHistoryId.value = item.id
  currentRouteCoords.value = item.coordinates
  distanceText.value = (item.distance / 1000).toFixed(2) + ' km'
  statusText.value = `显示历史: ${item.start_name} → ${item.end_name}`
}

onMounted(async () => {
  await loadHistory()
  window.addEventListener('unauthorized', () => {
    logout()
    historyList.value = []
  })
})

const doRegister = () => {
    showRegisterModal.value = true
};

const doLogin = () => {
    showLoginModal.value = true
};

const doLogout = () => {
    logout()
    historyList.value = []
    statusText.value = '点击建筑选择起点'
    distanceText.value = '--'
    currentRouteCoords.value = null
};

const onRegistered = () => {
    showRegisterModal.value = false
    showLoginModal.value = true
};

const onLoggedIn = async () => {
    showLoginModal.value = false
    await loadHistory()
};
</script>

<style>
</style>