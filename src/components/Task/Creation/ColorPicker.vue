<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="{ 'bg-gray-200 !items-start !cursor-auto active:!bg-gray-200': isOpen }" @click="openColorPicker">
    <div class="rounded-[8px] w-[27px] h-[27px]" :style="{ backgroundColor: color }"></div>

    <div v-if="!isOpen">
      <div class="text-gray-700 text-[13px] leading-[15px]">Vælg farve</div>
      <div class="text-gray-500 text-[12px] font-light">Vælg farve for opgaven</div>
    </div>

    <transition name="slide">
      <div class="flex items-center gap-x-2" v-if="isOpen">
        <div class="rounded-[8px] w-[26.5px] h-[26.5px] cursor-pointer hover-transition hover:opacity-80" :class="{ 'border-2 border-black': color === colorNew }" :style="{ backgroundColor: colorNew }" v-for="colorNew in taskColors" @click.stop="changeColor(colorNew)"></div>
      </div>
    </transition>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, nextTick } from 'vue';
import { taskColors } from '@/composables/globalHelper';

/******************************
 * Refs & const
******************************/
const color = defineModel('color');
const colorManuallyChanged = defineModel('colorManuallyChanged');
const isOpen = ref(false);

/******************************
 * Methods
******************************/
function openColorPicker () {
  isOpen.value = true;
}

async function changeColor (colorNew) {
  color.value = colorNew;
  await nextTick();
  isOpen.value = false;
  colorManuallyChanged.value = true;
}
</script>