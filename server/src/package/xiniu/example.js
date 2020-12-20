import xiniu from './index'


export default xiniu({
  baseURL: '',
  // 路由配置项
  routes: {
    mockapi: {
      // ...
    },
    ppl: {
      async dispatcher ({ query, body }) {

      },
      method: 'post',
      auth: [ 'xxxx' ],
      requestAdapter: {

      },
      responseAdapter: {

      },
      errorAdapter ({ message }) {

      },
    },
    openapi: {
      // ...
    },
  },

  async authAccept ({ ctx, auths }) {
    const userAuths = ctx.session.auths
    if (auths.some(auth => userAuths.includes(auth))) {
      return true
    }
    return false
  },

  // 请求拦截器
  request (config) {

  },
  // 响应拦截器
  response () {

  },
  // 成功拦截器
  success (config) {


  },
  // 失败拦截器
  failure (config) {
    const { error } = config
    const { message } = error
  },
})
