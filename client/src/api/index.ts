import easyapi from '@shushu.pro/easyapi';
import configs from './configs';
import createAPI from './core/index';
import './adapter';

const { baseURL } = process.env;
const { NODE_ENV } = process.env;

const api = createAPI({
  env: NODE_ENV,
  baseURL: `${baseURL}openapi/`,
  configs,
});

const mockapi = easyapi({
  baseURL: `${baseURL}mockapi/`,
  configs: {
    send: {
      url: '',
    },
  },
  resolve: (responseObject) => responseObject.data,
  request (config) {
    // ..
  },
});

export default { api, mockapi };

export {
  api,
  mockapi,
};
