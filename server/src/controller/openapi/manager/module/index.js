import module from '@/service/module'
import moduleFunction from '@/service/function'

export default {
  list: {
    async dispatcher  ({ query: { page, pageSize } }) {
      return module.list({ page, pageSize })
    },
  },

  create: {
    method: 'post',
    async dispatcher ({ body: { label, symbol } }) {
      await module.create({ label, symbol })
    },
  },


  delete: {
    method: 'post',
    async dispatcher ({ body: { id } }) {
      await module.delete({ id })
    },
  },

  function: {
    list: {
      async dispatcher ({ query: { id } }) {
        return moduleFunction.list({ id })
      },
    },

    create: {
      method: 'post',
      async dispatcher ({ body: { moduleId, groupId, label, symbol } }) {
        return moduleFunction.create({ moduleId, groupId, label, symbol })
      },
    },

    delete: {
      method: 'post',
      async dispatcher ({ body: { id } }) {
        return moduleFunction.delete({ id })
      },
    },

    modify: {
      method: 'post',
      async dispatcher ({ body: { id, label, symbol } }) {
        await moduleFunction.modify({ id, label, symbol })
      },
    },

    group: {
      list: {
        async dispatcher ({ query: { id } }) {
          return moduleFunction.group.list({ id })
        },
      },

      create: {
        method: 'post',
        async dispatcher ({ body: { moduleId, parentId, label, symbol } }) {
          await moduleFunction.group.create({ moduleId, parentId, label, symbol })
        },
      },

      delete: {
        method: 'post',
        async dispatcher ({ body: { id } }) {
          await moduleFunction.group.delete({ id })
        },
      },

      modify: {
        method: 'post',
        async dispatcher ({ body: { id, label, symbol } }) {
          await moduleFunction.group.modify({ id, label, symbol })
        },
      },

    },

  },


}
