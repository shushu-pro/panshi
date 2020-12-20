import { message } from 'antd';
import easyapi from '@shushu.pro/easyapi';
import adapter from '@shushu.pro/adapter';
import configs from './configs';
import './adapter';

const { baseURL } = process.env;
const { NODE_ENV } = process.env;

const api = easyapi({
  env: NODE_ENV,
  baseURL: `${baseURL}openapi/`,
  configs,
  configs2: {


    user: {
      login: {
        method: 'post',
        url: 'user/login',
      },
      alls: {
        url: 'user/alls',
        responseData: {
          $strict: false,
          list: {
            createTime: '#time',
          },
        },
      },
      create: {
        method: 'post',
        url: 'user/create',
      },

      modify: {
        method: 'post',
        url: 'user/modify',
      },
      resetPassword: {
        method: 'post',
        url: 'user/resetPassword',
      },

      role: {
        list: {
          url: 'user/role/list',
        },
        modify: {
          method: 'post',
          url: 'user/role/modify',
        },
      },
    },

    module: {
      list: {
        url: 'module/list',
      },
      create: {
        method: 'post',
        url: 'module/create',
      },
      delete: {
        method: 'post',
        url: 'module/delete',
      },
      functionGroup: {
        list: {
          url: 'module/functionGroup/list',
        },
        create: {
          method: 'post',
          url: 'module/functionGroup/create',
        },
        delete: {
          method: 'post',
          url: 'module/functionGroup/delete',
        },
        modify: {
          method: 'post',
          url: 'module/functionGroup/modify',
        },
      },
      function: {
        list: {
          url: 'module/function/list',
        },
        create: {
          method: 'post',
          url: 'module/function/create',
        },
        delete: {
          method: 'post',
          url: 'module/function/delete',
        },
        modify: {
          method: 'post',
          url: 'module/function/modify',
        },
      },
    },

    role: {
      list: {
        url: 'role/list',
      },

    },

    app: {
      all: {
        url: 'app/all',
      },
    },

  },
  errorIgnore: true,
  resolve: (responseObject) => responseObject.data.data,
  request (config) {
    // 请求数据转化
    const {
      requestData,
    } = config.meta;
    if (typeof request === 'function') {
      config.sendData = requestData(config.sendData);
    } else if (requestData && typeof requestData === 'object') {
      config.sendData = adapter(requestData, config.sendData);
    }
  },
  response (config) {
    // 二进制数据，直接返回
    if (config.responseObject.responseType === 'arraybuffer') {
      return;
    }

    // 对响应的数据做处理
    const {
      data,
    } = config.responseObject;
    const {
      code,
    } = data;

    if (code === 401) {
      throw Error('NO-LOGIN');
    }

    if (code !== 0) {
      throw Error(data.message);
    }
  },
  success (config) { // 正确响应处理器
    const {
      data,
    } = config.responseObject;
    const {
      responseData,
    } = config.meta;
    // 响应数据转化
    if (data.data) {
      const bizData = data.data;
      if (typeof responseData === 'function') {
        data.data = responseData(bizData);
      } else if (responseData && typeof responseData === 'object') {
        data.data = adapter(responseData, bizData);
      }
    }
  },
  failure (config) { // 错误响应处理器
    if (config.meta.preventDefaultError) {
      return;
    }

    // if (config.error.message === 'NO-LOGIN') {
    //   const loginURL = `${baseURL}login`;
    //   if (window.location.pathname !== loginURL) {
    //     window.location.href = loginURL;
    //   }
    //   return;
    // }
    if (!config.meta.errorMessageIgnore) {
      message.error(config.error.message);
    }
  },
});

const mockapi = easyapi({
  env: NODE_ENV,
  baseURL: `${baseURL}mockapi/`,
  configs: {
    send: {
      url: '',
    },
  },
  resolve: (responseObject) => responseObject.data,
  request (data, config) {
    // ..
  },
});

export default { api, mockapi };

export {
  api,
  mockapi,
};
