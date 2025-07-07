<template>
  <div class="bg-white">
    <div class="bg-primary-400 border-primary-300 border-b border-r h-[47px] flex items-center justify-center px-2 sticky top-[53px] z-[10]">
      <PhClock :size="20" weight="regular" class="text-white" />
    </div>
    <div v-for="(time, timeIndex) in calendar.timeslots" :key="time" class="border-b border-r relative h-[50px] px-2 flex flex-col justify-end text-[11px] text-gray-400 border-gray-100">
      <span v-if="time !== '00:00'" class="leading-none">{{ time }}</span>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { Calendar } from '@/store/calendar';
import { PhClock } from '@phosphor-icons/vue';

/******************************
 * Refs
******************************/
const calendar = Calendar();
</script>