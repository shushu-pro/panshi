
import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Router, { RouterConfig } from './Router';


let activeRouter = null;

export default function createRouter (routerConfig: RouterConfig) {
  const router = activeRouter = new Router(routerConfig);

  return () => (
    <BrowserRouter>
      <Route render={() => router.renderLayout()} />
    </BrowserRouter>
  );
}

export {
  useRoute,
};

function useRoute () {
  return activeRouter.route;
}
