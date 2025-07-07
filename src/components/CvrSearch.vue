<template>
  <div class="flex flex-col">
    <input
      v-model="cvr"
      @input="checkInput"
      type="text"
      class="input"
      :class="props.customClass"
      :placeholder="props.placeholder"
    />
    <div
      v-if="customer"
      class="text-[13px] py-2 px-2 rounded-lg border shadow-sm flex flex-col h-auto p-2 mt-2 bg-slate-100"
    >
      <p>{{ customer?.cvrNummer }} - {{ customer?.virksomhedMetadata?.nyesteNavn?.navn }}</p>
      <p>
        {{
          customer?.virksomhedMetadata?.nyesteBeliggenhedsadresse?.vejnavn
        }}
        {{
          customer?.virksomhedMetadata?.nyesteBeliggenhedsadresse?.postnummer
        }}
      </p>
      <button
        @click="selectCustomer"
        class="mt-2 p-2 btn btn__small btn__green w-[190px]"
      >
        Dette er mit firma
      </button>
    </div>
  </div>
</template>

<script setup>
/*******************************
 * Imports & props
 ******************************/
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps(['customClass', 'placeholder', 'modelValue'])
const emit = defineEmits(['update:modelValue', 'selectCustomer'])

/*******************************
 * Refs & consts
 ******************************/
const cvr = ref(props.modelValue)
const customer = ref(null)

/*******************************
 * Watchers
 ******************************/
watch(
  () => props.modelValue,
  (newVal) => {
    cvr.value = newVal
  }
)

watch(cvr, (newVal) => {
  emit('update:modelValue', newVal)
})

/*******************************
 * Methods
 ******************************/
function checkInput() {
  const cleaned = cvr.value.replace(/[^0-9]/g, '')
  cvr.value = cleaned

  if (cleaned.length === 8) {
    getSearch(cleaned)
  }
}

const getSearch = async () => {
  await axios.post(import.meta.env.VITE_CVR_API + 'advanced-search', {
    company: cvr.value,
  }, {
    headers: {
      'Authorization': "Bearer " + import.meta.env.VITE_CVR_API_TOKEN
    },
  }).then((response) => {
    if (response?.data && !response.data.error) {
      customer.value = response.data
    }
  })
}

const selectCustomer = () => {
  emit('selectCustomer', customer.value)
  customer.value = null
}
</script>