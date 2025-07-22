<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="{ 'bg-gray-200 !items-start !py-3 !cursor-auto active:!bg-gray-200': isOpen }" @click="isOpen = true">
    <PhClock :size="27" weight="regular" class="text-gray-600" />
    <div class="text-gray-700 text-[13px] leading-[15px]" v-if="!isOpen">
      <div>
        <span>{{ moment(date).format('DD. MMMM YYYY') }}</span>
        <span class="ml-2">kl. {{ startTime.value }} - {{ endTime.value }}</span>
      </div>
      <div class="text-gray-500 text-[12px] font-light" v-if="!recurring.enabled">Gentages ikke</div>
      <div class="text-gray-500 text-[12px] font-light" v-else>{{ recurring.danish_text }}</div>
    </div>
    <div class="flex-1 relative" v-else>
      <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
      <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Vælg dato & tidspunkt</div>
      <div class="flex gap-x-1.5 mt-2">
        <VueDatePicker locale="da" :format-locale="da" v-if="!is_recurring" text-input v-model="date" :clearable="false" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd. MMM yyyy" class="w-[160px]"></VueDatePicker>
        <div class="h-[37.5px] px-1 flex items-center text-sm justify-center text-gray-500 font-light bg-gray-200" :class="{ 'ml-3': !is_recurring }">kl.</div>
        <div class="relative">
          <PhClock :size="15" weight="bold" class="text-primary-600 absolute top-[11.5px] left-[10px] z-[10]" />
          <DropdownWrite fillPlaceholder="Vælg start tidspunkt" :showArrowDropdown="false" :values="times" :chosenValue="startTime" @selectValue="(time) => selectTime(time, 'start')" display="value" dropdownWidth="w-[150px]" class="!mt-0" overwriteInput="!w-[100px] !pl-8 !h-[37.5px] !m-0 hover:!bg-primary-50 hover:!border-gray-200 hover:!shadow-none !transition-all !ease-in-out !duration-300" :filterable="['value']" />
        </div>
        <div class="h-[37.5px] px-1 flex items-center text-sm justify-center text-gray-500 font-light bg-gray-200">til</div>
        <div class="relative">
          <PhClock :size="15" weight="bold" class="text-primary-600 absolute top-[11.5px] left-[10px] z-[10]" />
          <DropdownWrite fillPlaceholder="Vælg slut tidspunkt" :showArrowDropdown="false" :values="times" :chosenValue="endTime" @selectValue="(time) => selectTime(time, 'end')" display="value" dropdownWidth="w-[150px]" class="!mt-0" overwriteInput="!w-[100px] !pl-8 !h-[37.5px] !m-0 hover:!bg-primary-50 hover:!border-gray-200 hover:!shadow-none !transition-all !ease-in-out !duration-300" :filterable="['value']" />
          <div v-if="!endChanged" class="text-[11px] text-gray-500 font-light">2 timer automatisk</div>
        </div>
      </div>
      <LayoutComponents-Toggle class="mt-3" v-model="recurring.enabled" text="Gentagelse" small v-if="!is_recurring" />
      <div v-if="recurring.enabled && !is_recurring" class="mt-3 text-sm">
        <div class="text-sm text-gray-600">Gentag hver</div>
        <div class="flex gap-2 items-center mt-[-2px]">
          <input type="number" min="1" v-model="recurring.interval" class="input !w-[80px]" />            
          <DropdownWrite :showArrowDropdown="false" :values="[
            { value: 'DAILY', label: 'dag' },
            { value: 'WEEKLY', label: 'uge' },
            { value: 'MONTHLY', label: 'måned' },
          ]" :chosenValue="recurring.frequency" :writeable="false" @selectValue="(value) => recurring.frequency = value" display="label" dropdownWidth="w-[150px]" overwriteInput="!w-[150px]" :filterable="['value']" />
        </div>

        <template v-if="recurring.frequency.value === 'WEEKLY' || recurring.frequency.value === 'MONTHLY'">
          <div class="text-sm text-gray-600 mt-4">Gentag på</div>
          <div v-if="recurring.frequency.value === 'WEEKLY'" class="flex gap-1">
            <button v-for="(day, index) in daysOfWeek" :key="index" @click="toggleDay(index)" class="w-10 h-6 rounded-[5px]" :class="recurring.weekly_days.includes(index) ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-primary-100'">
              {{ day }}
            </button>
          </div>
          <div class="pb-1.5 pt-1" v-if="recurring.frequency.value === 'MONTHLY'">
            <div class="flex gap-3 items-center">
              <label class="flex items-center gap-1">
                <input type="radio" v-model="recurring.monthly_option" value="DAY_OF_MONTH" />
                Den {{ moment(date).date() }}. hver måned
              </label>
              <label class="flex items-center gap-1">
                <input type="radio" v-model="recurring.monthly_option" value="WEEKDAY_OF_MONTH" />
                Den første {{ weekdayName }} hver måned
              </label>
            </div>
          </div>
        </template>

        <div class="text-xs text-gray-500 italic mt-[2px]">{{ recurring.danish_text }}</div>
        <div class="mt-4 text-sm text-gray-600">Gentag indtil <span class="font-light">(afslut)</span></div>
        <VueDatePicker locale="da" :format-locale="da" v-model="recurring.ending_at" :clearable="true" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd. MMM yyyy" class="w-[160px] !mt-[2px]" />
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, watch, computed } from 'vue';
import moment from 'moment';
import { PhClock, PhCaretUp } from '@phosphor-icons/vue';
import { da } from 'date-fns/locale';
import { times } from '@/composables/globalHelper';
const props = defineProps(['is_recurring']);

/******************************
 * Refs & const
******************************/
const date = defineModel('date');
const startTime = defineModel('startTime');
const endTime = defineModel('endTime');
const endChanged = ref(false);
const isOpen = ref(false);
const recurring = defineModel('recurring');
const daysOfWeek = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

/******************************
 * Methods
******************************/
const toggleDay = (dayIndex) => {
  if (recurring.value.weekly_days.includes(dayIndex)) {
    recurring.value.weekly_days = recurring.value.weekly_days.filter(d => d !== dayIndex);
  } else {
    recurring.value.weekly_days.push(dayIndex);
  }
};

const weekdayName = computed(() => {
  return moment(date.value).locale('da').format('dddd');
});

const getRecurrencePreview = () => {
  const int = recurring.value.interval;
  const freqMap = {
    DAILY: 'dag',
    WEEKLY: 'uge',
    MONTHLY: 'måned',
  };

  let text = '';

  if (int !== 1) {
    text += `Gentages hver ${int}. ${freqMap[recurring.value.frequency.value]}`;
  } else {
    text += `Gentages hver ${freqMap[recurring.value.frequency.value]}`;
  }

  if (recurring.value.frequency.value === 'WEEKLY' && recurring.value.weekly_days.length) {
    const dayNames = recurring.value.weekly_days.sort().map(i => moment().weekday(i).locale('da').format('dddd'));
    text += ` på ${dayNames.join(', ')}`;
  }

  if (recurring.value.frequency.value === 'MONTHLY') {
    if (recurring.value.monthly_option === 'DAY_OF_MONTH') {
      text += ` den ${moment(date.value).date()}. i måneden`;
    } else {
      text += ` den første ${weekdayName.value} i måneden`;
    }
  }

  if (recurring.value.ending_at) {
    text += ` indtil ${moment(recurring.value.ending_at).format('D. MMM YYYY')}`;
  }

  return text;
}

const selectTime = (time, type) => {
  if (type === 'start') {
    startTime.value = time;

    if (!endChanged.value) {
      endTime.value = { value: moment(time.value, 'HH:mm').clone().add(2, 'hours').format('HH:mm') };
    }
  } else {
    endTime.value = time;
    endChanged.value = true;
  }
}

/******************************
 * Watchers
******************************/
watch([recurring.value], () => {
  let rule = `FREQ=${recurring.value.frequency.value}`;

  if (recurring.value.frequency.value === 'WEEKLY' && recurring.value.weekly_days.length > 0) {
    const dayMap = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    rule += `;BYDAY=${recurring.value.weekly_days.map(i => dayMap[i]).join(',')}`;
  }

  if (recurring.value.frequency.value === 'MONTHLY') {
    if (recurring.value.monthly_option === 'DAY_OF_MONTH') {
      rule += `;BYMONTHDAY=${moment(date.value).locale('da').date()}`;
    } else if (recurring.value.monthly_option === 'WEEKDAY_OF_MONTH') {
      rule += `;BYDAY=${moment(date.value).locale('en').format('dd').toUpperCase()};BYSETPOS=1`;
    }
  }

  recurring.value.danish_text = getRecurrencePreview();
  recurring.value.rule = rule;
});
</script>
