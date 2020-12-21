import './com';
import render from './app';

render();

// Webpack Hot Module Replacement API
if (module.hot) {
  // module.hot.accept()
  module.hot.accept('./app', () => {
    try {
      render();
    } catch (e) {
      console.error(e);
    }
  });
}
