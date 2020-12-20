import adapter from './adapter'
import openapi from './openapi'
import mockapi from './mockapi'
import config from '@/config'
import xiniu from '@/package/xiniu/'

export default xiniu({
  baseURL: config.server.baseURL,
  routes: {
    openapi,
    mockapi,
  },
  request ({ route, session, throwError, setRequestData }) {
    // 非免登接口，非登录用户
    if (!route.loginIgnore && !session.userId) {
      throwError('用户未登录', 401)
    }

    const { requestData } = route

    // 请求拦截器
    if (typeof requestData === 'function') {
      setRequestData((prevData) => {
        return requestData(prevData)
      })
    } else if (typeof requestData === 'object') {
      setRequestData((prevData) => {
        return adapter(requestData, prevData)
      })
    }
  },
  response (event) {

  },
  success (event) {
    const { responseData } = event.route

    // 成功拦截器
    if (typeof responseData === 'function') {
      event.setData((prevData) => {
        return responseData(prevData)
      })
    } else if (typeof responseData === 'object') {
      event.setData((prevData) => {
        return adapter(responseData, prevData)
      })
    }
  },
  failure (event) {

  },
})
