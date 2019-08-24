import { state, setState } from './state.js';
import { db } from './database/db.js';
import createHourIdentifier from './createHourIdentifier.js';

async function maybePersistActivity(activity) {
  const transaction = db.transaction(['activities'], 'readwrite');
  const objectStore = transaction.objectStore('activities');
  const index = objectStore.index('title');

  const savedActivitiy = await index.get(activity.title);
  const { bundleId, title, type, lastActivityDate, from, until } = activity;
  const seconds = Math.floor((until - from) / 1000);

  if (!savedActivitiy) {
    await objectStore.put({
      bundleId,
      title,
      type,
      productivityKey: 'unassigned',
      lastActivityDate: until,
      totalTime: seconds,
      isAlwaysActive: false
    });
    return transaction.complete;
  }

  if (Number.isNaN(savedActivitiy.totalTime) || savedActivitiy.totalTime <= 0) {
    console.error('Something wrong with savedActivity.totalTime', savedActivitiy);
    savedActivitiy.totalTime = 0;
  }

  await objectStore.put({
    ...savedActivitiy,
    lastActivityDate: until,
    totalTime: savedActivitiy.totalTime + seconds
  });

  return transaction.complete;
}

function groupIntoHours(activities) {
  const batches = {};
  const _1hour = 1 * 60 * 60 * 1000;

  for (const activity of activities) {
    addToBatches(activity);
  }

  function floorHour(from) {
    const hour = new Date(from).getHours();
    return new Date(new Date().setHours(hour, 0, 0, 0));
  }

  function ceilHour(until) {
    const hour = new Date(new Date(until).getTime() + _1hour);
    return floorHour(hour);
  }

  function addToBatches(activity) {
    const from = floorHour(activity.from);
    const until = ceilHour(activity.until);
    const statsIdentifier = createHourIdentifier(from);

    if (!batches[statsIdentifier]) {
      batches[statsIdentifier] = [];
    }

    if (until.getTime() - from.getTime() > _1hour) {
      const currActivity = {
        ...activity,
        until: new Date(from).setHours(from.getHours(), 59, 59, 999)
      };
      batches[statsIdentifier].push(currActivity);
      const nextActivity = {
        ...activity,
        from: new Date(from.getTime() + _1hour)
      };
      return addToBatches(nextActivity);
    }

    batches[statsIdentifier].push(activity);
  }

  return batches;
}

export default async function persistBatch() {
  if (!db) {
    throw new Error('database not opened');
  }

  const groupedActivities = groupIntoHours(state.batch);
  setState({ batch: [] });

  for (const key in groupedActivities) {
    let data = {
      statsIdentifier: key,
      activities: []
    };

    for (const activity of groupedActivities[key]) {
      await maybePersistActivity(activity);
      data.activities.push(activity);
    }

    const transaction = db.transaction(['stats'], 'readwrite');
    const objectStore = transaction.objectStore('stats');
    const index = objectStore.index('statsIdentifier');
    const persistedData = await index.get(key);

    if (persistedData) {
      data = {
        ...data,
        ...persistedData,
        activities: [...data.activities, ...persistedData.activities]
      };
    }

    await objectStore.put(data);
    await transaction.complete;
  }
}
