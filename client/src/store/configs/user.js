export default {
  state: {
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    name: '张三',
  },

  reducer: {
    setInfo (state, payload) {
      return { ...payload };
    },
  },

  effect: {
    async setInfo (payload, context) {
      context.dispatch('user.setInfo', payload);
    },
    async login (payload, context) {
      api.user.login().then((data) => {
        context.dispatch('user.setInfo', payload);
      });
    },
    async logout () {
      console.info('logout');
    },
  },
};
