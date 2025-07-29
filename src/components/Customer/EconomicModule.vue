<template>
  <div class="relative !text-[13.5px]">
    <button class="btn btn__economic btn__small" :disabled="initLoading" v-if="!activeEconomicCustomer" @click="toggleEconomicCustomers">
      <template v-if="!initLoading">
        <img src="img/economic1.png" alt="e-conomic" class="w-[14px] h-[14px]" />
        Opret via e-conomic
      </template>
      <template v-else>
        <PhSpinner class="animate-spin" />
      </template>
    </button>
    <div class="flex items-center gap-x-1" v-else>
      <img src="img/economic.png" alt="e-conomic" class="w-[14px] h-[14px]" />
      {{ activeEconomicCustomer.name }} <span class="text-[10px] font-light">({{ activeEconomicCustomer.customerNumber }})</span>
      <PhX class="text-red-500 cursor-pointer hover-transition hover:text-red-600 active:text-red-800" @click="removeActiveEconomicCustomer" />
    </div>
    <div class="absolute top-[45px] left-0 w-[400px] bg-white shadow-sm border border-gray-200 rounded-lg p-2" v-click-outside="() => showEconomicCustomers = false" v-if="showEconomicCustomers">
      <input type="text" id="economic-search" autocomplete="new-password" v-model="economicSearch" @input="searchInputCustomers" @keydown.enter="selectWithEnter" class="input !mt-0" placeholder="Søg e-conomic" />
      <div class="max-h-[200px] overflow-y-auto" v-if="!economicLoading">
        <div class="py-10 text-center text-gray-400 font-light" v-if="!economicCustomers.length">Søg på firmanavn eller cvr</div>
        <div class="flex flex-col gap-y-1 text-gray-700 mt-2" v-else>
          <div class="flex gap-x-2 items-center even:bg-gray-100 odd:bg-gray-50 cursor-pointer hover:bg-gray-200 hover-transition active:bg-gray-300 p-2 rounded-lg" v-for="customer in economicCustomers" :key="customer.id" @click="selectEconomicCustomer(customer)">
            <div>{{ customer.name }}</div>
            <div class="text-[10px] font-light">({{ customer.customerNumber }})</div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="py-10 text-center text-gray-400 font-light flex justify-center items-center gap-x-2"><PhSpinner class="animate-spin" /> Søger e-conomic...</div>
      </div>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
 ******************************/
import { ref, nextTick, onBeforeMount } from 'vue';
import { axiosClient } from '@/lib/axiosClient';
import { PhSpinner, PhX } from '@phosphor-icons/vue';

const props = defineProps(['customer']);

/*******************************
 * Refs & variables
 ******************************/
const emit = defineEmits(['update:customer', 'remove:customer']);
const showEconomicCustomers = ref(false);
const economicCustomers = ref([]);
const economicSearch = ref('');
const economicLoading = ref(false);
const initLoading = ref(false);
const activeEconomicCustomer = ref(null);

/*******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(async () => {
  if (props.customer.economic_id) {
    initLoading.value = true;

    await axiosClient.get(`/economic/customers?id=${props.customer.economic_id}`).then((response) => {
      activeEconomicCustomer.value = response.data;
    }).catch((e) => { });

    initLoading.value = false;
  }
});

/*******************************
 * Methods
 ******************************/
const toggleEconomicCustomers = async () => {
  showEconomicCustomers.value = !showEconomicCustomers.value;

  if (showEconomicCustomers.value) {
    await nextTick();
    document.getElementById('economic-search')?.focus();
  }
};

const searchEconomicCustomers = async () => {
  economicLoading.value = true;

  await axiosClient.get(`/economic/customers?search=${economicSearch.value}`).then((response) => {
    economicCustomers.value = response.data?.collection || [];
  }).catch((e) => { });
  
  economicLoading.value = false;
};

const searchInputCustomers = async () => {
  if (economicSearch.value.length > 2) {
    await searchEconomicCustomers();
  } else {
    economicCustomers.value = [];
  }
}

const selectEconomicCustomer = (customer) => {
  activeEconomicCustomer.value = customer;
  showEconomicCustomers.value = false;
  emit('update:customer', customer);
}

const removeActiveEconomicCustomer = () => {
  activeEconomicCustomer.value = null;
  emit('remove:customer')
}

const selectWithEnter = () => {
  if (economicCustomers.value?.length) {
    selectEconomicCustomer(economicCustomers.value[0]);
  }
}
</script>