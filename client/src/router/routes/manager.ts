import { RoutesConfig } from '@/router';

export default [
  {
    path: 'manager',
    children: [
      {
        title: '用户管理',
        path: 'user',
        lazy: () => import('@/page/manager/user'),
      },
      // {
      //   path: 'permisstion',
      //   // keepAlive: [ '/manage/user' ],
      //   // lazy: () => import('@/page/manage/permisstion'),
      //   children: [
      //     {
      //       title: '权限管理',
      //       path: '',
      //       redirect: '/manager/permisstion/module',
      //     },
      //     {
      //       title: '模块管理',
      //       path: 'module',
      //       lazy: () => import('@/page/manager/permisstion'),
      //     },

      //   ],
      // },
    ],
  },
] as RoutesConfig;
