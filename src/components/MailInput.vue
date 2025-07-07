<template>
  <div>
    <div class="relative flex items-center flex-wrap" :class="{ 'gap-2': mails?.length }">
      <div class="flex flex-wrap items-center gap-1 text-[12px]">
        <div class="bg-gray-200 text-gray-700 rounded-md p-[6px] flex items-center gap-x-2" v-for="mail in mails">
          <div>{{ mail }}</div>
          <PhX :size="12" class="cursor-pointer hover:opacity-70" @click="mails.splice(mails.indexOf(mail), 1)" />
        </div>
      </div>
      <input type="text" @keyup="addToMail" @blur="addToMail" v-model="test" class="input min-w-[200px] flex-1" :placeholder="props.placeholderText"/>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps({
  prefill: {
    type: Array,
    default: () => []
  },
  placeholderText: {
    type: String,
    default: ''
  }
});

const test = ref('');
const mails = ref(props.prefill || []);
const emit = defineEmits(['mails']);

const addToMail = async (event) => {
  if (event.key === ',' || event.key === 'Enter' || event.key === ' ' || event.type === 'blur') {
    const trimmed = test.value.trim();
    if (trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      if (trimmed.includes(',')) {
        mails.value.push(trimmed.slice(0, -1));
      } else {
        mails.value.push(trimmed);
      }
    }

    emit('mails', mails.value);
    test.value = '';
  }
}
</script>