import React, { useState, useEffect } from 'react';

import { Redirect } from 'react-router-dom';
import Layout from '@/layout/index';
import user from '@/page/user';
import { RoutesConfig } from './core/define';
import createRouter, { useRoute } from './core';
import routes from './routes';

const { defaultTitle } = process.env;

export default createRouter({
  Layout,
  routes,
  routerState (setState) {
    const [ userInfo, userInfoSet ] = user.useUserInfo();

    // 获取路由状态，登录状态，权限因子
    useEffect(() => {
    //   console.info('routerState.mouted');
      user.pullInfo()
        .then((data) => {
          setState({
            isReady: true,
            isLogin: true,
            auths: data.auths,
          });
          userInfoSet({ ...data, isLogin: true });
        })
        .catch(() => {
          setState({ isReady: true, isLogin: false });
        });
    }, []);

    useEffect(() => {
      setState({ isLogin: userInfo.isLogin });
    }, [ userInfo.isLogin ]);
  },
  routerEnter (router) {
    document.title = router.title() || defaultTitle;

    if (router.notFound()) {
      return <Redirect to="/page404" />;
    }

    if (!router.notLogin()) {
      if (router.route.path === '/login') {
        return <Redirect to="/" />;
      }
    } else if (router.needLogin()) {
      return <Redirect to="/login" />;
    }

    if (router.notAuth()) {
      return <Redirect to="/pageauth" />;
    }

    // console.info(router.route);
  },
});

export {
  RoutesConfig,
  useRoute,
};
