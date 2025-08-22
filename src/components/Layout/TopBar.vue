<template>
  <div class="pb-[50px]">
    <div class="w-full bg-white border-b border-gray-200 shadow-sm fixed z-[100] left-0 top-0">
      <div class="bigger-content leading-none py-3">
        <div class="flex justify-between items-center">
          <div class="relative">
            <div class="flex text-[15px] text-gray-700 items-center gap-x-2 cursor-pointer select-none bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 hover-transition active:bg-gray-300" @click="showCompanies = !showCompanies">
              <PhBuilding :size="15" />
              <div class="">{{ company?.activeCompany?.name }}</div>
              <PhCaretDown :size="15" class="ml-1 hover-transition" weight="bold" :class="{ 'rotate-180': showCompanies }" />
            </div>
            <transition name="dropdown">
              <LayoutComponents-HoverDropdown v-if="showCompanies" :freeSlot="true" class="absolute top-[38px] z-[99] left-0" v-click-outside="() => showCompanies = false" extraclass="w-[260px] max-h-[300px]">
                <template #free>
                  <div v-for="c in company?.companies" :key="c.id" class="hover_dropdown hover_dropdown__small" @click="selectCompany(c)" :class="{ 'bg-green-100 !text-green-700 !cursor-auto hover:!bg-green-100 !pointer-events-none !select-none': c.id === company?.activeCompany?.id }">
                    <PhBuilding :size="16" />
                    <div class="truncate">{{ c.name }}</div>
                    <div class="text-xs bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full" v-if="c.id === company?.activeCompany?.id">Valgt</div>
                  </div>
                </template>
              </LayoutComponents-HoverDropdown>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { Company } from '@/store/company';
import { PhBuilding, PhCaretDown, PhCheck } from '@phosphor-icons/vue';
import { ref } from 'vue';
import { axiosClient } from '@/lib/axiosClient';

const company = Company();
const showCompanies = ref(false);

const selectCompany = async (selectedCompany) => {
  if (selectedCompany.id === company?.activeCompany?.id) {
    showCompanies.value = false;
    return;
  }

  showCompanies.value = false;
  await axiosClient.post('company/active', { id: selectedCompany.id }).then(() => {
    window.location.reload();
  }).catch(() => { });
}
</script>
<style scoped>

</style>