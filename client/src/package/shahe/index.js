// 全局事件监听
export default {
  listen,
  send,
  leave,
};

const events = {};

function listen (type, handler, who) {
  if (!events[type]) {
    events[type] = [];
  }
  events[type].push({ who, handler });
}

function send (type, ...args) {
  const queue = events[type];
  queue && queue.forEach((item) => item.handler(...args));
}

function leave (who) {
  for (const type in events) {
    const queue = events[type];
    if (queue.length > 0) {
      events[type] = queue.filter((item) => item.who !== who);
    }
  }
}
