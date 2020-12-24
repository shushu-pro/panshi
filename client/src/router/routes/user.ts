import { RoutesConfig } from '@/router';

export default [
  {
    title: '登录',
    path: 'login',
    lazy: () => import('@/page/user/login'),
    loginIgnore: true,
    layout: null,
  },
  {
    path: 'user',
    children: [
      {
        path: 'center',
        children: [
          { redirect: '/user/center/apps' },
          {
            title: (route) => {
              if (route.params.type === 'apps') {
                return '我的应用';
              }
              return '我的项目';
            },
            path: ':type',
            lazy: () => import('@/page/user/center'),
          },
        ],
      },

      {
        title: '个人设置',
        path: 'settings',
        lazy: () => import('@/page/user/settings'),
      },
    ],
  },
] as RoutesConfig;
