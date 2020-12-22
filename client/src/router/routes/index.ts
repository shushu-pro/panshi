import { RoutesConfig } from '@/router';
import others from './others';
import user from './user';
import app from './app';

export default [
  {
    layout: {
      header: true,
    },
    children: [
      ...others,
      ...user,
      ...app,
    ],
  },
] as RoutesConfig;
