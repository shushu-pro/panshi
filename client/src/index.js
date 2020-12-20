import { kvlog } from '@/package/log';
import render from './app';

render();

// Webpack Hot Module Replacement API
if (module.hot) {
  // module.hot.accept()
  module.hot.accept('./app', () => {
    try {
      render();
    } catch (e) {
      console.error(e);
    }
  });
}

// 调试信息
const date = new Date(process.env.built);
const builtTime = `${
  date.getFullYear()}-${
  String(date.getMonth() + 1).padStart(2, '0')}-${
  String(date.getDate()).padStart(2, '0')} ${
  String(date.getHours()).padStart(2, '0')}${
  String(date.getMinutes()).padStart(2, '0')}${
  String(date.getSeconds()).padStart(2, '0')}`;

kvlog('BUILT', `${process.env.NODE_ENV} ${builtTime}`);
