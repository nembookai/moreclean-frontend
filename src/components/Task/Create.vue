<template>
  <Modal @close="$emit('close')">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900">Opret ny opgave</div>
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-2.5">
        <Task-Creation-Customer v-model:customer="newTask.customer" :lastCustomerNumber="company.lastCustomerNumber" :loading="company.loading.customers" :allCustomers="company.customers" @updateFromCustomer="updateFromCustomer" @removeServiceAgreement="removeServiceAgreement" />
        <Task-Creation-Employees v-model:employees="newTask.employees" :loading="company.loading.employees" :allEmployees="company.employees" />
        <Task-Creation-Products v-model:products="newTask.products" :loading="company.loading.products" :manually_changed="newTask.economy.manually_changed" :allProducts="company.products" @updateFromProducts="updateFromProducts" />
        <Task-Creation-DatePicker v-model:recurring="newTask.recurring" v-model:date="newTask.date" v-model:startTime="newTask.start_time" v-model:endTime="newTask.end_time" />
        <Task-Creation-Location v-model:location="newTask.location" />
        <Task-Creation-Economy v-if="!newTask.service_agreement_id" v-model:economy="newTask.economy" :start="newTask.start_time" :end="newTask.end_time" :products="newTask.products" :employees="newTask.employees" :customer="newTask.customer" />
        <Task-Creation-ColorPicker v-model:color="newTask.color" v-model:colorManuallyChanged="colorManuallyChanged" />
        <div class="col-span-full mt-1">
          <div class="text-gray-600 text-[13px] mb-1">Beskrivelse</div>
          <QuillEditor theme="snow" contentType="html" v-model:content="newTask.description" />
        </div>
      </div>
      <div class="flex mt-5 justify-end">
        <button class="btn btn__green" :disabled="loading" @click="createTask">
          <span v-if="!loading">Gem opgave</span>
          <span v-else>Gemmer opgaven...</span>
        </button>
      </div>
    </template>
  </Modal>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref, inject } from 'vue';
import moment from 'moment';
import { axiosClient } from '@/lib/axiosClient';
import { Tasks } from '@/store/tasks';
import { Calendar } from '@/store/calendar';
import { taskColors } from '@/composables/globalHelper';
import { Company } from '@/store/company';

/******************************
 * Refs
******************************/
const tasks = Tasks();
const calendar = Calendar();
const newTask = ref({
  date: tasks.prefillTask.date || calendar.activeDate.clone().format('YYYY-MM-DD'),
  start_time: { value: tasks.prefillTask.start_time || moment().minutes(Math.round(moment().minutes() / 30) * 30).format('HH:mm') },
  end_time: { value: tasks.prefillTask.end_time || moment().minutes(Math.round(moment().minutes() / 30) * 30).add(2, 'hours').format('HH:mm') },
  color: taskColors[7],
  employees: [],
  products: [],
  economy: {
    hourly_price: 0,
    fixed_price: 0,
    invoice_hours_customer: 0,
    invoice_hours_employee: 0,
    manually_changed: false,
  },
  service_agreement_id: null,
  recurring: {
    enabled: false,
    interval: 1,
    frequency: { value: 'DAILY', label: 'dag' },
    weekly_days: [ moment(tasks.prefillTask.date).isoWeekday() - 1 ],
  },
});
const loading = ref(false);
const emit = defineEmits(['close', 'created']);
const message = inject('message');
const company = Company();
const colorManuallyChanged = ref(false);

/******************************
 * Methods
******************************/
const createTask = async () => {
  if (!newTask.value.customer) {
    message.showError('Du skal vælge en kunde');
    return;
  }

  if (!newTask.value.products?.length) {
    message.showError('Du skal vælge mindst ét produkt');
    return;
  }

  if (!newTask.value.location) {
    message.showError('Du skal vælge en lokation');
    return;
  }

  if (!newTask.value.employees?.length && !colorManuallyChanged.value) {
    newTask.value.color = taskColors[7];
  }
  
  loading.value = true;

  if (!newTask.value.date) {
    newTask.value.date = moment().format('YYYY-MM-DD');
  }

  await axiosClient.post('task', {
    ...newTask.value,
    start_time: newTask.value.start_time.value,
    end_time: newTask.value.end_time.value,
  }).then((response) => {
    message.showComplete('Opgaven er oprettet');
    emit('created', response.tasks);
  }).catch((error) => { });

  loading.value = false;
}

const updateFromCustomer = (customer) => {
  if (customer.address) {
    newTask.value.location = customer.address;
  
    if (customer.zip) {
      newTask.value.location += ', ' + customer.zip;
    }
  
    if (customer.city) {
      newTask.value.location += ' ' + customer.city;
    }
  } else {
    newTask.value.location = null;
  }

  if (customer.color) {
    newTask.value.color = customer.color;
  } else {
    newTask.value.color = taskColors[0];
  }

  if (customer.service_agreement) {
    newTask.value.service_agreement_id = customer.service_agreement.id;
    addServiceAgreementFixedProduct();
  } else {
    newTask.value.service_agreement_id = null;
    removedServiceAgreementFixedProduct();
  }
}

const removeServiceAgreement = () => {
  newTask.value.service_agreement_id = null;
  removedServiceAgreementFixedProduct();
}

const updateFromProducts = (products) => {
  newTask.value.economy.manually_changed = false;

  if (!products.length) {
    newTask.value.economy.hourly_price = 0;
    newTask.value.economy.fixed_price = 0;
    newTask.value.economy.invoice_hours_customer = 0;
    newTask.value.economy.invoice_hours_employee = 0;
    return;
  }

  newTask.value.economy.hourly_price = products?.filter((p) => p.pricing_type === 'hourly')?.reduce((acc, product) => acc + product.price, 0);
  newTask.value.economy.fixed_price = products?.filter((p) => p.pricing_type === 'fixed')?.reduce((acc, product) => acc + product.price, 0);
  newTask.value.economy.invoice_hours_customer = products?.filter((p) => p.pricing_type === 'hourly')?.reduce((acc, product) => acc + product.hours, 0);
  newTask.value.economy.invoice_hours_employee = products?.reduce((acc, product) => acc + product.hours, 0);
}

const addServiceAgreementFixedProduct = () => {
  newTask.value.products.push({
    id: moment().unix(), 
    economic_id: null, 
    economic_unit_id: null, 
    name: "Serviceaftale",
    price: 0, 
    pricing_type: "fixed", 
    hours: newTask.value?.customer?.service_agreement?.weekly_hours ? (newTask.value.customer.service_agreement.weekly_hours * 100) : 0, 
    description: null, 
    invoice: 0, 
    service_agreement_task: true,
  });
}

const removedServiceAgreementFixedProduct = () => {
  newTask.value.products = newTask.value.products.filter((p) => p.service_agreement_task !== true);
}
</script>
<style lang="scss" scoped>
:deep(.ql-editor) {
  @apply h-[150px] overflow-y-auto bg-white rounded-b-[7px] !important;
}

:deep(.ql-container.ql-snow) {
  @apply rounded-b-[7px] !h-auto !important;
}

:deep(.ql-toolbar) {
  @apply rounded-t-[7px] !important;
}

:deep(.options-class) {
  @apply col-span-full flex gap-x-3 items-center hover:bg-gray-200 active:bg-gray-300 transition-all ease-in-out duration-300 px-1 py-2 rounded-md cursor-pointer -mx-1;
}

:deep(.dp__input) {
  @apply h-[37.5px] text-[13.5px];

  &:hover {
    @apply bg-primary-50 transition-all ease-in-out duration-300;
  }
}
</style>