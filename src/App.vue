<template>
  <header>
    <h1>智慧校园地图</h1>
    <ul>
      <li><a href="#">首页</a></li>
      <li><a href="#">关于</a></li>
      <li><a href="#">联系</a></li>
    </ul>
  </header>

  <div class="sidebar">
    <BuildingList
      :buildings="buildings"
      :selectedIndex="selectedBuildingIndex"
      @select="onBuildingSelect"
    />
    <HistoryList
      :historyList="historyList"
      :activeId="activeHistoryId"
      @select="onHistorySelect"
      @delete="deleteHistoryItem"
      @clear="clearAllHistory"
    />
  </div>

  <div class="map-wrapper">
    <MapContainer
      ref="mapContainer"
      :buildings="buildings"
      :routeCoords="currentRouteCoords"
      :highlightedFeature="highlightedFeature"
      @map-click="onMapClick"
    />
  </div>

  <div id="info-panel">
    <span>{{ statusText }}</span> | 距离: <span>{{ distanceText }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BuildingList from './components/BuildingList.vue'
import HistoryList from './components/HistoryList.vue'
import MapContainer from './components/MapContainer.vue'
import { usePath } from './composables/usePath'
import { useHistory } from './composables/useHistory'
import { fromLonLat } from 'ol/proj'

const buildings = [
  {
    name: "图书馆",
    coordinates: [113.0782, 28.1859],
    type: "academic",
    description: "图书馆是学校的主要教学场所..."
  },
  {
    name: "第七教学楼",
    coordinates: [113.0759, 28.1819],
    type: "academic",
    description: "第七教学楼是学校的主要教学场所..."
  },
  {
    name: "金岸校区食堂",
    coordinates: [113.0805, 28.1882],
    type: "life",
    description: "金岸校区学生食堂..."
  }
]

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

const { historyList, loadHistory, addHistoryItem, deleteHistoryItem, clearAllHistory } = useHistory()

const mapContainer = ref(null)

const onBuildingSelect = (building, index) => {
  selectedBuildingIndex.value = index
  const features = mapContainer.value?.features
  if (features && features[index]) {
    const feature = features[index]
    const coords = feature.getGeometry().getCoordinates()
    highlightedFeature.value = feature
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

const calculateAndDrawRoute = async () => {
  try {
    const { fetchAndDrawRoute } = usePath(mapContainer.value?.vectorLayer) 

    const startLonLat = ol.proj.toLonLat(startCoord)
    const endLonLat = ol.proj.toLonLat(endCoord)
    const url = `https://router.project-osrm.org/route/v1/foot/${startLonLat[0]},${startLonLat[1]};${endLonLat[0]},${endLonLat[1]}?overview=full&geometries=geojson`
    const response = await fetch(url)
    const data = await response.json()
    if (data.code !== 'Ok') throw new Error('路径计算失败')
    const routeCoordsLonLat = data.routes[0].geometry.coordinates
    const routeCoords3857 = routeCoordsLonLat.map(coord => fromLonLat(coord))
    const distance = data.routes[0].distance

    currentRouteCoords.value = routeCoords3857
    distanceText.value = (distance / 1000).toFixed(2) + ' km'
    statusText.value = `✅ 路径: ${startFeature.value.get('name')} → ${endFeature.value.get('name')}`

    addHistoryItem({
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      startName: startFeature.value.get('name'),
      endName: endFeature.value.get('name'),
      startCoord: startCoord,
      endCoord: endCoord,
      distance,
      coordinates: routeCoords3857,
      timestamp: Date.now()
    })

    startFeature.value = null
    endFeature.value = null
    startCoord = null
    endCoord = null
  } catch (error) {
    console.error(error)
    statusText.value = '❌ 路径计算失败'
  }
}

const onHistorySelect = (item) => {
  activeHistoryId.value = item.id
  currentRouteCoords.value = item.coordinates
  distanceText.value = (item.distance / 1000).toFixed(2) + ' km'
  statusText.value = `显示历史: ${item.startName} → ${item.endName}`
}

onMounted(() => {
  loadHistory()
})
</script>

<style>

</style>