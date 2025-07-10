<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="[{ 'bg-gray-200 !py-3 !cursor-auto active:!bg-gray-200': isOpen }, { '!items-start': (employees?.length >= 1 || isOpen) }, { '!cursor-not-allowed active:!bg-gray-200': loading }]" @click="openEmployee">
    <PhIdentificationBadge :size="27" weight="regular" class="text-gray-600" />
    <div class="flex-1">
      <div class="text-gray-700 text-[13px] leading-[15px]" v-if="!isOpen">
        <div v-if="!employees?.length">
          <div v-if="!loading">Ingen medarbejder valgt</div>
          <div v-if="loading" class="flex items-center gap-x-1 select-none"><PhSpinner :size="16" weight="bold" class="animate-spin" /> Indlæser medarbejdere...</div>
          <div class="text-gray-500 text-[12px] font-light select-none">Vælg medarbejder for opgaven</div>
        </div>
        <div v-if="employees?.length">
          <div class="text-gray-500 font-light text-[13px]" v-if="employees.length > 1">{{ employees.length }} medarbejdere</div>
          <div class="flex flex-col gap-1.5" :class="{ 'mt-1': employees.length > 1 }">
            <div class="text-gray-700 text-[14px] leading-[15px]" v-for="(e, index) in employees" :key="e.id">{{ e.name }}</div>
          </div>
          <div class="text-gray-500 text-[12px] font-light" v-if="employees.length === 1">Medarbejder valgt</div>
        </div>
      </div>
      <div class="text-gray-700 text-[13px] leading-[15px] w-full relative" v-if="isOpen">
        <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
        <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Tilføj medarbejder</div>
        <DropdownWrite fillPlaceholder="Vælg medarbejder" :values="employeesDropdown" :chosenValue="employees" @selectValue="updateEmployees" display="name" dropdownWidth="w-[500px]" :filterable="['name']" />
        <div class="mt-2" v-if="employees.length">
          <div class="text-gray-500 text-[12px] font-light">Medarbejdere valgt</div>
          <div class="flex flex-col gap-1.5">
            <div class="text-gray-700 text-[14px] leading-[15px] flex items-center gap-x-1" v-for="(e, index) in employees" :key="e.id">
              {{ e.name }}
              <PhX :size="16" weight="regular" class="text-red-500 cursor-pointer hover-transition hover:text-red-700 active:text-red-900" @click.stop="removeEmployee(e)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, computed } from 'vue';
import { PhIdentificationBadge, PhCaretUp, PhSpinner, PhX } from '@phosphor-icons/vue';
const props = defineProps(['allEmployees', 'loading']);

/******************************
 * Refs & const
******************************/
const employees = defineModel('employees');
const isOpen = ref(false);

/******************************
 * Methods & computed
******************************/
const openEmployee = async () => {
  if (!isOpen.value && !props.loading) {
    isOpen.value = true;
  }
}

const updateEmployees = (e) => {
  employees.value.push(e);
}

const removeEmployee = (e) => {
  const index = employees.value.findIndex(employee => employee.id === e.id);
  if (index > -1) {
    employees.value.splice(index, 1);
  }
}

const employeesDropdown = computed(() => {
  return props.allEmployees.filter(employee => !employees.value.some(e => e.id === employee.id));
});
</script>