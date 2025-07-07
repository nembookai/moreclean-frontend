import { defineStore } from 'pinia';
import { ref } from "vue";

export const Message = defineStore('message', () => {
  const error = ref(null);
  const complete = ref(null);
  const loading = ref(false);
  const timer = ref();

  const showError = (msg, time = 6000) => {
    close();
    if (error.value === null) {
      error.value = msg;

      timer.value = setTimeout(() => {
        close();
      }, time);
    }
  }

  const showComplete = (msg, time = 6000) => {
    close();

    if (complete.value === null) {
      complete.value = msg;

      timer.value = setTimeout(() => {
        close();
      }, time);
    }
  }

  const close = () => {
    clearTimeout(timer.value);
    loading.value = false;
    error.value = null;
    complete.value = null;
  }

  return { error, complete, showError, showComplete, close, loading }
});