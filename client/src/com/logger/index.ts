// 调试信息
import { kvlog } from '@/package/log';

const date = new Date(process.env.built);
const builtTime = `${
  date.getFullYear()}-${
  String(date.getMonth() + 1).padStart(2, '0')}-${
  String(date.getDate()).padStart(2, '0')} ${
  String(date.getHours()).padStart(2, '0')}${
  String(date.getMinutes()).padStart(2, '0')}${
  String(date.getSeconds()).padStart(2, '0')}`;

kvlog('BUILT', `${process.env.NODE_ENV} ${builtTime}`);
