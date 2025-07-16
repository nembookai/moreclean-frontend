<template>
  <div class="box !bg-transparent min-h-[500px] !border-gray-100 !shadow-none !rounded-none !p-0">
    <div class="w-full flex sticky top-[52px] z-[14] items-center justify-start bg-primary-500 text-white text-center border-r border-primary-400 p-2 border-b">
      <div class="text-[15px] py-[3px] font-medium drop-shadow">{{ startDate.format('MMMM' + (startDate.format('YYYY') !== endDate.format('YYYY') ? ' YYYY' : '')) }} - {{ endDate.format('MMMM YYYY') }}</div>
    </div>
    <div class="grid" v-if="days.find((day) => day.tasks?.length)">
      <template v-for="(day, index) in days" :key="day">
        <Drop :accepts-data="(task) => acceptsOnlyTasks(task, moment())" @drop="(task) => tasks.handleDrop(task, moment())" v-if="day.isToday && !day.tasks?.length" class="bg-white relative h-auto min-h-[40px] items-start gap-x-5 flex p-4 border-x border-gray-200">
          <div class="flex items-center justify-start cursor-pointer w-[100px] text-nowrap" @click.stop="jumpToDay(day.date)" >
            <div class="text-white bg-primary-500 p-1.5 -m-1.5 mr-0.5 rounded-full font-semibold text-[16.5px] leading-none">{{ day.date.format('DD') }}</div>
            <div class="text-[12.5px] text-center font-medium inline-block ml-1 text-primary-700 leading-none">
               {{ day.date.format('MMM') }} - {{ day.date.format('dddd').substring(0, 3) }}
            </div>
          </div>
          <div class="flex flex-col gap-y-[6px] w-full">
            <div class="text-[13px] text-gray-500 font-medium">
              Ingen opgaver denne dag
            </div>
          </div>
        </drop>
        <Drop :accepts-data="(task) => acceptsOnlyTasks(task, day.date)" @drop="(task) => tasks.handleDrop(task, day.date)" v-if="day.tasks?.length" class="bg-white relative h-auto min-h-[40px] items-start gap-x-5 flex px-4 pt-4 pb-2 border border-b-0 border-gray-200 hover:bg-[#fdfdfd]" :class="{ '!border-b-[1px]': index === days?.length - 1 }">
          <div class="flex items-center justify-start cursor-pointer w-[100px] text-nowrap" @click.stop="jumpToDay(day.date)" >
            <div class="text-lg font-medium text-primary-700 leading-none" :class="{ 'bg-primary-500 text-white p-1.5 -m-1.5 mr-0.5 rounded-full !font-semibold !text-[16.5px]': day.date.isSame(moment(), 'day') }">{{ day.date.format('DD') }}</div>
            <div class="text-[12.5px] text-center font-light inline-block ml-1 text-gray-600 leading-none" :class="{ 'text-primary-700 font-medium': day.date.isSame(moment(), 'day') }">
               {{ day.date.format('MMM') }} - {{ day.date.format('dddd').substring(0, 3) }}
            </div>
          </div>
          <div class="flex flex-col gap-y-[6px] w-full -mt-1.5">
            <drag :delay="10" @dragstart="tasks.draggingTaskId = task.id" @dragend="tasks.draggingTaskId = null" v-for="task in day.tasks" :key="'task-' + task.id" :drag-image-opacity="0.5" :data="task" :go-back="true" mode="cut" type="card" @click.stop :class="{ 'pointer-events-none': tasks.draggingTaskId && tasks.draggingTaskId !== task.id }">
              <div class="text-[14px] flex items-center gap-x-2 rounded-full relative cursor-pointer group select-none hover-transition w-full hover:bg-gray-100 p-1" @click="tasks.setActiveTask(task)">
                <div class="h-[25px] w-[25px] rounded-full" :style="{ backgroundColor: task.color }" :class="[textColorWhiteOrBlack(task.color)]"></div>
                <div class="w-[130px] font-light text-gray-600 ml-5">{{ task.start_time }} - {{ task.end_time }}</div>
                <div class="font-medium text-gray-800">{{ task.title }}</div>
              </div>
            </drag>
          </div>
        </Drop>
      </template>
      <div v-if="!days.find((day) => day.date.isSame(endDate, 'day'))?.tasks?.length" class="bg-gray-50 text-center w-full p-6 text-gray-600 text-[14px] border border-t-0 border-gray-200">
        <div class="flex flex-col items-center justify-center">
          <div class="text-[16px] font-medium mb-1">📭 Ingen flere opgaver</div>
          <div>Der er ikke planlagt yderligere opgaver frem mod slutningen af perioden <span class="font-semibold">{{ endDate.format('DD. MMM') }}</span></div>
        </div>
      </div>
    </div>
    <div v-else class="bg-gray-50 text-center w-full p-6 text-gray-600 text-[14px] border mt-[-1px] border-gray-200">
      <div class="flex flex-col items-center justify-center">
        <div class="text-[16px] font-medium mb-1">📭 Ingen opgaver</div>
        <div>Der er ikke planlagt opgaver i perioden</div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & Props
******************************/
import { ref, computed, watch, nextTick } from 'vue'
import moment from 'moment'
import { Drag, Drop } from "vue-easy-dnd";
import { Calendar } from '@/store/calendar'
import { textColorWhiteOrBlack } from '@/composables/globalHelper'
import { Tasks } from '@/store/tasks';
const props = defineProps(['container']);

/******************************
 * Refs
******************************/
const calendar = Calendar();
const emit = defineEmits(['viewChanged']);
const tasks = Tasks();

/******************************
 * Computed & Methods
******************************/
const startDate = computed(() => {
  return calendar.activeDate.clone();
});

const endDate = computed(() => {
  return calendar.activeDate.clone().add(1, 'month').endOf('month');
});

const days = computed(() => {
  const days = [];
  for (let date = startDate.value.clone(); date.isBefore(endDate.value); date.add(1, 'day')) {
    let dayTasks = tasks.tasksListView(date.clone());

    if (date.isSame(calendar.activeDate, 'day') && !dayTasks?.length) {
      days.push({
        date: date.clone(),
        tasks: null,
        isToday: true
      })
    }

    if (dayTasks?.length) {
      days.push({
        date: date.clone(),
        tasks: dayTasks
      });
    }
  }

  return days;
});

const jumpToDay = (day) => {
  calendar.switchView(2)
  calendar.switchDate(day)
  emit('viewChanged')
}

function acceptsOnlyTasks(task, day) {
  // Always block if trying to drop on the task's start date
  if (task.date === day.format('YYYY-MM-DD')) {
    return false;
  }

  return true;
}

/******************************
 * Watch
******************************/
watch(() => calendar.activeDate, async () => {
  await nextTick();

  if (props.container) {
    props.container.scrollTop = 0;
  }
});
</script>