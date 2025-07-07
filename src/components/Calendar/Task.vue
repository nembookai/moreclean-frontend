<template>
  <div class="text-[12px] flex flex-col h-full rounded shadow inner-shadow relative cursor-pointer group select-none hover-transition" :style="{ backgroundColor: task.color }" :class="[textColorWhiteOrBlack(task.color), { '!rounded-t-none': task.overlaps }, { '!rounded-b-none': task.overlapping }]">
    <div v-if="allowResize && (!task.overlapping && !task.overlaps) && !task.all_day" class="resize-handle absolute top-0 left-0 right-0 h-1.5 z-[10] cursor-n-resize" @mousedown.stop="startResizeTop(task, $event)"></div>
    <div class="group-hover:opacity-80 p-[3px] group-active:opacity-60 hover-transition flex-1 dragHandler hover-transition" @click="tasks.setActiveTask(task)">
      <div class="line-clamp-1 font-normal drop-shadow-sm flex items-center">
        <span v-if="task.overlaps && calendar.activeView === 4" class="mr-1">(f)</span>
        <span>{{ task.title }}</span>
        <span v-if="task.overlapping && calendar.activeView === 4" class="ml-1">(n)</span>
      </div>
      <div v-if="showTime && !showMultiDay" class="font-light drop-shadow-sm">{{ printTaskTime(task) }}</div>
      <template v-if="showMultiDay">
        <div class="font-light drop-shadow-sm" v-if="task.date !== task.end_date">{{ moment(task.date).format('DD. MMM') }} - {{ moment(task.end_date).format('DD. MMM') }}</div>
        <div class="font-light drop-shadow-sm" v-if="task.date === task.end_date">Hele dagen</div>
      </template>
    </div>
    <div v-if="allowResize && (!task.overlapping && !task.overlaps) && !task.all_day" class="resize-handle absolute bottom-0 left-0 right-0 h-1.5 cursor-s-resize" @mousedown.stop="startResize(task, $event)"></div>
    <div v-if="showTooltip" class="absolute top-[40px] pointer-events-none -translate-y-1/2 !text-[9px] py-0.5 px-3 rounded-full bg-gray-700 text-white opacity-0 hover-transition group-hover:opacity-100 z-[21] hover-transition text-nowrap delay-0 group-hover:delay-[2000ms]" :class="dayIndex && dayIndex > 3 ? 'right-0' : 'left-0'">
      <div>{{ task.title }}</div>
      <div>Varighed: {{ task.overlaps ? task.original_task.duration : task.duration }} minutter</div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & Props
******************************/
import moment from 'moment'
import { textColorWhiteOrBlack } from '@/composables/globalHelper'
import { Tasks } from '@/store/tasks'
import { Calendar } from '@/store/calendar'
import { inject } from 'vue';
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  dayIndex: {
    type: Number,
    required: false
  },
  showTooltip: {
    type: Boolean,
    default: true
  },
  showTime: {
    type: Boolean,
    default: true
  },
  showMultiDay: {
    type: Boolean,
    default: false
  },
  allowResize: {
    type: Boolean,
    default: false
  }
});

/******************************
 * Refs
******************************/
const tasks = Tasks();
const message = inject('message');
const calendar = Calendar();

let resizingTop = false;
let originalStart = null;
let resizing = false;
let originalY = 0;
let originalEnd = null;

/******************************
 * Computed & Methods
******************************/
function printTaskTime(task) {
  if (task.overlaps) {
    return '(f) ' + task.original_task.start_time + ' - ' + task.original_task.end_time;
  }

  return task.start_time + ' - ' + task.end_time + (task.overlapping ? ' (n)' : '');
}

function startResize(task, event) {
  resizing = true;
  originalY = event.clientY;
  originalEnd = moment(`${task.date} ${task.end_time}`, 'YYYY-MM-DD HH:mm');

  window.addEventListener('mousemove', (e) => resizeTask(task, e));
  window.addEventListener('mouseup', stopResize);
}

function resizeTask(task, event) {
  if (!resizing) return;

  const deltaY = event.clientY - originalY;
  const pixelsPer30Min = 24.5; // adjust to match your UI scale
  const durationStep = 30; // in minutes

  const steps = Math.round(deltaY / pixelsPer30Min);
  const start = moment(`${task.date} ${task.start_time}`, 'YYYY-MM-DD HH:mm');
  const proposedEnd = originalEnd.clone().add(steps * durationStep, 'minutes');

  const endOfDay = moment(`${task.date} 23:59`, 'YYYY-MM-DD HH:mm');

  // Prevent end time from going past midnight
  if (proposedEnd.isAfter(endOfDay)) return;

  // Ensure end stays after start
  if (proposedEnd.isAfter(start)) {
    task.end_time = proposedEnd.format('HH:mm');
    task.duration = proposedEnd.diff(start, 'minutes');
  }
}

function stopResize() {
  resizing = false;
  window.removeEventListener('mousemove', resizeTask);
  window.removeEventListener('mouseup', stopResize);

  tasks.updateTaskBackend(props.task, () => {
    message.showComplete('Opgaven er rykket');
  });
}

function startResizeTop(task, event) {
  resizingTop = true;
  originalY = event.clientY;
  originalStart = moment(`${task.date} ${task.start_time}`, 'YYYY-MM-DD HH:mm');

  window.addEventListener('mousemove', (e) => resizeTaskTop(task, e));
  window.addEventListener('mouseup', stopResizeTop);
}

function resizeTaskTop(task, event) {
  if (!resizingTop) return;

  const deltaY = event.clientY - originalY;
  const pixelsPer30Min = 24.5;
  const durationStep = 30;

  const steps = Math.round(deltaY / pixelsPer30Min);
  const proposedStart = originalStart.clone().add(steps * durationStep, 'minutes');

  const end = moment(`${task.date} ${task.end_time}`, 'YYYY-MM-DD HH:mm');
  const minStart = moment(`${task.date} 00:00`, 'YYYY-MM-DD HH:mm');

  // Prevent resizing above 00:30
  if (proposedStart.isBefore(minStart)) return;

  // Ensure start is before end
  if (proposedStart.isBefore(end)) {
    task.start_time = proposedStart.format('HH:mm');
    task.duration = end.diff(proposedStart, 'minutes');
  }
}

function stopResizeTop() {
  resizingTop = false;
  window.removeEventListener('mousemove', resizeTaskTop);
  window.removeEventListener('mouseup', stopResizeTop);

  tasks.updateTaskBackend(props.task, () => {
    message.showComplete('Opgaven er rykket');
  });
}
</script>
<style scoped>
:deep(.resizing) {
  @apply opacity-60 border-dashed border;
}
</style>