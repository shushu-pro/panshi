import config from '../config'
import history from 'koa2-connect-history-api-fallback'

const { fallback } = config.server

const middleware =
    fallback === true
      ? history()
      : (typeof fallback === 'object'
        ? history(fallback)
        : async (ctx, next) => await next()
      )

export default middleware
