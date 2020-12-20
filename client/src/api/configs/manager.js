export default {

  user: {
    list: {
      url: 'manager/user/list',
    },

    role: {
      list: {
        url: 'manager/user/role/list',
      },
      modify: {
        method: 'post',
        url: 'manager/user/role/modify',
      },
    },

    create: {
      method: 'post',
      url: 'manager/user/create',
    },

    modify: {
      method: 'post',
      url: 'manager/user/modify',
    },

    password: {
      reset: {
        method: 'post',
        url: 'manager/user/password/reset',
      },
    },

    disabled: {
      method: 'post',
      url: 'manager/user/disabled',
    },

    delete: {
      method: 'post',
      url: 'manager/user/delete',
    },
  },

  role: {
    list: {
      url: 'manager/role/list',
    },

    create: {
      method: 'post',
      url: 'manager/role/create',
    },


    modify: {
      method: 'post',
      url: 'manager/role/modify',
    },

    delete: {
      method: 'post',
      url: 'manager/role/delete',
    },

    function: {
      list: {
        url: 'manager/role/function/list',
      },
      group: {
        list: {
          url: 'manager/role/function/group/list',
        },
      },
      modify: {
        method: 'post',
        url: 'manager/role/function/modify',
      },
    },
  },

  module: {
    list: {
      url: 'manager/module/list',
    },
    detail: {
      url: 'manager/module/detail',
    },
    create: {
      method: 'post',
      url: 'manager/module/create',
    },
    modify: {
      method: 'post',
      url: 'manager/module/modify',
    },
    delete: {
      method: 'post',
      url: 'manager/module/delete',
    },

    function: {
      list: {
        url: 'manager/module/function/list',
      },
      create: {
        method: 'post',
        url: 'manager/module/function/create',
      },
      modify: {
        method: 'post',
        url: 'manager/module/function/modify',
      },
      delete: {
        method: 'post',
        url: 'manager/module/function/delete',
      },

      group: {
        list: {
          url: 'manager/module/function/group/list',
        },
        create: {
          method: 'post',
          url: 'manager/module/function/group/create',
        },
        modify: {
          method: 'post',
          url: 'manager/module/function/group/modify',
        },
        delete: {
          method: 'post',
          url: 'manager/module/function/group/delete',
        },
      },
    },
  },
};
