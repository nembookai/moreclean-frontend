<template>
  <Modal @close="$emit('close')" modalWidth="w-[700px]">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900">Send fakturaer til economic</div>
    </template>
    <template #content>
      <div>
        <div class="text-[13px] text-green-600 font-medium" v-if="allComplete">Alle <span class="font-bold underline">{{ finishedInvoices.length }}</span> fakturaer er sendt afsted</div>
        <div class="mt-3" v-if="allCustomers?.length && sendingLoading">
          <div class="flex items-center justify-between text-[12px] text-gray-600">
            <div>Fremgang</div>
            <div>{{ progressPercent }}%</div>
          </div>
          <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div class="h-full bg-green-500 transition-all duration-300" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
        <div class="">
          <div class="text-[13px] text-gray-600 font-light" :class="{ 'mt-5': allComplete || sendingLoading }">Faktura dato</div>
          <VueDatePicker locale="da" class="!w-[200px]" :format-locale="da" text-input v-model="invoiceDate" :clearable="false" :enable-time-picker="false" model-type="yyyy-MM-dd"  :close-on-auto-apply="true" prevent-min-max-navigation :auto-apply="true" format="dd/MM/yyyy"></VueDatePicker>
        </div>
        <div class="text-[13px] text-gray-600 font-light mt-5">Fakturaer (<span class="font-bold underline">{{ allCustomers.length }}</span>)</div>
        <div class="bg-white border border-gray-200 rounded-md flex flex-col gap-y-1 p-3 max-h-[300px] overflow-y-auto mt-1">
          <div v-for="(customer, index) in allCustomers" :key="customer.id">
            <div class="flex justify-between items-center gap-x-2 text-[13px]">
              <div class="flex items-center gap-x-1" :class="{ 'text-green-600': customerStatuses[customer.id] === 'done', 'text-red-600': customerStatuses[customer.id] === 'error' }">
                <div>{{ index + 1 }}.</div>
                {{ customer.name }}
                <PhSpinner  v-if="sendingLoading && customerStatuses[customer.id] === 'processing'" :size="16" weight="bold" class="animate-spin text-gray-800" />
                <PhCheck v-else-if="customerStatuses[customer.id] === 'done'" :size="16" weight="bold" class="text-green-600" />
                <PhX v-else-if="customerStatuses[customer.id] === 'error'" :size="16" weight="bold" class="text-red-600" />
              </div>
              <div>{{ formatPrice(getTotal(customer)) }} kr</div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-4 mt-10" v-if="!allComplete">
          <div class="text-[13px] text-gray-600 font-light cursor-pointer hover-transition hover:text-gray-800 active:text-gray-900" @click="$emit('close')">Annuller</div>
          <button v-if="sendingLoading" class="btn btn__red btn__small" @click="cancelSending" :disabled="cancelRequested">
            <template v-if="!cancelRequested">Afbryd</template>
            <template v-else>
              <PhSpinner class="animate-spin" />
              Afbryder...
            </template>
          </button>
          <button class="btn btn__economic btn__small" :disabled="sendingLoading" @click="sendToEconomic">
            <template v-if="!sendingLoading">
              <img src="img/economic1.png" alt="e-conomic" class="w-[14px] h-[14px]" />
              Send til economic
            </template>
            <template v-else>
              <PhSpinner class="animate-spin" />
              Sender til economic
            </template>
          </button>
        </div>
        <div class="flex items-center justify-end gap-x-4 mt-10" v-else>
          <button class="btn btn__green btn__small" @click="$emit('close')">Luk og tilbage</button>
        </div>
      </div>
    </template>
  </Modal>  
</template>
<script setup>
/******************************
 * Imports & props
 ******************************/
import { ref, reactive, computed } from 'vue';
import { PhSpinner, PhCheck, PhX } from '@phosphor-icons/vue';
import { formatPrice } from '@/composables/Price';
import { axiosClient } from '@/lib/axiosClient';
import moment from 'moment';
import { da } from 'date-fns/locale';
const props = defineProps(['customers', 'settings']);
const emit = defineEmits(['close']);

/******************************
 * Refs
 ******************************/
const finishedInvoices = ref([]);
const sendingLoading = ref(false);
const allCustomers = ref(props.customers);
const customerStatuses = reactive({}); // { [customerId]: 'pending' | 'processing' | 'done' }
const cancelRequested = ref(false);
const allComplete = ref(false);
const invoiceDate = ref(moment().format('YYYY-MM-DD'));

/******************************
 * Methods & computed
 ******************************/
const progressPercent = computed(() => {
  const total = allCustomers.value?.length || 0;
  if (!total) return 0;
  const processed = (allCustomers.value || []).filter((c) => ['done', 'error'].includes(customerStatuses[c.id])).length;
  return Math.round((processed / total) * 100);
});

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

async function sendToEconomic() {
  allComplete.value = false;
  sendingLoading.value = true;
  finishedInvoices.value = [];
  cancelRequested.value = false;
  // Initialize statuses
  allCustomers.value?.forEach((c) => { customerStatuses[c.id] = 'pending'; });

  for (const customer of allCustomers.value || []) {
    if (cancelRequested.value && customerStatuses[customer.id] !== 'processing') {
      break;
    }

    customerStatuses[customer.id] = 'processing';

    await axiosClient.post('/economic/invoice', {
      customer_id: customer.id,
      settings: props.settings,
      invoice_date: invoiceDate.value,
    }).then((response) => {
      customerStatuses[customer.id] = 'done';
      finishedInvoices.value.push(customer.id);
    }).catch((e) => {
      customerStatuses[customer.id] = 'error';
    });
    
    if (cancelRequested.value) {
      break;
    }
  }

  sendingLoading.value = false;
  allComplete.value = true;
}

function cancelSending() {
  if (sendingLoading.value) {
    cancelRequested.value = true;
    emit('close');
  }
}
</script>