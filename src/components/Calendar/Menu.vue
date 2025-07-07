<template>
  <div class="pb-3 bg-[#f5f7fb]">
    <div class="flex justify-between items-center text-[14px]">
      <div class="flex items-center gap-x-1">
        <div class="relative group">
          <button @click="tasks.showTaskCreation = true" :class="[menuBox, clickAble]" class="h-[40px] mr-2 -ml-0.5 py-3 px-4 !bg-primary-500 hover:!bg-primary-600 active:!bg-primary-700 text-white flex items-center justify-center relative">
            <PhPlus :size="15" class="mr-2" weight="bold" />
            Opret ny opgave
          </button>
          <div class="absolute top-[30px] left-1/2 pointer-events-none -translate-x-1/2 text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-1000">Opret ny opgave</div>
        </div>
        <div :class="seperator" class="!mr-4"></div>
        <div class="relative group">
          <div :class="[menuBox, clickAble]" class="w-[40px] h-[40px] text-primary-800 flex items-center justify-center" @click="switchDate('previous')">
            <PhCaretLeft :size="17" weight="bold" />
          </div>
          <div class="absolute top-[40px] left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 !text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-1000">Forrige</div>
        </div>
        <div class="relative group">
          <div :class="[menuBox, clickAble]" class="w-[40px] h-[40px] text-primary-800 flex items-center justify-center" @click="switchDate('next')">
            <PhCaretRight :size="17" weight="bold" />
          </div>
          <div class="absolute top-[40px] left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 !text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-1000">Næste</div>
        </div>
        <div :class="seperator"></div>
        <div class="relative">
          <VueDatePicker locale="da" :format-locale="da" v-if="viewDatePicker" :month-picker="calendar.activeView === 4" v-click-outside="() => viewDatePicker = false" class="absolute top-[42px] z-[20]" inline :model-value="calendar.activeDate.format('YYYY-MM-DD')" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd/MM/yyyy" @update:model-value="datePickerUpdate" />
          <div class="relative group">
            <div class="absolute top-[5px] left-[6px] text-gray-100 leading-none py-0.5 rounded-full px-2 text-[9px] bg-gray-700" v-if="calendar.activeDate.format('YYYY') !== moment().format('YYYY')">{{ calendar.activeDate.format('YYYY') }}</div>
            <button :class="[menuBox, clickAble]" class="h-[40px] text-primary-800 flex items-center justify-center px-4 gap-x-2" @click="viewDatePicker = true">
              <PhCalendarDots :size="17" weight="thin" />
              <div class="flex items-center gap-x-1" v-html="displayDate?.text"></div>
            </button>
            <div class="absolute top-[40px] left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 !text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-500" v-if="!viewDatePicker">{{ displayDate?.hoverText }}</div>
          </div>
        </div>
        <div :class="seperator" v-if="shouldShowToday"></div>
        <div class="relative group">
          <div :class="[menuBox, clickAble]" class="px-4 h-[40px] text-primary-800 flex items-center justify-center gap-x-1" v-if="shouldShowToday" @click="switchToToday">I dag</div>
          <div class="absolute top-[40px] left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 !text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-1000">Gå til dags dato</div>
        </div>
      </div>
      <div class="flex items-center">
        <div class="relative group">
          <div class="cursor-pointer hover:bg-gray-200 h-[40px] w-[40px] flex items-center justify-center hover-transition rounded-[9px]">
            <PhMagnifyingGlass :size="22" weight="regular" class="text-gray-600" />
          </div>
          <div class="absolute top-[40px] left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 !text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-150">Søg</div>
        </div>
        <div class="relative group">
          <div class="cursor-pointer hover:bg-gray-200 h-[40px] w-[40px] flex items-center justify-center hover-transition rounded-[9px]">
            <PhGear :size="22" weight="regular" class="text-gray-600" />
          </div>
          <div class="absolute top-[40px] left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 !text-[11px] py-0.5 px-2 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition text-nowrap delay-0 group-hover:delay-150">Indstillinger</div>
        </div>
        <div :class="[menuBox]" class="h-[40px] ml-2 py-3 px-0.5 text-primary-800 flex items-center justify-center relative">
          <div class="h-[35px] bg-primary-500 rounded-[6px] absolute hover-transition" :class="[calendar.activeView === 1 ? 'w-[48px] left-[2px]' : calendar.activeView === 2 ? 'w-[55px] left-[52px]' : calendar.activeView === 3 ? 'w-[55px] left-[110px]' : 'w-[70px] left-[170.5px]']"></div>
          <div class="px-4 h-full flex items-center justify-center cursor-pointer hover:scale-[1.03] select-none hover-transition border-r border-gray-100 relative active:text-primary-600" :class="[ { 'text-white': calendar.activeView === 1 }, { '!border-0': calendar.activeView === 1 || calendar.activeView === 2 } ]" @click="calendar.switchView(1); $emit('viewChanged')"><PhListNumbers :size="17" weight="regular" /></div>
          <div class="px-4 h-full flex items-center justify-center cursor-pointer hover:scale-[1.03] select-none hover-transition border-r border-gray-100 relative active:text-primary-600" :class="[ { 'text-white': calendar.activeView === 2 }, { '!border-0': calendar.activeView === 2 || calendar.activeView === 3 } ]" @click="calendar.switchView(2); $emit('viewChanged')">Dag</div>
          <div class="px-4 h-full flex items-center justify-center cursor-pointer hover:scale-[1.03] select-none hover-transition border-r border-gray-100 relative active:text-primary-600" :class="[ { 'text-white': calendar.activeView === 3 }, { '!border-0': calendar.activeView === 3 || calendar.activeView === 4 } ]" @click="calendar.switchView(3); $emit('viewChanged')">Uge</div>
          <div class="pl-4 pr-3.5 h-full flex items-center justify-center cursor-pointer hover:scale-[1.03] select-none hover-transition relative active:text-primary-600" :class="[ { 'text-white': calendar.activeView === 4 } ]" @click="calendar.switchView(4);">Måned</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import moment from 'moment';
import { ref, computed } from 'vue';
import { PhCalendarDots, PhCaretLeft, PhCaretRight, PhGear, PhMagnifyingGlass, PhPlus, PhListNumbers } from '@phosphor-icons/vue';
import { Calendar } from '@/store/calendar';
import { Tasks } from '@/store/tasks';
import { da } from 'date-fns/locale';

/******************************
 * Refs & consts
******************************/
const tasks = Tasks();
const calendar = Calendar();
const viewDatePicker = ref(false);
const emit = defineEmits(['viewChanged']);

/******************************
 * Style classes
******************************/
const menuBox = 'bg-white rounded-[9px] border border-gray-100 shadow-sm';
const clickAble = 'hover:bg-stone-100 select-none active:bg-gray-200 active:border-gray-300 hover-transition cursor-pointer';
const seperator = 'mx-2 text-gray-200 h-[27.5px] rounded-md w-[1px] bg-gray-200';

/******************************
 * Methods and computeds
******************************/
const displayDate = computed(() => {
  let date = calendar.activeDate.clone();

  if (calendar.activeView === 4) {
    const startOfMonth = date.clone().startOf('month');
    const endOfMonth = date.clone().endOf('month');

    return {
      text: date.format('MMMM - YYYY'),
      hoverText: startOfMonth.format('DD') + ' - ' + endOfMonth.format('DD. MMMM YYYY'),
    };
  }

  if (calendar.activeView === 3) {
    const startOfWeek = date.clone().startOf('isoWeek');
    const endOfWeek = date.clone().endOf('isoWeek');

    return {
      text: 'Uge ' + date.format('W') + '<div class="text-gray-500 mt-[0.5px] text-[11px]">(' + date.format('MMMM') + ')</div>',
      hoverText: startOfWeek.format('DD') + ' - ' +endOfWeek.format('DD. MMMM YYYY'),
    };
  }

  if (calendar.activeView === 2) {
    return {
      text: date.format('DD. MMMM') + '<div class="text-gray-500 mt-[0.5px] text-[11px]">(' + date.format('dddd') + ')</div>',
      hoverText: date.format('DD. MMMM - YYYY') + ' (' + date.format('dddd') + ')',
    };
  }

  if (calendar.activeView === 1) {
    return {
      text: date.format('DD. MMMM - YYYY') + ' (' + date.format('dddd') + ')',
      hoverText: date.format('DD. MMMM - YYYY') + ' (' + date.format('dddd') + ')',
    };
  }
});

const shouldShowToday = computed(() => {
  if (calendar.activeView === 1) {
    return !calendar.activeDate.isSame(moment(), 'day');
  }

  if (calendar.activeView === 2) {
    return !calendar.activeDate.isSame(moment(), 'day');
  }

  if (calendar.activeView === 3) {
    return !calendar.activeDate.isSame(moment(), 'week');
  }

  if (calendar.activeView === 4) {
    return !calendar.activeDate.isSame(moment(), 'month');
  }

  return false;
});

const datePickerUpdate = (date) => {
  calendar.switchDate(date);
  viewDatePicker.value = false;
  emit('viewChanged');
}

const switchToToday = () => {
  calendar.switchDate(moment());
  viewDatePicker.value = false;
  emit('viewChanged');
}

const switchDate = (direction) => {
  let date = calendar.activeDate.clone();

  if (direction === 'previous') {
    if (calendar.activeView === 1) {
      calendar.switchDate(date.subtract(1, 'day'));
    } else if (calendar.activeView === 2) {
      calendar.switchDate(date.subtract(1, 'day'));
    } else if (calendar.activeView === 3) {
      calendar.switchDate(date.subtract(1, 'week'));
    } else if (calendar.activeView === 4) {
      calendar.switchDate(date.subtract(1, 'month'));
    }
  } else {
    if (calendar.activeView === 1) {
      calendar.switchDate(date.add(1, 'day'));
    } else if (calendar.activeView === 2) {
      calendar.switchDate(date.add(1, 'day'));
    } else if (calendar.activeView === 3) {
      calendar.switchDate(date.add(1, 'week'));
    } else if (calendar.activeView === 4) {
      calendar.switchDate(date.add(1, 'month'));
    }
  }

  viewDatePicker.value = false;
  emit('viewChanged');
}
</script>