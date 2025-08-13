<template>
  <LayoutComponents-Title title="Kunder" />

  <ModalShow :condition="openCreateCustomer">
    <Customer-Create @close="openCreateCustomer = false" :lastCustomerNumber="company.lastCustomerNumber" :prefill="activeCustomer" @updated="updateCustomer" @created="createCustomer" />
  </ModalShow>

  <ModalShow :condition="deleteSure">
    <DeletePrompt :msg="`Er du sikker på du vil slette kunden ${activeCustomer.name}?`" @delete="deleteCustomer" @close="deleteSure = null" />
  </ModalShow>

  <ModalShow :condition="serviceAgreement">
    <ServiceAgreement-Create @close="serviceAgreement = null" :products="company.products" :customer="serviceAgreement" @saved="saveServiceAgreement" @deleted="deleteServiceAgreement" />
  </ModalShow>

  <div class="mt-5 box" v-if="!loading.loading">
    <TableComponent emptyMessage="Ingen kunder fundet" :lastRight="true" :headers="headers" :data="customerData">
      <template #extra>
        <div class="flex w-full justify-end items-center gap-x-2">
          <button class="btn btn__green" @click="openCreateCustomer = true"><PhPlus :size="16" weight="bold" /> Opret ny kunde</button>
        </div>
      </template>
      <template #body="{ item: customer }">
        <td>
          <div class="flex items-center gap-x-1 cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none w-fit" @click="router.push({ name: 'customers.single', params: { id: customer.id } })">
            <div class="rounded-full w-[5px] h-[15px]" :style="{ backgroundColor: customer.color }"></div>
            <div class="font-medium">{{ customer.number || '---' }}</div>
          </div>
          <div class="text-[10px] text-gray-600" v-if="customer.debit_number">Debitor. {{ customer.debit_number }}</div>
        </td>
        <td>
          <div class="flex items-center gap-x-1">
            <RouterLink :to="{ name: 'customers.single', params: { id: customer.id } }" class="hover-transition hover:text-primary-600 active:text-primary-800 select-none w-fit">{{ customer.name || '---' }}</RouterLink>
            <QuickContact type="mail" :customer="customer" />
          </div>
          <div class="text-[10px] text-gray-600" v-if="customer.cvr">Cvr. {{ customer.cvr }}</div>
        </td>
        <td>
          <template v-if="!customer.contact_person_email && !customer.contact_person_phone">
            <div>{{ customer.email || '---' }}</div>
            <div v-if="customer.phone" class="text-[10px] text-gray-600">{{ customer.phone }}</div>
          </template>
          <template v-else>
            <div>{{ customer.contact_person_email || '---' }}</div>
            <div v-if="customer.contact_person_phone" class="text-[10px] text-gray-600">{{ customer.contact_person_phone }}</div>
          </template>
        </td>
        <td>
          <div>
            <span>{{ customer.address || '---' }}</span>
          </div>
          <div class="text-[10px] text-gray-600" v-if="customer.zip || customer.city">
            <span v-if="customer.zip">{{ customer.zip }}, </span>
            <span v-if="customer.city">{{ customer.city }}</span>
          </div>
        </td>
        <td class="h-full">
          <div class="flex flex-col justify-center items-center">
            <div v-if="customer.economic_id">
              <PhCheck :size="22" weight="bold" class="text-green-500" />
              <div class="text-[10px] text-gray-600">({{ customer.economic_id }})</div>
            </div>
            <PhX :size="22" weight="bold" class="text-red-500" v-else />
          </div>
        </td>
        <td>
          <div class="flex justify-end items-center relative">
            <div @click="setActiveCustomer(customer)" class="flex items-center gap-x-0.5 cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" :class="activeCustomer?.id === customer.id ? 'text-primary-700' : ''">
              Mere <PhCaretDown size="16" class="hover-transition" :class="activeCustomer?.id === customer.id ? 'rotate-180' : ''" />
            </div>
            <transition name="dropdown">
              <LayoutComponents-HoverDropdown :freeSlot="true" class="absolute top-[30px] z-[99] right-0" @close="activeCustomer = null" v-click-outside="() => activeCustomer = null" v-if="activeCustomer?.id === customer.id" extraclass="w-[250px] max-h-[300px]">
              <template #free>
                <div class="hover_dropdown hover_dropdown__small" @click="router.push({ name: 'customers.single', params: { id: customer.id } })">
                  <div><PhEye :size="16" weight="fill" /></div>
                  Se kunde
                </div>
                <div class="hover_dropdown hover_dropdown__small" @click="serviceAgreement = customer">
                  <div><PhCalendar :size="16" weight="fill" /></div>
                  Serviceaftale
                </div>
                <div class="hover_dropdown hover_dropdown__small" @click="openCreateCustomer = true;">
                  <div><PhPen :size="16" weight="fill" /></div>
                  Rediger kunde
                </div>
                <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteSure = customer.id">
                  <div><PhBackspace :size="16" weight="fill" /></div>
                  Slet kunde
                </div>
              </template>
              </LayoutComponents-HoverDropdown>
            </transition>
          </div>
        </td>
      </template>
    </TableComponent>
  </div>
</template>
<script setup>
/*******************************
* Imports & props
******************************/
import { ref, onBeforeMount, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient'
import { PhCaretDown, PhEye, PhPen, PhBackspace, PhPlus, PhCalendar, PhCheck, PhX } from '@phosphor-icons/vue';
import { Company } from '@/store/company';
import { useRouter } from 'vue-router';

/*******************************
* Refs & variables
******************************/
const message = inject('message');
const loading = inject('loading');
const router = useRouter();
const customerData = ref([]);
const headers = [
  {
    name: 'Kundenr.',
    sortable: 'number'
  },
  {
    name: 'Navn',
    sortable: 'name'
  },
  {
    name: 'Kontakt',
    sortable: 'email'
  },
  {
    name: 'Adresse'
  },
  {
    name: 'E-conomic',
    sortable: 'economic_id'
  },
  {
    name: ''
  }
];
const activeCustomer = ref(null);
const openCreateCustomer = ref(false);
const deleteSure = ref(null);
const serviceAgreement = ref(null);
const company = Company();

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.load();

  await axiosClient.get('/customers').then((response) => {
    customerData.value = response.pageData;
  }).catch((e) => { });

  loading.reset();
});

/*******************************
* Methods
******************************/
const setActiveCustomer = (customer) => {
  if (activeCustomer.value === customer) {
    activeCustomer.value = null;
  } else {
    activeCustomer.value = customer;
  }
};

const updateCustomer = (customer) => {
  const index = customerData.value?.data?.findIndex(c => c.id === customer.id);
  customerData.value.data[index] = customer;
  openCreateCustomer.value = false;
};

const createCustomer = (customer) => {
  customerData.value.data.unshift(customer);
  openCreateCustomer.value = false;
  company.addToLastCustomerNumber();
};

const deleteCustomer = async () => {
  await axiosClient.delete(`/customers/${deleteSure.value}`).then((response) => {
    const index = customerData.value.data.findIndex(c => c.id === deleteSure.value);
    if (index !== -1) {
      customerData.value.data.splice(index, 1);
    }
    deleteSure.value = null;
    message.showComplete('Kunden er blevet slettet');
  }).catch((e) => { });
};

const saveServiceAgreement = (sa) => {
  const index = customerData.value.data.findIndex(c => c.id === sa.customer_id);
  customerData.value.data[index].service_agreement = sa;
  serviceAgreement.value = null;
};

const deleteServiceAgreement = () => {
  window.location.reload();
};
</script>