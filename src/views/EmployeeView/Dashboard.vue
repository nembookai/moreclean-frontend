<template>
  <div class="mt-1 md:mt-5">
    <EmployeeView-Top />
    <ModalShow :condition="!!activeTaskInfo">
      <EmployeeView-TaskInfo :task="activeTaskInfo" @close="activeTaskInfo = null" />
    </ModalShow>
    <div class="mt-3">
      <div class="flex items-center justify-between gap-x-2">
        <button class="bg-white rounded-[9px] border border-gray-100 shadow-sm w-[42px] h-[42px] flex items-center justify-center active:bg-gray-200 hover:bg-stone-100 hover-transition text-primary-800" @click="switchDay('previous')">
          <PhCaretLeft :size="18" weight="bold" />
        </button>
        <div class="flex-1 text-center bg-white rounded-[9px] border border-gray-100 shadow-sm py-2 px-3 relative cursor-pointer" @click="viewDatePicker = true">
          <div class="text-[16px] font-medium text-gray-800 leading-none">{{ displayDate.text }}</div>
          <div class="text-[11px] text-gray-500 mt-0.5">{{ displayDate.subtext }}</div>
          <div v-if="viewDatePicker" v-click-outside="() => viewDatePicker = false" >
            <VueDatePicker locale="da" :format-locale="da" class="absolute top-[48px] left-1/2 -translate-x-1/2 z-[20]" inline :model-value="activeDate.format('YYYY-MM-DD')" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd/MM/yyyy" @update:model-value="datePickerUpdate" />
          </div>
        </div>
        <button class="bg-white rounded-[9px] border border-gray-100 shadow-sm w-[42px] h-[42px] flex items-center justify-center active:bg-gray-200 hover:bg-stone-100 hover-transition text-primary-800" @click="switchDay('next')">
          <PhCaretRight :size="18" weight="bold" />
        </button>
      </div>
      <div class="mt-3" v-if="!loading">
        <div v-if="dayTasks.length" class="flex flex-col gap-y-[6px] px-1">
          <div class="text-[14px]">Total arbejdstimer idag: <span class="font-semibold">{{ formatPrice(totalHoursToday) }} timer</span></div>
          <div v-for="task in dayTasks" :key="task.id || task.title + (task.start_time || '')" class="text-[13px] grid grid-cols-12 gap-y-1.5 rounded-lg relative w-full p-2" :class="[textColorWhiteOrBlack(task.color)]" :style="{ backgroundColor: task.color }">
            <div class="col-span-4 font-semibold">Kunde:</div>
            <div class="col-span-8">
              <div>{{ task.customer.name }}</div>
            </div>
            <div class="col-span-4 font-semibold">Sted:</div>
            <div class="col-span-8">{{ task.location }}</div>
            <div class="col-span-4 font-semibold">Opgave:</div>
            <div class="col-span-8">
              <div v-for="product in task.products" :key="product.id">{{ product?.name }}</div>
            </div>
            <div class="col-span-4 font-semibold">Medarbejdere:</div>
            <div class="col-span-8">
              <div v-for="employee in task.employees" :key="employee.id">{{ employee?.name }}</div>
            </div>
            <div class="col-span-4 font-semibold">Start:</div>
            <div class="col-span-8">({{ task.start_time }} - {{ task.end_time }}) {{ moment(task.date).format('DD. MMMM YYYY') }}</div>
            <div class="col-span-4 font-semibold" v-if="task.description">Noter:</div>
            <div class="col-span-8" v-if="task.description">{{ task.description }}</div>
            <div class="col-span-4 font-semibold">Varighed:</div>
            <div class="col-span-8">{{ formatPrice(task?.economy?.invoice_hours_employee) + ' timer' }}</div>
            <div class="col-span-full flex items-center gap-x-3 mt-3">
              <div class="w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer" :class="textColorWhiteOrBlack(task.color) === 'text-white' ? 'bg-white' : 'bg-gray-800'" @click.stop="showTaskInfo(task)">
                <PhInfo :size="30" weight="regular" :class="textColorWhiteOrBlack(task.color) === 'text-white' ? 'text-gray-800' : 'text-white'" />
              </div>
              <div class="w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer" :class="textColorWhiteOrBlack(task.color) === 'text-white' ? 'bg-white' : 'bg-gray-800'" @click.stop="openMaps(task)">
                <PhNavigationArrow :size="30" weight="regular" :class="textColorWhiteOrBlack(task.color) === 'text-white' ? 'text-gray-800' : 'text-white'" />
              </div>
              <div class="w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer" :class="textColorWhiteOrBlack(task.color) === 'text-white' ? 'bg-white' : 'bg-gray-800'" @click.stop="callCustomer(task)">
                <PhPhone :size="30" weight="regular" :class="textColorWhiteOrBlack(task.color) === 'text-white' ? 'text-gray-800' : 'text-white'" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-600 text-[14px] py-8">Ingen opgaver denne dag</div>
      </div>
      <div class="bg-white rounded-md mt-3 py-5 flex items-center justify-center flex-col w-full" v-else>
      <div class="loader"></div>
      <div class="text-[20px] text-gray-600 mt-4">Henter opgaver</div>
    </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { axiosClient } from '@/lib/axiosClient';
import { ref, onBeforeMount, computed, inject } from 'vue';
import moment from 'moment';
import { PhCaretLeft, PhCaretRight, PhInfo, PhNavigationArrow, PhPhone, PhSpinner, PhUser } from '@phosphor-icons/vue';
import { textColorWhiteOrBlack } from '@/composables/globalHelper'
import { da } from 'date-fns/locale'
import { formatPrice } from '@/composables/Price';

/******************************
 * Refs & variables
******************************/
const dayTasks = ref([]);
const activeDate = ref(moment());
const loading = ref(false);
const viewDatePicker = ref(false);
const activeTaskInfo = ref(null);
const message = inject('message');

/******************************
 * Computed & methods
******************************/
const displayDate = computed(() => {
  const date = activeDate.value.clone();

  return {
    text: date.format('DD. MMMM'),
    subtext: date.format('YYYY') + ' (' + date.format('dddd') + ')'
  };
});

const totalHoursToday = computed(() => {
  return dayTasks.value.reduce((acc, task) => acc + (task?.economy?.invoice_hours_employee || 0), 0);
});

function switchDay(direction) {
  const date = activeDate.value.clone();

  if (direction === 'previous') {
    activeDate.value = date.subtract(1, 'day');
  } else {
    activeDate.value = date.add(1, 'day');
  }

  fetchDayTasks();
}

async function fetchDayTasks() {
  loading.value = true;

  const dateStr = activeDate.value.format('YYYY-MM-DD');

  await axiosClient.get(`employee-view?startdate=${dateStr}&enddate=${dateStr}`).then((response) => {
    console.log(response);
    dayTasks.value = response?.tasks;
  }).catch((error) => { });

  loading.value = false;
}

function datePickerUpdate (date) {
  activeDate.value = moment(date);
  viewDatePicker.value = false;
  fetchDayTasks();
}

function showTaskInfo(task) {
  activeTaskInfo.value = task || null;
}

function openMaps(task) {
  const location = task?.location || '';
  if (!location) {
    message?.showError && message.showError('Ingen adresse fundet');
    return;
  }
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  window.open(url, '_blank');
}

function callCustomer(task) {
  const phone = task?.customer?.phone || task?.customer?.contact_person_phone || '';
  if (!phone) {
    message?.showError && message.showError('Ingen telefonnummer fundet');
    return;
  }
  const tel = `tel:${String(phone).replace(/\s+/g, '')}`;
  window.location.href = tel;
}

/******************************
 * Lifecycle hooks
******************************/
onBeforeMount(async () => {
  await fetchDayTasks();
})
</script>