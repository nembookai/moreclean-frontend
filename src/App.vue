<template>
  <template v-if="!auth.user">
    <router-view :key="$route.fullPath"/>
  </template>
  <template v-else>
    <Layout-Loading v-if="loading.loading"/>
    <Layout-SideNavigation @hide="hide" />
    <div class="hover-transition" :class="menuIsHidden ? 'content' : 'bigger-content'">
      <router-view :key="$route.fullPath" />
    </div>
  </template>
  <transition name="modal-fade">
    <FlashMessage v-if="message.error || message.complete" :error="message.error" :complete="message.complete" @close="message.close()"/>
  </transition>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref, provide, onMounted, onBeforeUnmount } from 'vue';
import { Message } from '@/store/message';
import { Loading } from '@/store/loading';
import { Auth } from '@/store/auth';

/******************************
 * Refs
******************************/
const message = Message();
const loading = Loading();
const auth = Auth();
const urlSavings = ref([]);
const menuIsHidden = ref(localStorage.getItem('hide-menu') === 'true' ? true : false);

/******************************
 * Inject & provides
******************************/
provide('message', message);
provide('loading', loading)
provide('urlSavings', urlSavings.value)

/******************************
 * Lifecycle
******************************/

/******************************
 * Methods and functions
******************************/
const reload = () => {
  if (auth.user) {
    auth.getUserRole();
    auth.getUser();
  }
}
reload();

const hide = () => {
  menuIsHidden.value = !menuIsHidden.value;
}
</script>