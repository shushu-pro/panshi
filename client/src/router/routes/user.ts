import { Routes } from '../core/Router';

export default [
  {
    title: '登录',
    path: 'login',
    lazy: () => import('@/page/user/login'),
    layout: null,
    loginIgnore: true,
  },
  {
    path: 'user',
    children: [
      {
        path: 'center',
        children: [
          {
            path: '',
            redirect: '/user/center/apps',
          },

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
      // {

      //   title: '个人设置',
      //   path: 'settings',
      //   lazy: () => import('@/page/user/settings'),
      // },
    ],
  },
] as Routes;
