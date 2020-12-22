
export type KeyValue = Record<string, string>;

export type LayoutConfig = {
  header?: boolean;
  sidebar?: boolean;
}

// 输出的路由信息
export type RouterRoute = {
  path: string;
  layout: LayoutConfig;
  title?: string | ((route: RouterRoute) => string); // 标题
  params: KeyValue;
  query: KeyValue;
}

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

export type RoutesConfig = Array<RouteConfig>;
