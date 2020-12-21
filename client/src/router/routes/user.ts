import { RoutesConfig } from '@/router';

export default [
  {
    title: '登录',
    path: 'login',
    lazy: () => import('@/page/user/login'),
    loginIgnore: true,
  },
] as RoutesConfig;
