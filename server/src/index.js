import Koa from 'koa'
import favicon from './koa-middleware/favicon'
import session from './koa-middleware/session'
import koaBody from './koa-middleware/koaBody'
import fallback from './koa-middleware/fallback'
import statics from './koa-middleware/statics'
import controller from './controller'
import config from './config'

const app = new Koa()
const { port } = config.server

app.use(favicon)
app.use(session)
app.use(koaBody)
app.use(controller)
app.use(fallback)
app.use(statics)

app.listen(port)
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
      console.info(`端口“${port}”被占用，请修改panshirc文件中的port字段然后重试`)
    }
  }).on('listening', () => {
    // eslint-disable-next-line no-console
    console.info(`server run at ${port}`)
  })
