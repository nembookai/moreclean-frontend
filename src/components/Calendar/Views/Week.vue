<template>
  <div class="box hover:!border-none border-none !shadow-none !rounded-none !p-0">
    <div class="flex sticky top-[52px] z-[14]">
      <div v-for="(day, index) in days" :key="day" class="w-[14.28%] bg-primary-500 cursor-pointer hover:bg-primary-400 group hover-transition active:bg-primary-600 text-white text-center border-r border-primary-400 p-2 border-b" @click="jumpToDay(day)">
        <div class="inline-flex items-center justify-center" :class="{ 'bg-primary-600 hover-transition group-hover:bg-primary-500 group-active:bg-primary-700 px-3 rounded-full': day.isSame(moment(), 'day') }">
          <div class="text-[20px] font-medium drop-shadow">{{ day.format('DD') }}</div>
          <div class="text-[14px] ml-2 drop-shadow">{{ day.format('dddd') }}</div>
        </div>
      </div>
    </div>
    <div class="flex">
      <div v-for="(day, dayIndex) in days" :key="day" class="w-[14.28%] border-r border-gray-100 relative">
        <div class="w-full bg-white min-h-[500px] p-[2px] flex flex-col gap-y-1">
          <Calendar-Task v-for="(task, index) in tasks.filteredTasks[day.format('YYYY-MM-DD')]" :key="task.id" :task="task" :dayIndex="dayIndex" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & Props
******************************/
import { ref, computed } from 'vue'
import moment from 'moment'
import { Calendar } from '@/store/calendar'
import { Tasks } from '@/store/tasks';

/******************************
 * Refs
******************************/
const calendar = Calendar();
const emit = defineEmits(['viewChanged']);
const tasks = Tasks();

/******************************
 * Computed & Methods
******************************/
const days = computed(() => {
  const startDate = calendar.activeDate.clone().startOf('isoWeek')
  return Array.from({ length: 7 }, (_, i) => moment(startDate).add(i, 'days'))
})

const jumpToDay = (day) => {
  calendar.switchView(2)
  calendar.switchDate(day)
  emit('viewChanged')
}
</script>
