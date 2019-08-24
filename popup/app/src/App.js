/* global chrome */
import React from 'react';
import { useReducer, useEffect, useState } from 'react';
import FocusSession from './FocusSession';
import Home from './Home';
import { extensionId, isProduction } from './constants';

export const AppContext = React.createContext();

function reducer(state, action) {
  if ((action.type = 'SET_VIEW')) {
    return { view: action.view };
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, { view: '' });

  useEffect(() => {
    chrome.runtime.sendMessage(extensionId, { type: 'GET_VIEW' }, function(
      response = { value: 'HOME' }
    ) {
      dispatch({ type: 'SET_VIEW', view: response.value });
    });
  }, []);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {!isProduction && 'DEVELOPMENT'}
      {state.view === 'HOME' && <Home />}
      {state.view === 'FOCUS_SESSION' && <FocusSession />}
    </AppContext.Provider>
  );
}

export default App;
