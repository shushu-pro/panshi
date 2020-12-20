import { all, get, insert, update, exec, list, run } from '@db'
import history from '@/service/history'

export default {


  async list ({ page, pageSize, userId }) {
    let list
    if (userId) {
      list = await all(`
        SELECT id, name, description FROM appMember
        LEFT OUTER JOIN app
        ON appMember.appId=app.id
        WHERE appMember.userId=${userId}
    `)
    } else {
      list = await all(`
        SELECT id, name, description FROM app
      `)
    }

    return { list }
  },

  async detail ({ id }) {
    return get(`
        SELECT * FROM app WHERE id = ${id}
    `)
  },

  async  create ({ name, description, createUserId }) {
    await insert('app', {
      name, description, createTime: Date.now(), createUserId,
    })

    // const { appId } = await get('SELECT last_insert_rowid() as appId  FROM project')

    // await insert('projectFavorite', {
    //   appId, userId,
    // })
  },

  // 修改
  async  modify ({ id, name, description }) {
    await update('app', { name, description }, `WHERE id = ${id}`)
  },

  async delete ({ id }) {
    // const { total1 } = await get(`
    //     SELECT count(*) as total1 FROM  rolePermission WHERE rolePermission.moduleFunctionId=${id}
    // `)
    // if (total1) {
    //   throw Error('权限被使用，不能删除')
    // }

    // TODO:添加删除校验，不允许删除不空的应用

    const sqlExpression = [
      'BEGIN;',
      `DELETE FROM app WHERE id=${id};`,
    ]

    sqlExpression.push('COMMIT;')
    // console.info(sqlExpression.join('\n'))
    await exec(sqlExpression.join('\n'))
  },

  user: {
    async list () {
      return list({ tableName: 'user', keys: 'id, nick' })
    },
  },

  member: {
    async list ({ id }) {
      const list = await all(`
        SELECT
          id,
          user,
          nick
        FROM
          appMember
        LEFT OUTER JOIN user ON userId = user.id
        WHERE
          appId = ${id}
      `)
      return { list }
      // return list({ tableName: 'appMember', keys: 'userId', filters: { id } })
    },


    async modify ({ appId, memberList }) {
      const sqlExpression = [
        'BEGIN;',
      ]

      if (memberList.length === 0) {
        sqlExpression.push(`
          DELETE FROM appMember WHERE appId=${appId};
        `)
      } else {
        sqlExpression.push(`
            DELETE FROM appMember WHERE userId NOT IN (${memberList.join(',')}) AND appId=${appId};
          `)
        sqlExpression.push(...memberList.map((userId) => {
          return `
              REPLACE INTO appMember (appId, userId)
              VALUES (${appId}, ${userId});
            `
        }))
      }

      sqlExpression.push('COMMIT;')
      // console.info(sqlExpression.join('\n'))

      await exec(sqlExpression.join('\n'))
    },

    async remove ({ id }) {
      await exec(`DELETE FROM appMember WHERE userId=${id};`)
    },
  },

  category: {
    async list ({ appId, parentId = 'NULL' }) {
      const rs = await all(`
        SELECT * FROM appCategory WHERE appId=${appId}
      `)

      const lg = rs.length
      if (lg === 0) {
        return { list: [] }
      }

      // previousId 实现链表指针关联
      const map = {}
      for (let i = 0; i < lg; i++) {
        const item = rs[i]
        map[item.id] = item
      }

      rs.forEach(item => {
        item.next = map[item.nextId]
        delete map[item.nextId]
      })
      // 剩下没被使用的就是最后一个节点了
      for (const key in map) {
        const newRs = []
        let pointer = map[key]
        while (pointer) {
          newRs.push(pointer)
          const cur = pointer
          pointer = pointer.next

          // 断开链表，回收无用属性
          cur.next = undefined
          cur.prevId = undefined
          cur.nextId = undefined
        }
        return { list: newRs }
      }

      /* const rs = await all(`
                SELECT * FROM category WHERE appId=${appId} AND ${parentId === 'NULL' ? 'parent_id IS NULL' : `parent_id = ${parentId}`}
            `) */
      // console.info(`SELECT * FROM category WHERE ${parentId === 'NULL' ? 'parent_id IS NULL' : `parent_id = ${parentId}`}`, rs)
      // return rs
    },

    async create ({ appId, name, parentId }) {
      const tailCate = await get(`
          SELECT id FROM appCategory WHERE appId=${appId} AND nextId IS NULL
      `)

      // 没有节点，直接插入数据
      if (!tailCate) {
        return insert('appCategory', { appId, name, parentId })
      }

      const tailCateId = tailCate.id
      try {
        await run('BEGIN;')
        const { lastID } = await insert('appCategory', { appId, name, parentId, prevId: tailCateId })
        await run(`
            UPDATE appCategory SET nextId=${lastID} WHERE id=${tailCateId};
        `)
        await run('COMMIT;')
      } catch (e) {
        await run('ROLLBACK')
        throw e
      }

      // await insert('category', { appId, name, parentId })
    },

    async modify ({ id, name, parentId }) {
      await update('appCategory', { name, parentId }, `WHERE id = ${id}`)
    },

    async delete ({ id }) {
      const cateSelf = await get(`
        SELECT prevId, nextId FROM appCategory WHERE id=${id}
      `)

      const sqlExpression = [
        'BEGIN;',
        `DELETE FROM appCategory WHERE id=${id} OR parentId = ${id};`, // 删除分类
        `UPDATE api SET categoryId=NULL WHERE categoryId=${id};`, // 将所有接口的分类移除
      ]
      // 需要改变它的nextId
      if (cateSelf.prevId) {
        sqlExpression.push(`
            UPDATE appCategory SET nextId=${cateSelf.nextId || 'NULL'} WHERE id=${cateSelf.prevId};
        `)
      }
      // 需要改变它的prevId
      if (cateSelf.nextId) {
        sqlExpression.push(`
            UPDATE appCategory SET prevId=${cateSelf.prevId || 'NULL'} WHERE id=${cateSelf.nextId};
        `)
      }
      sqlExpression.push('COMMIT;')
      // console.info(sqlExpression.join('\n'))
      await exec(sqlExpression.join('\n'))

      // await run(`
      //     DELETE FROM category WHERE id = ${id} OR parentId = ${id}
      // `)
    },

    async move ({ appId, targetId, selfId, operator }) {
      // 获取self记录，取得变量self.id, self.prevId, self.nextId
      // 获取target记录，获取变量target.id, target.nextId

      // 变更self.prev的nextId为self.nextId
      // 变更self.next的prevId为self.prevId
      // 变更self.prevId为target.id
      // 变更self.nextId为target.nextId
      // 变更target.nextId为self.id
      // 变更target.next.prevId为self.id

      let apiSelfId
      let apiTargetId
      let cateSelfId
      let cateTargetId
      let apiMove = false
      let cateMove = false

      // 移动API
      if (selfId.includes('#')) {
        apiSelfId = selfId.substr(1)
      } else if (selfId.includes('-')) {
        ([ cateSelfId, apiSelfId ] = selfId.split('-'))
      } else {
        cateSelfId = selfId
      }

      if (targetId.includes('#')) {
        apiTargetId = targetId.substr(1)
      } else if (targetId.includes('-')) {
        ([ cateTargetId, apiTargetId ] = targetId.split('-'))
      } else {
        cateTargetId = targetId
      }

      // 1. 仅移动分类
      // 2. 仅移动API
      // 3. 改变API分类，并进行移动

      if (apiSelfId !== apiTargetId) {
        apiMove = true
      }

      if (cateSelfId !== cateTargetId) {
        cateMove = true
      }

      // 仅移动分类
      if (cateMove && !apiMove) {
        cateSelfId = Number(cateSelfId)
        cateTargetId = Number(cateTargetId)

        const cates = await all(`
                SELECT * FROM appCategory WHERE appId=${appId} AND (id=${cateTargetId} OR id=${cateSelfId})
            `)

        // 获取移动分类和目标分类
        let cateSelf, cateTarget
        cates.forEach(item => {
          if (item.id === cateSelfId) {
            cateSelf = item
          } else if (item.id === cateTargetId) {
            cateTarget = item
          }
        })

        // 互换目标
        if (cateSelf.prevId === cateTargetId) {
          ([ cateSelf, cateTarget ] = [ cateTarget, cateSelf ])
        }

        const sqlExpression = [ 'BEGIN;' ]
        // 存在prev节点
        if (cateSelf.prevId) {
          sqlExpression.push(`UPDATE appCategory SET nextId=${cateSelf.nextId} WHERE id=${cateSelf.prevId};`)
        }
        // 更新下一个节点
        if (cateSelf.nextId) {
          sqlExpression.push(`UPDATE appCategory SET prevId=${cateSelf.prevId || 'NULL'} WHERE id=${cateSelf.nextId};`)
        }
        // 更新目标节点的下一个节点
        if (cateTarget.nextId) {
          sqlExpression.push(`UPDATE appCategory SET prevId=${cateSelf.id} WHERE id=${cateTarget.nextId};`)
        }
        sqlExpression.push(`UPDATE appCategory SET prevId=${cateTarget.id}, nextId=${cateTarget.nextId || 'NULL'} WHERE id=${cateSelf.id};`)
        sqlExpression.push(`UPDATE appCategory SET nextId=${cateSelf.id} WHERE id=${cateTarget.id};`)
        sqlExpression.push('COMMIT;')

        await exec(sqlExpression.join('\n'))

        return
      }

      // 仅移动API，可能涉及分类变更
      if (apiMove) {
        apiSelfId = Number(apiSelfId)
        apiTargetId = Number(apiTargetId)
        cateTargetId = Number(cateTargetId)
        // 仅改变分类
        if (!apiTargetId) {
          exec(`UPDATE api SET categoryId=${cateTargetId || 'NULL'} WHERE id=${apiSelfId};`)
          await history.api.move({ apiId: apiSelfId, operator, apiData: JSON.stringify({ category: [ cateSelfId, cateTargetId ] }) })
          return
        }

        const apis = await all(`
                SELECT * FROM api WHERE appId=${appId} AND (id=${apiTargetId} OR id=${apiSelfId})
            `)

        // 获取移动API和目标API
        let apiSelf, apiTarget
        apis.forEach(item => {
          if (item.id === apiSelfId) {
            apiSelf = item
          } else if (item.id === apiTargetId) {
            apiTarget = item
          }
        })

        // 互换目标
        if (apiSelf.prevId === apiTargetId) {
          ([ apiSelf, apiTarget ] = [ apiTarget, apiSelf ])
        }

        const sqlExpression = [ 'BEGIN;' ]

        // 分类发生变更
        if (cateMove) {
          sqlExpression.push(`UPDATE api SET categoryId=${cateTargetId || 'NULL'} WHERE id=${apiSelf.id};`)
        }
        // 存在prev节点
        if (apiSelf.prevId) {
          sqlExpression.push(`UPDATE api SET nextId=${apiSelf.nextId} WHERE id=${apiSelf.prevId};`)
        }
        // 更新下一个节点
        if (apiSelf.nextId) {
          sqlExpression.push(`UPDATE api SET prevId=${apiSelf.prevId || 'NULL'} WHERE id=${apiSelf.nextId};`)
        }
        // 更新目标节点的下一个节点
        if (apiTarget.nextId) {
          sqlExpression.push(`UPDATE api SET prevId=${apiSelf.id} WHERE id=${apiTarget.nextId};`)
        }
        sqlExpression.push(`UPDATE api SET prevId=${apiTarget.id}, nextId=${apiTarget.nextId || 'NULL'} WHERE id=${apiSelf.id};`)
        sqlExpression.push(`UPDATE api SET nextId=${apiSelf.id} WHERE id=${apiTarget.id};`)
        sqlExpression.push('COMMIT;')

        await exec(sqlExpression.join('\n'))
      }

      const apiData = {}
      if (cateMove) {
        apiData.categroy = [ cateSelfId, cateTargetId ]
      }

      if (apiMove) {
        apiData.api = [ apiSelfId, apiTargetId ]
      }

      await history.api.move({ apiId: apiSelfId, operator, apiData: JSON.stringify(apiData) })
    },
  },

  api: {
    async list ({ appId }) {
      const rs = await all(`
          SELECT id, name, categoryId, prevId, nextId FROM api WHERE appId = ${appId}
      `)

      const lg = rs.length
      if (lg === 0) {
        return { list: [] }
      }

      // previousId 实现链表指针关联
      const map = {}
      for (let i = 0; i < lg; i++) {
        const item = rs[i]
        map[item.id] = item
      }

      rs.forEach(item => {
        item.next = map[item.nextId]
        delete map[item.nextId]
      })
      // 剩下没被使用的就是最后一个节点了
      for (const key in map) {
        const newRs = []
        let pointer = map[key]
        while (pointer) {
          newRs.push(pointer)
          const cur = pointer
          pointer = pointer.next

          // 断开链表，回收无用属性
          cur.next = undefined
          cur.prevId = undefined
          cur.nextId = undefined
        }
        return { list: newRs }
      }

      // const rs = await all(`
      //     SELECT id, name, categoryId FROM api WHERE projectId = ${projectId}
      // `)
      // return rs
    },
  },
}
