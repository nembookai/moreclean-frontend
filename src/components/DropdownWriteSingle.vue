<template>
  <div class="relative mt-1">
    <div class="relative group" v-if="writeable">
      <input type="text" autocomplete="additional-name" class="input !mt-0 group-hover:border-slate-400" :class="[{ '!border-slate-400': showDropdown }, { 'input__small': inputSmall }]" @input="showDropdown = true; keyPressed = true" v-on:keyup.enter="selectWithEnter" v-model="valueInput" @click="showDropdown = true" :placeholder="fillPlaceholder" />
      <div class="dropdown-box" v-if="showArrowDropdown" @click="showDropdown = true" >
        <ph-caret-down :class="showDropdown ? 'rotate-180' : 'rotate-0'" class="hover-transition" size="18" color="currentColor" />
      </div>
    </div>
    <div class="relative group" v-else>
      <div @click="showDropdown = !showDropdown" class="input min-h-[40px] !mt-0 group-hover:border-slate-400" :class="[{ '!border-slate-400': showDropdown }, { 'input__small': inputSmall }]">
        <div v-if="!valueInput" class="text-gray-400 truncate">{{ fillPlaceholder }}</div>
        <div class="truncate" v-else>{{ valueInput }}</div>
      </div>
      <div class="dropdown-box" v-if="showArrowDropdown" @click="showDropdown = true" >
        <ph-caret-down :class="showDropdown ? 'rotate-180' : 'rotate-0'" class="hover-transition" size="18" color="currentColor" />
      </div>
    </div>

    <div class="absolute shadow-md bg-white max-h-[175px] overflow-y-scroll mt-1 border border-gray-200 text-sm rounded z-20" :class="dropdownWidth" v-click-outside="hideDropdown" v-if="showDropdown">
      <template v-for="value in values">
        <template v-if="!value?.title">
          <div @click="hideDropdown(); selectValue(value)" :class="{ 'bg-green-100 !text-green-600': chosenValue === value }" class="px-2 py-2 border-b hover-transition flex items-center hover:bg-gray-200 cursor-pointer border-gray-200 text-[13px] gap-x-2">
            {{ value }}
            <div class="text-xs text-white bg-green-600 px-1.5 py-0.5 rounded-full" v-if="chosenValue === value">Valgt</div>
          </div>
        </template>
        <template v-else>
          <div class="bg-gray-100 px-2 py-1.5 font-medium">{{ value?.title }}</div>
        </template>
      </template>
      <slot></slot>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { computed, onBeforeMount, ref, watch } from 'vue';
import { PhCaretDown } from "@phosphor-icons/vue";

const props = defineProps({
  values: {},
  chosenValue: {},
  inputSmall: { default: false },
  showArrowDropdown: { default: true },
  dropdownWidth: { default: 'w-full' },
  allowNull: { default: false },
  fillPlaceholder: { default: '-- Vælg --' },
  writeable: { default: true },
});

/******************************
 * Refs and consts
******************************/
const showDropdown = ref();
const valueInput = ref();
const emit = defineEmits(['selectValue']);
const keyPressed = ref(false);

/*******************************
 * Lifecycle hooks
******************************/
onBeforeMount(() => {
  if (props.chosenValue) {
    valueInput.value = props.chosenValue;
  }
})

/*******************************
 * Methods & computeds
******************************/
const hideDropdown = () => {
  showDropdown.value = false;
  keyPressed.value = false;
  
  if (!valueInput.value && props.allowNull) {
    emit('selectValue', null);
    valueInput.value = null;
  }
  
  if (props.chosenValue) {
    if (props.allowNull && !valueInput.value) {
      valueInput.value = null;
      return;
    }
    valueInput.value = props.chosenValue;
  } else {
    valueInput.value = null;
  }
}

const values = computed(() => {
  let values = props.values;

  if (valueInput.value && keyPressed.value) {
    return values.filter(value => value?.toString().toLowerCase().includes(valueInput.value?.toLowerCase()));
  } else {
    return values;
  }
})

const selectValue = (value) => {
  valueInput.value = value;
  emit('selectValue', value)
}

const selectWithEnter = () => {
  if (values.value?.length) {
    if (Object.keys(values.value[0]).includes('title')) {
      selectValue(values.value[1]);
    } else {
      selectValue(values.value[0]);
    }
    hideDropdown();
  }
}

/*******************************
 * Watchers
******************************/
watch(() => props.chosenValue, () => {
  valueInput.value = props.chosenValue;
})
</script>
<style>
.dropdown-box {
  @apply absolute top-0 right-0 bg-primary-800 text-white h-[calc(100%-8px)] m-1 w-[32px] flex items-center justify-center rounded-[6px] cursor-pointer transition-all ease-in-out duration-300 group-hover:bg-primary-700 group-active:bg-primary-900;
}
</style>