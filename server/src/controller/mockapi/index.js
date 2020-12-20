// import jsonsql from '@smartx/jsonsql'
import api from '@/service/api'
import DataX from '@shushu.pro/datax'

const METHOD_NUM = { GET: 0, POST: 1, PUT: 2, DELETE: 3, OPTION: 4 }

export default {
  // '(.*)': {
  //   method: 'all',
  //   loginIgnore: true,
  //   async dispatcher ({ ctx, next }) {
  //     ctx.session.userId = 1
  //     ctx.session.name = 'admin'
  //     await next()
  //   },
  // },

  ':appId/(.*)': {
    method: 'all',
    loginIgnore: true,
    async dispatcher ({ ctx }) {
      const method = METHOD_NUM[ctx.method]
      const { appId, 0: path } = ctx.params

      if (!appId) {
        return ctx.body = { code: 500, message: '接口所在项目不存在' }
      }

      const data = await api.match({ path: path, method, appId })

      if (data === undefined) {
        ctx.body = { code: 404, message: '接口未定义' }
        return
      }

      const { resData } = data
      const { query, body, header } = ctx.request
      const responseData = DataX.parse(resData || '', { $query: query, $body: body, $header: header })

      if (responseData.$error) {
        return { $error: responseData.$error.message }
      }

      return ctx.body = responseData
    },
  },

  '(.*.*)': {
    method: 'all',
    loginIgnore: true,
    async dispatcher ({ throwError }) {
      throwError('接口未定义', 404)
    },
  },
}
