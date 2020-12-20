export default {
  state: {
    formData: {
      xo: '初始值',
    },
  },
  reducer: {
    formDataSet (prevState, payload) {
      return {
        formData: {
          ...payload,
        },
      };
    },
  },

  effect: {
    async resetFormData (payload, context) {
      await new Promise((resolve) => {
        setTimeout(() => {
          context.dispatch('example.formDataSet', { xo: '111' });
          resolve();
        }, 1000);
      });

      await new Promise((resolve) => {
        setTimeout(() => {
          context.dispatch('example.formDataSet', { xo: '初始值' });
          resolve();
        }, 1000);
      });
    },
  },
};
