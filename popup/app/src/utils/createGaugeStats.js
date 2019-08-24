import get from 'lodash/get';
import each from 'lodash/each';
import partialRight from 'lodash/partialRight';

// Internals (A-z)
import { calculatePercentage } from './helpers';
import {
  PRODUCTIVE_KEY,
  NEUTRAL_KEY,
  DISTRACTING_KEY,
  SLIGHTLY_DISTRACTING_KEY,
  SLIGHTLY_PRODUCTIVE_KEY,
  UNASSIGNED_KEY
} from './constants.js';

export default function createGaugeStats(stats) {
  let totalProductiveTime = 0.0;
  let totalNeutralTime = 0.0;
  let totalDistractingTime = 0.0;
  let totalUnassignedTime = 0.0;
  let totalSlightlyProductiveTime = 0.0;
  let totalSlightlyDistractingTime = 0.0;

  each(stats, yearStats => {
    each(yearStats, monthStats => {
      each(monthStats, dayStats => {
        each(dayStats, hourStats => {
          totalProductiveTime += get(hourStats, PRODUCTIVE_KEY, 0);
          totalSlightlyProductiveTime += get(hourStats, SLIGHTLY_PRODUCTIVE_KEY, 0);
          totalNeutralTime += get(hourStats, NEUTRAL_KEY, 0);
          totalDistractingTime += get(hourStats, DISTRACTING_KEY, 0);
          totalSlightlyDistractingTime += get(hourStats, SLIGHTLY_DISTRACTING_KEY, 0);
          totalUnassignedTime += get(hourStats, UNASSIGNED_KEY, 0);
        });
      });
    });
  });

  const totalTime =
    totalProductiveTime +
    totalNeutralTime +
    totalDistractingTime +
    totalSlightlyDistractingTime +
    totalUnassignedTime +
    totalSlightlyProductiveTime;

  const calculatePercentageFromTotalTime = partialRight(calculatePercentage, totalTime);

  const result = {
    totalTime,
    productive: {
      totalTime: totalProductiveTime,
      percentage: calculatePercentageFromTotalTime(totalProductiveTime)
    },
    slightlyProductive: {
      totalTime: totalSlightlyProductiveTime,
      percentage: calculatePercentageFromTotalTime(totalSlightlyProductiveTime)
    },
    neutral: {
      totalTime: totalNeutralTime,
      percentage: calculatePercentageFromTotalTime(totalNeutralTime)
    },
    unassigned: {
      totalTime: totalUnassignedTime,
      percentage: calculatePercentageFromTotalTime(totalUnassignedTime)
    },
    slightlyDistracting: {
      totalTime: totalSlightlyDistractingTime,
      percentage: calculatePercentageFromTotalTime(totalSlightlyDistractingTime)
    },
    distracting: {
      totalTime: totalDistractingTime,
      percentage: calculatePercentageFromTotalTime(totalDistractingTime)
    }
  };

  return result;
}
