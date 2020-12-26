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

    request (config) {
      // 请求数据转化
      const {
        requestData,
      } = config.meta;
      if (typeof requestData === 'function') {
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
}
