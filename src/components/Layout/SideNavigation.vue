<template>
  <div class="top-0 bottom-0 bg-white border-r-2 border-gray-200 shadow-lg items-center flex flex-col h-full pt-4 hover-transition fixed z-[999]" :class="hideMenu ? 'w-[215px]' : 'w-[85px]'">
    <RouterLink to="/">
      <img src="@/assets/images/brand/moreclean_icon.png" class="rounded-md h-[35px] object-contain w-[35px] drop-shadow-sm" />
    </RouterLink>
    <div class="flex flex-col justify-center items-center mt-[25px] gap-y-3">
      <RouterLink v-for="item in menuItems" :key="item.route" :to="{ name: item.route }" class="flex relative p-[7.5px] text-gray-700 flex-col group justify-center items-center rounded-[6px]" active-class="!text-primary-500 shadow-lg border border-gray-50" v-slot="{ isActive }">
        <component
          :is="item.icon"
          :size="35"
          weight="thin"
          :class="[
            'hover-transition',
            !isActive && 'group-hover:text-primary-500 drop-shadow group-hover:rotate-6'
          ]" />
          <div class="absolute bottom-[-15px] text-nowrap left-1/2 -translate-x-1/2 -translate-y-1/2 !text-[10px] py-[1px] px-1.5 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition">{{ item.name }}</div>
      </RouterLink>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref } from 'vue';
import { Auth } from '@/store/auth';
import { PhCalendar, PhIdentificationBadge, PhPackage, PhUsers } from '@phosphor-icons/vue';

/******************************
 * Refs
******************************/
const auth = Auth();
const hideMenu = ref(localStorage.getItem('hide-menu') === 'true' ? true : false);
const hideWait = ref(localStorage.getItem('hide-wait') === 'true' ? true : false);
const emit = defineEmits(['hide']);
const menuItems = [
  {
    name: 'Overblik',
    icon: PhCalendar,
    route: 'dashboard'
  },
  {
    name: 'Kunder',
    icon: PhUsers,
    route: 'customers.index'
  },
  {
    name: 'Produkter',
    icon: PhPackage,
    route: 'products'
  },
  {
    name: 'Medarbejdere',
    icon: PhIdentificationBadge,
    route: 'employees.index'
  }
];

/******************************
 * Methods and functions
******************************/
const toggleMenu = async () => {
  hideMenu.value = !hideMenu.value;

  if (hideWait.value === true) {
    setTimeout(() => {
      hideWait.value = false;
      localStorage.setItem('hide-wait', hideWait.value);
    }, 150)
  } else {
    hideWait.value = true;
    localStorage.setItem('hide-wait', hideWait.value);
  }

  localStorage.setItem('hide-menu', hideMenu.value);
  emit('hide');
}
</script>