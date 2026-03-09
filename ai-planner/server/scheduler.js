export function scheduleTasks(tasks, hoursPerDay) {
  let day = 1;
  let remainingHours = hoursPerDay;
  const schedule = [];

  for (const task of tasks) {
    let hoursLeft = task.hours;

    while (hoursLeft > 0) {
      if (remainingHours === 0) {
        day++;
        remainingHours = hoursPerDay;
      }

      const hoursUsed = Math.min(hoursLeft, remainingHours);

      schedule.push({
        day,
        task: task.task,
        hours: hoursUsed
      });

      hoursLeft -= hoursUsed;
      remainingHours -= hoursUsed;
    }
  }

  return schedule;
}