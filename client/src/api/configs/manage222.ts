export default {
  user: {
    list: {
      url: 'manage/user/list',
    },

    detail: {
      url: 'manage/user/detail',
    },

    create: {
      method: 'post',
      url: 'manage/user/create',
    },

    modify: {
      method: 'post',
      url: 'manage/user/modify',
    },

    delete: {
      method: 'post',
      url: 'manage/user/delete',
    },


    password: {
      reset: {
        method: 'post',
        url: 'manage/user/password/reset',
      },
    },

    role: {
      list: {
        url: 'manage/user/role/list',
      },
      modify: {
        method: 'post',
        url: 'manage/user/role/modify',
      },
    },

  },
  role: {


    permission: {
      list: {
        url: 'manage/role/permission/list',
      },
      modify: {
        method: 'post',
        url: 'manage/role/permission/modify',
      },
    },

  },
};
