import React, { useState } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import Router, { RouterOption } from './Router';

let activeRouter = null;

export default function createRouter (routerOption: RouterOption) {
  const router = activeRouter = new Router(routerOption);
  const RouterRender = router.render.bind(router);
  return () => (
    <BrowserRouter>
      <Route render={() => <RouterRender />} />
    </BrowserRouter>
  );
}

export {
  useRoute,
};

function useRoute () {
  return activeRouter.route;
}
