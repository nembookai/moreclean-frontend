<template>
  <div>
    <div class="bg-white border border-gray-200 rounded-md w-[400px] shadow-lg">
      <div class="bg-gray-100 p-2 rounded-t-md text-gray-600 font-light">Filtrér opgaver</div>
      <div class="p-5 flex flex-col gap-y-5">
        <div>
          <div class="text-[13px] font-light">Søg efter kunde</div>
          <DropdownWrite fillPlaceholder="Vælg kunde" :values="customerDropdown" :chosenValue="filteredCustomers" @selectValue="selectCustomer" display="name" dropdownWidth="w-[350px]" :filterable="['number', 'name']" />
          <div class="mt-2" v-if="filteredCustomers.length">
            <div class="text-gray-500 text-[12px] font-light">Kunder valgt</div>
            <div class="flex flex-col gap-1.5">
              <div class="text-gray-700 text-[14px] leading-[15px] flex items-center gap-x-1" v-for="(c, index) in filteredCustomers" :key="c.id">
                {{ c.name }}
                <PhX :size="16" weight="regular" class="text-red-500 cursor-pointer hover-transition hover:text-red-700 active:text-red-900" @click.stop="removeCustomer(c)" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="!toHandle">
          <div class="text-[13px] font-light">Søg efter medarbejder</div>
          <DropdownWrite fillPlaceholder="Vælg medarbejder" :values="[{ id: 0, name: 'Opgaver til håndtering', handle: true }, ...employeeDropdown]" :chosenValue="filteredEmployees" @selectValue="selectEmployee" display="name" dropdownWidth="w-[350px]" :filterable="['name']" />
          <div class="mt-2" v-if="filteredEmployees.length">
            <div class="text-gray-500 text-[12px] font-light">Medarbejdere valgt</div>
            <div class="flex flex-col gap-1.5">
              <div class="text-gray-700 text-[14px] leading-[15px] flex items-center gap-x-1" v-for="(e, index) in filteredEmployees" :key="e.id">
                {{ e.name }}
                <PhX :size="16" weight="regular" class="text-red-500 cursor-pointer hover-transition hover:text-red-700 active:text-red-900" @click.stop="removeEmployee(e)" />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="text-[13px] font-light">Søg efter medarbejder</div>
          <div class="text-gray-800 text-[14px] flex items-center gap-x-1 mt-1.5">
            Opgaver til håndtering valgt
            <PhX :size="16" weight="regular" class="text-red-500 cursor-pointer hover-transition hover:text-red-700 active:text-red-900" @click.stop="toHandle = false" />
          </div>
        </div>
        <div>
          <div class="text-[13px] font-light">Søg efter område</div>
          <DropdownWrite fillPlaceholder="Vælg område" :values="areasDropdown" :chosenValue="filteredAreas" @selectValue="selectArea" display="name" dropdownWidth="w-[350px]" :filterable="['name']" />
          <div class="mt-2" v-if="filteredAreas.length">
            <div class="text-gray-500 text-[12px] font-light">Områder valgt</div>
            <div class="flex flex-col gap-1.5">
              <div class="text-gray-700 text-[14px] leading-[15px] flex items-center gap-x-1" v-for="(a, index) in filteredAreas" :key="a.name">
                {{ a.name }}
                <PhX :size="16" weight="regular" class="text-red-500 cursor-pointer hover-transition hover:text-red-700 active:text-red-900" @click.stop="removeArea(a)" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end items-center gap-x-4 mt-5">
          <div v-if="filteredCustomers.length || filteredEmployees.length || tasks.activeFilter.to_handle || filteredAreas.length" class="text-primary-500 text-[13px] underline font-light cursor-pointer hover-transition hover:text-primary-700 active:text-primary-900" @click="resetFilter">Ryd filtrering</div>
          <button class="btn btn__small" @click="filterTasks(false)">Gem & filtrer</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref, computed } from 'vue';
import { Company } from '@/store/company';
import { Tasks } from '@/store/tasks';
import { PhX } from '@phosphor-icons/vue';

/******************************
 * Refs & consts
******************************/ 
const company = Company();
const tasks = Tasks();
const emit = defineEmits(['search']);
const filteredCustomers = ref([
  ...tasks.activeFilter.customers
]);
const filteredEmployees = ref([
  ...tasks.activeFilter.employees
]);
const toHandle = ref(tasks.activeFilter.to_handle);
const filteredAreas = ref(Array.isArray(tasks.activeFilter.areas) ? [...tasks.activeFilter.areas] : (tasks.activeFilter.areas ? [{ name: tasks.activeFilter.areas }] : []));

/******************************
 * Methods
******************************/
const selectCustomer = (customer) => {
  filteredCustomers.value.push(customer);
}

const selectArea = (area) => {
  filteredAreas.value.push(area);
}

const selectEmployee = (employee) => {
  if (employee.handle) {
    toHandle.value = true;
    filteredEmployees.value = [];
  } else {
    toHandle.value = false;
    filteredEmployees.value.push(employee);
  }
}

const removeEmployee = (employee) => {
  filteredEmployees.value = filteredEmployees.value.filter(e => e.id !== employee.id);
}

const removeCustomer = (customer) => {
  filteredCustomers.value = filteredCustomers.value.filter(c => c.id !== customer.id);
}

const removeArea = (area) => {
  filteredAreas.value = filteredAreas.value.filter(a => a.name !== area.name);
}

const customerDropdown = computed(() => {
  let allCustomers = [...company.customers];

  allCustomers = allCustomers.filter(customer => !filteredCustomers.value.some(c => c.id === customer.id));

  return allCustomers;
})

const employeeDropdown = computed(() => {
  let allEmployees = [...company.employees];

  allEmployees = allEmployees.filter(employee => !filteredEmployees.value.some(e => e.id === employee.id));

  return allEmployees;
})

const areasDropdown = computed(() => {
  const selected = new Set(filteredAreas.value.map(a => a.name));
  return company.areas
    .map(a => ({ name: typeof a === 'string' ? a : a?.name }))
    .filter(a => a && !selected.has(a.name));
})

const filterTasks = () => {
  tasks.activeFilter.customers = filteredCustomers.value;
  tasks.activeFilter.employees = filteredEmployees.value;
  tasks.activeFilter.to_handle = toHandle.value;
  tasks.activeFilter.areas = filteredAreas.value;
  
  emit('search');
}

const resetFilter = () => {
  filteredCustomers.value = [];
  filteredEmployees.value = [];
  filteredAreas.value = [];

  tasks.activeFilter.customers = [];
  tasks.activeFilter.employees = [];
  tasks.activeFilter.to_handle = false;
  tasks.activeFilter.areas = [];

  emit('search');
}
</script>