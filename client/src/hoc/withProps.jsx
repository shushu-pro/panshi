
import React from 'react';
import { connect, getState } from '@/package/haima';

export default withProps;

// 注入常用的一些模式
function withProps ({ mapState, mapDispatch, auth } = {}) {
  return (Component) => {
    let ComponentNext = Component;

    if (auth) {
      ComponentNext = withAuth()(ComponentNext);
    }

    if (mapState || mapDispatch) {
      ComponentNext = connect(mapState, mapDispatch)(ComponentNext);
    }

    return (props) => <ComponentNext {...props} />;
  };
}

// 注入权限判断方法
function withAuth () {
  return (Component) => {
    const localProps = {
      auth: { has: (symbol) => getState().user.auths.includes(symbol) },
    };
    return (props) => <Component {...{ props, ...localProps }} />;
  };
}
