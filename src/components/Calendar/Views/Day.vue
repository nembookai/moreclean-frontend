<template>
  <div class="box hover:!border-none border-none !shadow-none !rounded-none !p-0">
    <div class="flex sticky top-[52px] z-[14]">
      <div class="w-[4.8%] bg-primary-500 border-r border-primary-400 border-b flex items-center justify-center">
        <PhClock :size="20" weight="regular" class="text-white drop-shadow" />
      </div>
      <div class="w-[95.2%] flex items-center justify-center bg-primary-500 text-white text-center border-r border-primary-400 p-2 border-b">
        <div class="text-[20px] font-medium drop-shadow">{{ day.format('DD') }}</div>
        <div class="text-[14px] ml-2 drop-shadow">{{ day.format('dddd') }}</div>
      </div>
    </div>
    <div class="flex shadow-md sticky top-[99px] z-[14] bg-white" v-if="multiDayTasksForDay?.length">
      <div class="w-[4.8%] border-b border-r relative px-2 flex flex-col justify-center text-center text-[11px] text-gray-500 font-medium border-gray-100">
        Hele dagen
      </div>
      <div class="relative w-[95.2%]">
        <div class="w-full relative p-1 flex flex-col gap-y-1 overflow-hidden border-b border-gray-100 hover-transition" :class="showAllTasks ? 'h-auto pb-4' : 'h-[58px]'">
          <div class="h-[42px] w-full relative" v-for="task in multiDayTasksForDay" :key="task.id">
            <div class="absolute top-1 w-full h-[42px] px-1">
              <Calendar-Task :task="task" :showTime="false" :showTooltip="false" :showMultiDay="true" class="w-full h-full" />
            </div>
          </div>
        </div>
        <div class="absolute left-1/2 bottom-[-10px] hover:bg-primary-600 flex items-center z-20 bg-primary-500 text-white text-[10px] py-[2px] px-[8px] rounded-full shadow inner-shadow cursor-pointer group select-none hover-transition" v-if="multiDayTasksForDay?.length > 1" @click="showAllTasks = !showAllTasks">
          <span v-if="!showAllTasks">Vis alle</span>
          <span v-else>Skjul</span>
          <PhCaretDown :size="12" weight="regular" class="ml-1 hover-transition" :class="showAllTasks ? 'rotate-180' : ''" />
        </div>
      </div>
    </div>
    <div class="flex">
      <div class="w-[4.8%]">
        <div v-for="(time, timeIndex) in calendar.timeslots" :key="time" class="border-b border-r relative h-[50px] px-2 flex flex-col justify-end text-[11px] text-gray-400 border-gray-100 cursor-pointer hover:bg-[#fdfdfd]" @click="tasks.createFromDate(day, time)">
          <span v-if="time !== '00:00'" class="leading-none" :class="'clock_' + time?.substring(0, 2)">{{ time }}</span>
        </div>
      </div>
      <div class="w-[95.2%] relative">
        <Drop v-for="(time, timeIndex) in calendar.timeslots" :key="time" :accepts-data="(task) => acceptsOnlyTasks(task, time)" @drop="(task) => tasks.handleDrop(task, day, time)" class="border-b h-[50px] hover:bg-[#fdfdfd] cursor-pointer border-gray-100" @click="tasks.createFromDate(day, time)"></Drop>
        
        <template v-for="(group, gIndex) in tasks.groupedTasks(day)" :key="gIndex">
          <drag handle=".dragHandler" @dragstart="tasks.draggingTaskId = task.id" @dragend="tasks.draggingTaskId = null" v-if="group.length <= 2" v-for="(task, tIndex) in group" :drag-image-opacity="0.5" :data="task" :go-back="true" mode="cut" type="card" :key="'task-' + task.id" class="absolute" :style="{ top: calendar.getTaskTop(task.start_time) + 'px', left: group.length === 1 ? '4px' : tIndex === 0 ? '4px' : 'calc(50% + 2px)', width: group.length === 1 ? 'calc(100% - 8px)' : 'calc(50% - 6px)', height: calendar.getTaskHeight(task) + 'px' }" :class="{ 'pointer-events-none': tasks.draggingTaskId && tasks.draggingTaskId !== task.id }">
            <Calendar-Task :task="task" :allowResize="true" />
          </drag>
          <div v-else class="absolute left-1 right-1" :style="{ top: calendar.getTaskTop(calendar.getEarliestStart(group)) + 'px', height: calendar.getGroupHeight(group) + 'px' }" :class="{ 'pointer-events-none': tasks.draggingTaskId }">
            <div class="relative h-full">
              <div class="text-[12px] p-[3px] h-full rounded shadow inner-shadow relative cursor-pointer group select-none hover-transition bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700" @click="activeGroup = gIndex">
                <div class="font-medium">{{ group.length }} Opgaver</div>
                <div class="text-[10px] line-clamp-1">{{ group.map(t => t.title).join(', ') }}</div>
              </div>
              <transition name="dropdown"><Calendar-GroupPopup v-click-outside="() => activeGroup = null" v-if="activeGroup === gIndex" :group="group" @close="activeGroup = null" extraClass="w-[500px] left-0 max-h-[300px]" /></transition>
            </div>
          </div>
        </template>
        <div v-if="day.isSame(moment(), 'day')" class="absolute left-[-6.25px] flex items-center shadow-md right-0 h-[2px] bg-primary-500 z-10" :style="{ top: calendar.getTaskTop(moment().format('HH:mm')) + 'px' }">
          <div class="bg-primary-500 w-[12.5px] h-[12.5px] rounded-full"></div>
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
import { Tasks } from '@/store/tasks'
import { PhClock, PhCaretDown } from '@phosphor-icons/vue'
import { Drag, Drop } from "vue-easy-dnd";

/******************************
 * Refs
******************************/
const calendar = Calendar();
const tasks = Tasks();
const showAllTasks = ref(false);
const activeGroup = ref(null);

/******************************
 * Computed & Methods
******************************/
const day = computed(() => calendar.activeDate.clone())
const multiDayTasksForDay = computed(() => tasks.multiDayTasksDailyView(day.value))

function acceptsOnlyTasks(task, time) {
  if (moment(task.start_time, 'HH:mm').add(1, 'hours').isSame(moment(time, 'HH:mm')) && task.date === day.value.format('YYYY-MM-DD')) {
    return false;
  }

  return true;
}
</script>
