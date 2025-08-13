<template>
  <div class="absolute top-[40px] left-0 bg-white border border-gray-200 rounded-[6px] p-6 shadow-md w-[400px]">
    <div class="text-[14px] text-gray-600 font-light mb-1">Periode</div>
    <DatePicker :prefilledDate="settings.date" :customSpan="true" @dateSearch="(date) => settings.date = date" :hideActions="true" class="!text-[13px] !leading-none">
      <template #customSpan>{{ displayDate }}</template>
    </DatePicker>
    <div class="text-[14px] text-gray-600 font-light mt-3">Kunde</div>
    <DropdownWrite fillPlaceholder="Vis alle kunder" :values="customers" :chosenValue="settings.customer" @selectValue="(customer) => updateField('customer', customer)" display="name" :allowNull="true" dropdownWidth="w-[350px]" :filterable="['number', 'name']" />
    <div class="text-[14px] text-gray-600 font-light mt-3">Indstillinger</div>
    <LayoutComponents-Toggle v-model="settings.showExcludedCustomers" small text="Vis ekskluderede kunder" class="mt-2" />
    <LayoutComponents-Toggle v-model="settings.showExcludedProducts" small text="Vis ekskluderede produkter" class="mt-5" />
    <button class="btn btn__primary btn__small mt-10" @click="$emit('search', settings)">Filter og søg</button>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
 ******************************/
import { computed } from 'vue';
import moment from 'moment';
const props = defineProps({
  customers: Array,
  settings: Object
});

/******************************
 * Refs & consts
 ******************************/
const emit = defineEmits(['search', 'update:settings']);

/******************************
 * Methods & computed
 ******************************/
function updateField(key, value) {
  emit('update:settings', { ...props.settings, [key]: value });
}

const displayDate = computed(() => {
  const start = moment(props.settings.date.start);
  const end = moment(props.settings.date.end);

  if (start.format('YYYY-MM') === end.format('YYYY-MM')) {
    return `${start.format('DD')} til ${end.format('DD')} ${start.format('MMMM YYYY')}`;
  }

  return `${start.format('DD. MMMM YYYY')} - ${end.format('DD. MMMM YYYY')}`;
});
</script>