<template>
  <div class="building-search">
    <h3>🏫 校园建筑</h3>
    <input
      v-model="keyword"
      class="search-input"
      type="text"
      placeholder="搜索建筑..."
    />
    <ul>
      <li v-if="visibleBuildings.length === 0" class="no-result">无匹配建筑</li>
      <li
        v-for="(building, idx) in visibleBuildings"
        :key="idx"
        :class="{ selected: selectedIndex === originalIndex(building) }"
        @click="$emit('select', building, originalIndex(building))"
      >
        <span :class="['badge', building.type]"></span>
        {{ building.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  buildings: Array,
  selectedIndex: Number
})
defineEmits(['select'])

const keyword = ref('')

const visibleBuildings = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return props.buildings
  return props.buildings.filter(b => b.name.includes(kw))
})

const originalIndex = (building) => {
  return props.buildings.indexOf(building)
}
</script>

<style scoped>
.search-input {
  width: 100%;
  padding: 6px 10px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: #45ce22;
}
.building-search ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.15) transparent;
}
.building-search ul::-webkit-scrollbar {
  width: 4px;
}
.building-search ul::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
}
.building-search ul::-webkit-scrollbar-track {
  background: transparent;
}
.building-search li {
  margin-bottom: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}
.building-search li:hover {
  background: rgba(255,255,255,0.5);
}
.building-search li.selected {
  background: #cfe9dc;
  font-weight: bold;
  border-left: 4px solid #45ce22;
}
.building-search li.no-result {
  color: #999;
  cursor: default;
  justify-content: center;
}
.badge {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
}
.badge.academic { background: #ff6633; }
.badge.life { background: #33cc33; }
.badge.default { background: #3388ff; }
.badge.sports { background: #ff33cc; }
</style>
