import { defineStore } from 'pinia';
import moment from 'moment';
import { ref } from "vue";

export const Calendar = defineStore('calendar', () => {
  const activeView = ref(parseInt(localStorage.getItem('calendar-view')) || 3);
  const activeDate = ref(moment());
  const timeslots = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];

  function switchView(view) {
    activeView.value = view;

    localStorage.setItem('calendar-view', view);
  }

  function switchDate(date, format = 'YYYY-MM-DD') {
    activeDate.value = moment(date, format);
  }

  function getTaskTop(startTime) {
    const [h, m] = startTime.split(':').map(Number)
    const decimal = h + m / 60
    return decimal * 50
  }
  
  function getTaskHeight(task) {
    console.log(task)

    let duration = task.overlapping
      ? (task.duration - task.overlapping.duration)
      : task.duration;
  
    return (duration / 60) * 50;
  }

  function getGroupHeight(group) {
    const heights = group.map(task => getTaskHeight(task))
    return Math.max(...heights)
  }

  function doTasksOverlap(t1, t2) {
    const start1 = moment(t1.start_time, 'HH:mm')
    const end1 = start1.clone().add(t1.duration, 'minutes')
    const start2 = moment(t2.start_time, 'HH:mm')
    const end2 = start2.clone().add(t2.duration, 'minutes')
    return start1.isBefore(end2) && start2.isBefore(end1)
  }

  function getEarliestStart(group) {
    return group
      .map(t => t.start_time)
      .sort((a, b) => moment(a, 'HH:mm').diff(moment(b, 'HH:mm')))[0]
  }

  return { activeView, switchView, activeDate, switchDate, timeslots, getTaskTop, getTaskHeight, getGroupHeight, doTasksOverlap, getEarliestStart }
});