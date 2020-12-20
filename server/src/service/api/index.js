import { all, get, insert, run, update, exec } from '@db'
import DataX from '@shushu.pro/datax'
import { match } from 'path-to-regexp'
import history from '@/service/history'

export default {
  async list ({ appId, page, pageSize }) {
    pageSize = Math.min(pageSize, 100)

    const list = await all(`
      SELECT *  FROM api WHERE appId = ${appId}
    `)
    return { total: list.list, page: Number(page), pageSize, list }
  },

  detail: apiDetail,

  // 创建接口
  async create ({ path, name, method, reqContextType, reqData, resData, appId, categoryId, operator }) {
    // 获取链表尾
    const tailRecord = await get(`
        SELECT id FROM api WHERE appId=${appId} AND nextId IS NULL
    `)

    // 没有节点，直接插入数据
    if (!tailRecord) {
      const { lastID } = await insert('api', {
        path, name, method, reqContextType, reqData, resData, appId, categoryId,
      })

      await history.api.create({ apiId: lastID, operator })

      return lastID
    }

    const tailId = tailRecord.id
    try {
      await run('BEGIN;')
      const { lastID } = await insert('api', {
        path,
        name,
        method,
        reqContextType,
        reqData,
        resData,
        appId,
        categoryId,
        prevId: tailId,
      })
      await run(`
            UPDATE api SET nextId=${lastID} WHERE id=${tailId};
        `)
      await run('COMMIT;')
      await history.api.create({ apiId: lastID, operator })
      updateMatchs({ id: lastID, type: 'add', value: path, method })
      return lastID
    } catch (e) {
      await run('ROLLBACK')
      throw e
    }
  },

  // 修改接口
  async modify ({ id, path, name, method, description, reqContextType, reqData, resData, categoryId, operator }) {
    const apiDataBefore = await apiDetail({ id })
    const { changes } = await update('api', {
      path, name, method, reqContextType, reqData, resData, categoryId, description: description || null,
    }, `WHERE id = ${id}`)

    if (changes) {
      await history.api.modify({ apiId: id, operator, typeData: JSON.stringify({ apiDataBefore, apiDataAfter: await apiDetail({ id }) }) })
    }

    if (path) {
      updateMatchs({ id, type: 'update', value: path, method })
    }
  },

  // 删除接口
  async delete ({ id, operator }) {
    const selfRecord = await get(`
      SELECT * FROM api WHERE id=${id}
  `)

    if (selfRecord) {
      await history.api.delete({ apiId: id, operator, apiData: JSON.stringify(selfRecord) })
    }

    const sqlExpression = [ 'BEGIN;', `DELETE FROM api WHERE id=${id};` ]
    // 需要改变它的nextId
    if (selfRecord.prevId) {
      sqlExpression.push(`UPDATE api SET nextId=${selfRecord.nextId || 'NULL'} WHERE id=${selfRecord.prevId};`)
    }
    // 需要改变它的prevId
    if (selfRecord.nextId) {
      sqlExpression.push(`UPDATE api SET prevId=${selfRecord.prevId || 'NULL'} WHERE id=${selfRecord.nextId};`)
    }
    sqlExpression.push('COMMIT;')
    await exec(sqlExpression.join('\n'))
    updateMatchs({ id, type: 'remove' })
  // await run(`
  //     DELETE FROM api WHERE id = ${id}
  // `)
  },

  // 接口搜索
  async search ({ appId, value }) {
    const data = await all(`
      SELECT id,name FROM api WHERE appId = ${appId} AND (path LIKE "%${value}%" OR name LIKE "%${value}%")
  `)
    return data
  },

  updateMatchs,

  match: matchAPI,

}

// api请求路径匹配正则
const matchs = {}
let matchsReady = false

// 更新API映射关系
function updateMatchs ({ id, type = 'add', method, value }) {
  switch (type) {
    case 'add':
    case 'update': {
      matchs[id] = {
        method,
        path: value,
        match: match(value, { decode: decodeURIComponent }),
      }
      break
    }
    case 'remove': {
      delete matchs[id]
      break
    }
  }
}

// 匹配接口
async function matchAPI ({ path, method, appId }) {
  if (!matchsReady) {
    matchsReady = true
    const apis = await all(`SELECT * FROM api WHERE appId = ${appId}`)
    apis.forEach(api => {
      updateMatchs({ id: api.id, value: api.path, method: api.method })
    })
  }

  let apiId
  for (const id in matchs) {
    const { match, method: matchMethod } = matchs[id]
    if (match(path) && matchMethod === method) {
      apiId = Number(id)
      break
    }
  }
  if (apiId == null) {
    return
  }
  return get(`SELECT * FROM api WHERE id=${apiId}`)
}

async function apiDetail ({ id, fully }) {
  const data = await get(`
      SELECT * FROM api WHERE id = ${id}
  `)
  if (data && fully) {
    data.mockReqData = DataX.parse(data.reqData || '')
    data.mockReqDoc = DataX.document(data.reqData || '')
    data.mockResDoc = DataX.document(data.resData || '')
  }
  return data
}
