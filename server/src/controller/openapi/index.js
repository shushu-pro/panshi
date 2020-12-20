import user from './user'
import manager from './manager'
import app from './app'
import history from './history'
import oc from './oc'

export default {
  // 自动登录
  // '(.*)': {
  //   method: 'all',
  //   loginIgnore: true,
  //   async dispatcher ({ ctx, next }) {
  //     ctx.session.userId = 1
  //     ctx.session.name = 'admin'
  //     await next()
  //   },
  // },

  user,
  manager,
  app,
  history,
  oc,

  // 404拦截
  '(.*.*)': {
    method: 'all',
    loginIgnore: true,
    async dispatcher ({ throwError }) {
      throwError('接口未定义', 404)
    },
  },
}
