<template>
  <LayoutComponents-Title title="Medarbejdere" />

  <ModalShow :condition="openCreateEmployee">
    <Employees-Create @close="openCreateEmployee = false" :prefill="activeEmployee" @updated="updateEmployee" @created="createEmployee" />
  </ModalShow>

  <ModalShow :condition="deleteSure">
    <DeletePrompt :msg="`Er du sikker på du vil slette ${activeEmployee.name}?`" @delete="deleteEmployee" @close="deleteSure = null" />
  </ModalShow>

  <ModalShow :condition="createUserLogin">
    <Employees-CreateUserLogin :employee="createUserLogin" @close="createUserLogin = null" @addUserLogin="addUserLogin" />
  </ModalShow>

  <ModalShow :condition="deleteUserSure">
    <DeletePrompt :msg="`Er du sikker på du vil fjerne login for ${deleteUserSure?.name}?`" @delete="deleteUserLogin" @close="deleteUserSure = null" />
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
          <div class="flex items-center gap-x-1">
            <RouterLink class="w-fit inline-block hover:text-primary-600 active:text-primary-800 group" :to="{ name: 'employees.single', params: { id: employee.id } }">{{ employee.name }}</RouterLink>
            <QuickContact type="mail" :customer="employee" />
          </div>
          <div v-if="employee.type === 'subcontractor' && employee.cvr" class="text-[10px] text-gray-600 group-hover:text-primary-600">Cvr. {{ employee.cvr }}</div>
          <div v-if="employee.type === 'employee' && employee.cvr" class="text-[10px] text-gray-600 group-hover:text-primary-600">Cpr. {{ employee.cvr }}</div>
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
          <div v-if="employee.user" class="flex items-center gap-x-2">
            <div class="underline text-blue-600 cursor-pointer hover-transition hover:text-blue-700 active:text-blue-800" @click="createUserLogin = employee">{{ employee.user?.email }}</div>
            <PhBackspace :size="16" weight="fill" class="text-red-600 cursor-pointer hover-transition hover:text-red-700 active:text-red-800" @click="deleteUserSure = employee" />
          </div>
          <div class="underline text-blue-600 flex items-center gap-x-2 cursor-pointer hover-transition hover:text-blue-700 active:text-blue-800" v-else @click="createUserLogin = employee">
            <PhUserPlus :size="16" />
            Tilknyt login
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
import { PhCaretDown, PhPen, PhBackspace, PhPlus, PhEye, PhUserPlus } from '@phosphor-icons/vue';
import { formatPrice } from '@/composables/Price';
import { useRouter } from 'vue-router';

/*******************************
* Refs & variables
******************************/
const message = inject('message');
const loading = inject('loading');
const router = useRouter();
const createUserLogin = ref(null);
const deleteUserSure = ref(null);
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
    name: 'Tilknyttet til'
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

const addUserLogin = (user) => {
  const index = employeeData.value.data.findIndex(p => p.id === createUserLogin.value.id);
  employeeData.value.data[index].user = user;
  createUserLogin.value = null;
};

const deleteUserLogin = async () => {
  let id = deleteUserSure?.value?.user?.id;

  if (!id) return;

  await axiosClient.delete(`employees/user/${id}`).then(() => {
    const index = employeeData.value.data.findIndex(p => p.id === deleteUserSure.value.id);
    if (index !== -1) {
      employeeData.value.data[index].user = null;
    }
    message.showComplete('Login fjernet');
    deleteUserSure.value = null;
  }).catch((e) => { });
};
</script>