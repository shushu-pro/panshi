import mockv from '@shushu.pro/mockv'
import md5 from 'md5'
import user from '@/service/user'
import message from '@/service/message'
export default {

  login: {
    method: 'post',
    async dispatcher ({ body, session }) {
      const { user: userId, password } = body
      const data = await user.login({ userId, password })

      if (!data) {
        throw Error('登录失败，请检查用户名或密码是否正确！')
      }

      session.userId = data.id
      session.user = data.user

      return data
    },
    loginIgnore: true,
  },

  logout: {
    method: 'post',
    async dispatcher ({ session }) {
      session.userId = null
      session.name = null
    },
  },

  info: {
    async dispatcher ({ session: { userId }, throwError }) {
      if (userId == null) {
        throwError('用户未登录', 401)
      }
      return user.info({ userId })
    },
  },

  password: {
    modify: {
      method: 'post',
      async dispatcher ({ body: { password, passwordNext }, session: { userId } }) {
        await user.password.modify({ userId, password, passwordNext })
      },
    },
  },

  favorite: {
    api: {
      enabled: {
        async dispatcher ({ query: { apiId }, session: { userId } }) {
          return user.favorite.api.enabled({ userId, apiId })
        },
      },
      add: {
        method: 'post',
        async dispatcher ({ body: { apiId }, session: { userId } }) {
          await user.favorite.api.add({ userId, apiId })
        },
      },
      remove: {
        method: 'post',
        async dispatcher ({ body: { apiId }, session: { userId } }) {
          await user.favorite.api.remove({ apiId, userId })
        },
      },
      list: {
        async dispatcher ({ query: { userId } }) {
          return message.list({ userId })
        },
      },
    },
  },

  message: {
    api: {
      list: {
        async dispatcher ({ session: { userId } }) {
          return message.list({ userId })
        },
      },
      delete: {
        method: 'post',
        async dispatcher ({ body: { id }, session: { userId } }) {
          await message.delete({ id, userId })
        },
      },
    },

  },

  // list: {
  //   async dispatcher () {
  //     return { list: await user.list() }
  //   },
  //   responseData: {
  //     $strict: false,
  //     list: {
  //       createTime: '#time',
  //     },
  //   },
  // },

  // async list () {

  // },

  // async detail () {

  // },

  // role: {
  //   list: {
  //     async dispatcher ({ session: { userId } }) {
  //       return { list: await user.role.list({ userId }) }
  //     },
  //   },

  //   // async modify () {

  //   // },
  // },

  // async auths () {

  // },

  // app: {
  //   async list () {

  //   },

  //   add: {
  //     async apply () {

  //     },
  //   },

  //   async remove () {

  //   },
  // },

  // project: {
  //   async list () {

  //   },
  // },

  // favorite: {
  //   api: {
  //     async list () {

  //     },
  //   },
  // },

  // create: {
  //   method: 'post',
  //   async dispatcher ({ body: { name, nick } }) {
  //     const password = await user.create({ name, nick: nick || name })
  //     return { password }
  //   },
  // },

  // modify: {
  //   method: 'post',
  //   async dispatcher ({ body: { id, nick } }) {
  //     await user.modify({ id, nick })
  //   },
  // },


  // password: {
  //   reset: {
  //     method: 'post',
  //     async dispatcher ({ body: { id } }) {
  //       const password = mockv.string(12)
  //       await user.modify({ id, password: md5(password) })
  //       return { password }
  //     },
  //   },
  // },

  // disabled: {
  //   method: 'post',
  //   async dispatcher ({ body: { id, enabled } }) {
  //     await user.modify({ id, enabled })
  //   },
  //   requestData: {
  //     id: true,
  //     state: { $key: 'enabled', $value: (state) => Number(!state) },
  //   },
  // },

  // delete: {
  //   method: 'post',
  //   async dispatcher ({ body: { id } }) {
  //     await user.delete({ id })
  //   },
  // },
}
