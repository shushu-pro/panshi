

export default {
  login: {
    method: 'post',
    url: 'user/login',
  },

  logout: {
    method: 'post',
    url: 'user/logout',
  },

  info: {
    url: 'user/info',
    errorMessageIgnore: true,
  },

  password: {
    modify: {
      method: 'post',
      url: 'user/password/modify',
    },
  },

  list: {
    url: 'user/list',
  },

  role: {
    list: {
      url: 'user/role/list',
    },
  },

  favorite: {
    api: {
      enabled: {
        url: 'user/favorite/api/enabled',
      },
      add: {
        method: 'post',
        url: 'user/favorite/api/add',
      },
      remove: {
        method: 'post',
        url: 'user/favorite/api/remove',
      },
    },
  },

  message: {
    api: {
      list: {
        url: 'user/message/api/list',
      },
      delete: {
        method: 'post',
        url: 'user/message/api/delete',
      },
    },
  },
};
