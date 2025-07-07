<template>
  <div class="bg-white text-gray-500 font-medium border-gray-200 rounded-[6px] border text-[13px] drop-shadow-sm overflow-y-auto" :class="extraclass">
    <div class="relative">
      <template v-for="(menu, index) in menus" :key="menu.route" v-if="!freeSlot">
        <RouterLink @click="$emit('close')" :to="menu.route" class="hover_dropdown">
          <component :is="menu.icon" :size="16" />
          <div class="drop-shadow-sm">{{ menu.name }}</div>
        </RouterLink>
      </template>
      <template v-else-if="freeSlot">
        <slot name="free"></slot>
      </template>
      <slot name="extra"></slot>
    </div>
  </div>
</template>
<script setup>
const props = defineProps(['extraclass', 'menus', 'freeSlot', 'extraSlot']);
const emit = defineEmits(['close']);
</script>