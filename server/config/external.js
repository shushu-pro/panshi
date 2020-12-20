// 排除被打包进来的包
// ['lodash']

export default (id, parentId) => {
  if (external.includes(id) || /\/panshirc$/.test(id)) {
    return true
  }
  return false
}

const external = [
  '@koa/router',
  '@shushu.pro/datax',
  '@shushu.pro/mockv',
  '@shushu.pro/adapter',
  'fs-extra',
  'koa',
  'koa-body',
  'koa-bodyparser',
  'koa-router',
  'koa-send',
  'koa-session2',
  'md5',
  'path-to-regexp',
  'sqlite',
  'sqlite3',
  'koa2-connect-history-api-fallback',
  'fs',
  'path',
]
