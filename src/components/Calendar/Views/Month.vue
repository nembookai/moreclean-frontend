<template>
  <div class="box !bg-transparent !border-gray-100 !shadow-none !rounded-none !p-0">
    <div class="w-full flex items-center justify-center bg-primary-500 text-white text-center border-r border-primary-400 p-2 border-b">
      <div class="text-[15px] py-[3px] font-medium drop-shadow">{{ calendar.activeDate.format('MMMM YYYY') }}</div>
    </div>
    <div class="grid grid-cols-7">
      <Drop v-for="(day, index) in days" :key="day" :accepts-data="(task) => acceptsOnlyTasks(task, day)" @drop="(task) => tasks.handleDrop(task, day)" class="bg-white relative h-[135px] col-span-1 p-2 border-b border-gray-100 hover:bg-[#fdfdfd] cursor-pointer" :class="{ 'border-r': (index + 1) % 7 !== 0, '!opacity-40': !day.isSame(calendar.activeDate, 'month') }" @click="tasks.createFromDate(day)">
        <div class="flex items-center justify-center">
          <div class="text-[13px] text-center text-gray-500 font-light inline-block px-2" @click.stop="jumpToDay(day)" :class="[{ 'cursor-pointer hover:text-primary-600 mb-[2px]': day.isSame(calendar.activeDate, 'month') }, { 'bg-primary-600 hover:bg-primary-700 hover-transition text-white rounded-full hover:!text-white': day.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') }]">
            {{ day.format('DD') }} {{ day.format('dddd').substring(0, 3) }}
          </div>
        </div>
        <div class="flex flex-col gap-y-[2px]">
          <drag @dragstart="tasks.draggingTaskId = task.id" @dragend="tasks.draggingTaskId = null" v-for="task in tasks.tasksMonthlyView(day)?.slice(0, 3)" :key="'task-' + task.id" :drag-image-opacity="0.5" :data="task" :go-back="true" mode="cut" type="card" @click.stop :class="{ 'pointer-events-none': tasks.draggingTaskId && tasks.draggingTaskId !== task.id }">
            <Calendar-Task :task="task" :showTime="false" :showTooltip="false" />
          </drag>
          <div v-if="tasks.tasksMonthlyView(day)?.length > 3" class="relative h-full" :class="{ 'pointer-events-none': tasks.draggingTaskId }">
            <div class="text-[12px] p-[3px] h-full rounded shadow inner-shadow relative cursor-pointer group select-none hover-transition bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700" @click.stop="setActiveGroup(index)">+{{ tasks.tasksMonthlyView(day)?.length - 3 }} opgaver</div>
            <transition name="dropdown">
              <Calendar-GroupPopup v-click-outside="() => activeGroup = null" v-if="activeGroup === index" :group="tasks.tasksMonthlyView(day)?.slice(3)" @close="activeGroup = null" :extraClass="getExtraClass(index)" @click.stop />
            </transition>
          </div>
        </div>
      </Drop>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & Props
******************************/
import { ref, computed } from 'vue'
import moment from 'moment'
import { Drag, Drop } from "vue-easy-dnd";
import { Calendar } from '@/store/calendar'
import { Tasks } from '@/store/tasks';

/******************************
 * Refs
******************************/
const activeGroup = ref(null);
const calendar = Calendar();
const emit = defineEmits(['viewChanged']);
const tasks = Tasks();

/******************************
 * Computed & Methods
******************************/
const days = computed(() => {
  const startOfMonth = calendar.activeDate.clone().startOf('month');
  const endOfMonth = calendar.activeDate.clone().endOf('month');

  const startDate = startOfMonth.clone().startOf('week').add(1, 'day');
  if (startDate.isAfter(startOfMonth)) {
    startDate.subtract(7, 'days');
  }

  const endDate = endOfMonth.clone().endOf('week').add(1, 'day');
  if (endDate.day() !== 0) {
    endDate.add(7 - endDate.day(), 'days');
  }

  const days = [];
  for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, 'day')) {
    days.push(date.clone());
  }

  return days;
});

const jumpToDay = (day) => {
  if (!day.isSame(calendar.activeDate, 'month')) {
    return
  }

  calendar.switchView(2)
  calendar.switchDate(day)
  emit('viewChanged')
}

function getExtraClass(dayIndex) {
  const colInRow = dayIndex % 7;

  if (colInRow < 3) {
    return 'w-[300px] max-h-[300px] left-0'
  }

  return 'w-[300px] max-h-[300px] right-0'
}

function acceptsOnlyTasks(task, day) {
  const dayStr = day.format('YYYY-MM-DD');

  // Always block if trying to drop on the task's start date
  if (task.date === dayStr) {
    return false;
  }

  // If the task has a different end date and a display_date, block if dropping on display_date
  if (task.end_date && task.date !== task.end_date && task.display_date === dayStr) return false;

  return true;
}

function setActiveGroup(index) {
  if (activeGroup.value === index) {
    activeGroup.value = null; 
    return;
  }

  activeGroup.value = index;
}
</script>