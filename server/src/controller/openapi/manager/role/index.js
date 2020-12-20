import role from '@/service/role'

export default {
  list: {
    async dispatcher () {
      return await role.list()
    },
  },

  create: {
    method: 'post',
    async dispatcher ({ body: { label } }) {
      await role.create({ label })
    },
  },

  modify: {
    method: 'post',
    async dispatcher ({ body: { id, label } }) {
      await role.modify({ id, label })
    },
  },

  delete: {
    method: 'post',
    async dispatcher ({ body: { id } }) {
      await role.delete({ id })
    },
  },

  function: {
    list: {
      async dispatcher ({ query: { id } }) {
        return role.function.list({ id })
      },
    },
    modify: {
      method: 'post',
      async dispatcher ({ body: { id, functionList } }) {
        await role.function.modify({ id, functionList })
      },
    },
  },

}
