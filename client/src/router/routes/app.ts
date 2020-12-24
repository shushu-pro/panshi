import { RoutesConfig } from '@/router';

export default [
  {
    path: 'app',
    children: [
      {
        title: '应用',
        redirect: {
          path: '/app/api',
          query: (query) => ({ appId: query.id }),
        },
      },
      {
        title: '应用接口中心',
        path: 'api',
        lazy: () => import('@/page/app/api'),
      },
      {
        title: '应用基础信息',
        path: 'info',
        lazy: () => import('@/page/app/info'),
      },
      {
        title: '应用用户管理',
        path: 'member',
        lazy: () => import('@/page/app/info'),
      },
    ],
  },
] as RoutesConfig;
