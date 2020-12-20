import { all, get, insert, update, exec, list } from '@db'


export default {
  async list ({ page, pageSize }) {
    const list = await all(`
        SELECT * FROM module
    `)
    return { page, pageSize, total: list.list, list }
  },

  async create ({ label, symbol }) {
    await insert('module', {
      label, symbol,
    })
  },


  async delete ({ id }) {
    const sqlExpression = [
      'BEGIN;',
      `DELETE FROM module WHERE id=${id};`,
    ]

    sqlExpression.push('COMMIT;')

    await exec(sqlExpression.join('\n'))
  },


}
