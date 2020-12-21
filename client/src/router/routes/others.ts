import { RoutesConfig } from '@/router';


export default [
  {
    path: '',
    redirect: '/home/abc',
    // redirect: '/user/center/apps',
  },

  {
    title: '首页',
    path: 'home/:abc',
    lazy: () => import('@/page/home'),
    // keepAlive: [ '/page404' ],
  },

  {
    title: '未授权页面',
    path: 'pageauth',
    lazy: () => import('@/page/etc/pageauth'),
    authIgnore: true,
  },

  {
    title: '页面未找到',
    path: 'page404',
    lazy: () => import('@/page/etc/page404'),
    loginIgnore: true,
  },
] as RoutesConfig;
