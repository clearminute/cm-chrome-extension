/* global chrome */
import * as React from 'react';
import { useEffect, useState, useContext } from 'react';
import styles from './focus-session.module.css';
import convertToDisplayTime from './utils/convertToDisplayTime';
import logo from './logo.svg';
import { AppContext } from './App';
import { extensionId } from './constants';

const SESSION_TIME = 30 * 60; // 30 minutes
const COUNTDOWN_TIME = 29 * 60 + 30; // 29.5 minutes start countdown

export default function FocusSession() {
  const [focusTime, setFocusTime] = useState(0);
  const focus = convertToDisplayTime(SESSION_TIME - focusTime);
  const [appState, appDispatch] = useContext(AppContext);

  useEffect(() => {
    const interval = setInterval(() => {
      chrome.runtime.sendMessage(extensionId, { type: 'GET_CURRENT_FOCUS_SESSION_TIME' }, function(
        response
      ) {
        setFocusTime(response.value);
      });
    }, 500);
    chrome.runtime.sendMessage(extensionId, { type: 'START_FOCUS_SESSION' });

    return () => {
      clearInterval(interval);
      chrome.runtime.sendMessage(extensionId, { type: 'STOP_FOCUS_SESSION' });
    };
  }, []);

  return (
    <>
      {focusTime >= SESSION_TIME && (
        <div className={styles['focus-session-achieved']}>
          <header>
            <img src={logo} className={styles.logo} alt="clearminute logo" />
          </header>
          <main>
            {focusTime >= COUNTDOWN_TIME && (
              <h2 className={styles.title}>
                {convertToDisplayTime(focusTime - SESSION_TIME)} <br /> bonus
              </h2>
            )}
          </main>
          <section className={styles.buttons}>
            <button
              className={[styles.button, styles['button-break']].join(' ')}
              onClick={() => appDispatch({ view: 'HOME' })}
            >
              Take a break
            </button>
            <button
              className={[styles.button, styles['button-configure']].join(' ')}
              onClick={() => {
                chrome.tabs.create({ url: 'https://clearminute-151818.appspot.com/#/activities' });
              }}
            >
              Configure Apps
            </button>
          </section>
        </div>
      )}
      {focusTime < SESSION_TIME && (
        <div className={styles['focus-session-progress']}>
          <header>
            <img src={logo} className={styles.logo} alt="clearminute logo" />
          </header>
          <main>
            {focusTime >= COUNTDOWN_TIME && (
              <h2 className={styles.title}>
                {SESSION_TIME - focusTime}s <br /> remaining
              </h2>
            )}
            {focusTime > 0 && focusTime < COUNTDOWN_TIME && (
              <h2 className={styles.title}>
                {focus} <br /> remaining
              </h2>
            )}
          </main>
          <section className={styles.buttons}>
            <button
              className={[styles.button, styles['button-cancel']].join(' ')}
              onClick={() => appDispatch({ view: 'HOME' })}
            >
              Cancel Session
            </button>
            <button
              className={[styles.button, styles['button-configure']].join(' ')}
              onClick={() => {
                chrome.tabs.create({ url: 'https://clearminute-151818.appspot.com/#/activities' });
              }}
            >
              Configure Apps
            </button>
          </section>
        </div>
      )}
    </>
  );
}
