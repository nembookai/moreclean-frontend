import { defineStore } from 'pinia';
import moment from 'moment';
import { ref, computed } from "vue";
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
  const activeFilter = ref({
    customers: [],
    employees: [],
    to_handle: false,
    areas: []
  })

  async function init() {
    await axiosClient.get('task').then((response) => {
      tasks.value = response.tasks;
    }).catch((error) => { });
  }

  function groupedTasks(day) {
    const dayStr = day.format('YYYY-MM-DD');
    const dayTasks = [];
    const groups = [];

    if (!filteredTasks.value || !filteredTasks.value?.[dayStr]) {
      return [];
    }
  
    for (const task of filteredTasks.value[dayStr]) {
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
    }
  
    // Sort by time
    dayTasks.sort((a, b) =>
      moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm'))
    );
  
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
    const dayStr = day.format('YYYY-MM-DD');
    const dayTasks = [];

    if (!filteredTasks.value || !filteredTasks.value?.[dayStr]) {
      return [];
    }
  
    for (const task of filteredTasks.value[dayStr]) {
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
    }
  
    // Sort by time
    dayTasks.sort((a, b) =>
      moment(a.start_time, 'HH:mm').diff(moment(b.start_time, 'HH:mm'))
    );

    return dayTasks;
  }

  function addTask(task) {
    const date = task.date;

    if (!tasks.value[date]) {
      tasks.value = {
        ...tasks.value,
        [date]: [task]
      };
    } else {
      tasks.value[date].push(task);
    }
  }

  async function deleteTask(task, method) {
    let id = task.recurring_id ? task.recurring_id : task.id;

    await axiosClient.delete(`task/${id}/${method}/${task.date}`).then((response) => {
      if (activeTask.value.reloadOnUpdate) {
        window.location.reload();
        return;
      }

      tasks.value[task.date] = tasks.value[task.date].filter(t => t.id !== task.id);
      activeTask.value = null;
      
      if (task.recurring?.enabled) {
        if (method === 1 || method === 3 || method === 4) {
          window.location.reload();
        }
      }

      message.showComplete('Opgaven er blevet slettet');
    }).catch((error) => { });
  }

  function updateTask(allTasks) {
    if (allTasks.length > 1 || activeTask.value.reloadOnUpdate) {
      window.location.reload();
      return;
    }

    tasks.value[activeTask.value.date] = tasks.value[activeTask.value.date].filter(t => t.id !== activeTask.value.id);

    if (!tasks.value[allTasks[0].date]) {
      tasks.value[allTasks[0].date] = [];
    }

    tasks.value[allTasks[0].date].push(allTasks[0]);
    activeTask.value = allTasks[0];
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
  
    tasks.value[taskInFocus.date] = tasks.value[taskInFocus.date].filter(t => t.id !== taskInFocus.id);
  
    // Set new date
    taskInFocus.date = day.format('YYYY-MM-DD');

    // If time is provided (like in day or week view), update start and end times
    if (time) {
      const newStart = moment(time, 'HH:mm').subtract(1, 'hours');
      taskInFocus.start_time = newStart.format('HH:mm');
      taskInFocus.end_time = newStart.clone().add(taskInFocus.duration, 'minutes').format('HH:mm');
    }

    await updateTaskBackend(taskInFocus, (tasks) => {
      taskInFocus.title = tasks[0].title;
      addTask(taskInFocus);
      message.showComplete('Opgaven er rykket');
    });
  }

  async function updateTaskBackend(task, callback = () => {}) {
    await axiosClient.put(`task/${task.id}`, task).then((response) => {
      callback(response.tasks);
    }).catch((error) => { });
  }

  function setActiveTask(task, from_id = false, reloadOnUpdate = false) {
    if (!from_id) {
      activeTask.value = { ...task, reloadOnUpdate };
      return;
    }

    activeTask.value = null;
    activeTask.value = Object.values(tasks.value).flat().find(t => t.id == task);
  }

  const filteredTasks = computed(() => {
    const result = {};
  
    for (const [date, taskList] of Object.entries(tasks.value)) {
      const filteredList = taskList.filter(task => {
        if ( activeFilter.value.customers.length && !task.customers?.some(taskCustomer => activeFilter.value.customers.some(filterCustomer => filterCustomer.id === taskCustomer.id))) {
          return false;
        }
  
        // Filter by employees
        if (activeFilter.value.employees.length && !task.employees?.some(taskEmployee => activeFilter.value.employees.some(filterEmployee => filterEmployee.id === taskEmployee.id))) {
          return false;
        }
  
        // Filter by "to handle" (no employees assigned)
        if (activeFilter.value.to_handle && task.employees?.length) {
          return false;
        }

        // Filter by areas (task.customer.zip falls into any selected area range string "from-to")
        if (activeFilter.value.areas?.length) {
          const zip = Number(task.customer?.zip);
          if (!Number.isFinite(zip)) return false;
          const matches = activeFilter.value.areas.some(area => {
            const [fromStr, toStr] = (area.name || area).toString().split('-');
            const from = Number(fromStr);
            const to = Number(toStr);
            if (!Number.isFinite(from) || !Number.isFinite(to)) return false;
            return zip >= from && zip <= to;
          });
          if (!matches) return false;
        }
  
        return true;
      });
  
      if (filteredList.length) {
        result[date] = filteredList;
      }
    }
  
    return result;
  });
  
  return { tasks, groupedTasks, tasksListView, showTaskCreation, addTask, activeTask, deleteTask, updateTask, createFromDate, prefillTask, handleDrop, draggingTaskId, updateTaskBackend, setActiveTask, filteredTasks, activeFilter, init }
});