// 全局状态管理

import * as redux from 'redux';
import * as reactRedux from 'react-redux';
import React from 'react';

import { Provider } from 'react-redux';

export {
  connect,
  getState,
  withState,
};

export default {
  connect,
  getState,
  withState,
};

const { createStore: reduxCreateStore, combineReducers: reduxCombineReducers } = redux;
const { connect: reduxConnect } = reactRedux;

let store = null;
const reducers = {};
const effects = {};

function createStore (configs) {
  const keys = Object.keys(configs);
  keys.forEach((key) => {
    const config = configs[key];
    const { reducer } = config;
    // effects[key] = config.effect

    // eslint-disable-next-line no-restricted-syntax
    for (const subKey in config.effect) {
      effects[`${key}.${subKey}`] = config.effect[subKey];
    }

    reducers[key] = (state = config.state || {}, { type, payload }) => {
      const [ modKey, actionType ] = type.split('.');
      if (modKey !== key || !reducer[actionType]) {
        return state;
      }
      // console.info({ actionType, payload })
      return { ...state, ...reducer[actionType](state, payload) };
    };
  });

  return store = reduxCreateStore(reduxCombineReducers(reducers));
}

function connect (mapStateToProps, mapDispatchToProps) {
  return reduxConnect(mapStateToProps, mapDispatchToProps && ((reduxDispatch, ownProps) => mapDispatchToProps(dispatch, ownProps)));
}

async function dispatch (type, payload) {
  // console.info('dispatch');
  if (typeof type === 'object') {
    ({ type, payload } = type);
  }
  // 优先调用effect
  if (effects[type]) {
    return effects[type](payload, {
      dispatch,
      getState,
    });
  }

  return store.dispatch({ type, payload });
}

function getState (path) {
  let state = store.getState();
  if (!path) {
    return state;
  }

  const keys = path.split('.');
  for (let i = 0; i < keys.length; i++) {
    if (!state || typeof state !== 'object') {
      return;
    }
    state = state[keys[i]];
  }
  return state;
}

function withState (option) {
  createStore(option.configs);
  return (Component) => (props) => (<Provider store={store}>{Component(props)}</Provider>);
}
