export default async function (ctx, next) {
  if (ctx.path === '/favicon.ico') {
    return ctx.res.end()
  }
  await next()
}
