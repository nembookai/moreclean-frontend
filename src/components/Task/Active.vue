<template>
  <div>
    <ModalShow :condition="deleteTask">
      <DeletePrompt :msg="`Er du sikker på du vil slette opgaven ${tasks.activeTask.title}?`" @delete="tasks.deleteTask(tasks.activeTask.id)" @close="deleteTask = false" />
    </ModalShow>

    <div class="bg-[#f8f8f8] rounded-[8px] my-[48px] drop-shadow z-[210] w-[600px] relative" ref="modal">
      <div class="py-3 px-5 border-b flex items-center justify-between gap-x-2 rounded-t-[8px]" :class="textColorWhiteOrBlack(tasks.activeTask.color)" :style="{ backgroundColor: tasks.activeTask.color }">
        <div class="flex-1 text-[22.5px] font-normal">{{ tasks.activeTask.title }}</div>
        <PhX :size="30" weight="bold" class="p-1 w-[30px] hover:opacity-80 cursor-pointer hover-transition" @click.stop="closeModal" />
      </div>
      <template v-if="!showEditTask">
        <div class="p-5 flex flex-col gap-y-[25px]">
          <div class="flex gap-x-4">
            <div>
              <PhClock :size="20" weight="bold" class="text-gray-600" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px]">Dato & tidspunkt</div>
              <div class="text-gray-800 text-[14px] font-light flex items-center gap-x-1 mt-1">
                <div>{{ moment(tasks.activeTask.date).format('dddd, DD. MMM' + (moment(tasks.activeTask.date).year() !== moment().year() ? ' YYYY' : '')) }}</div>
                <div class="text-gray-500 text-[14px] mx-1">&bull;</div>
                <div v-if="!tasks.activeTask.all_day">{{ tasks.activeTask.start_time }} - {{ tasks.activeTask.end_time }}</div>
                <div v-else>{{ moment(tasks.activeTask.end_date).format('dddd, DD. MMM' + (moment(tasks.activeTask.end_date).year() !== moment().year() ? ' YYYY' : '')) }}</div>
              </div>
            </div>
          </div>
          <div class="flex gap-x-4">
            <div>
              <PhMapPin :size="20" weight="bold" class="text-gray-600" />
            </div>
            <div>
              <div class="text-gray-800 text-[15px] font-semibold leading-[15px]">Lokation</div>
              <div class="text-gray-800 text-[14px] font-light mt-1">{{ tasks.activeTask.location || 'Ingen lokation tilføjet' }}</div>
            </div>
          </div>
          <div class="flex gap-x-4 bg-gray-200 -m-2 p-2 rounded-[8px]">
            <div>
              <PhChatText :size="20" weight="bold" class="text-gray-600" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px] mb-1.5">Beskrivelse</div>
              <div v-html="tasks.activeTask.description" class="description" v-if="tasks.activeTask.description"></div>
              <div v-else class="text-gray-500 text-[13px] font-light">Ingen beskrivelse</div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-x-5">
            <div class="text-red-500 underline text-[13px] font-light underline-offset-2 leading-[15px] select-none cursor-pointer hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" @click.stop="deleteTask = true">Slet opgaven</div>
            <button @click="showEditTask = true" class="flex items-center justify-center select-none gap-x-1.5 px-[15px] py-[8px] rounded-[4px] text-[13.5px] hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" :style="{ backgroundColor: tasks.activeTask.color }" :class="textColorWhiteOrBlack(tasks.activeTask.color)">
              <PhPencilSimple :size="14" weight="fill" />
              Rediger opgave
            </button>
          </div>
        </div>
      </template>
      <Task-Edit class="p-5" v-else :task="tasks.activeTask" @close="showEditTask = false" @updated="tasks.updateActiveTask" />
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { textColorWhiteOrBlack } from '@/composables/globalHelper'
import { PhChatText, PhClock, PhPencilSimple, PhMapPin, PhX } from '@phosphor-icons/vue';
import moment from 'moment';
import { Tasks } from '@/store/tasks';

/******************************
 * Refs & consts
******************************/
const tasks = Tasks();
const emit = defineEmits(['close']);
const modal = ref();
const deleteTask = ref(false);
const showEditTask = ref(false);

/******************************
 * Methods & computed
******************************/
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

function closeModal() {
  if (showEditTask.value) {
    showEditTask.value = false;
  } else {
    emit('close');
  }
}

/******************************
 * Lifecycle hooks
******************************/
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
  document.body.style.overflowY = 'hidden';
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflowY = '';
});
</script>
<style lang="scss" scoped>
:deep(.description) {
  p {
    @apply text-gray-700 text-[14px] font-light;
    strong {
      @apply font-bold;
    }
  }

  ol, ul {
    @apply list-decimal list-inside text-gray-700 text-[14px] ml-3 font-light;
  }

  li {
    @apply mb-1;
  }

  h1 {
    @apply text-2xl font-bold text-gray-700 mb-1;
  }

  h2 {
    @apply text-xl font-semibold text-gray-700 mb-1;
  }

  h3 {
    @apply text-lg font-semibold text-gray-700 mb-1;
  }

  a {
    @apply text-blue-600 underline hover:text-blue-700;
  }
}
</style>