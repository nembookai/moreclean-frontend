<template>
  <div class="relative">
    <div @click="isDateOpen = !isDateOpen" :class="isDateOpen ? 'bg-gray-300 active:bg-gray-400' : 'bg-gray-200/75 hover:bg-gray-300 active:bg-gray-400'" class="flex relative items-center gap-x-2 px-3.5 py-2.5 select-none border-gray-300/75 text-gray-700 rounded-[5px] cursor-pointer hover-transition">
      <PhCalendarBlank weight="bold" :size="16" />
      <template v-if="customSpan">
        <slot name="customSpan" />
      </template>
      <div v-else>{{ displayDate }}</div>
    </div>
    <div class="pb-10 absolute top-[50px] z-[99] left-0" v-if="isDateOpen" v-click-outside="() => isDateOpen = false">
      <div class="w-[450px] p-3.5 leading-normal rounded-[6px] shadow-md border border-gray-50 text-[13.5px] bg-white">
        <div class="grid grid-cols-3 rounded-[6px] mb-3 bg-gray-100">
          <div :class="[tabStyle, activeTab === 1 ? activeTabStyle : '']" class="!rounded-r-none" @click="switchTab(1)">Måned</div>
          <div :class="[tabStyle, activeTab === 2 ? activeTabStyle : '']" class="!rounded-none" @click="switchTab(2)">Kvartal</div>
          <div :class="[tabStyle, activeTab === 3 ? activeTabStyle : '']" class="!rounded-l-none" @click="switchTab(3)">Årligt</div>
        </div>
        <div class="max-h-[260px] overflow-y-auto overscroll-contain">
          <div class="grid grid-cols-3 gap-x-3" v-if="activeTab === 3">
            <div class="p-2 rounded-[6px] hover-transition hover:bg-gray-200 cursor-pointer flex items-center justify-center" @click="setActiveDateByYear(year)" :class="moment(activeDate.start).format('YYYY') === year ? 'bg-primary-700 text-primary-50 hover:bg-primary-700' : ''" v-for="year in years" :key="year">
              {{ year }}
            </div>
          </div>
          <div class="flex flex-col gap-y-1 mt-2" v-if="activeTab === 2">
            <div class="grid grid-cols-4 gap-x-3 p-2 rounded-md" :class="{ 'bg-primary-50': year === moment(activeDate.start).format('YYYY') }" v-for="year in years" :key="year">
              <div class="col-span-full text-[13px] text-gray-400 font-semibold" :class="{ 'text-primary-700': year === moment(activeDate.start).format('YYYY') }">{{ year }}</div>
              <div class="p-2 rounded-[6px] hover-transition hover:bg-gray-200 cursor-pointer flex items-center justify-center" v-for="quarter in 4" @click="setActiveDateByQuarter(quarter, year)" :class="moment(activeDate.start).format('Q YYYY') == `${quarter} ${year}` ? 'bg-primary-700 text-primary-50 hover:bg-primary-700' : ''">
                {{ quarter }}. Kvartal
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-y-1 mt-2" v-if="activeTab === 1">
            <div class="grid grid-cols-6 gap-x-3 p-2 rounded-md" :class="{ 'bg-primary-50': year === moment(activeDate.start).format('YYYY') }" v-for="year in years" :key="year">
              <div class="col-span-full text-[13px] text-gray-400 font-semibold" :class="{ 'text-primary-700': year === moment(activeDate.start).format('YYYY') }">{{ year }}</div>
              <div class="p-2 rounded-[6px] hover-transition hover:bg-gray-200 cursor-pointer flex items-center justify-center" v-for="month in 12" @click="setActiveDateByMonth(month, year)" :class="moment(activeDate.start).format('M YYYY') == `${month} ${year}` ? 'bg-primary-700 text-primary-50 hover:bg-primary-700' : ''">
                {{ moment(year).add(month - 1, 'month').format('MMMM')?.slice(0, 3) }}
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 mt-2 gap-x-3">
          <div>
            <div class="col-span-full text-[13px] text-gray-600 font-normal">Startsdato</div>
            <VueDatePicker locale="da" :format-locale="da" text-input v-model="activeDate.start" :clearable="false" :enable-time-picker="false" model-type="yyyy-MM-dd"  :close-on-auto-apply="true" prevent-min-max-navigation :auto-apply="true" format="dd/MM/yyyy" @update:model-value="updateDate"></VueDatePicker>
          </div>
          <div>
            <div class="col-span-full text-[13px] text-gray-600 font-normal">Slutdato</div>
            <VueDatePicker locale="da" :format-locale="da" text-input v-model="activeDate.end" :clearable="false" :enable-time-picker="false" model-type="yyyy-MM-dd"  :close-on-auto-apply="true" prevent-min-max-navigation :auto-apply="true" format="dd/MM/yyyy" @update:model-value="updateDate"></VueDatePicker>
          </div>
        </div>
        <div class="flex items-center justify-end mt-3 gap-x-3" v-if="!hideActions">
          <div v-if="prefilledDate?.start" class="text-primary-700 text-[13px] cursor-pointer" @click="$emit('resetSearch'); isDateOpen = false;">Nulstil søgning</div>
          <button class="btn btn__green btn__small" @click="$emit('dateSearch', { ...activeDate, tab: activeTab }); isDateOpen = false">
            Søg efter dato
            <PhArrowRight weight="bold" :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, computed, watch } from 'vue';
import moment from 'moment';
import { PhArrowRight, PhCalendarBlank } from '@phosphor-icons/vue';
import { da } from 'date-fns/locale';
const props = defineProps(['customSpan', 'prefilledDate', 'hideActions'])

/*******************************
 * Styles
******************************/
const tabStyle = 'text-center active:bg-primary-800 active:text-primary-50 hover-transition hover:bg-gray-200 rounded-[6px] p-2 cursor-pointer font-medium text-gray-700';
const activeTabStyle = 'bg-primary-700 hover:bg-primary-700 text-primary-50 !font-semibold hover-transition !cursor-default';

/*******************************
 * Refs & consts
******************************/
const isDateOpen = ref(false);
const activeTab = ref(props.prefilledDate?.tab || 1);
const activeDate = ref({
  start: props.prefilledDate?.start || moment().format('YYYY-MM-DD'),
  end: props.prefilledDate?.end || moment().add(1, 'month').format('YYYY-MM-DD')
})
const emit = defineEmits(['dateSearch', 'resetSearch'])

/*******************************
 * Computed & methods
******************************/
const years = computed(() => {
  const currentYear = moment().year();

  let years = [
    {
      start: moment().startOf('year').format('YYYY-MM-DD'),
      end: moment().endOf('year').format('YYYY-MM-DD')
    },
    {
      start: moment().add(1, 'year').startOf('year').format('YYYY-MM-DD'),
      end: moment().add(1, 'year').endOf('year').format('YYYY-MM-DD')
    }
  ]

  years = years
    .map(date => moment(date.start).format('YYYY'))
    .filter(year => {
      const yearInt = parseInt(year, 10);
      return yearInt >= currentYear - 4 && yearInt <= currentYear + 4;
    });

  return years.slice(0, 9);
});

const setActiveDateByYear = (year) => {
  activeDate.value = {
    start: moment(year).startOf('year').format('YYYY-MM-DD'),
    end: moment(year).endOf('year').format('YYYY-MM-DD')
  }
}

const setActiveDateByQuarter = (quarter, year) => {
  activeDate.value = {
    start: moment(year).add(quarter - 1, 'quarter').startOf('quarter').format('YYYY-MM-DD'),
    end: moment(year).add(quarter - 1, 'quarter').endOf('quarter').format('YYYY-MM-DD')
  }
}

const setActiveDateByMonth = (month, year) => {
  activeDate.value = {
    start: moment(year).add(month - 1, 'month').startOf('month').format('YYYY-MM-DD'),
    end: moment(year).add(month - 1, 'month').endOf('month').format('YYYY-MM-DD')
  }
}

const switchTab = (tab) => {
  activeTab.value = tab;

  if (tab === 1) {
    activeDate.value.end = moment(activeDate.value.start).endOf('month').format('YYYY-MM-DD');
  }

  if (tab === 2) {
    activeDate.value.end = moment(activeDate.value.start).endOf('quarter').format('YYYY-MM-DD');
  }

  if (tab === 3) {
    activeDate.value.end = moment(activeDate.value.start).endOf('year').format('YYYY-MM-DD');
  }
}

const displayDate = computed(() => {
  if (activeTab.value === 3) {
    return moment(activeDate.value.start).format('YYYY');
  } else if (activeTab.value === 2) {
    return moment(activeDate.value.start).format('Q') + ' Kvartal ' + moment(activeDate.value.start).format('YYYY');
  } else if (activeTab.value === 1) {
    return moment(activeDate.value.start).format('MMMM') + ' ' + moment(activeDate.value.start).format('YYYY');
  }
})

const updateDate = (date) => {
  if (moment(date).year() > moment(activeDate.value.end).year()) {
    activeDate.value.end = moment(date).format('YYYY-MM-DD');
  }

  if (moment(date).isBefore(moment(activeDate.value.start))) {
    activeDate.value.start = moment(date).format('YYYY-MM-DD');
  }

  if (props.hideActions) {
    emit('dateSearch', { ...activeDate.value, tab: activeTab.value });
  }
}

/*******************************
 * Watchers
******************************/
watch(activeDate, (newVal) => {
  if (props.hideActions) {
    emit('dateSearch', { ...newVal, tab: activeTab.value });
    isDateOpen.value = false;
  }
})
</script>
<style scoped>
:deep(.dp__input) {
  @apply !py-[7px] !text-[12px];
}
</style>
