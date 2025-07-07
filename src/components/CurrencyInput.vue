<template>
  <input ref="inputRef" type="text" />
</template>

<script setup>
import { watch } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'

const props = defineProps({
  modelValue: {},
  minValue: { default: 0 },
  maxValue: {},
  currencyDisplay: { default: 'hidden' },
  valueScaling: {}
});

const options = {
  currency: 'DKK',
  locale: 'da-DK',
  currencyDisplay: props.currencyDisplay,
  autoDecimalDigits: false,
  precision: 2
}

if (props.minValue === 0) {
  options.valueRange = { min: props.minValue, max: (props.maxValue ? props.maxValue : undefined) };
}

if (props.valueScaling) {
  options.valueScaling = props.valueScaling;
}

const { inputRef, setValue } = useCurrencyInput(options);

watch(
  () => props.modelValue,
  (value) => {
    setValue(value);
  }
);

defineExpose({
  inputRef
})
</script>