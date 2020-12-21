import React, { useState, useEffect } from 'react';
import Layout from '@/layout/index';
import { Redirect } from 'react-router-dom';
import user from '@/page/user/exports';
import createRouter, { useRoute } from './core/index';
import routes from './routes/index';


const { defaultTitle } = process.env;

export default createRouter({
  Layout,
  routes,
  routerState ({ setState }) {
    // const hasLogin = user.useHasLoginValue();
    // const userInfoReady = user.useUserInfoReady();

    useEffect(() => {
      if (!userInfoReady) {
        // 拉取信息
      }
    }, [ userInfoReady ]);


    // const setUserInfo = user.useSetUserInfo();
    // useEffect(() => {
    //   setUserInfo()
    //     .then(() => {
    //       setState({ hasLogin: true });
    //     })
    //     .catch(() => {
    //       setState({ hasLogin: false });
    //     });
    // }, []);
  },

  async beforeRoute (router) {
    if (router.notFound()) {
      return <Redirect to="/page404" />;
    }

    console.info('xxx');

    const hasLogin = router.hasLogin();

    if (hasLogin) {
      if (router.route.path === '/login') {
        return <Redirect to="/" />;
      }
    } else if (router.needLogin()) {
      return <Redirect to="/login" />;
    }

    console.info('ooooooooooo');


    // // 授权拦截
    // if (!await user.hasAuth(router.route.auths)) {
    //   return <Redirect to="/noauth" />;
    // }

    try {
      // await user.login();
    } catch (err) {
      // ...
    }

    document.title = router.title() || defaultTitle;
  },
});

export {
  useRoute,
};
