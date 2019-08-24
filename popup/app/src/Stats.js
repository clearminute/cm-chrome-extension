/* global chrome */
import * as React from 'react';
import styles from './stats.module.css';
import { useEffect, useState } from 'react';
import { extensionId, isProduction } from './constants';
import createGaugeStats from './utils/createGaugeStats';
import calculateProductivity from './utils/calculateProductivity';
import convertToDisplayTime from './utils/convertToDisplayTime';

export default function Stats() {
  const [productivityScore, setProductivityScore] = useState(50);
  const [topActivities, setTopActivities] = useState([]);

  useEffect(() => {
    const statsOptions = {
      from: new Date().setHours(0, 0, 0, 0),
      until: new Date().setHours(23, 59, 59, 59)
    };

    console.log('send message from popup!');
    chrome.runtime.sendMessage(
      extensionId,
      {
        type: 'LOAD_STATS',
        message: statsOptions
      },
      function(response) {
        const gaugeStats = createGaugeStats(response['aggregated_context']['statsByHour']);
        const productivity = calculateProductivity(gaugeStats);
        setProductivityScore(productivity);
        setTopActivities(response['aggregated_context'].topActivities);
      }
    );
  }, []);

  useEffect(() => {
    window.twttr = (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0],
        t = window.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    })(document, 'script', 'twitter-wjs');
  }, []);

  console.log(topActivities);
  return (
    <div className={styles.container}>
      <h3 className={styles.title}> PRODUCTIVITY SCORE </h3>
      <h1 className={styles['productivity-score']}> {productivityScore}% </h1>
      {/* <p className={styles.description}>You're on a good path!</p> */}
      <h4 className={styles.subtitle}> TOP ACTIVITIES TODAY </h4>
      <ul className={styles.activities}>
        {topActivities.slice(0, 3).map(activity => (
          <li className={[styles.activity].join(' ')}>
            <div className={[styles.activityDot, styles[activity.productivityKey]].join(' ')} />
            <div className={styles.activityTitle}> {activity.title} </div>
            <div className={styles.activityTime}> {convertToDisplayTime(activity.seconds)} </div>
          </li>
        ))}
      </ul>

      <a
        className="twitter-share-button"
        href="https://twitter.com/intent/tweet?text=Hello%20world"
      >
        Tweet
      </a>
      <a
        className={styles.link}
        href={isProduction ? 'https://light.clearminute.com' : 'http://localhost:8080/'}
        target="_blank"
        rel="noopener noreferrer"
      >
        OPEN DASHBOARD TO SEE MORE
      </a>
    </div>
  );
}
