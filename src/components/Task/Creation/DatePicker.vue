<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="{ 'bg-gray-200 !items-start !py-3 !cursor-auto active:!bg-gray-200': isOpen }" @click="isOpen = true">
    <PhClock :size="27" weight="regular" class="text-gray-600" />
    <div class="text-gray-700 text-[13px] leading-[15px]" v-if="!isOpen">
      <div>
        <span>{{ moment(date).format('DD. MMMM YYYY') }}</span>
        <span v-if="!allDay" class="ml-2">kl. {{ startTime.value }} - {{ endTime.value }}</span>
        <span v-else-if="endDate">
          <span class="mx-1.5">-</span>
          <span>{{ moment(endDate).format('DD. MMMM YYYY') }}</span>
        </span>
      </div>
      <div class="text-gray-500 text-[12px] font-light">Gentages ikke</div>
    </div>
    <div class="flex-1 relative" v-else>
      <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
      <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Vælg dato & tidspunkt</div>
      <div class="flex gap-x-1.5 mt-2">
        <VueDatePicker locale="da" :format-locale="da" text-input v-model="date" :clearable="false" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd. MMM yyyy" class="w-[160px]"></VueDatePicker>
        <template v-if="!allDay">
          <div class="h-[37.5px] ml-3 px-1 flex items-center text-sm justify-center text-gray-500 font-light bg-gray-200">kl.</div>
          <div class="relative">
            <PhClock :size="15" weight="bold" class="text-primary-600 absolute top-[11.5px] left-[10px] z-[10]" />
            <DropdownWrite fillPlaceholder="Vælg start tidspunkt" :showArrowDropdown="false" :values="times" :chosenValue="startTime" @selectValue="(time) => startTime = time" display="value" dropdownWidth="w-[150px]" class="!mt-0" overwriteInput="!w-[100px] !pl-8 !h-[37.5px] !m-0 hover:!bg-primary-50 hover:!border-gray-200 hover:!shadow-none !transition-all !ease-in-out !duration-300" :filterable="['value']" />
          </div>
          <div class="h-[37.5px] px-1 flex items-center text-sm justify-center text-gray-500 font-light bg-gray-200">til</div>
          <div class="relative">
            <PhClock :size="15" weight="bold" class="text-primary-600 absolute top-[11.5px] left-[10px] z-[10]" />
            <DropdownWrite fillPlaceholder="Vælg slut tidspunkt" :showArrowDropdown="false" :values="times" :chosenValue="endTime" @selectValue="(time) => endTime = time" display="value" dropdownWidth="w-[150px]" class="!mt-0" overwriteInput="!w-[100px] !pl-8 !h-[37.5px] !m-0 hover:!bg-primary-50 hover:!border-gray-200 hover:!shadow-none !transition-all !ease-in-out !duration-300" :filterable="['value']" />
          </div>
        </template>
        <template v-else>
          <div class="h-[37.5px] px-1 flex items-center text-sm justify-center text-gray-500 font-light bg-gray-200">til</div>
          <VueDatePicker locale="da" :format-locale="da" :min-date="date" text-input v-model="endDate" :clearable="false" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd. MMM yyyy" class="w-[160px]"></VueDatePicker>
        </template>
      </div>
      <LayoutComponents-Toggle class="mt-3" v-model="allDay" @updated="allDayUpdated" text="Hele dagen" small />
      <div class="text-gray-700 text-[13px] font-medium leading-[15px] mt-4 pb-2">Gentagelse <span class="text-primary-50 bg-primary-500 px-2 py-1 rounded-full font-bold ml-1 text-[12px]">Kommer snart</span></div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, watch } from 'vue';
import moment from 'moment';
import { PhClock, PhCaretUp } from '@phosphor-icons/vue';
import { da } from 'date-fns/locale';
import { times } from '@/composables/globalHelper';

/******************************
 * Refs & const
******************************/
const date = defineModel('date');
const startTime = defineModel('startTime');
const endTime = defineModel('endTime');
const endDate = defineModel('endDate');
const allDay = defineModel('allDay');
const isOpen = ref(false);

/******************************
 * Methods
******************************/
const allDayUpdated = (value) => {
  if (value) {
    endDate.value = date.value;
  } else {
    endDate.value = null;
  }
}

/******************************
 * Watchers
******************************/
watch(date, (value) => {
  if (allDay.value && moment(value).isAfter(endDate.value)) {
    endDate.value = value;
  }
});
</script>
