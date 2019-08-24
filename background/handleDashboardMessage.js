import { db } from './database/db.js';
import createHourIdentifier from './createHourIdentifier.js';
import { getFocusTime } from './handlePopupMessage.js';

async function queryStatsForIdentifier(statsIdentifier) {
  const transaction = db.transaction(['stats'], 'readonly');
  const objectStore = transaction.objectStore('stats');
  const index = objectStore.index('statsIdentifier');

  const stats = await index.get(statsIdentifier);
  return stats;
}

export async function createStats(statsOptions, response) {
  if (!db) {
    return response(null);
  }

  const from = new Date(statsOptions.from);
  const to = new Date(statsOptions.until);
  let curr = from;

  const statsByHour = {};
  const activitiesAllTime = {};
  const activitiesByHour = new Map();
  const queriedActivitiesCache = new Map();
  const _1hour = 1 * 60 * 60 * 1000;

  while (curr.getTime() + _1hour <= to.getTime()) {
    const statsIdentifier = createHourIdentifier(curr);
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const day = curr.getDate();
    const hour = curr.getHours();
    curr = new Date(curr.getTime() + _1hour);
    if (!statsByHour[year]) {
      statsByHour[year] = {};
    }

    if (!statsByHour[year][month]) {
      statsByHour[year][month] = {};
    }

    if (!statsByHour[year][month][day]) {
      const hourStats = {};
      for (let i = 0; i < 24; i++) {
        hourStats[i] = {
          neutral: 0,
          distracting: 0,
          productive: 0,
          unassigned: 0,
          slightlyProductive: 0,
          slightlyDistracting: 0,
          mostActiveActivities: []
        };
      }
      statsByHour[year][month][day] = hourStats;
    }

    // cursor with range might be much efficienter here?
    const stats = await queryStatsForIdentifier(statsIdentifier);
    if (!stats) {
      continue;
    }

    for (const activity of stats.activities) {
      let savedActivity = queriedActivitiesCache.get(activity.title);
      if (!savedActivity) {
        const transaction = db.transaction(['activities'], 'readonly');
        const objectStore = transaction.objectStore('activities');
        const index = objectStore.index('title');
        savedActivity = await index.get(activity.title);
        queriedActivitiesCache.set(activity.title, savedActivity);
      }

      const seconds = (activity.until - activity.from) / 1000;
      const productivityKey = savedActivity.productivityKey;
      const title = activity.title;

      let groupedActivitiesByHour = activitiesByHour.get(statsIdentifier);
      if (!groupedActivitiesByHour) {
        groupedActivitiesByHour = {};
      }

      if (!groupedActivitiesByHour[activity.title]) {
        groupedActivitiesByHour[activity.title] = {
          title: activity.title,
          productivityKey: savedActivity.productivityKey,
          activityId: activity.title,
          seconds: 0
        };
      }

      if (!activitiesAllTime[activity.title]) {
        activitiesAllTime[activity.title] = {
          title: activity.title,
          productivityKey: savedActivity.productivityKey,
          activityId: activity.title,
          seconds: 0
        };
      }

      groupedActivitiesByHour[activity.title].seconds += seconds;
      activitiesAllTime[activity.title].seconds += seconds;
      activitiesByHour.set(statsIdentifier, groupedActivitiesByHour);

      statsByHour[year][month][day][hour][productivityKey] += seconds;
    }
  }

  let topActivities = [...Object.values(activitiesAllTime)]
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 5);
  for (let [key, hourlyActivities] of activitiesByHour.entries()) {
    const topHourlyActivities = [...Object.values(hourlyActivities)]
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 3);
    let [year, month, day, hour] = key.split('.').map(n => Number(n));
    month = month - 1;
    statsByHour[year][month][day][hour].mostActiveActivities = topHourlyActivities;
  }

  console.log('responding with stats', {
    statsByHour,
    topActivities
  });
  response({
    statsByHour,
    topActivities
  });
}

async function fetchActivities(message, response) {
  const transaction = db.transaction(['activities'], 'readonly');
  const objectStore = transaction.objectStore('activities');
  let activities = await objectStore.getAll();
  activities = activities.map(item => ({ ...item, activityId: item.title }));
  response(activities);
}

async function editActivity(message, response) {
  const activity = message.activity;
  const transaction = db.transaction(['activities'], 'readwrite');
  const objectStore = transaction.objectStore('activities');
  const index = objectStore.index('title');

  const savedActivity = await index.get(activity.activityId);
  if (activity.productivityKey) {
    savedActivity.productivityKey = activity.productivityKey;
  }

  await objectStore.put(savedActivity);
  await transaction.complete;
  response({ ...savedActivity, activityId: savedActivity.title });
}

export default function handleDashboardMessage(request, sender, sendResponse) {
  console.log('Dashboard Message', request);

  if (request.type === 'LOAD_STATS') {
    createStats(request.message, sendResponse);
  }

  if (request.type === 'LOAD_FOCUS_TIME') {
    getFocusTime(sendResponse, request.message);
  }

  if (request.type === 'LOAD_ACTIVITIES') {
    fetchActivities(request.message, sendResponse);
  }

  if (request.type === 'EDIT_ACTIVITY') {
    editActivity(request.message, sendResponse);
  }

  return true;
}
