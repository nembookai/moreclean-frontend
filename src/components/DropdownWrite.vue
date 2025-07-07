<template>
  <div class="relative mt-1">
    <div class="relative group" v-if="writeable">
      <input type="text" autocomplete="additional-name" class="input !mt-0 group-hover:border-slate-400" :class="[{ '!border-slate-400': showDropdown }, { 'input__small': inputSmall }, overwriteInput]" :value="multiple ? valueInput.map(v => v[display]).join(', ') : valueInput" @input="handleInput" v-on:keyup.enter="selectWithEnter" @keyup.arrow-up="(e) => { highlightValue('decrease') }" @keyup.arrow-down="(e) => { highlightValue('increase') }" @click="openDropdown();" :placeholder="fillPlaceholder" />
      <div :class="createNew && (!valueInput || valueInput?.length === 0) && showDropdown ? '!w-[100px]' : '!w-0 overflow-hidden pointer-events-none'" class="absolute text-nowrap text-[12.5px] gap-x-1 flex items-center justify-center top-0 right-[35px] bg-primary-800 text-white h-[calc(100%-8px)] m-1 rounded-[6px] cursor-pointer hover-transition hover:bg-primary-500 active:bg-primary-700" @click="$emit('createNew')">
        <PhPlus :size="15" weight="bold" />
        Opret ny
      </div>
      <div class="absolute top-0 right-0 bg-primary-500 text-white h-[calc(100%-8px)] m-1 w-[32px] flex items-center justify-center rounded-[6px] cursor-pointer hover-transition" :class="createNew && (!valueInput || valueInput?.length === 0) && showDropdown ? 'hover:bg-primary-600 active:bg-primary-700' : 'group-hover:bg-primary-600 group-active:bg-primary-700'" v-if="showArrowDropdown" @click="openDropdown();" >
        <ph-caret-down :class="showDropdown ? 'rotate-180' : 'rotate-0'" class="hover-transition" size="18" color="currentColor" />
      </div>
    </div>
    <div class="relative group" v-else>
      <div @click="openDropdown();" class="input min-h-[40px] !mt-0 group-hover:border-slate-400" :class="[{ '!border-slate-400': showDropdown }, { 'input__small': inputSmall }, overwriteInput]">
        <div v-if="!valueInput || (Array.isArray(valueInput) && valueInput.length === 0)" class="text-gray-400 truncate">{{ fillPlaceholder }}</div>
        <div v-else>{{ multiple ? valueInput.map(v => v[display]).join(', ') : valueInput }}</div>
      </div>
      <div :class="createNew && (!valueInput || valueInput?.length === 0) && showDropdown ? '!w-[100px]' : '!w-0 overflow-hidden pointer-events-none'" class="absolute text-nowrap text-[12.5px] gap-x-1 flex items-center justify-center top-0 right-[35px] bg-primary-500 text-white h-[calc(100%-8px)] m-1 rounded-[6px] cursor-pointer hover-transition hover:bg-primary-600 active:bg-primary-700" @click="$emit('createNew')">
        <PhPlus :size="15" weight="bold" />
        Opret ny
      </div>
      <div class="absolute top-0 right-0 bg-primary-500 text-white h-[calc(100%-8px)] m-1 w-[32px] flex items-center justify-center rounded-[6px] cursor-pointer hover-transition" :class="createNew && (!valueInput || valueInput?.length === 0) && showDropdown ? 'hover:bg-primary-600 active:bg-primary-700' : 'group-hover:bg-primary-600 group-active:bg-primary-700'" v-if="showArrowDropdown" @click="openDropdown();" >
        <ph-caret-down :class="showDropdown ? 'rotate-180' : 'rotate-0'" class="hover-transition" size="18" color="currentColor" />
      </div>
    </div>

    <div class="absolute shadow-md bg-white max-h-[175px] overflow-y-scroll mt-1 border border-gray-200 text-sm rounded z-20" :class="dropdownWidth" v-click-outside="hideDropdown" v-if="showDropdown" ref="dropdown">
      <template v-for="(value, index) in values">
        <div v-if="value.onlyTitle" class="text-gray-600 !bg-gray-100 font-light text-sm px-1.5 py-2">{{ value.title }}</div>
        <div v-else @click.stop="selectValue(value)" :class="[{ 'bg-green-100 text-green-700': isSelected(value) && !keyPressed }, { 'bg-gray-100': highlightedValue === index }]" class="hover_dropdown flex items-center gap-x-1 !py-2 !px-1.5">
          <div v-if="noSlot">{{ value[display] }}</div>
          <slot name="display" :item="value" v-if="!noSlot"></slot>
          <div class="text-xs text-white bg-green-600 px-1.5 py-0.5 rounded-full mt-[2px]" v-if="isSelected(value) && !keyPressed">Valgt</div>
        </div>
      </template>
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { PhCaretDown, PhPlus } from "@phosphor-icons/vue";

const props = defineProps({
  values: {},
  chosenValue: {},
  inputSmall: { default: false },
  showArrowDropdown: { default: true },
  dropdownWidth: { default: 'w-full' },
  allowNull: { default: false },
  fillPlaceholder: { default: '-- Vælg --' },
  display: {},
  writeable: { default: true },
  filterable: {},
  noSlot: { default: true },
  createNew: { default: false },
  overwriteInput: {},
  multiple: { default: false }
});

const showDropdown = ref();
const dropdown = ref();
const valueInput = ref(props.multiple ? [] : null);
const emit = defineEmits(['selectValue', 'createNew']);
const keyPressed = ref(false);
const filterable = ref(props.filterable);
const highlightedValue = ref(0);

onBeforeMount(() => {
  if (props.chosenValue) {
    valueInput.value = props.multiple ? [...props.chosenValue] : props.chosenValue[props.display];
  }
})

const openDropdown = async (e) => {
  if (showDropdown.value) return;
  showDropdown.value = true;
  await setTimeout(() => {}, 100);
  if (valueInput.value && props.chosenValue && !props.multiple) {
    const index = props.values.findIndex(value => value[props.display] === props.chosenValue?.[props.display]);
    const item = dropdown.value.children[index];
    highlightedValue.value = index;
    if (item) dropdown.value.scrollTop = item.offsetTop - 100;
  }
}

const hideDropdown = () => {
  showDropdown.value = false;
  keyPressed.value = false;
  if ((!valueInput.value || valueInput.value.length === 0) && props.allowNull) {
    emit('selectValue', props.multiple ? [] : null);
    valueInput.value = props.multiple ? [] : null;
  }
  if (props.chosenValue && !props.multiple) {
    valueInput.value = props.chosenValue[props.display];
  }
}

const values = computed(() => {
  if (valueInput.value && keyPressed.value && filterable.value && !props.multiple) {
    return props.values.filter(value => matchesFilter(value));
  }
  return props.values;
})

const matchesFilter = (filterValue) => {
  return filterable.value.some(key => {
    const val = filterValue[key];
    if (typeof val === 'string') return val.toLowerCase().includes(valueInput.value.toLowerCase());
    if (typeof val === 'number') return val.toString().includes(valueInput.value);
    return false;
  });
}

const handleInput = (e) => {
  keyPressed.value = true;
  openDropdown();
  if (!props.multiple) valueInput.value = e.target.value;
}

const selectValue = (value) => {
  if (props.multiple) {
    const index = valueInput.value.findIndex(v => v[props.display] === value[props.display]);
    if (index > -1) {
      valueInput.value.splice(index, 1);
    } else {
      valueInput.value.push(value);
    }
    emit('selectValue', [...valueInput.value]);
  } else {
    valueInput.value = value?.[props.display];
    emit('selectValue', value);
    hideDropdown();
  }
}

const isSelected = (value) => {
  if (props.multiple) {
    return valueInput.value.some(v => v[props.display] === value[props.display]);
  }
  return props.chosenValue?.[props.display] === value[props.display];
}

const selectWithEnter = () => {
  if (!values.value.length) return;
  if (props.multiple) {
    selectValue(values.value[highlightedValue.value]);
  } else {
    if (values.value.length === 1) {
      selectValue(values.value[0]);
    } else {
      selectValue(values.value[highlightedValue.value]);
    }
  }
}

const highlightValue = (status) => {
  if (showDropdown.value) {
    if (status === 'increase' && highlightedValue.value < values.value.length - 1) highlightedValue.value++;
    else if (status === 'decrease' && highlightedValue.value > 0) highlightedValue.value--;
    if (dropdown.value) {
      const item = dropdown.value.children[highlightedValue.value];
      if (item) dropdown.value.scrollTop = item.offsetTop - 100;
    }
  }
}

watch(() => props.chosenValue, () => {
  if (props.chosenValue) {
    valueInput.value = props.multiple ? [...props.chosenValue] : props.chosenValue[props.display];
  } else {
    valueInput.value = props.multiple ? [] : null;
  }
})
</script>
