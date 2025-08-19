<template>
  <div>
    <LayoutComponents-Title title="Fakturering" />

    <ModalShow :condition="sendingPrompt">
      <Invoices-SendingPrompt @close="sendingPrompt = false" :settings="settings" :customers="sendingCustomer" />
    </ModalShow>

    <div class="flex gap-x-5 items-center" v-if="!loading.loading">
      <div class="relative z-[20]">
        <button class="btn btn__lightgray btn__small" @click="filterOpen = !filterOpen"><PhFunnel weight="bold" :size="16" />Søg og filtrer</button>
        <Invoices-Filter v-if="filterOpen" @close="filterOpen = false" v-click-outside="() => filterOpen = false" :customers="allCustomers" @search="search" v-model:settings="settings" /> 
      </div>
      <div class="underline underline-offset-1 text-orange-500 text-[13px] cursor-pointer" @click="sendToEconomic()" v-if="customers.length">Send alle {{ economicCustomers?.length }} fakturaer til economic</div>
    </div>
    <div class="flex flex-col gap-y-3 mt-3 mb-10" v-if="customers?.length">
      <div class="box grid grid-cols-12 gap-x-10 !bg-gray-50 !p-2.5">
        <div class="col-span-3">
          <div class="text-[15px] font-medium text-center">{{ moment(settings.date.start).format('DD. MMM YYYY') }} - {{ moment(settings.date.end).format('DD. MMM YYYY') }}</div>
          <div class="text-[13px] text-gray-600 font-light text-center">Periode</div>
        </div>
        <div class="col-span-3">
          <div class="text-[15px] font-medium text-center">{{ customers.length }}</div>
          <div class="text-[13px] text-gray-600 font-light text-center">Antal fakturaer</div>
        </div>
        <div class="col-span-3">
          <div class="text-[15px] font-medium text-center">{{ 0 }}</div>
          <div class="text-[13px] text-gray-600 font-light text-center">Antal serviceaftaler</div>
        </div>
        <div class="col-span-3">
          <div class="text-[15px] font-medium text-center">{{ formatPrice(customers.reduce((acc, customer) => acc + getTotal(customer), 0)) }} kr</div>
          <div class="text-[13px] text-gray-600 font-light text-center">Total beløb</div>
        </div>
      </div>
      <div class="box grid grid-cols-12 gap-x-10 !p-2.5 !pr-4" v-for="customer in customers" :key="customer.id">
        <div class="col-span-3">
          <div class="bg-gray-50 border border-gray-200 text-gray-800 text-[13px] font-light rounded-md p-2 relative group">
            <div class="flex items-center gap-x-1">
              <PhBuilding v-if="customer.type === 'company'" weight="fill" :size="16" /> 
              <PhUser v-if="customer.type === 'person'" weight="fill" :size="16" />
              <div class="text-[15px] font-normal line-clamp-1">{{ customer.name }}</div>
              <div class="text-[15px] font-normal line-clamp-1">({{ customer.number }})</div>
            </div>
            <Invoices-CustomerInfo :customer="customer" class="absolute left-0 top-[20px] z-10 pointer-events-none group-hover:pointer-events-auto opacity-0 hover-transition group-hover:opacity-100 delay-0 group-hover:delay-[1500ms] group-hover:block" />
          </div>
        </div>
        <div class="col-span-9">
          <div class="grid grid-cols-12 text-gray-800 font-medium text-[13px] gap-x-10 mb-2">
            <div class="col-span-5">Varenavn</div>
            <div class="col-span-2">Antal</div>
            <div class="col-span-3">Pris pr.</div>
            <div class="col-span-2 text-right">Total</div>
          </div>
          <div class="w-full mb-3">
            <div v-for="task in customer.tasks" :key="task.id">
              <div class="grid grid-cols-12 gap-x-10 text-[14px] text-gray-700 font-light my-1.5" :class="{ 'text-red-500': !product.economic_id }" v-for="product in task.products" :key="product.id">
                <div class="col-span-5">
                  <div class="inline relative" v-if="!product.economic_id" >
                    <img src="img/economic.png" class="w-3 h-3 inline-block mr-1" />
                    <span class="text-[12px] font-light">(mangler)</span>
                  </div>
                  {{ product.name }}, {{ moment(task.date).format('DD/MM/YYYY') }}
                </div>
                <div class="col-span-2">
                  <span v-if="product.pricing_type === 'hourly'">{{ formatPrice(product.hours) }} timer</span>
                  <span v-else>pr opgave</span>
                </div>
                <div class="col-span-3">kr. {{ formatPrice(product.price) }}</div>
                <div class="col-span-2 text-right font-medium">
                  <span v-if="product.pricing_type === 'hourly'">{{ formatPrice((product.price) * (product.hours / 100)) }} kr.</span>
                  <span v-else>{{ formatPrice(product.price) }} kr.</span>
                </div>
              </div>
            </div>
            <div class="flex w-full items-end flex-col mt-3 border-t border-gray-200 pt-3">
              <div class="w-[300px] text-right text-[14px]">Ialt. {{ formatPrice(getTotal(customer)) }} kr</div>
              <div class="underline underline-offset-1 text-orange-500 text-[12px] mt-1 cursor-pointer" v-if="customer.economic_id" @click="sendToEconomic(customer)">Send faktura til economic</div>
              <div v-else class="text-red-500 text-[12px] mt-1">Kunden ikke tilknyttet economic</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="box mt-3 py-[200px]">
      <div class="text-gray-500 text-[13px] text-center">Ingen fakturaer fundet</div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
 ******************************/
import { ref, onBeforeMount, inject, computed } from 'vue';
import { PhFunnel, PhBuilding, PhUser, PhXCircle } from '@phosphor-icons/vue';
import { axiosClient } from '@/lib/axiosClient';
import { formatPrice } from '@/composables/Price';
import moment from 'moment';

/******************************
 * Refs
 ******************************/
const settings = ref({
  date: {
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().endOf('month').format('YYYY-MM-DD')
  },
  customer: null,
  showExcludedCustomers: true,
});
const loading = inject('loading');
const allCustomers = ref([]);
const customers = ref([]);
const filterOpen = ref(false);
const sendingPrompt = ref(false);
const sendingCustomer = ref([]);

/******************************
 * Methods & computed
 ******************************/
async function getApi() {
  loading.load();

  await axiosClient.get('/invoices', {
    params: {
      date_start: settings.value.date.start,
      date_end: settings.value.date.end,
      customer: settings.value.customer,
      show_excluded_customers: settings.value.showExcludedCustomers,
      show_excluded_products: settings.value.showExcludedProducts,
    }
  }).then((response) => {
    customers.value = response.customers;
    allCustomers.value = response.all_customers;
  }).catch((err) => { });

  loading.reset();
}
 
async function search(newSettings) {
  settings.value = newSettings;
  filterOpen.value = false;

  await getApi();
}

function getTotal(customer) {
  return customer.tasks?.reduce((acc, task) => {
    return acc + task.products?.reduce((acc, product) => {
      if (product.pricing_type === 'hourly') {
        return acc + (product.price * (product.hours / 100));
      } else {
        return acc + product.price;
      }
    }, 0);
  }, 0);
}

async function sendToEconomic(customer = null) {
  sendingPrompt.value = true;
  sendingCustomer.value = [];

  if (customer) {
    sendingCustomer.value.push(customer);
  } else {
    sendingCustomer.value = economicCustomers.value;
  }
}

const economicCustomers = computed(() => {
  return customers.value.filter((customer) => customer.economic_id);
});
/******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(async () => {
  await getApi();
})
</script>