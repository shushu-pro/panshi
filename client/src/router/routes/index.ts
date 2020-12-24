import { RoutesConfig } from '@/router';
import others from './others';
import user from './user';
import app from './app';
import manager from './manager';

export default [
  {
    layout: {
      header: true,
    },
    children: [
      ...others,
      ...user,
      ...app,
      ...manager,
    ],
  },
] as RoutesConfig;
