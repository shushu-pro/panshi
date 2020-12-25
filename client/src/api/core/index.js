import { message } from 'antd';
import easyapi from '@shushu.pro/easyapi';
import adapter from '@shushu.pro/adapter';


export default function createAPI ({ env, baseURL, configs }) {
  return easyapi({
    env,
    baseURL,
    configs,
    errorIgnore: true,
    resolve: (responseObject) => responseObject.data.data,

    // 请求拦截器
    request (config) {
      // 请求数据转化
      const {
        requestData,
        easymock,
      } = config.meta;
      if (typeof requestData === 'function') {
        config.sendData = requestData(config.sendData);
      } else if (requestData && typeof requestData === 'object') {
        config.sendData = adapter(requestData, config.sendData);
      }
      // 开启连接在线mock接口
      if (env === 'development' && easymock === true && !/^\/?mockapi\//.test(config.meta.url)) {
        config.meta.url = (`/mockapi/${config.meta.url}`).replace(/\/+/g, '/');
      }
    },

    // 响应拦截器
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

      if (code === 1008) {
        throw Error('NO-LOGIN');
      }

      if (code !== 0) {
        throw Error(data.message);
      }
    },

    // 正确响应拦截器
    success (config) {
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

    // 错误响应拦截器
    failure (config) {
      if (config.meta.preventDefaultError) {
        return;
      }

      if (config.error.message === 'NO-LOGIN') {
        // return window.alert('登录失效');
      }
      if (!config.meta.ignoreErrorMessage) {
        message.error(config.error.message);
      }
    },
  });
}
