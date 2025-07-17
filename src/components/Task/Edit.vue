<template>
  <div>    
    <div class="grid grid-cols-6 gap-2">
      <Task-Creation-Customer v-model:customer="newTask.customer" :lastCustomerNumber="lastCustomerNumber" :prefillServiceAgreement="newTask.service_agreement" :loading="loading.customers" :allCustomers="customers" @updateFromCustomer="updateFromCustomer" @removeServiceAgreement="removeServiceAgreement" />
      <Task-Creation-Employees v-model:employees="newTask.employees" :loading="loading.employees" :allEmployees="employees" />
      <Task-Creation-Products v-model:products="newTask.products" :loading="loading.products" :allProducts="products" @updateFromProducts="updateFromProducts" />
      <Task-Creation-DatePicker v-model:recurring="newTask.recurring" :is_recurring="!!task.recurring_id" v-model:date="newTask.date" v-model:startTime="newTask.start_time" v-model:endTime="newTask.end_time" />
      <Task-Creation-Location v-model:location="newTask.location" />
      <Task-Creation-Economy v-if="!newTask.service_agreement_id" v-model:economy="newTask.economy" :start="newTask.start_time" :end="newTask.end_time" :products="newTask.products" :employees="newTask.employees" :customer="newTask.customer" />
      <Task-Creation-ColorPicker v-model:color="newTask.color" />
      <div class="col-span-full mt-1">
        <div class="text-gray-600 text-[13px] mb-1">Beskrivelse</div>
        <QuillEditor theme="snow" contentType="html" v-model:content="newTask.description" />
      </div>
    </div>
    <div class="flex items-center gap-x-5 mt-5 justify-end">
      <div class="text-gray-500 text-[15px] cursor-pointer underline underline-offset-2 font-light hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" @click="emit('close')">Annuller</div>
      <button class="btn btn__green" :disabled="loading.edit" v-if="!newTask.recurring?.enabled" @click="editTask(1)">
        <span v-if="!loading.edit">Gem opgaven</span>
        <span v-else>Gemmer opgaven...</span>
      </button>
      <div class="relative">
        <button class="btn btn__green" :disabled="loading.edit" v-if="newTask.recurring?.enabled" @click="showEditRecurring = !showEditRecurring">
          <div class="flex items-center gap-x-1" v-if="!loading.edit">Gem opgaven <PhCaretDown :size="16" weight="bold" class="hover-transition" :class="{ 'rotate-180': showEditRecurring }" /></div>
          <div class="flex items-center gap-x-1" v-else>Gemmer gentagelse...</div>
        </button>
        <transition name="dropdown">
          <LayoutComponents-HoverDropdown :freeSlot="true" class="absolute top-[-80px] z-[99] right-0" @close="showEditRecurring = false" v-click-outside="() => showEditRecurring = false" v-if="showEditRecurring" extraclass="w-[250px] max-h-[300px]">
          <template #free>
            <div class="hover_dropdown hover_dropdown__small" @click="editTask(2)">
              <div><PhPen :size="16" weight="fill" /></div>
              Gem alle opgaver
            </div>
            <div class="hover_dropdown hover_dropdown__small" @click="editTask(3)">
              <div><PhPen :size="16" weight="fill" /></div>
              Gem og frigør opgaven
            </div>
          </template>
          </LayoutComponents-HoverDropdown>
        </transition>
      </div>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, inject, onBeforeMount } from 'vue';
import { axiosClient } from '@/lib/axiosClient';
import { PhCaretDown, PhPen } from '@phosphor-icons/vue';
const props = defineProps(['task']);

/******************************
 * Refs & consts
******************************/
const message = inject('message');
const emit = defineEmits(['close', 'updated']);
const customers = ref([]);
const employees = ref([]);
const products = ref([]);
const lastCustomerNumber = ref(0);
const loading = ref({
  edit: false,
  customers: true,
  employees: true,
  products: true,
});
const newTask = ref({
  ...props.task,
  start_time: props.task.start_time ? { value: props.task.start_time } : null,
  end_time: props.task.end_time ? { value: props.task.end_time } : null,
});
const showEditRecurring = ref(false);

/******************************
 * Methods
******************************/
const editTask = async (method) => {
  if (!newTask.value.customer) {
    message.showError('Du skal vælge en kunde');
    return;
  }

  if (!newTask.value.employees?.length) {
    message.showError('Du skal vælge mindst én medarbejder');
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

  loading.value.edit = true;

  if (!newTask.value.date) {
    newTask.value.date = moment().format('YYYY-MM-DD');
  }

  let id = props.task.id;

  if (method === 2 && props.task.recurring_id) {
    id = props.task.recurring_id;
    newTask.value.id = props.task.recurring_id;
  }

  if (method === 3) {
    id = null;
    newTask.value.id = null;
  }

  await axiosClient.put(`task/${id}`, {
    method: method,
    ...newTask.value,
    start_time: newTask.value.start_time?.value || null,
    end_time: newTask.value.end_time?.value || null,
    customer_id: newTask.value.customer?.id,
  }).then((response) => {
    message.showComplete('Opgaven er opdateret');
    emit('updated', response.task);
    emit('close');
  }).catch((error) => { });

  loading.value.edit = false;
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
  } 
}

const removeServiceAgreement = () => {
  newTask.value.service_agreement_id = null;
}

const updateFromProducts = (products) => {
  if (!newTask.value.economy.hourly_changed) {
    newTask.value.economy.hourly_price = 0;
  } else if (newTask.value.economy.hourly_price === 0) {
    newTask.value.economy.hourly_changed = false;
  }

  if (!newTask.value.economy.fixed_changed) {
    newTask.value.economy.fixed_price = 0;
  } else if (newTask.value.economy.fixed_price === 0) {
    newTask.value.economy.fixed_changed = false;
  }

  if (products.length > 0) {
    products.forEach((product) => {
      if (product.pricing_type === 'hourly' && !newTask.value.economy.hourly_changed) {
        newTask.value.economy.hourly_price += product.price;
      }

      if (product.pricing_type === 'fixed' && !newTask.value.economy.fixed_changed) {
        newTask.value.economy.fixed_price += product.price;
      }
    });
  }
}

/******************************
 * Lifecycle hooks
******************************/
onBeforeMount(async () => {
  await axiosClient.get('customers?per_page=100000').then((response) => {
    customers.value = response.pageData?.data || [];
    lastCustomerNumber.value = response.lastCustomerNumber;
  }).catch((e) => { });

  loading.value.customers = false;

  await axiosClient.get('employees?per_page=100000').then((response) => {
    employees.value = response.pageData?.data || [];
  }).catch((e) => { });

  loading.value.employees = false;

  await axiosClient.get('products?per_page=100000').then((response) => {
    products.value = response.pageData?.data || [];
  }).catch((e) => { });

  loading.value.products = false;
});
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