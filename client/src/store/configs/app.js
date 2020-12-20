export default {
  state: {
    count: 2233,
  },
  reducer: {
    increase ({ count }) {
      return { count: count + 1 };
    },
    setCount (nil, nextCount) {
      return { count: nextCount };
    },
  },
  effect: {
    async setDoubleIncrease (payload, context) {
      console.info(context.getState());
      context.dispatch('app.increase');
      context.dispatch('app.increase');
      console.info(context.getState('app.count'));
    },
  },
};
