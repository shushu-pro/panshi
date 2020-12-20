import Router from '@koa/router'
import Event from './Event'
import { match } from 'path-to-regexp'

export default xiniu

function xiniu ({ baseURL = '/', routes, authAccept, request, response, success, failure }) {
  const router = new Router({ prefix: '' })
  const nextRoutes = walkRoutes(routes, baseURL)

  nextRoutes.forEach((route) => {
    if (route.disabled) {
      return
    }

    const { method, path, dispatcher, auths } = route

    router[method](path,
      allIntercepter(
        authIntercepter(dispatcher, authAccept, auths),
        { request, response, success, failure, route },
      ),
    )
  })

  return router.routes()
}

// 收集路由信息
function walkRoutes (routes, baseURL) {
  const TYPE_CHILDREN_EXPAND = 1 // 继续展开子节点
  const TYPE_ROUTE_ADD = 2 // 添加路由
  const TYPE_PATH_POP = 3 // 弹出路径

  const nextRoutes = []

  const queue = Object.keys(routes).map(key => ({ type: TYPE_CHILDREN_EXPAND, key, children: routes[key] }))
  const paths = []
  while (queue.length) {
    const route = queue.shift()
    const { type, key } = route

    switch (type) {
      case TYPE_CHILDREN_EXPAND: {
        const { children } = route

        // 插入路径
        paths.push(key)

        // 解析子项
        const nextQueueItem = Object.keys(children).map(key => {
          const item = children[key]
          // 纯函数配置项，示例：{list:async function get(){}}
          if (typeof item === 'function') {
            return { type: TYPE_ROUTE_ADD, key, dispatcher: item, method: item.name }
          }

          if (typeof item === 'object') {
            // 包含dispatcher字段为函数的配置项，则是route配置项
            if (typeof item.dispatcher === 'function') {
              const { dispatcher, method = 'get', auths } = item
              return { ...item, type: TYPE_ROUTE_ADD, key, dispatcher, method, auths }
            }

            return { type: TYPE_CHILDREN_EXPAND, key, children: item }
          }
        })

        nextQueueItem.push({ type: TYPE_PATH_POP })
        queue.unshift(...nextQueueItem)
        break
      }

      case TYPE_ROUTE_ADD: {
        const { type, key, path, ...restRoute } = route
        const fullPath = baseURL + paths.concat(key).join('/')

        nextRoutes.push({
          path: fullPath,
          pathMatch: match(fullPath),
          ...restRoute,
        })
        break
      }

      case TYPE_PATH_POP: {
        paths.pop()
        break
      }
    }
  }

  return nextRoutes
}

// 权限拦截器
function authIntercepter (dispatcher, authAccept, auths) {
  // 拦截鉴权函数和权限配置都不存在，直接放开
  if (!authAccept || !auths) {
    return dispatcher
  }

  return async (ctx, next) => {
    if (authAccept({ ctx, auths })) {
      return dispatcher
    }
    const error = new Error('没有权限')
    error.type = 'NO_AUTH'
    throw error
  }
}

function allIntercepter (dispatcher, { request, response, success, failure, route }) {
  return async (ctx, next) => {
    // console.info({ route })
    const event = new Event({ route, ctx, next })

    await Promise.resolve()
      .then(() => {
        if (typeof request === 'function') {
          request(event)
        }
      })
      .then(() => dispatcher(event))
      .then((data) => {
        event.setData(data)
        if (typeof response === 'function') {
          response(event)
        }
      })
      .then(() => {
        if (typeof success === 'function') {
          success(event)
        }
      })
      .catch((err) => {
        event.setError(err)
        if (typeof failure === 'function') {
          failure(event)
        }
      })

    if (event.error) {
      console.error(event.error)
      const { code = 500, message = '服务器处理异常' } = event.error
      return ctx.body = { code, message }
    }

    if (ctx.body == null) {
      return ctx.body = { code: 0, data: event.data }
    }
  }
}
