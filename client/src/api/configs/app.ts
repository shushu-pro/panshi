import Configs from './Configs';

const configs: Configs = {
  list: {
    url: 'app/list',
  },
  detail: {
    url: 'app/detail',
  },
  create: {
    method: 'post',
    url: 'app/create',
  },

  modify: {
    method: 'post',
    url: 'app/modify',
  },

  delete: {
    method: 'post',
    url: 'app/delete',
  },

  user: {
    list: {
      url: 'app/user/list',
    },
  },

  member: {
    list: {
      url: 'app/member/list',
    },

    add: {
      method: 'post',
      url: 'app/member/add',
    },

    remove: {
      method: 'post',
      url: 'app/member/remove',
    },

    modify: {
      method: 'post',
      url: 'app/member/modify',
    },

  },

  category: {
    list: {
      url: 'app/category/list',
      responseData: {
        list: {
          id: [ true, 'key' ],
          name: 'title',
          parentId: true,
        },
      },
    },

    create: {
      method: 'post',
      url: 'app/category/create',
    },

    modify: {
      method: 'post',
      url: 'app/category/modify',
      requestData: {
        $strict: false,
        categoryId: 'id',
      },
    },

    delete: {
      method: 'post',
      url: 'app/category/delete',
    },

    move: {
      method: 'post',
      url: 'app/category/move',
    },
  },

  api: {
    list: {
      url: 'app/api/list',
      responseData: {
        list: {
          id: [ true, 'key' ],
          name: 'title',
          categoryId: 'parentId',
          $increase: {
            $key: 'isLeaf',
            $value: () => true,
          },
        },
      },
    },
    create: {
      method: 'post',
      url: 'app/api/create',
    },
    modify: {
      method: 'post',
      url: 'app/api/modify',
    },
    delete: {
      method: 'post',
      url: 'app/api/delete',
      errorIgnore: false,
    },
    detail: {
      url: 'app/api/detail',
      responseData: {
        $strict: false,
        method: [ true, {
          $key: 'methodText',
          $enum: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTION' ],
        } ],
        mockReqDoc: {
          key: [ true, 'name' ],
          types: [ {
            $value: (value) => value.filter((item) => item !== 'null'),
          },
          {
            $key: 'required',
            $value: (value) => (value.includes('null') ? '否' : '是'),
          },
          ],
          $increase: {
            $key: 'defaultValue',
            $value: () => '-',
          },
          description: true,
        },
        mockResDoc: true,
      },
      // mock (data) {
      //   return {
      //     code: 0,
      //     data: {
      //       apiId: data.apiId,
      //       name: '接口名称',
      //       path: 'jjhjhj',
      //       method: 0,
      //       methodText: 'GET',
      //     },
      //   };
      // },
    },
  },
};

export default configs;
