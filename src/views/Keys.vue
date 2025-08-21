<template>
  <LayoutComponents-Title title="Nøgler" />

  <ModalShow :condition="openCreateKey">
    <Keys-Create @close="openCreateKey = false" :prefill="activeKey" @updated="updateKey" @created="createKey" />
  </ModalShow>

  <ModalShow :condition="deleteSure">
    <DeletePrompt :msg="`Er du sikker på du vil slette ${activeKey.name}?`" @delete="deleteKey" @close="deleteSure = null" />
  </ModalShow>

  <div class="mt-5 box" v-if="!loading.loading">
    <TableComponent emptyMessage="Ingen nøgler fundet" :lastRight="true" :headers="headers" :data="keyData">
      <template #extra>
        <div class="flex w-full justify-end items-center gap-x-2">
          <button class="btn btn__green" @click="openCreateKey = true"><PhPlus :size="16" weight="bold" /> Opret ny nøgle</button>
        </div>
      </template>
      <template #body="{ item: key }">
        <td>{{ key.name }}</td>
        <td>
          <div>{{ key.customer?.name || '---' }}</div>
        </td>
        <td>{{ key.keychain || '---' }}</td>
        <td>
          <div>{{ key.employee?.name || '---' }}</div>
        </td>
        <td>
          <div>{{ formatDate(key.obtaining_date) }}</div>
        </td>
        <td>
          <div class="flex justify-end items-center relative">
            <div @click="setActiveKey(key)" class="flex items-center gap-x-0.5 cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" :class="activeKey?.id === key.id ? 'text-primary-700' : ''">
              Mere <PhCaretDown size="16" class="hover-transition" :class="activeKey?.id === key.id ? 'rotate-180' : ''" />
            </div>
            <transition name="dropdown">
              <LayoutComponents-HoverDropdown :freeSlot="true" class="absolute top-[30px] z-[99] right-0" @close="activeKey = null" v-click-outside="() => activeKey = null" v-if="activeKey?.id === key.id" extraclass="w-[250px] max-h-[300px]">
              <template #free>
                <div class="hover_dropdown hover_dropdown__small" @click="openCreateKey = true;">
                  <div><PhPen :size="16" weight="fill" /></div>
                  Rediger nøgle
                </div>
                <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteSure = key.id">
                  <div><PhBackspace :size="16" weight="fill" /></div>
                  Slet nøgle
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
import { PhCaretDown, PhPen, PhBackspace, PhPlus } from '@phosphor-icons/vue';

/*******************************
* Refs & variables
******************************/
const message = inject('message');
const loading = inject('loading');
const keyData = ref([]);
const headers = [
  { name: 'Navn', sortable: 'name' },
  { name: 'Kunde', sortable: 'customer.name' },
  { name: 'Nøglering', sortable: 'keychain' },
  { name: 'Medarbejder', sortable: 'employee.name' },
  { name: 'Modtagelsesdato', sortable: 'obtaining_date' },
  { name: '' }
];
const activeKey = ref(null);
const openCreateKey = ref(false);
const deleteSure = ref(null);

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.load();

  await axiosClient.get('/keys').then((response) => {
    keyData.value = response.pageData;
  }).catch((e) => { });

  loading.reset();
});

/*******************************
* Methods
******************************/
const setActiveKey = (key) => {
  if (activeKey.value === key) {
    activeKey.value = null;
  } else {
    activeKey.value = key;
  }
};

const updateKey = (key) => {
  const index = keyData.value?.data?.findIndex(c => c.id === key.id);
  keyData.value.data[index] = key;
  openCreateKey.value = false;
};

const createKey = (key) => {
  keyData.value.data.unshift(key);
  openCreateKey.value = false;
};

const deleteKey = async () => {
  await axiosClient.delete(`/keys/${deleteSure.value}`).then((response) => {
    const index = keyData.value.data.findIndex(p => p.id === deleteSure.value);
    if (index !== -1) {
      keyData.value.data.splice(index, 1);
    }
    deleteSure.value = null;
    message.showComplete('Nøglen er blevet slettet');
  }).catch((e) => { });
};

const formatDate = (date) => {
  if (!date) return '---';
  try {
    return new Date(date).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return date;
  }
}
</script>

