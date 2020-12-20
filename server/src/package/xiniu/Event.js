class Event {
  constructor ({ route, ctx, next }) {
    this.route = route
    this.ctx = ctx
    this.next = next
    this.body = ctx.request.body
    this.query = ctx.request.query
    this.session = ctx.session
    this.params = route.pathMatch(ctx.request.url).params
  }

  data = null // 数据
  error = null // 错误

  setBody = (body) => {
    this.body = typeof body === 'function' ? body(this.body) : body
  }

  setQuery = (query) => {
    this.query = typeof query === 'function' ? query(this.query) : query
  }

  setRequestData = (data) => {
    const { route } = this
    const { method } = route
    if (/^GET$/i.test(method)) {
      this.setQuery(data)
    } else {
      this.setBody(data)
    }
  }

  setData = (data) => {
    this.error = null
    this.data = typeof data === 'function' ? data(this.data) : data
  }

  setError = (error) => {
    this.error = typeof error === 'string' ? Error(error) : error
  }

  throwError =(error, code) => {
    error = typeof error === 'string' ? Error(error) : error
    if (code) {
      error.code = code
    }
    throw error
  }
}

export default Event
