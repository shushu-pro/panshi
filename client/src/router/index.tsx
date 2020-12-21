import React, { useState, useEffect } from 'react';
import Layout from '@/layout/index';
import { Redirect } from 'react-router-dom';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import createRouter, { useRoute } from './core';
import { RoutesConfig } from './core/Router';
import routes from './routes';


let userInfoData = {
  nick: '',
  auths: [],
};
const userInfoAtom = atom({ key: 'userInfo', default: userInfoData });


const { defaultTitle } = process.env;


export default createRouter({
  Layout,
  routes,
  routerState (setState) {
    const [ userInfo, userInfoSet ] = useRecoilState(userInfoAtom);

    useEffect(() => {
      setTimeout(() => {
        userInfoSet(userInfoData = {
          nick: '张三',
          auths: [],
        });

        setState({
          isLogin: !true,
          auths: [],
        });
      }, 1000);
    }, []);
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
  useRoute, RoutesConfig,
};
