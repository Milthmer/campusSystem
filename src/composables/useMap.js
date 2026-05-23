import { ref, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
import Overlay from 'ol/Overlay'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

const typeColorMap = {
  academic: '#ff6633',   // 学术建筑-橙色
  life: '#33cc33',       // 生活设施-绿色
  sports: '#ff33cc',     // 体育设施-粉色
  default: '#3388ff'     // 默认蓝色
}

export function useMap() {
  const map = ref(null)
  const vectorLayer = ref(null)
  const popupOverlay = ref(null)
  const features = ref([])
  const initMap = (targetId) => {
    const vectorSource = new VectorSource()
    vectorLayer.value = new VectorLayer({ source: vectorSource })

    map.value = new Map({
      target: targetId,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer.value
      ],
      view: new View({
        center: fromLonLat([113.0821, 28.1842]),
        zoom: 16
      })
    })

    const popupElement = document.createElement('div')
    popupElement.id = 'popup'
    popupElement.className = 'ol-popup'
    popupElement.innerHTML = `
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content"></div>
    `
    document.body.appendChild(popupElement)

    popupOverlay.value = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
      autoPan: true,
      autoPanAnimation: { duration: 250 }
    })
    map.value.addOverlay(popupOverlay.value)

    document.getElementById('popup-closer').onclick = () => {
      popupOverlay.value.setPosition(undefined)
      return false
    }
  }

  const addBuildingFeatures = (buildings) => {
    buildings.forEach(building => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(building.coordinates)),
        name: building.name,
        type: building.type,
        description: building.description
      })

      const color = typeColorMap[building.type] || typeColorMap.default
      feature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        })
      }))

      vectorLayer.value.getSource().addFeature(feature)
      features.value.push(feature)
    })
  }

  const highlightFeature = (feature) => {

    const highlightStyle = new Style({
      image: new Circle({
        radius: 14,
        fill: new Fill({ color: '#FFD700' }),
        stroke: new Stroke({ color: '#fff', width: 3 })
      }),
      text: new Text({
        text: feature.get('name'),
        offsetY: -26,
        font: 'bold 16px Microsoft Yahei',
        fill: new Fill({ color: '#FFD700' }),
        stroke: new Stroke({ color: '#333', width: 4 })
      })
    })
    feature.setStyle(highlightStyle)
  }

  const resetFeatureStyle = (feature) => {

    const type = feature.get('type')
    const color = typeColorMap[type] || typeColorMap.default
    feature.setStyle(new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    }))
  }

  const disposeMap = () => {
    if (map.value) {
      map.value.setTarget(null)
      map.value = null
    }
  }

  return {
    map,
    vectorLayer,
    popupOverlay,
    features,
    initMap,
    addBuildingFeatures,
    highlightFeature,
    resetFeatureStyle,
    disposeMap
  }
}