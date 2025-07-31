<template>
  <div>    
    <div class="grid grid-cols-6 gap-2">
      <Task-Creation-Customer v-model:customer="newTask.customer" :lastCustomerNumber="company.lastCustomerNumber" :prefillServiceAgreement="newTask.service_agreement" :loading="company.loading.customers" :allCustomers="company.customers" @updateFromCustomer="updateFromCustomer" @removeServiceAgreement="removeServiceAgreement" />
      <Task-Creation-Employees v-model:employees="newTask.employees" :loading="company.loading.employees" :allEmployees="company.employees" />
      <Task-Creation-Products v-model:products="newTask.products" :loading="company.loading.products" :manually_changed="newTask.economy.manually_changed" :allProducts="company.products" @updateFromProducts="updateFromProducts" />
      <Task-Creation-DatePicker v-model:recurring="newTask.recurring" :is_recurring="task.recurring_id" @changeRecurring="$emit('changeRecurring')" v-model:date="newTask.date" v-model:startTime="newTask.start_time" v-model:endTime="newTask.end_time" />
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
      <button class="btn btn__green" :disabled="loading" v-if="!newTask.recurring?.enabled || !newTask.recurring_id" @click="editTask(1)">
        <span v-if="!loading">Gem opgaven</span>
        <span v-else>Gemmer opgaven...</span>
      </button>
      <div class="relative">
        <button class="btn btn__green" :disabled="loading" v-if="newTask.recurring?.enabled && newTask.recurring_id" @click="showEditRecurring = !showEditRecurring">
          <div class="flex items-center gap-x-1" v-if="!loading">Gem opgaven <PhCaretDown :size="16" weight="bold" class="hover-transition" :class="{ 'rotate-180': showEditRecurring }" /></div>
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
import { Company } from '@/store/company';
const props = defineProps(['task']);

/******************************
 * Refs & consts
******************************/
const message = inject('message');
const emit = defineEmits(['close', 'updated', 'changeRecurring']);
const company = Company();
const loading = ref(false);
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

  if (!newTask.value.products?.length) {
    message.showError('Du skal vælge mindst ét produkt');
    return;
  }

  if (!newTask.value.location) {
    message.showError('Du skal vælge en lokation');
    return;
  }

  loading.value = true;

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
  }).then((response) => {
    message.showComplete('Opgaven er opdateret');
    emit('updated', response.tasks);
    emit('close');
  }).catch((error) => { console.log(error); });

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
  } 
}

const removeServiceAgreement = () => {
  newTask.value.service_agreement_id = null;
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