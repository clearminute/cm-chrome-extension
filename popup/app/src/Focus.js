/* global chrome */
import * as React from 'react';
import { useReducer, useEffect, useContext } from 'react';
import styles from './focus.module.css';
import convertToDisplayTime from './utils/convertToDisplayTime';
import { AppContext } from './App';
import { extensionId } from './constants';

const initialState = { focusTime: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TODAY_FOCUS_TIME':
      return { focusTime: action.value };
    default:
      throw new Error();
  }
}

export default function Focus() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, appDispatch] = useContext(AppContext);

  const focusTime = convertToDisplayTime(state.focusTime);
  useEffect(() => {
    chrome.runtime.sendMessage(extensionId, { type: 'GET_TODAY_FOCUS_TIME' }, function(response) {
      dispatch({ type: 'SET_TODAY_FOCUS_TIME', value: response.value });
    });
  }, []);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}> DEEP FOCUS TODAY </h3>
      <h1 className={styles.focusTime}> {focusTime}</h1>
      <p className={styles.description}>
        Let's get started with <br /> your first session today!
      </p>
      <button className={styles.button} onClick={() => appDispatch({ type: 'SET_VIEW', view: 'FOCUS_SESSION' })}>
        Quick Start
      </button>
      <a
        className={styles.link}
        href="https://www.clearminute.com/blog/posts/uninterrupted-focus"
        target="_blank"
        rel="noopener noreferrer"
      >
        WHY DO I NEED DEEP FOCUS?
      </a>
    </div>
  );
}
