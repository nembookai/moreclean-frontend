<template>
  <div>
    <ModalShow :condition="tasks.showTaskCreation">
      <Task-Create @close="tasks.showTaskCreation = false; tasks.prefillTask = {};" @created="addNewTasks" />
    </ModalShow>

    <div class="overflow-y-auto max-h-[calc(100vh-50px)] mt-5 pr-3" ref="calendarContainer" v-if="!loading.loading">
      <Calendar-Menu class="sticky top-0 z-[20]" @viewChanged="viewChanged" />
      <Calendar-Views-Week class="flex-1" v-if="calendar.activeView === 3" @viewChanged="viewChanged" />
      <Calendar-Views-Day class="flex-1" v-if="calendar.activeView === 2" />
      <Calendar-Views-List class="flex-1" :container="calendarContainer" v-if="calendar.activeView === 1" @viewChanged="viewChanged" />
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref, nextTick } from 'vue';
import { Calendar } from '@/store/calendar';
import { Tasks } from '@/store/tasks';
import { Loading } from '@/store/loading';

/******************************
 * Refs
******************************/
const calendar = Calendar();
const tasks = Tasks();
const calendarContainer = ref(null);
const loading = Loading();

/******************************
 * Methods
******************************/
function viewChanged() {  
  scrollToCenter();
}

async function scrollToCenter() {
  await nextTick();

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  
  const clockElement = calendarContainer.value?.querySelector(`.clock_${currentHour}`);
  
  if (clockElement) {
    clockElement.scrollIntoView({ block: 'center' });
  }
}

function addNewTasks(newTasks) {
  newTasks.forEach(task => {
    tasks.addTask(task);
  });
  
  tasks.showTaskCreation = false;
  tasks.prefillTask = {};
}
</script>
<style lang="scss" scoped>
:deep(.drag-source) {
  opacity: 0.5;
}

:deep(.drop-in) {
  @apply border border-dashed border-primary-300 w-full relative;
}

:deep(.drop-in.drop-forbidden) {
  @apply border-solid border-gray-100;
}
</style>