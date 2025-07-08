<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="[{ 'bg-gray-200 !items-start !py-3 !cursor-auto active:!bg-gray-200': isOpen }]" @click="openEconomy">
    <PhCoins :size="27" weight="regular" class="text-gray-600" />
    <div class="text-gray-700 text-[13px] leading-[15px]" v-show="!isOpen">
      <div class="select-none">Økonomi</div>
      <div class="text-gray-500 text-[12px] font-light select-none">Ret økonomi indstillinger</div>
    </div>
    <div class="text-gray-700 text-[13px] leading-[15px] w-full relative" v-show="isOpen">
      <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
      <div class="text-gray-700 text-[13px] font-medium leading-[15px] mb-3">Økonomi</div>
      <div class="flex items-center justify-between pr-10">
        <label class="text-gray-600 text-[13px] text-nowrap">Opgavepris (Timepris)</label>
        <div class="relative group">
          <CurrencyInput value-scaling="precision" class="input !h-[35px] !w-[200px] !mt-0" name="product_price" @update:model-value="economy.hourly_changed = true" v-model="economy.hourly_price" required />
          <div class="bg-gray-300 absolute right-0 hover-transition group-hover:border border-gray-400 rounded-r-[7px] top-0 h-full w-10 flex items-center justify-center">kr.</div>
        </div>
      </div>
      <div class="flex items-center justify-between pr-10 mt-2">
        <label class="text-gray-600 text-[13px] text-nowrap">Opgavepris (Fastpris)</label>
        <div class="relative group">
          <CurrencyInput value-scaling="precision" class="input !h-[35px] !w-[200px] !mt-0" name="product_price" @update:model-value="economy.fixed_changed = true" v-model="economy.fixed_price" required />
          <div class="bg-gray-300 absolute right-0 hover-transition group-hover:border border-gray-400 rounded-r-[7px] top-0 h-full w-10 flex items-center justify-center">kr.</div>
        </div>
      </div>
      <template v-if="!all_day">
        <div class="flex items-center justify-between pr-10 mt-2">
          <div class="text-gray-600 text-[13px] text-nowrap">Lønninger</div>
          <div class="bg-gray-100 w-[200px] cursor-not-allowed h-[35px] flex items-center justify-start pl-2.5 rounded-[7px]">{{ formatPrice(expenses) }} kr.</div>
        </div>
        <div class="flex items-center justify-between pr-10 mt-2">
          <div class="text-gray-600 text-[13px] text-nowrap">Indtjening</div>
          <div class="bg-gray-100 w-[200px] cursor-not-allowed h-[35px] flex items-center justify-start pl-2.5 rounded-[7px]">{{ formatPrice(earnings) }} kr.</div>
        </div>
        <div class="flex items-center justify-between pr-10 mt-2">
          <div class="text-gray-600 text-[13px] text-nowrap">Resultat</div>
          <div class="bg-gray-100 w-[200px] cursor-not-allowed h-[35px] flex items-center justify-start pl-2.5 rounded-[7px] font-semibold" :class="[earnings - expenses > 0 ? 'text-green-600' : 'text-red-600']">{{ formatPrice(earnings - expenses) }} kr.</div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, computed } from 'vue';
import { PhCoins, PhCaretUp } from '@phosphor-icons/vue';
import { formatPrice } from '@/composables/Price';
import moment from 'moment';
const props = defineProps(['customer', 'products', 'employees', 'start', 'end', 'all_day']);

/******************************
 * Refs & const
******************************/
const economy = defineModel('economy');
const isOpen = ref(false);

/******************************
 * Computed
******************************/
const earnings = computed(() => {
  const start = moment(props.start.value, 'HH:mm');
  const end = moment(props.end.value, 'HH:mm');
  const totalHours = moment.duration(end.diff(start)).asHours();

  // Calculate the earnings
  return ((totalHours * economy.value.hourly_price) + economy.value.fixed_price);
});

const expenses = computed(() => {
  let total = 0;
  const start = moment(props.start.value, 'HH:mm');
  const end = moment(props.end.value, 'HH:mm');
  const totalHours = moment.duration(end.diff(start)).asHours();

  if (props.employees.length) {
    props.employees.forEach((employee) => {
      if (employee.payout_type === 'hourly') {
        total += employee.payout_amount * totalHours;
      }
    });
  }

  return total;
});

/******************************
 * Methods
******************************/
const openEconomy = async () => {
  if (!isOpen.value) {
    isOpen.value = true;
  }
}
</script>