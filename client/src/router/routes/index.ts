import { RoutesConfig } from '@/router';
import others from './others';
import user from './user';

export default [
  {
    layout: {
      header: true,
    },
    children: [
      ...others,
      ...user,
    ],
  },
] as RoutesConfig;
