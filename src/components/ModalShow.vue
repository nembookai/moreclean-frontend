<template>
  <template v-if="noTeleport">
    <transition name="modal-fade">
      <div class="blackBackgroundFixed" v-if="condition">
        <slot></slot>
      </div>
    </transition>
  </template>
  <template v-else>
    <teleport to="body">
      <transition name="modal-fade">
        <div class="blackBackgroundFixed" v-if="condition">
          <slot></slot>
        </div>
      </transition>
    </teleport>
  </template>
</template>
<script setup>
const props = defineProps(['condition', 'noTeleport']);
</script>