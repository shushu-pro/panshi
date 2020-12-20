import React, { useState, useEffect } from 'react';
import { match, MatchFunction } from 'path-to-regexp';
import { Redirect, useHistory } from 'react-router-dom';
import { Spin } from 'antd';
import { connect } from '@/package/haima';

interface Route{
  path: string; // 路由路径
  layout: Record<string, unknown>; // 布局
  title?: string | (() => string); // 标题
  params: Record<string, unknown>; // 参数
  query: Record<string, unknown>; // 参数
  redirect?: string;
}

export type Routes = Array<RouteConfig>;

interface RouteConfig {
  path: string;
  page?: () => React.FC;
  lazy?: () => Promise<JSX.Element>;
  loginIgnore?: boolean;
  auths?: Array<string>;
  layout?: {
    header?: boolean;
    sidebar?: boolean;
  },
  title?: string | ((route: Route) => string); // 标题
  children?: Array<RouteConfig>;
  redirect?: string | { query: boolean; path: string; } | ((auery) => string);

}

export interface RouterConfig {
  Layout?: (props) => JSX.Element;
  routes: Routes;
  routerState?: (props) => void;
  beforeRoute?: (router: Router) => Promise<JSX.Element>;
}

interface InnerRoute{
  [k: string]: unknown;
  pathMatch?: MatchFunction;
  routePath?: string;
  keepAliveMatchs: Array<MatchFunction>;
  routeRender?: () => JSX.Element;
}

class Router {
  route: Route;
  private Layout?: React.FC;
  private beforeRoute: (router: Router) => Promise<JSX.Element>;
  private staticRoutes: Record<string, InnerRoute>;
  private dynamicRoutes: Array<InnerRoute>;
  private keepAliveRoutes: Array<InnerRoute>;
  private activeJSX: JSX.Element;
  private childrenRoutes: Array<InnerRoute>;
  private innerRoute: any;
  private routerState: (props) => void;
  private stateLogin: boolean;
  private stateAuth: boolean;

  constructor ({ Layout, beforeRoute, routes, routerState }: RouterConfig) {
    this.beforeRoute = beforeRoute;
    this.Layout = Layout;
    this.staticRoutes = {};
    this.dynamicRoutes = [];
    this.keepAliveRoutes = [];
    this.activeJSX = null;
    this.childrenRoutes = [];
    this.stateLogin = false;
    this.stateAuth = false;
    this.routerState = routerState;
    this.initRoutes(routes);
  }

  notFound () {
    return !this.innerRoute;
  }

  hasLogin () {
    return this.stateLogin;
  }

  hasAuth () {
    return this.stateAuth;
  }

  renderLayout () {
    const router = {
      Layout: this.Layout,
      beforeRoute: this.beforeRoute.bind(this),
      renderPage: this.renderPage.bind(this),
      routerEnter: this.routerEnter.bind(this),
      getLayout: () => this.route?.layout || {},
      routerState: this.routerState ? this.routerState.bind(this) : null,
      setState: ({ hasLogin, hasAuth }) => {
        if (hasLogin !== undefined) {
          this.stateLogin = hasLogin;
        }
        if (hasAuth !== undefined) {
          this.stateAuth = hasAuth;
        }
      },
    };

    return <RenderRoute router={router} />;
  }

  renderPage () {
    const { innerRoute } = this;
    return (
      <>
        {this.activeJSX}
        {this.childrenRoutes.map((item) => (<div key={item.routePath} style={{ display: item === innerRoute ? '' : 'none' }}>{item.routeRender()}</div>))}
      </>
    );
  }

  title () {
    const { innerRoute } = this;
    return typeof innerRoute.title === 'function' ? innerRoute.title(this.route) : innerRoute.title;
  }

  needLogin () {
    return !this.innerRoute.loginIgnore;
  }

  private initRoutes (routes: Array<RouteConfig>) {
    const walkRoutes = (routes, paths, parentLayout) => {
      routes.forEach((route) => {
        const { path } = route;
        const pathsNext = paths.concat([ path ]);
        const pathsNextText = pathsNext.join('/').replace(/\/+/g, '/');
        const layout = route.layout === null ? null : (route.layout || parentLayout);
        route.routeLayout = layout || {};
        if (route.children) {
          walkRoutes(route.children, pathsNext, layout);
        }

        // 非页面级别的路由配置项
        if (typeof route.redirect === 'undefined' && !route.page && !route.render && !route.lazy) {
          return;
        }

        // 生产路由地址
        route.routePath = pathsNextText;

        // 判断是动态还是静态路径的路由
        if (/:/.test(pathsNextText)) {
          this.dynamicRoutes.push(route);
          route.pathMatch = match(route.routePath);
        } else {
          this.staticRoutes[pathsNextText] = route;
        }

        // 路由缓存
        const { keepAlive } = route;
        if (keepAlive) {
          route.keepAliveMatchs = (Array.isArray(keepAlive) ? keepAlive : [ keepAlive ]).map((item) => match(item));
        }

        if (route.render) {
          route.routeRender = route.render;
        } else if (route.page) {
          route.routeRender = route.page;
        }
      });
    };

    walkRoutes(routes, [ '' ], null);
  }

  private async routerEnter (history) {
    this.routeUpdate(history);

    const { innerRoute } = this;

    this.activeJSX = null;

    if (this.isRedirect()) {
      const { redirect } = innerRoute;
      let queryString;
      let redirectTo;

      const typeofRedirect = typeof redirect;

      if (typeofRedirect === 'object') {
        const { path, query } = redirect;
        if (query === true) {
          queryString = queryStringify(this.route.query);
        } else if (typeof query === 'function') {
          queryString = queryStringify(query(this.route.query));
        } else {
          queryString = queryStringify(query);
        }
        redirectTo = path + (queryString ? `?${queryString}` : '');
      } else if (typeofRedirect === 'function') {
        redirectTo = redirect(this.route.query);
      } else {
        redirectTo = redirect;
      }

      this.activeJSX = <Redirect to={redirectTo} />;
      return;
    }

    // 执行拦截器
    if (this.beforeRoute) {
      const activeJSX = await this.beforeRoute(this);

      if (activeJSX) {
        this.activeJSX = activeJSX;
        return;
      }
    }

    if (this.notFound()) {
      this.activeJSX = <div>PAGE404</div>;
    }

    const keepAliveRoutes = this.keepAliveRoutes.filter((item) => {
      if (innerRoute === item) {
        return false;
      }

      // 符合keepAlive的组件继续保持
      return item.keepAliveMatchs.some((match) => match(innerRoute.routePath));
    });

    const childrenRoutes = [ ...keepAliveRoutes ];

    // 不是从拦截器中返回的节点，则进行保存
    if (innerRoute.keepAliveMatchs) {
      keepAliveRoutes.push(innerRoute);
    }

    childrenRoutes.push(innerRoute);

    // 异步加载
    if (!innerRoute.routeRender) {
      const FC = (await innerRoute.lazy()).default;
      innerRoute.routeRender = () => <FC />;
    }

    this.keepAliveRoutes = keepAliveRoutes;
    this.childrenRoutes = childrenRoutes;
  }

  private routeUpdate (history) {
    const { location } = history;
    const { pathname } = location;
    // 直接匹配
    let route: any = this.staticRoutes[pathname];
    let params: any = {};

    // 尝试从动态路由中进行匹配
    if (!route) {
      this.dynamicRoutes.some((item) => {
        const result = item.pathMatch(pathname);

        if (result) {
          route = item;
          params = result.params;
          return true;
        }
        return false;
      });
    }

    this.innerRoute = route;

    const query: {[key: string]: string} = {};

    // 解析查询参数
    if (location.search) {
      location.search.substr(1).split(/&/).forEach((item) => {
        const [ key, value ] = item.split('=');
        query[key] = value;
      });
    }

    if (route) {
      this.route = {
        path: route.routePath,
        layout: route.routeLayout,
        title: route.title,
        params,
        query,
      };
    } else {
      this.route = {
        path: pathname,
        params,
        layout: {},
        query,
      };
    }
  }

  private isRedirect () {
    return this.innerRoute && /^(string|object|function)$/.test(typeof this.innerRoute.redirect);
  }
}

export default Router;

function RenderRoute ({ router }) {
  const [ loading, loadingSet ] = useState(false);
  const [ routerStateLoading, routerStateLoadingSet ] = useState(true);
  const history = useHistory();
  const routePath = `${history.location.pathname}?${history.location.search}`;
  const { Layout } = router;

  useEffect(() => {
    if (!router.routerState) {
      router.setState({
        hasLogin: true,
        hasAuth: true,
      });
      routerStateLoadingSet(false);
    }
  }, []);

  useEffect(() => {
    if (routerStateLoading) {
      return;
    }

    loadingSet(true);
    router.routerEnter(history)
      .finally(() => {
        loadingSet(false);
      });
  }, [ routePath, routerStateLoading ]);

  router.routerState && router.routerState({
    setState (nextState) {
      router.setState(nextState);
      routerStateLoadingSet(false);
    },
  });

  let content;


  if (routerStateLoading) {
    content = <div style={{ minHeight: '600px' }}>&nbsp;</div>;
  } else if (Layout) {
    content = <Layout render={router.renderPage} layout={router.getLayout()} />;
  } else {
    content = router.renderPage();
  }

  console.info({
    routerStateLoading, routePath, content,
  });
  return (
    <Spin spinning={loading || routerStateLoading} size="large">
      {content}
    </Spin>
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
