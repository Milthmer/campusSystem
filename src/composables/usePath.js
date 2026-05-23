import { ref } from 'vue'
import { fromLonLat, toLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { Style, Stroke } from 'ol/style'

export function usePath(vectorLayer) {
  const currentRouteFeature = ref(null)

  const fetchAndDrawRoute = async (startCoord3857, endCoord3857, startName, endName) => {
    const startLonLat = toLonLat(startCoord3857)
    const endLonLat = toLonLat(endCoord3857)

    const url = `http://localhost:3000/route?startLon=${startLonLat[0]}&startLat=${startLonLat[1]}&endLon=${endLonLat[0]}&endLat=${endLonLat[1]}`;

    try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.code !== 'Ok') throw new Error('路径计算失败')

      const routeCoordsLonLat = data.routes[0].geometry.coordinates
      const routeCoords3857 = routeCoordsLonLat.map(coord => fromLonLat(coord))

      const routeGeom = new LineString(routeCoords3857)
      const newRouteFeature = new Feature({ geometry: routeGeom })
      newRouteFeature.setStyle(new Style({
        stroke: new Stroke({
          color: '#1E90FF',
          width: 5,
          lineDash: [10, 5]
        })
      }))

      if (currentRouteFeature.value) {
        vectorLayer.value.getSource().removeFeature(currentRouteFeature.value)
      }

      vectorLayer.value.getSource().addFeature(newRouteFeature)
      currentRouteFeature.value = newRouteFeature

      const distance = data.routes[0].distance
      return { routeCoords3857, distance }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const clearRoute = () => {
    if (currentRouteFeature.value && vectorLayer.value) {
      vectorLayer.value.getSource().removeFeature(currentRouteFeature.value)
      currentRouteFeature.value = null
    }
  }

  return {
    currentRouteFeature,
    fetchAndDrawRoute,
    clearRoute
  }
}