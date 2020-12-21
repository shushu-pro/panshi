import { Space, Input, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { Redirect, Link, useHistory } from 'react-router-dom';
import { match, MatchFunction } from 'path-to-regexp';

type KeyValue = Record<string, string>

type LayoutConfig = {
  header?: boolean;
  sidebar?: boolean;
}

// 标准化的路由配置项
type NormalizeRouteConfig = {
  layout: LayoutConfig,
  path: string;
  redirect?: string | { query: boolean; path: string; } | ((auery) => string);
  pathMatch?: MatchFunction;
  keepAliveMatchs: Array<MatchFunction>;
  RouteView?: React.FC;
  title?: string | ((route: RouterRoute) => string); // 标题
  lazy?: () => Promise<{default: React.FC}>;
  loginIgnore?: boolean;
  authIgnore?: boolean;
}

// 输出的路由信息
type RouterRoute = {
  path: string;
  layout: LayoutConfig;
  title?: string | ((route: RouterRoute) => string); // 标题
  params: KeyValue;
  query: KeyValue;
}

type MybeJSX = JSX.Element | void

export type RouterOption = {
  Layout?: (props) => JSX.Element;
  routes: RoutesConfig;
  routerState: (props) => void;
  routerEnter: (router: Router) => MybeJSX;
}

export type RoutesConfig = Array<RouteConfig>;

type RouteConfig = {
  path: string;
  page?: React.FC;
  lazy?: () => Promise<{default: React.FC}>;
  render?: () => JSX.Element;
  loginIgnore?: boolean;
  authIgnore?: boolean;
  auths?: Array<string>;
  layout?: LayoutConfig,
  title?: string | ((route: RouterRoute) => string); // 标题
  children?: RoutesConfig;
  redirect?: string | { query: boolean; path: string; } | ((auery) => string);
  keepAlive?: Array<string>;
}
export default class Router {
//  布局基座
  private Layout?: (props) => JSX.Element;

  // 路由状态钩子
  private routerStateHook: (props) => void;

  // 路由拦截钩子
  private routerEnterHook: (router: Router) => MybeJSX;

  // 静态路由配置项
  private staticRoutes: Record<string, NormalizeRouteConfig>;

  // 动态路由配置项
  private dynamicRoutes: Array<NormalizeRouteConfig>;

  // 缓存中的路由信息
  private keepAliveRoutes: Array<NormalizeRouteConfig>;

  // 所有待渲染的路由视图配置
  private routerViewRoutes: Array<NormalizeRouteConfig>;

  // 当前渲染的路由视图
  private routerView: JSX.Element;

  // 激活的路由配置信息
  private activeRoute: NormalizeRouteConfig;

  // 导出的路由信息
  route: RouterRoute;

  // 权限因子列表
  stateAuths: Array<string>;

  // 登录状态
  stateIsLogin: boolean;


  constructor ({ Layout, routes, routerState, routerEnter }: RouterOption) {
    this.Layout = Layout;
    this.routerStateHook = routerState;
    this.routerEnterHook = routerEnter;
    this.staticRoutes = {};
    this.dynamicRoutes = [];
    this.routerView = null;
    this.routerViewRoutes = [];
    this.keepAliveRoutes = [];
    this.stateAuths = [];
    this.stateIsLogin = false;

    this.initRoutes(routes);
  }


  render () {
    const history = useHistory();
    const routerState = this.routerState();
    const [ pageLoading, pageLoadingSet ] = useState(false);
    const [ content, contentSet ] = useState(null);
    // const [ isUpdate, isUpdateSet ] = useState(null);
    // const [update, updateSet] =

    // 监听路由变化
    useEffect(() => {
      if (!routerState.isReady) {
        return;
      }
      pageLoadingSet(true);
      this.routerEnter(history)
        .then((content) => {
          contentSet(content);
        })
        .finally(() => {
          pageLoadingSet(false);
        });
    }, [ `${history.location.pathname}?${history.location.search}`, routerState.isReady ]);

    if (!routerState.isReady) {
      return (
        <Spin size="large">
          <div style={{ minHeight: '600px' }}>&nbsp;</div>
        </Spin>
      );
    }

    if (!content) {
      return null;
    }

    return (
      <Spin spinning={pageLoading} size="large">
        {content}
      </Spin>
    );
  }

  notFound () {
    return !this.activeRoute;
  }

  title () {
    const { activeRoute } = this;
    if (!activeRoute) {
      return;
    }

    const { title } = activeRoute;
    return typeof title === 'function' ? title(this.route) : title;
  }

  needLogin () {
    return !this.activeRoute.loginIgnore;
  }

  notLogin () {
    return !true;
  }

  notAuth () {
    return true && this.needLogin() && !this.activeRoute.authIgnore;
  }

  private initRoutes (routes: RoutesConfig) {
    const { staticRoutes, dynamicRoutes } = this;

    walkRoutes(routes, [ '' ], {});

    // console.info({ staticRoutes, dynamicRoutes });

    function walkRoutes (routes: RoutesConfig, paths: Array<string>, parentLayout) {
      routes.forEach((route) => {
        const { path, layout, children } = route;
        const pathsNext = paths.concat([ path ]);

        const routeLayout = (layout === null ? {} : (layout || parentLayout));

        if (children) {
          walkRoutes(children, pathsNext, routeLayout);
        }

        // 非页面级别的路由配置项
        if (!route.redirect && !route.page && !route.render && !route.lazy) {
          return;
        }

        // 路由全路径
        const pathsNextText = pathsNext.join('/').replace(/\/+/g, '/');

        const tempRouteConfig: NormalizeRouteConfig = {
          path: pathsNextText,
          layout: routeLayout,
          keepAliveMatchs: [],
        };

        // 判断是动态还是静态路径的路由
        if (/:/.test(pathsNextText)) {
          tempRouteConfig.pathMatch = match(pathsNextText);
          dynamicRoutes.push(tempRouteConfig);
        } else {
          staticRoutes[pathsNextText] = tempRouteConfig;
        }

        // 跳转的路由配置项，不在后续的逻辑
        if (route.redirect) {
          tempRouteConfig.redirect = route.redirect;
          return;
        }

        tempRouteConfig.title = route.title;
        tempRouteConfig.loginIgnore = route.loginIgnore;
        tempRouteConfig.authIgnore = route.authIgnore;

        // 路由缓存
        const { keepAlive } = route;
        if (keepAlive) {
          tempRouteConfig.keepAliveMatchs = (Array.isArray(keepAlive) ? keepAlive : [ keepAlive ]).map((item) => match(item));
        }

        if (route.render) {
          tempRouteConfig.RouteView = () => route.render();
        } else if (route.page) {
          tempRouteConfig.RouteView = route.page;
        } else {
          tempRouteConfig.lazy = route.lazy;
        }
      });
    }
  }

  private routerState () {
    const [ routerState, routerStateSet ] = useState({
      isReady: false,
      isLogin: this.stateIsLogin,
      auths: this.stateAuths,
    });

    this.routerStateHook((nextState) => {
      this.stateAuths = nextState.auths;
      this.stateIsLogin = nextState.isLogin;

      routerStateSet({
        isReady: true,
        ...nextState,
      });
    });

    return routerState;
  }

  private async routerEnter (history) {
    this.updateRoute(history);

    const routerView = (
      <>
        {this.matchRedirect() || this.matchRouterEnter() || this.matchNotFound() || await this.matchRoute() || null}
        {this.routerViewRoutes.map((item) => (
          <div key={item.path} style={{ display: item === this.activeRoute ? '' : 'none' }}>
            <item.RouteView />
          </div>
        ))}
      </>
    );


    const { Layout } = this;
    let content = null;
    if (Layout) {
      content = <Layout layout={this.activeRoute ? this.activeRoute.layout : {}} routerView={routerView} />;
    } else {
      content = routerView;
    }

    return content;
  }

  // 匹配路由跳转
  private matchRedirect () {
    const { activeRoute } = this;
    if (activeRoute && /^(string|object|function)$/.test(typeof activeRoute.redirect)) {
      const { redirect } = activeRoute;
      let queryString;
      let redirectTo;

      const typeofRedirect = typeof redirect;
      const routeQuery = this.route.query;

      if (typeofRedirect === 'object') {
        const { path, query } = redirect as { query: boolean; path: string; };
        if (query === true) {
          queryString = queryStringify(routeQuery);
        } else if (typeof query === 'function') {
          queryString = queryStringify((query as (q: KeyValue) => string)(routeQuery));
        } else {
          queryString = queryStringify(query);
        }
        redirectTo = path + (queryString ? `?${queryString}` : '');
      } else if (typeofRedirect === 'function') {
        redirectTo = (redirect as (query: KeyValue) => string)(routeQuery);
      } else {
        redirectTo = redirect;
      }

      return <Redirect to={redirectTo} />;
    }
  }

  // 匹配路由拦截
  private matchRouterEnter () {
    return this.routerEnterHook(this);
  }

  // 匹配未定义的路由
  private matchNotFound () {
    if (this.notFound()) {
      return <div>PAGE404</div>;
    }
  }

  // 匹配路由正确
  private async matchRoute () {
    const { activeRoute } = this;
    const keepAliveRoutes = this.keepAliveRoutes.filter((item) => {
      if (activeRoute === item) {
        return false;
      }

      // 符合keepAlive的组件继续保持
      return item.keepAliveMatchs.some((matchPath) => matchPath(activeRoute.path));
    });

    const routerViewRoutes = [ ...keepAliveRoutes ];

    // 不是从拦截器中返回的节点，则进行保存
    if (activeRoute.keepAliveMatchs) {
      keepAliveRoutes.push(activeRoute);
    }

    routerViewRoutes.push(activeRoute);

    // 异步加载
    if (!activeRoute.RouteView) {
      const FC = (await activeRoute.lazy()).default;
      activeRoute.RouteView = FC;
    }

    this.keepAliveRoutes = keepAliveRoutes;
    this.routerViewRoutes = routerViewRoutes;

    return null;
  }

  // 更新路由信息
  private updateRoute (history) {
    const { location } = history;
    const { pathname, search } = location;
    let activeRoute = this.staticRoutes[pathname];
    let params: any = {};


    // 尝试从动态路由中进行匹配
    if (!activeRoute) {
      this.dynamicRoutes.some((route) => {
        const result = route.pathMatch(pathname);

        if (result) {
          activeRoute = route;
          params = result.params;
          return true;
        }
        return false;
      });
    }

    this.activeRoute = activeRoute;

    // 解析查询参数
    const query: KeyValue = {};
    if (search) {
      search.substr(1).split(/&/).forEach((item: string) => {
        const [ key, value ] = item.split('=');
        query[key] = value;
      });
    }

    // 生成路由信息对象
    if (activeRoute) {
      this.route = {
        path: activeRoute.path,
        layout: activeRoute.layout,
        title: activeRoute.title,
        params,
        query,
      };
    } else {
      this.route = {
        path: pathname,
        layout: {},
        params,
        query,
      };
    }

    // console.info('updateRoute', this.route);
  }
}

function Nonex () {
  const [ txt, txtSet ] = useState(0);
  return <div onClick={() => txtSet(Math.random())}>xx{txt}xaa</div>;
}

let arr = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
arr = arr.concat(arr);
// arr = arr.concat(arr);
// arr = arr.concat(arr);
// arr = arr.concat(arr);

function MapInput () {
  console.info('yes');
  return (
    <>
      {
        arr.map((v, i) => (
          <Input key={`${i}`} name={`${i}`} defaultValue={i} />
        ))
      }
    </>
  );
}

function queryStringify (query) {
  const typeofQuery = typeof query;

  if (typeofQuery === 'string') {
    return query;
  }

  if (!query || typeofQuery !== 'object') {
    return '';
  }

  return Object.keys(query).map((key) => {
    const value = query[key];
    return `${key}=${value}`;
  }).join('&');
}
