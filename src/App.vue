<script setup>
</script>

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
    <BuildingList :buildings="buildings" :selectedIndex="selectedBuildingIndex" @select="onBuildingSelect" />
    <HistoryList :historyList="historyList" :activeId="activeHistoryId" @select="onHistorySelect"
      @delete="deleteHistoryItem" @clear="clearAllHistory" />
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

<style scoped></style>
