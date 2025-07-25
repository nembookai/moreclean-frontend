<template>
  <div class="text-[12px] flex flex-col h-full rounded shadow inner-shadow relative cursor-pointer group select-none hover-transition" :style="{ backgroundColor: task.color }" :class="[textColorWhiteOrBlack(task.color)]">
    <div v-if="allowResize" class="resize-handle absolute top-0 left-0 right-0 h-1.5 z-[10] cursor-n-resize" @mousedown.stop="startResizeTop(task, $event)"></div>
    <div class="group-hover:opacity-80 p-[3px] group-active:opacity-60 hover-transition flex-1 dragHandler hover-transition" @click="tasks.setActiveTask(task, false, reloadOnUpdate)">
      <div v-if="showDate" class="font-normal">{{ moment(task.date).format('DD/MM/YYYY') }}</div>
      <div class="font-normal drop-shadow-sm flex items-center">
        <span :class="getLineClampClass()">{{ task.title }}</span>
      </div>
    </div>
    <div v-if="allowResize" class="resize-handle absolute bottom-0 left-0 right-0 h-1.5 cursor-s-resize" @mousedown.stop="startResize(task, $event)"></div>
    <div v-if="showTooltip" class="absolute top-[40px] pointer-events-none -translate-y-1/2 !text-[9px] py-0.5 px-3 rounded-full bg-gray-700 text-white opacity-0 hover-transition group-hover:opacity-100 z-[21] hover-transition text-nowrap delay-0 group-hover:delay-[500ms]" :class="dayIndex && dayIndex > 3 ? 'right-0' : 'left-0'">
      <div>{{ task.title }}</div>
      <div>Varighed: {{ task.duration }} minutter</div>
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
  showDate: {
    type: Boolean,
    default: false
  },
  allowResize: {
    type: Boolean,
    default: false
  },
  lineClampOverride: {
    type: String,
    default: null
  },
  reloadOnUpdate: {
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
let resizing = false;
let originalY = 0;
let originalStart = null;
let originalEnd = null;
let hasMovedEnough = false;
const minResizeDistance = 15;

/******************************
 * Computed & Methods
******************************/
function startResize(task, event) {
  resizing = true;
  hasMovedEnough = false;
  originalY = event.clientY;
  originalEnd = moment(`${task.date} ${task.end_time}`, 'YYYY-MM-DD HH:mm');

  const resizeHandler = (e) => resizeTask(task, e);
  const stopHandler = () => stopResize(resizeHandler, stopHandler, task);

  window.addEventListener('mousemove', resizeHandler);
  window.addEventListener('mouseup', stopHandler);
}

function resizeTask(task, event) {
  if (!resizing) return;

  const deltaY = event.clientY - originalY;

  if (!hasMovedEnough && Math.abs(deltaY) < minResizeDistance) return;
  hasMovedEnough = true;

  const pixelsPer30Min = 24.5;
  const durationStep = 30;

  const steps = Math.round(deltaY / pixelsPer30Min);
  const start = moment(`${task.date} ${task.start_time}`, 'YYYY-MM-DD HH:mm');
  const proposedEnd = originalEnd.clone().add(steps * durationStep, 'minutes');
  const endOfDay = moment(`${task.date} 23:59`, 'YYYY-MM-DD HH:mm');

  if (proposedEnd.isAfter(endOfDay)) return;
  if (proposedEnd.isAfter(start)) {
    task.end_time = proposedEnd.format('HH:mm');
    task.duration = proposedEnd.diff(start, 'minutes');
  }
}

function stopResize(resizeHandler, stopHandler, task) {
  resizing = false;
  window.removeEventListener('mousemove', resizeHandler);
  window.removeEventListener('mouseup', stopHandler);

  if (hasMovedEnough) {
    tasks.updateTaskBackend(task, (updatedTask) => {
      task.title = updatedTask[0].title;
      message.showComplete('Opgaven er rykket');
    });
  }
}

function startResizeTop(task, event) {
  resizingTop = true;
  hasMovedEnough = false;
  originalY = event.clientY;
  originalStart = moment(`${task.date} ${task.start_time}`, 'YYYY-MM-DD HH:mm');

  const resizeHandler = (e) => resizeTaskTop(task, e);
  const stopHandler = () => stopResizeTop(resizeHandler, stopHandler, task);

  window.addEventListener('mousemove', resizeHandler);
  window.addEventListener('mouseup', stopHandler);
}

function resizeTaskTop(task, event) {
  if (!resizingTop) return;

  const deltaY = event.clientY - originalY;

  if (!hasMovedEnough && Math.abs(deltaY) < minResizeDistance) return;
  hasMovedEnough = true;

  const pixelsPer30Min = 24.5;
  const durationStep = 30;

  const steps = Math.round(deltaY / pixelsPer30Min);
  const proposedStart = originalStart.clone().add(steps * durationStep, 'minutes');
  const end = moment(`${task.date} ${task.end_time}`, 'YYYY-MM-DD HH:mm');
  const minStart = moment(`${task.date} 00:00`, 'YYYY-MM-DD HH:mm');

  if (proposedStart.isBefore(minStart)) return;
  if (proposedStart.isBefore(end)) {
    task.start_time = proposedStart.format('HH:mm');
    task.duration = end.diff(proposedStart, 'minutes');
  }
}

function stopResizeTop(resizeHandler, stopHandler, task) {
  resizingTop = false;
  window.removeEventListener('mousemove', resizeHandler);
  window.removeEventListener('mouseup', stopHandler);

  if (hasMovedEnough) {
    tasks.updateTaskBackend(task, (updatedTask) => {
      task.title = updatedTask[0].title;
      message.showComplete('Opgaven er rykket');
    });
  }
}

function getLineClampClass() {
  if (props.lineClampOverride) {
    return props.lineClampOverride;
  }

  if (calendar.activeView === 3) {
    return 'line-clamp-2';
  }

  if (calendar.getTaskHeight(props.task) === 25) {
    return 'line-clamp-1';
  }

  if (calendar.getTaskHeight(props.task) === 50) {
    return 'line-clamp-2';
  }

  if (calendar.getTaskHeight(props.task) === 75) {
    return 'line-clamp-3';
  }

  if (calendar.getTaskHeight(props.task) > 75) {
    return 'line-clamp-4';
  }

  return 'line-clamp-1';
}
</script>
<style scoped>
:deep(.resizing) {
  @apply opacity-60 border-dashed border;
}
</style>