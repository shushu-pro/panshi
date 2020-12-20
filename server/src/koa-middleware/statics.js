import send from 'koa-send'
import config from '../config'

const sendConfig = {
  root: config.server.static,
  index: 'index.html',
  maxage: 60000 * 24 * 365,
}

export default async function (ctx, next) {
  const path = ctx.path

  await send(ctx, path, sendConfig).catch(err => {
    if (err.code === 'ENOENT' && err.status === 404) {
      ctx.status = 404
      ctx.body = 'Not Fount'
    }
  })
}
