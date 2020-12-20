import mockv from '@shushu.pro/mockv'
import md5 from 'md5'
import user from '@/service/user'

export default {
  list: {
    async dispatcher () {
      return user.list()
    },
    responseData: {
      $strict: false,
      list: {
        createTime: '#time',
      },
    },
  },

  role: {
    list: {
      async dispatcher ({ query: { userId } }) {
        return await user.role.list({ userId })
      },
    },
    modify: {
      method: 'post',
      async dispatcher ({ body: { userId, roles } }) {
        await user.role.modify({ userId, roles })
      },
    },
  },

  create: {
    method: 'post',
    async dispatcher ({ body: { user: userId, nick } }) {
      const password = await user.create({ user: userId, nick })
      return { password }
    },
  },

  modify: {
    method: 'post',
    async dispatcher ({ body: { id, nick } }) {
      await user.modify({ id, nick })
    },
  },

  password: {
    reset: {
      method: 'post',
      async dispatcher ({ body: { id } }) {
        const password = mockv.string(12)
        await user.password.reset({ userId: id, password })
        return { password }
      },
    },
  },

  disabled: {
    method: 'post',
    async dispatcher ({ body: { id, enabled } }) {
      await user.modify({ id, enabled })
    },
    requestData: {
      id: true,
      state: { $key: 'enabled', $value: (state) => Number(!state) },
    },
  },

  delete: {
    method: 'post',
    async dispatcher ({ body: { id } }) {
      await user.delete({ id })
    },
  },

}
