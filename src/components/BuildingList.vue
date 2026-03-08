<template>
  <div class="building-list">
    <h3>🏫 校园建筑</h3>
    <ul>
      <li
        v-for="(building, index) in buildings"
        :key="index"
        :class="{ selected: selectedIndex === index }"
        @click="$emit('select', building, index)"
      >
        <span :class="['badge', building.type]"></span>
        {{ building.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  buildings: Array,
  selectedIndex: Number
})
defineEmits(['select'])
</script>

<style scoped>
.building-list ul {
  list-style: none;
  padding: 0;
}
.building-list li {
  margin-bottom: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}
.building-list li:hover {
  background: rgba(255,255,255,0.5);
}
.building-list li.selected {
  background: #cfe9dc;
  font-weight: bold;
  border-left: 4px solid #45ce22;
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
</style>