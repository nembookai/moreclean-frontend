<template>
  <div class="relative !text-[13.5px]">
    <button class="btn btn__economic btn__small" :disabled="initLoading" v-if="!activeEconomicProduct" @click="toggleEconomicProducts">
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
      {{ activeEconomicProduct.name }} <span class="text-[10px] font-light">({{ activeEconomicProduct.productNumber }})</span>
      <PhX class="text-red-500 cursor-pointer hover-transition hover:text-red-600 active:text-red-800" @click="removeactiveEconomicProduct" />
    </div>
    <div class="absolute top-[45px] left-0 w-[400px] bg-white shadow-sm border border-gray-200 rounded-lg p-2" v-click-outside="() => showEconomicProducts = false" v-if="showEconomicProducts">
      <input type="text" id="economic-search" autocomplete="new-password" v-model="economicSearch" @keydown.enter="selectWithEnter" class="input !mt-0" placeholder="Søg e-conomic" />
      <div class="max-h-[200px] overflow-y-auto" v-if="!economicLoading">
        <div class="py-10 text-center text-gray-400 font-light" v-if="!economicProducts.length">Søg på firmanavn eller cvr</div>
        <div class="flex flex-col gap-y-1 text-gray-700 mt-2" v-else>
          <div class="flex gap-x-2 items-center even:bg-gray-100 odd:bg-gray-50 cursor-pointer hover:bg-gray-200 hover-transition active:bg-gray-300 p-2 rounded-lg" v-for="product in allEconomicProducts" :key="product.id" @click="selectEconomicProduct(product)">
            <div>{{ product.name }}</div>
            <div class="text-[10px] font-light">({{ product.productNumber }})</div>
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
import { ref, nextTick, onBeforeMount, computed } from 'vue';
import { axiosClient } from '@/lib/axiosClient';
import { PhSpinner, PhX } from '@phosphor-icons/vue';

const props = defineProps(['product']);

/*******************************
 * Refs & variables
 ******************************/
const emit = defineEmits(['update:product', 'remove:product']);
const showEconomicProducts = ref(false);
const economicProducts = ref([]);
const economicSearch = ref('');
const economicLoading = ref(false);
const initLoading = ref(false);
const activeEconomicProduct = ref(null);

/*******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(async () => {
  initLoading.value = true;

  await axiosClient.get(`/economic/products`).then((response) => {
    economicProducts.value = response.data?.collection || [];
  }).catch((e) => { });

  if (props.product.economic_id) {
    await axiosClient.get(`/economic/products?id=${props.product.economic_id}`).then((response) => {
      activeEconomicProduct.value = response.data;
    }).catch((e) => { });
  }

  initLoading.value = false;
});

/*******************************
 * Methods
 ******************************/
const toggleEconomicProducts = async () => {
  showEconomicProducts.value = !showEconomicProducts.value;

  if (showEconomicProducts.value) {
    await nextTick();
    document.getElementById('economic-search')?.focus();
  }
};

const selectWithEnter = () => {
  if (allEconomicProducts.value?.length) {
    selectEconomicProduct(allEconomicProducts.value[0]);
  }
}

const selectEconomicProduct = (product) => {
  activeEconomicProduct.value = product;
  showEconomicProducts.value = false;
  emit('update:product', product);
}

const removeactiveEconomicProduct = () => {
  activeEconomicProduct.value = null;
  emit('remove:product')
}

const allEconomicProducts = computed(() => {
  let products = economicProducts.value;

  if (economicSearch.value.length) {
    products = products.filter((product) => {
      return product.name.toLowerCase().includes(economicSearch.value.toLowerCase()) || product.productNumber.toLowerCase().includes(economicSearch.value.toLowerCase());
    });
  }

  return products;
});
</script>