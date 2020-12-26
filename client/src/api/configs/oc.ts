import Configs from './Configs';

const configs: Configs = {
  product: {
    list: {
      url: 'oc/product/list',
    },
    create: {
      method: 'post',
      url: 'oc/product/create',
    },
    delete: {
      method: 'post',
      url: 'oc/product/delete',
    },
  },

  spec: {
    type: {
      list: {
        url: 'oc/spec/type/list',
      },
      create: {
        method: 'post',
        url: 'oc/spec/type/create',
      },
      modify: {
        method: 'post',
        url: 'oc/spec/type/modify',
      },
      delete: {
        method: 'post',
        url: 'oc/spec/type/delete',
      },
    },
    value: {
      list: {
        url: 'oc/spec/value/list',
      },
      create: {
        method: 'post',
        url: 'oc/spec/value/create',
      },
      modify: {
        method: 'post',
        url: 'oc/spec/value/modify',
      },
    },
  },
};

export default configs;
