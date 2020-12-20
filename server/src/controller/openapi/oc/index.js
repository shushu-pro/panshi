import oc from '@/service/oc'

export default {
  product: {
    list: {
      async dispatcher () {
        return oc.product.list()
      },
    },
    create: {
      method: 'post',
      async dispatcher ({ body: { label, symbol } }) {
        await oc.product.create({ label, symbol })
      },
    },
    delete: {
      method: 'post',
      async dispatcher ({ body: { id } }) {
        await oc.product.delete({ id })
      },
    },
  },

  spec: {
    type: {
      list: {
        async dispatcher ({ query: { productId } }) {
          return oc.spec.type.list({ productId })
        },
      },
      create: {
        method: 'post',
        async dispatcher ({ body: { productId, parentId, type, label, symbol, fields } }) {
          await oc.spec.type.create({ productId, parentId, type, label, symbol, fields })
        },
      },
      modify: {
        method: 'post',
        async dispatcher ({ body: { specId, label, symbol } }) {
          await oc.spec.type.modify({ specId, label, symbol })
        },
      },
      delete: {
        method: 'post',
        async dispatcher ({ body: { id } }) {
          await oc.spec.type.delete({ id })
        },
      },
    },
    value: {
      list: {
        async dispatcher ({ query: { productId } }) {
          return oc.spec.value.list({ productId })
        },
      },
      create: {
        method: 'post',
        async dispatcher ({ body: { productId, specTypeId, parentId, label, symbol } }) {
          await oc.spec.value.create({ productId, specTypeId, parentId, label, symbol })
        },
      },
      delete: {
        method: 'post',
        async dispatcher ({ body: { id } }) {
          await oc.spec.value.delete({ id })
        },
      },
    },
  },

}
