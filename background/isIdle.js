import { state } from './state.js';

export default function isIdle() {
  return state.idleStatus !== 'active';
}
