import { Routes } from '../core/Router';


export default [
  {
    path: '',
    redirect: '/user/center/apps',
  },


  // {
  //   path: 'app',
  //   lazy: () => import('@/page/appDetail'),
  // },
  {
    path: 'page404',
    lazy: () => import('@/page/etc/page404'),
    // loginIgnore: true,
  },

] as Routes;
