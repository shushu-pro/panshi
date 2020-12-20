import { all, get, insert, update, exec, list } from '@db'
import message from '@/service/message'

export default {
  app: {

  },
  api: {
    async list ({ apiId, page }) {
      return {
        list: await all(`
        SELECT type, operator as operatorId, nick, operateHistory.createTime, operateHistory.id as historyId FROM operateHistory 
        LEFT OUTER JOIN user ON user.id=operator
        WHERE typeId=${apiId} 
      `),
      }
      // return list({
      //   tableName: 'operateHistory',
      //   keys: 'type, operator as operatorId, createTime',
      //   filters: { typeId: apiId },
      // })
    },

    async data ({ historyId }) {
      return get(`SELECT typeData FROM operateHistory WHERE id=${historyId}`)
    },

    async create ({ apiId, operator }) {
      await insert('operateHistory', {
        type: 'api.create', typeId: apiId, operator,
      })

    //   await message.create({ historyId: lastID, apiId })
      // await insert('message')
    },

    async delete ({ apiId, operator, apiData }) {
      await insert('operateHistory', {
        type: 'api.delete', typeId: apiId, operator, typeData: apiData,
      })
    },

    async modify ({ apiId, operator, typeData }) {
      const { lastID } = await insert('operateHistory', {
        type: 'api.modify', typeId: apiId, operator, typeData,
      })

      await message.create({ historyId: lastID, apiId })
    },

    async move ({ apiId, operator, apiData }) {
      const { lastID } = await insert('operateHistory', {
        type: 'api.move', typeId: apiId, operator, typeData: apiData,
      })
      await message.create({ historyId: lastID, apiId })
    },
  },
}
