<template>
  <LayoutComponents-HoverDropdown class="absolute top-[30px] z-[99]" @close="$emit('close')" :freeSlot="true" :extraclass="extraClass">
    <template #free>
      <div class="text-[12px] font-medium bg-gray-50 p-2 border-b border-gray-200 rounded-t">Fandt {{ group.length }} opgaver</div>
      <div class="flex flex-col gap-y-2 p-2">
        <template v-for="task in group" :key="'card-' + task.id">
          <drag @dragstart="tasks.draggingTaskId = task.id" @dragend="tasks.draggingTaskId = null" :data="task" :go-back="true" mode="cut" type="card" @click.stop>
            <Calendar-Task :task="task" :showMultiDay="!!task.end_date" :showTooltip="false" />
          </drag>
        </template>
      </div>
    </template>
  </LayoutComponents-HoverDropdown>
</template>
<script setup>
/******************************
 * Imports & Props
******************************/
import { Tasks } from '@/store/tasks';
import { Drag } from "vue-easy-dnd";
const props = defineProps(['group', 'extraClass']);

/******************************
 * Refs
******************************/
const tasks = Tasks();
const emit = defineEmits(['close']);
</script>