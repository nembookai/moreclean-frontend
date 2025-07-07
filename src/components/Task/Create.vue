<template>
  <Modal @close="$emit('close')">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900">Opret ny opgave</div>
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-2.5">
        <Task-Creation-Customer v-model:customer="newTask.customer" :allCustomers="customers" @updateFromCustomer="updateFromCustomer" />
        <Task-Creation-Employees v-model:employees="newTask.employees" :allEmployees="employees" />
        <Task-Creation-Products v-model:products="newTask.products" :allProducts="products" />
        <Task-Creation-DatePicker v-model:date="newTask.date" v-model:startTime="newTask.start_time" v-model:endTime="newTask.end_time" v-model:endDate="newTask.end_date" v-model:allDay="newTask.all_day" />
        <Task-Creation-Location v-model:location="newTask.location" />
        <Task-Creation-Economy v-model:economy="newTask.economy" />
        <Task-Creation-ColorPicker v-model:color="newTask.color" />
        <div class="col-span-full mt-1">
          <div class="text-gray-600 text-[13px] mb-1">Beskrivelse</div>
          <QuillEditor theme="snow" contentType="html" v-model:content="newTask.description" />
        </div>
      </div>
      <div class="flex mt-5 justify-end">
        <button class="btn" :disabled="loading.create" @click="createTask">
          <span v-if="!loading.create">Gem opgave</span>
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
import { ref, inject, onBeforeMount } from 'vue';
import moment from 'moment';
import { axiosClient } from '@/lib/axiosClient';
import { Tasks } from '@/store/tasks';
import { Calendar } from '@/store/calendar';
import { taskColors } from '@/composables/globalHelper';

/******************************
 * Refs
******************************/
const tasks = Tasks();
const calendar = Calendar();
const newTask = ref({
  date: tasks.prefillTask.date || calendar.activeDate.clone().format('YYYY-MM-DD'),
  start_time: { value: tasks.prefillTask.start_time || moment().minutes(Math.round(moment().minutes() / 30) * 30).format('HH:mm') },
  end_time: { value: tasks.prefillTask.end_time || moment().minutes(Math.round(moment().minutes() / 30) * 30).add(1, 'hours').format('HH:mm') },
  all_day: tasks.prefillTask.all_day || false,
  color: taskColors[0],
  employees: [],
  products: [],
  economy: {},
});
const customers = ref([]);
const employees = ref([]);
const products = ref([]);
const loading = ref({
  create: false,
  customers: false,
  employees: false,
  products: false,
});
const emit = defineEmits(['close', 'created']);
const message = inject('message');

/******************************
 * Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.value.customers = true;

  await axiosClient.get('customers?per_page=100000').then((response) => {
    customers.value = response.pageData?.data || [];
  }).catch((e) => { });

  loading.value.customers = false;
  loading.value.employees = true;

  await axiosClient.get('employees?per_page=100000').then((response) => {
    employees.value = response.pageData?.data || [];
  }).catch((e) => { });

  loading.value.employees = false;
  loading.value.products = true;

  await axiosClient.get('products?per_page=100000').then((response) => {
    products.value = response.pageData?.data || [];
  }).catch((e) => { });

  loading.value.products = false;
});

/******************************
 * Methods
******************************/
const createTask = async () => {
  loading.value.create = true;

  if (!newTask.value.title) {
    newTask.value.title = 'Ingen titel';
  }

  if (!newTask.value.date) {
    newTask.value.date = moment().format('YYYY-MM-DD');
  }

  await axiosClient.post('task', {
    ...newTask.value,
    start_time: newTask.value.start_time.value,
    end_time: newTask.value.end_time.value
  }).then((response) => {
    message.showComplete('Opgaven er oprettet');
    emit('created', response.task);
  }).catch((error) => { });

  loading.value.create = false;
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