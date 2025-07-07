<template>
  <div>    
    <div class="grid grid-cols-6 gap-2">
      <div class="col-span-full mb-1">
        <label for="title" class="text-gray-600 text-[13px]">Titel <span class="text-red-500">*</span></label>
        <input type="text" id="title" v-model="newTask.title" class="input" autocomplete="new-password" placeholder="Tilføj titel" />
      </div>
      <Task-Creation-DatePicker v-model:date="newTask.date" v-model:startTime="newTask.start_time" v-model:endTime="newTask.end_time" v-model:endDate="newTask.end_date" v-model:allDay="newTask.all_day" />
      <Task-Creation-Location v-model:location="newTask.location" />
      <Task-Creation-ColorPicker v-model:color="newTask.color" />
      <div class="col-span-full mt-1">
        <div class="text-gray-600 text-[13px] mb-1">Beskrivelse</div>
        <QuillEditor theme="snow" contentType="html" v-model:content="newTask.description" />
      </div>
    </div>
    <div class="flex items-center gap-x-5 mt-5 justify-end">
      <div class="text-gray-500 text-[15px] cursor-pointer underline underline-offset-2 font-light hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" @click="emit('close')">Annuller</div>
      <button class="btn" :disabled="loading" @click="editTask">
        <span v-if="!loading">Gem opgaven</span>
        <span v-else>Gemmer opgaven...</span>
      </button>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient';
const props = defineProps(['task']);

/******************************
 * Refs & consts
******************************/
const message = inject('message');
const emit = defineEmits(['close', 'updated']);
const loading = ref(false);
const newTask = ref({
  title: props.task.title,
  date: props.task.date,
  start_time: props.task.start_time ? { value: props.task.start_time } : null,
  end_time: props.task.end_time ? { value: props.task.end_time } : null,
  end_date: props.task.end_date,
  all_day: props.task.all_day,
  color: props.task.color,
  location: props.task.location,
  description: props.task.description,
});

/******************************
 * Methods
******************************/
const editTask = async () => {
  loading.value = true;

  if (!newTask.value.title) {
    newTask.value.title = 'Ingen titel';
  }

  if (!newTask.value.date) {
    newTask.value.date = moment().format('YYYY-MM-DD');
  }

  await axiosClient.put(`task/${props.task.id}`, {
    ...newTask.value,
    start_time: newTask.value.start_time?.value || null,
    end_time: newTask.value.end_time?.value || null
  }).then((response) => {
    message.showComplete('Opgaven er opdateret');
    emit('updated', response.task);
    emit('close');
  }).catch((error) => { });

  loading.value = false;
}
</script>
<style lang="scss" scoped>
:deep(.ql-editor) {
  @apply h-[150px] overflow-y-auto bg-white rounded-b-[7px] !important;
}

:deep(.ql-container.ql-snow) {
  @apply rounded-b-[7px] !h-auto !important;
}

:deep(.ql-toolbar) {
  @apply rounded-t-[7px] !important;
}

:deep(.options-class) {
  @apply col-span-full flex gap-x-3 items-center hover:bg-gray-200 active:bg-gray-300 transition-all ease-in-out duration-300 px-1 py-2 rounded-md cursor-pointer -mx-1;
}

:deep(.dp__input) {
  @apply h-[37.5px] text-[13.5px];

  &:hover {
    @apply bg-primary-50 transition-all ease-in-out duration-300;
  }
}
</style>