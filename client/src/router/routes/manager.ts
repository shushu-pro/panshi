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
      {
        path: 'permisstion',
        children: [
          { redirect: '/manager/permisstion/module' },
          {
            title: (route) => {
              if (route.params.type === 'module') {
                return '模块管理';
              }
              return '角色管理';
            },
            path: ':type',
            lazy: () => import('@/page/manager/permisstion'),
          },
        ],
      },
    ],
  },
] as RoutesConfig;
