<template>
  <div id="map" ref="mapRef" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue'
import { useMap } from '../composables/useMap'
import { toLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { Style, Stroke } from 'ol/style'

const props = defineProps({
  buildings: Array,
  routeCoords: Array,     
  highlightedFeature: Object 
})
const emit = defineEmits(['map-click', 'feature-hover', 'feature-highlight'])

const mapRef = ref(null)
const { map, vectorLayer, popupOverlay, features, initMap, addBuildingFeatures, highlightFeature, resetFeatureStyle } = useMap()

let currentRouteFeature = null

onMounted(() => {
  initMap('map')
  if (props.buildings.length) {
    addBuildingFeatures(props.buildings)
  }

  map.value.on('click', (evt) => {
    const feature = map.value.forEachFeatureAtPixel(evt.pixel, f => f)
    emit('map-click', feature)
  })

  map.value.on('pointermove', (evt) => {
    const feature = map.value.forEachFeatureAtPixel(evt.pixel, f => f)
    if (feature) {
      const coord = feature.getGeometry().getCoordinates()
      const lonLat = toLonLat(coord)
      document.getElementById('popup-content').innerHTML = `
        <strong>${feature.get('name')}</strong><br>
        ${feature.get('description')}<br>
        坐标：${lonLat[0].toFixed(4)}, ${lonLat[1].toFixed(4)}
      `
      popupOverlay.value.setPosition(coord)
      map.value.getTargetElement().style.cursor = 'pointer'
      emit('feature-hover', feature)
    } else {
      popupOverlay.value.setPosition(undefined)
      map.value.getTargetElement().style.cursor = ''
    }
  })
})

watch(() => props.routeCoords, (newCoords) => {
  if (!newCoords || !vectorLayer.value) return

  if (currentRouteFeature) {
    vectorLayer.value.getSource().removeFeature(currentRouteFeature)
  }
  const routeGeom = new LineString(newCoords)
  const routeFeature = new Feature({ geometry: routeGeom })
  routeFeature.setStyle(new Style({
    stroke: new Stroke({ color: '#1E90FF', width: 5, lineDash: [10, 5] })
  }))
  vectorLayer.value.getSource().addFeature(routeFeature)
  currentRouteFeature = routeFeature
}, { deep: true })

watch(() => props.highlightedFeature, (newFeat, oldFeat) => {
  if (oldFeat) resetFeatureStyle(oldFeat)
  if (newFeat) highlightFeature(newFeat)
})

defineExpose({ features, map })
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>