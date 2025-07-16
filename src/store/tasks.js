import { defineStore } from 'pinia';
import moment from 'moment';
import { ref } from "vue";
import { Calendar } from '@/store/calendar';
import { axiosClient } from '@/lib/axiosClient';
import { Message } from '@/store/message';

export const Tasks = defineStore('tasks', () => {
  const calendar = Calendar();
  const message = Message();
  const tasks = ref([]);
  const showTaskCreation = ref(false);
  const activeTask = ref(null);
  const prefillTask = ref({});
  const draggingTaskId = ref(null);

  function makeOverlappingTask(task) {
    return {
      ...task,
      overlaps: true,
      overlapping: null,
      start_time: task.overlapping.start_time,
      end_time: task.overlapping.end_time,
      date: task.overlapping.date,
      duration: task.overlapping.duration,
      original_task: task,
    };
  }

  function groupedTasks(day) {
    const dayStr = day.format('YYYY-MM-DD');
    const dayTasks = [];
  
    for (const task of tasks.value) {
      const taskDate = task.date;
      const start = moment(`${task.date} ${task.start_time}`, 'YYYY-MM-DD HH:mm');
      let end = moment(`${task.date} ${task.end_time}`, 'YYYY-MM-DD HH:mm');
  
      // Adjust end time if overnight
      if (end.isSameOrBefore(start)) {
        end.add(1, 'day');
      }
  
      // Normal segment (starts this day)
      if (taskDate === dayStr) {
        dayTasks.push(task);
      }
  
      if (task.overlapping && task.overlapping.date === dayStr) {
        dayTasks.push(makeOverlappingTask(task));
      }
    }
  
    // Sort by time
    dayTasks.sort((a, b) =>
      moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm'))
    );
  
    // Group by overlap
    const groups = [];
  
    for (const task of dayTasks) {
      let placed = false;
      for (const group of groups) {
        if (group.some(t => calendar.doTasksOverlap(t, task))) {
          group.push(task);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups.push([task]);
      }
    }
  
    return groups;
  }

  function tasksListView(day) {
    const allTasks = tasks.value;
    const dayStr = day.format('YYYY-MM-DD');
    const results = [];
  
    for (const task of allTasks) {
      const start = moment(task.date);
      const end = moment(task.date);
  
      // Main task span
      if (day.isBetween(start, end, 'day', '[]')) {
        results.push({ ...task, display_date: dayStr });
      }
  
      // If it has an overlapping segment on this day
      if (task.overlapping && task.overlapping.date === dayStr) {  
        results.push(makeOverlappingTask({ ...task, display_date: dayStr }));
      }
    }
  
    return results;
  }

  async function getTasks() {
    await axiosClient.get('task').then((response) => {
      tasks.value = response.tasks;
    }).catch((error) => { });
  }

  function addToTasks(task) {
    tasks.value.push(task);
  }

  async function deleteTask(taskId) {
    await axiosClient.delete(`task/${taskId}`).then((response) => {
      tasks.value = tasks.value.filter(t => t.id !== taskId);
      activeTask.value = null;
      message.showComplete('Opgaven er blevet slettet');
    }).catch((error) => { });
  }

  function updateActiveTask(task) {
    activeTask.value = task;
  }

  function createFromDate(day, time = null) {
    let startTime, endTime;

    if (time) {
      startTime = moment(time, 'HH:mm').subtract(1, 'hours').format('HH:mm');
      endTime = moment(startTime, 'HH:mm').add(1, 'hours').format('HH:mm');
    }

    showTaskCreation.value = true;
    prefillTask.value = {
      date: day.format('YYYY-MM-DD'),
      start_time: startTime || null,
      end_time: endTime || null,
    }
  }

  async function handleDrop(task, day, time = null) {
    let taskInFocus = task.data;
  
    if (taskInFocus.overlaps) {
      taskInFocus = taskInFocus.original_task;
    }
  
    tasks.value = tasks.value.filter(t => t.id !== taskInFocus.id);
  
    // Set new date
    taskInFocus.date = day.format('YYYY-MM-DD');

    // If time is provided (like in day or week view), update start and end times
    if (time) {
      const newStart = moment(time, 'HH:mm').subtract(1, 'hours');
      taskInFocus.start_time = newStart.format('HH:mm');
      taskInFocus.end_time = newStart.clone().add(taskInFocus.duration, 'minutes').format('HH:mm');
    }
  
    // Recalculate overlapping regardless of time change
    const startDateTime = moment(`${taskInFocus.date} ${taskInFocus.start_time}`, 'YYYY-MM-DD HH:mm');
    let endDateTime = moment(`${taskInFocus.date} ${taskInFocus.end_time}`, 'YYYY-MM-DD HH:mm');

    if (endDateTime.isSameOrBefore(startDateTime)) {
      endDateTime.add(1, 'day');
    }

    const overlapStart = moment(taskInFocus.date).clone().add(1, 'day').startOf('day');
    const overlapDuration = endDateTime.diff(overlapStart, 'minutes');

    taskInFocus.overlapping = overlapDuration > 0
      ? {
          date: overlapStart.format('YYYY-MM-DD'),
          start_time: '00:00',
          end_time: endDateTime.format('HH:mm'),
          duration: overlapDuration,
        }
      : null;
  
    await updateTaskBackend(taskInFocus, (task) => {
      taskInFocus.title = task.title;
      addToTasks(taskInFocus);
      message.showComplete('Opgaven er rykket');
    });
  }

  async function updateTaskBackend(task, callback = () => {}) {
    await axiosClient.put(`task/${task.id}`, task).then((response) => {
      callback(response.task);
    }).catch((error) => { });
  }

  function setActiveTask(task) {
    if (task.overlaps) {
      activeTask.value = task.original_task;
    } else {
      activeTask.value = task;
    }
  }
  
  return { tasks, groupedTasks, tasksListView, showTaskCreation, getTasks, addToTasks, activeTask, deleteTask, updateActiveTask, createFromDate, prefillTask, handleDrop, draggingTaskId, updateTaskBackend, setActiveTask }
});