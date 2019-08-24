import { openDB, deleteDB, wrap, unwrap } from './indexedDB.js';

const name = 'light.clearminute';
const version = '18';
let db = null;

async function initDB() {
  const instance = await openDB(name, version, {
    async upgrade(upgradeDB, oldVersion, newVersion, transaction) {
      if (!upgradeDB.objectStoreNames.contains('stats')) {
        const statsOS = upgradeDB.createObjectStore('stats', {
          keyPath: 'id',
          autoIncrement: true
        });

        statsOS.createIndex('statsIdentifier', 'statsIdentifier', {
          unique: true
        });
      }

      if (!upgradeDB.objectStoreNames.contains('activities')) {
        const activitiesOS = upgradeDB.createObjectStore('activities', {
          keyPath: 'id',
          autoIncrement: true
        });

        activitiesOS.createIndex('title', 'title', {
          unique: true
        });
      }

      if (!upgradeDB.objectStoreNames.contains('focus')) {
        const focusOS = upgradeDB.createObjectStore('focus', {
          keyPath: 'id',
          autoIncrement: true
        });

        focusOS.createIndex('focusIdentifierForDay', 'focusIdentifierForDay', {
          unique: true
        });
      }

      const activitiesObjectStore = transaction.objectStore('activities');
      const activities = await activitiesObjectStore.getAll();

      for (const activity of activities) {
        if (Number.isNaN(activity.totalTime) || activity.totalTime <= 0) {
          activity.totalTime = 0;
          await activitiesObjectStore.put(activity);
        }
      }
    }
  });

  db = instance;
}

initDB();

export { db };
