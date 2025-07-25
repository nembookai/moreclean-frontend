<template>
  <LayoutComponents-Title title="Medarbejdere" />

  <ModalShow :condition="openCreateEmployee">
    <Employee-Create @close="openCreateEmployee = false" :prefill="activeEmployee" @updated="updateEmployee" @created="createEmployee" />
  </ModalShow>

  <ModalShow :condition="deleteSure">
    <DeletePrompt :msg="`Er du sikker på du vil slette ${activeEmployee.name}?`" @delete="deleteEmployee" @close="deleteSure = null" />
  </ModalShow>

  <div class="mt-5 box" v-if="!loading.loading">
    <TableComponent emptyMessage="Ingen medarbejdere fundet" :lastRight="true" :headers="headers" :data="employeeData">
      <template #extra>
        <div class="flex w-full justify-end items-center gap-x-2">
          <button class="btn btn__green" @click="openCreateEmployee = true"><PhPlus :size="16" weight="bold" /> Opret ny medarbejder</button>
        </div>
      </template>
      <template #body="{ item: employee }">
        <td>
          <RouterLink class="w-fit inline-block hover:text-primary-600 active:text-primary-800 group" :to="{ name: 'employees.single', params: { id: employee.id } }">
            {{ employee.name }}
            <div v-if="employee.type === 'subcontractor' && employee.cvr" class="text-[10px] text-gray-600 group-hover:text-primary-600">Cvr. {{ employee.cvr }}</div>
            <div v-if="employee.type === 'employee' && employee.cvr" class="text-[10px] text-gray-600 group-hover:text-primary-600">Cpr. {{ employee.cvr }}</div>
          </RouterLink>
        </td>
        <td>
          <div>{{ employee.email || '---' }}</div>
          <div v-if="employee.phone" class="text-[10px] text-gray-600">{{ employee.phone }}</div>
        </td>
        <td>
          <div>{{ formatPrice(employee.payout_amount) }}</div>
          <div v-if="employee.payout_type === 'hourly'" class="text-[10px] text-gray-600">kr. pr. time</div>
          <div v-if="employee.payout_type === 'fixed'" class="text-[10px] text-gray-600">kr. pr. måned</div>
        </td>
        <td>
          <div>
            <span>{{ employee.address || '---' }}</span>
          </div>
          <div class="text-[10px] text-gray-600" v-if="employee.zip || employee.city">
            <span v-if="employee.zip">{{ employee.zip }}, </span>
            <span v-if="employee.city">{{ employee.city }}</span>
          </div>
        </td>
        <td>
          <div class="flex justify-end items-center relative">
            <div @click="setActiveEmployee(employee)" class="flex items-center gap-x-0.5 cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" :class="activeEmployee?.id === employee.id ? 'text-primary-700' : ''">
              Mere <PhCaretDown size="16" class="hover-transition" :class="activeEmployee?.id === employee.id ? 'rotate-180' : ''" />
            </div>
            <transition name="dropdown">
              <LayoutComponents-HoverDropdown :freeSlot="true" class="absolute top-[30px] z-[99] right-0" @close="activeEmployee = null" v-click-outside="() => activeEmployee = null" v-if="activeEmployee?.id === employee.id" extraclass="w-[250px] max-h-[300px]">
              <template #free>
                <div class="hover_dropdown hover_dropdown__small" @click="router.push({ name: 'employees.single', params: { id: employee.id } })">
                  <div><PhEye :size="16" weight="fill" /></div>
                  Se medarbejder
                </div>
                <div class="hover_dropdown hover_dropdown__small" @click="openCreateEmployee = true;">
                  <div><PhPen :size="16" weight="fill" /></div>
                  Rediger medarbejder
                </div>
                <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteSure = employee.id">
                  <div><PhBackspace :size="16" weight="fill" /></div>
                  Slet medarbejder
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
import { PhCaretDown, PhPen, PhBackspace, PhPlus, PhEye } from '@phosphor-icons/vue';
import { formatPrice } from '@/composables/Price';
import { useRouter } from 'vue-router';

/*******************************
* Refs & variables
******************************/
const message = inject('message');
const loading = inject('loading');
const router = useRouter();
const employeeData = ref([]);
const headers = [
  {
    name: 'Navn',
    sortable: 'name'
  },
  {
    name: 'Kontakt',
  },
  {
    name: 'Løn',
    sortable: 'payout_amount'
  },
  {
    name: 'Adresse'
  },
  {
    name: ''
  }
];
const activeEmployee = ref(null);
const openCreateEmployee = ref(false);
const deleteSure = ref(null);

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.load();

  await axiosClient.get('/employees').then((response) => {
    employeeData.value = response.pageData;
  }).catch((e) => { });

  loading.reset();
});

/*******************************
* Methods
******************************/
const setActiveEmployee = (employee) => {
  if (activeEmployee.value === employee) {
    activeEmployee.value = null;
  } else {
    activeEmployee.value = employee;
  }
};

const updateEmployee = (employee) => {
  const index = employeeData.value?.data?.findIndex(c => c.id === employee.id);
  employeeData.value.data[index] = employee;
  openCreateEmployee.value = false;
};

const createEmployee = (employee) => {
  employeeData.value.data.unshift(employee);
  openCreateEmployee.value = false;
};

const deleteEmployee = async () => {
  await axiosClient.delete(`/employees/${deleteSure.value}`).then((response) => {
    const index = employeeData.value.data.findIndex(p => p.id === deleteSure.value);
    if (index !== -1) {
      employeeData.value.data.splice(index, 1);
    }
    deleteSure.value = null;
    message.showComplete('Medarbejderen er blevet slettet');
  }).catch((e) => { });
};
</script>