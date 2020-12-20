
import { all, get, insert, update, exec, list } from '@db'


export default {
  async list ({ id }) {
    if (!id) {
      return { list: await all(' SELECT * FROM moduleFunction') }
    }
    const list = await all(`
        SELECT * FROM moduleFunction WHERE moduleId=${id}
    `)
    return { list }
  },

  async create ({ moduleId, groupId, label, symbol }) {
    await insert('moduleFunction', {
      moduleId, groupId, label, symbol,
    })
  },

  async modify ({ id, label, symbol }) {
    await update('moduleFunction', { label, symbol }, `WHERE id = ${id}`)
  },


  async delete ({ id }) {
    const { total1 } = await get(`
        SELECT count(*) as total1 FROM  rolePermission WHERE rolePermission.moduleFunctionId=${id}
    `)
    if (total1) {
      throw Error('权限被使用，不能删除')
    }

    const sqlExpression = [
      'BEGIN;',
      `DELETE FROM moduleFunction WHERE id=${id};`,
    ]

    sqlExpression.push('COMMIT;')
    // console.info(sqlExpression.join('\n'))
    await exec(sqlExpression.join('\n'))
  },

  group: {
    async list ({ id }) {
      return list({ tableName: 'moduleFunctionGroup', filters: { moduleId: id } })
    },

    async create ({ moduleId, parentId, label, symbol }) {
      await insert('moduleFunctionGroup', {
        moduleId, parentId, label, symbol,
      })
    },

    async delete ({ id }) {
      const { total1 } = await get(`
          SELECT count(*) as total1 FROM  moduleFunction WHERE moduleFunction.groupId=${id}
      `)
      if (total1) {
        throw Error('权限不为空，不能删除')
      }
      const { total2 } = await get(`
        SELECT count(*) as total2 FROM moduleFunctionGroup WHERE moduleFunctionGroup.parentId=${id}
    `)
      if (total2) {
        throw Error('分组不为空，不能删除')
      }

      const sqlExpression = [
        'BEGIN;',
        `DELETE FROM moduleFunctionGroup WHERE id=${id};`,
      ]
      sqlExpression.push('COMMIT;')
      // console.info(sqlExpression.join('\n'))
      await exec(sqlExpression.join('\n'))
    },

    async modify ({ id, label, symbol }) {
      await update('moduleFunctionGroup', { label, symbol }, `WHERE id = ${id}`)
    },

  },
}
